'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import posthog from 'posthog-js';
import { createSessionSync } from '@/lib/demo/session-sync';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const MAX_SSE_RETRIES = 3;

export type DemoStatus = 'loading' | 'pending' | 'pass_downloaded' | 'pass_installed' | 'error';
export type DemoCardType = 'stamp' | 'points';

// Stamp cards fill 0..8 (+1 per scan); points cards fill 0..120 (+20 per scan).
const POINTS_MAX = 120;

interface DemoSession {
  session_id: string;
  session_token: string;
  status: string;
  stamps: number;
  points?: number;
  card_type?: string;
  expires_at?: string;
}

interface UseDemoSessionOptions {
  /** Which demo engine this session drives. Defaults to 'stamp' so existing
   *  callers (and the deployed stamp frontend) are unaffected. */
  cardType?: DemoCardType;
  /** When false, no session is created (nothing hits the backend). Used to
   *  lazy-init the points session only once the visitor selects Points. */
  enabled?: boolean;
}

interface UseDemoSessionReturn {
  /** URL for the QR code (points to demo pass download) */
  qrUrl: string | null;
  /** Current session status */
  status: DemoStatus;
  /** Current stamp count (stamp cards) */
  stamps: number;
  /** Current points balance (points cards) */
  points: number;
  /** The engine this session drives */
  cardType: DemoCardType;
  /** Session token (for debugging) */
  sessionToken: string | null;
  /** Whether the hook is loading initial state */
  isLoading: boolean;
  /** Whether a scan request is in progress */
  isStamping: boolean;
  /** Error message if any */
  error: string | null;
  /** Add one scan (only works when status === 'pass_installed'). +1 stamp or
   *  +20 points depending on cardType. */
  scan: () => Promise<void>;
  /** Alias of scan (kept for the stamp branch). */
  addStamp: () => Promise<void>;
  /** Reset session and start fresh */
  reset: () => void;
  /** Call when the visitor taps Add on this phone: the page polls until Wallet's install is confirmed. */
  expectInstall: () => void;
}

function isExpired(expiresAt: string | undefined): boolean {
  if (!expiresAt) return false;
  const expDate = new Date(expiresAt.replace('Z', '+00:00'));
  return expDate < new Date();
}

export function useDemoSession(options: UseDemoSessionOptions = {}): UseDemoSessionReturn {
  const { cardType = 'stamp', enabled = true } = options;
  // Separate storage per engine so the two hero sessions never collide. The
  // stamp key is unchanged, so existing saved stamp sessions still resume.
  const STORAGE_KEY = cardType === 'points' ? 'stampeo_demo_session_points' : 'stampeo_demo_session';

  const [session, setSession] = useState<DemoSession | null>(null);
  const [status, setStatus] = useState<DemoStatus>('loading');
  const [stamps, setStamps] = useState(0);
  const [points, setPoints] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStamping, setIsStamping] = useState(false);

  const eventSourceRef = useRef<EventSource | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startPollingRef = useRef<(token: string) => void>(() => {});

  // SSE retry state
  const sseRetryCountRef = useRef(0);
  const sseRetryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track current token for visibility reconnection (avoids stale closures)
  const activeTokenRef = useRef<string | null>(null);

  // Guards a single lazy init (so flipping `enabled` true can't double-create).
  const initedRef = useRef(false);

  // Stop all connections and timers
  const stopAllConnections = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (sseRetryTimeoutRef.current) {
      clearTimeout(sseRetryTimeoutRef.current);
      sseRetryTimeoutRef.current = null;
    }
  }, []);

  // Fetch session by token
  const fetchSession = useCallback(async (token: string): Promise<DemoSession | null> => {
    try {
      const response = await fetch(`${API_URL}/demo/sessions/${token}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch session');
      }
      return await response.json();
    } catch (err) {
      console.error('Error fetching session:', err);
      return null;
    }
  }, []);

  // Keeps the page in step with the server: every status read (SSE, polls, the re-read on return) feeds it.
  const [sync] = useState(() =>
    createSessionSync({
      cardType,
      fetchSession,
      apply: (snapshot) => {
        setStatus(snapshot.status as DemoStatus);
        setStamps(snapshot.stamps);
        if (typeof snapshot.points === 'number') setPoints(snapshot.points);
      },
      capture: (event, props) => posthog.capture(event, props),
      isHidden: () => document.hidden,
      now: () => Date.now(),
      startTimer: (fn, ms) => setInterval(fn, ms),
      stopTimer: (timer) => clearInterval(timer as NodeJS.Timeout),
    })
  );

  // Create new session (typed by cardType)
  const createSession = useCallback(async (): Promise<DemoSession | null> => {
    try {
      const response = await fetch(`${API_URL}/demo/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card_type: cardType }),
      });
      if (!response.ok) {
        throw new Error('Failed to create session');
      }
      return await response.json();
    } catch (err) {
      console.error('Error creating session:', err);
      setError(err instanceof Error ? err.message : 'Failed to create session');
      return null;
    }
  }, [cardType]);

  // Start SSE connection for real-time updates
  const startSSE = useCallback((token: string) => {
    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource(`${API_URL}/demo/sessions/${token}/events`);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        sync.receive(JSON.parse(event.data));

        // SSE is working — reset retry counter
        sseRetryCountRef.current = 0;
      } catch (err) {
        console.error('Error parsing SSE data:', err);
      }
    };

    eventSource.addEventListener('expired', () => {
      // Session expired, create a new one
      localStorage.removeItem(STORAGE_KEY);
      eventSource.close();
      initSession();
    });

    eventSource.onerror = () => {
      eventSource.close();
      eventSourceRef.current = null;

      // Retry SSE with exponential backoff before falling back to polling
      if (sseRetryCountRef.current < MAX_SSE_RETRIES) {
        const delay = Math.pow(2, sseRetryCountRef.current + 1) * 1000; // 2s, 4s, 8s
        sseRetryCountRef.current++;
        sseRetryTimeoutRef.current = setTimeout(() => {
          sseRetryTimeoutRef.current = null;
          startSSE(token);
        }, delay);
      } else {
        // Exhausted retries — fall back to polling
        startPollingRef.current(token);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardType]);

  // Fallback polling
  startPollingRef.current = (token: string) => {
    // Clear existing interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    const poll = async () => {
      // Inactivity check: stop polling if status hasn't changed in 10 minutes
      if (sync.isIdle()) {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        return;
      }

      const session = await fetchSession(token);
      if (!session) {
        // Session expired or not found
        localStorage.removeItem(STORAGE_KEY);
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
        initSession();
        return;
      }

      sync.receive(session);
    };

    // Poll every 5 seconds (SSE preferred but falls back to polling through proxies)
    pollingIntervalRef.current = setInterval(poll, 5000);
  };

  // Initialize session (called on mount and after reset)
  const initSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // Check localStorage for existing session
    const savedToken = localStorage.getItem(STORAGE_KEY);

    if (savedToken) {
      // Try to resume existing session
      const existingSession = await fetchSession(savedToken);

      if (existingSession && !isExpired(existingSession.expires_at)) {
        // Resume session
        setSession(existingSession);
        setStatus(existingSession.status as DemoStatus);
        setStamps(existingSession.stamps);
        setPoints(existingSession.points ?? 0);
        setIsLoading(false);
        activeTokenRef.current = savedToken;
        sync.adopt(savedToken, existingSession);
        startSSE(savedToken);
        return;
      }

      // Session expired or not found, clear it
      localStorage.removeItem(STORAGE_KEY);
    }

    // Create new session
    const newSession = await createSession();
    if (newSession) {
      localStorage.setItem(STORAGE_KEY, newSession.session_token);
      setSession(newSession);
      setStatus(newSession.status as DemoStatus);
      setStamps(newSession.stamps);
      setPoints(newSession.points ?? 0);
      activeTokenRef.current = newSession.session_token;
      sync.adopt(newSession.session_token, newSession);
      startSSE(newSession.session_token);
      posthog.capture('demo_started', { session_token: newSession.session_token, card_type: cardType });
    } else {
      setStatus('error');
    }

    setIsLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchSession, createSession, startSSE, cardType]);

  // Single-shot lazy init guard
  const maybeInit = useCallback(() => {
    if (initedRef.current) return;
    initedRef.current = true;
    initSession();
  }, [initSession]);

  // Add scan (+1 stamp or +20 points)
  const scan = useCallback(async () => {
    if (!session || status !== 'pass_installed') return;

    setIsStamping(true);
    try {
      const response = await fetch(`${API_URL}/demo/sessions/${session.session_token}/stamp`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to add scan');
      }

      const data = await response.json();
      if (typeof data.stamps === 'number') setStamps(data.stamps);
      if (typeof data.points === 'number') setPoints(data.points);

      if (cardType === 'points') {
        posthog.capture('demo_points_added', {
          points: data.points,
          is_complete: (data.points ?? 0) >= POINTS_MAX,
          card_type: 'points',
        });
      } else {
        posthog.capture('demo_stamp_added', {
          stamp_number: data.stamps,
          is_complete: (data.stamps ?? 0) >= 8,
        });
      }
    } catch (err) {
      console.error('Error adding scan:', err);
      setError(err instanceof Error ? err.message : 'Failed to add scan');
    } finally {
      setIsStamping(false);
    }
  }, [session, status, cardType]);

  // Reset session
  const reset = useCallback(() => {
    stopAllConnections();
    sync.stop();

    // Clear localStorage and state
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
    setStatus('loading');
    setStamps(0);
    setPoints(0);
    setError(null);
    activeTokenRef.current = null;
    sseRetryCountRef.current = 0;
    initedRef.current = true;

    // Create new session
    initSession();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initSession, stopAllConnections]);

  // Initialize on mount + visibility handling
  useEffect(() => {
    if (enabled) maybeInit();

    // Back on the page: re-read the session once (Wallet may have registered
    // the pass while the stream was closed) and reopen the stream.
    const reconnect = () => {
      const token = activeTokenRef.current;
      if (!token) return;
      sseRetryCountRef.current = 0;
      void sync.pageVisible();
      startSSE(token);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab hidden — stop all background traffic
        stopAllConnections();
        sync.pageHidden();
      } else {
        reconnect();
      }
    };

    // Restored from the back/forward cache: the stream was closed with the page.
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) reconnect();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handlePageShow);
      stopAllConnections();
      sync.stop();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lazy-enable: create the session the first time `enabled` flips true.
  useEffect(() => {
    if (enabled) maybeInit();
  }, [enabled, maybeInit]);

  // Build QR URL
  const qrUrl = session ? `${API_URL}/demo/pass/${session.session_token}` : null;

  return {
    qrUrl,
    status,
    stamps,
    points,
    cardType,
    sessionToken: session?.session_token ?? null,
    isLoading,
    isStamping,
    error,
    scan,
    addStamp: scan,
    reset,
    expectInstall: sync.expectInstall,
  };
}
