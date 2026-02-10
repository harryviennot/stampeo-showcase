'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const STORAGE_KEY = 'stampeo_demo_session';
const MAX_SSE_RETRIES = 3;
const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

export type DemoStatus = 'loading' | 'pending' | 'pass_downloaded' | 'pass_installed' | 'error';

interface DemoSession {
  session_id: string;
  session_token: string;
  status: string;
  stamps: number;
  expires_at?: string;
}

interface UseDemoSessionReturn {
  /** URL for the QR code (points to demo pass download) */
  qrUrl: string | null;
  /** Current session status */
  status: DemoStatus;
  /** Current stamp count */
  stamps: number;
  /** Session token (for debugging) */
  sessionToken: string | null;
  /** Whether the hook is loading initial state */
  isLoading: boolean;
  /** Whether a stamp request is in progress */
  isStamping: boolean;
  /** Error message if any */
  error: string | null;
  /** Add a stamp (only works when status === 'pass_installed') */
  addStamp: () => Promise<void>;
  /** Reset session and start fresh */
  reset: () => void;
}

function isExpired(expiresAt: string | undefined): boolean {
  if (!expiresAt) return false;
  const expDate = new Date(expiresAt.replace('Z', '+00:00'));
  return expDate < new Date();
}

export function useDemoSession(): UseDemoSessionReturn {
  const [session, setSession] = useState<DemoSession | null>(null);
  const [status, setStatus] = useState<DemoStatus>('loading');
  const [stamps, setStamps] = useState(0);
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

  // Inactivity tracking
  const lastStatusChangeRef = useRef(Date.now());
  const statusRef = useRef<DemoStatus>('loading');

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

  // Create new session
  const createSession = useCallback(async (): Promise<DemoSession | null> => {
    try {
      const response = await fetch(`${API_URL}/demo/sessions`, {
        method: 'POST',
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
  }, []);

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
        const data = JSON.parse(event.data);
        const newStatus = data.status as DemoStatus;

        // Track actual status changes for inactivity timeout
        if (newStatus !== statusRef.current) {
          lastStatusChangeRef.current = Date.now();
          statusRef.current = newStatus;
        }

        setStatus(newStatus);
        setStamps(data.stamps);

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
  }, []);

  // Fallback polling
  startPollingRef.current = (token: string) => {
    // Clear existing interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    const poll = async () => {
      // Inactivity check: stop polling if status hasn't changed in 10 minutes
      if (Date.now() - lastStatusChangeRef.current > INACTIVITY_TIMEOUT_MS) {
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

      const newStatus = session.status as DemoStatus;

      // Track actual status changes for inactivity timeout
      if (newStatus !== statusRef.current) {
        lastStatusChangeRef.current = Date.now();
        statusRef.current = newStatus;
      }

      setStatus(newStatus);
      setStamps(session.stamps);
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
        statusRef.current = existingSession.status as DemoStatus;
        setStamps(existingSession.stamps);
        setIsLoading(false);
        activeTokenRef.current = savedToken;
        lastStatusChangeRef.current = Date.now();
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
      statusRef.current = newSession.status as DemoStatus;
      setStamps(newSession.stamps);
      activeTokenRef.current = newSession.session_token;
      lastStatusChangeRef.current = Date.now();
      startSSE(newSession.session_token);
    } else {
      setStatus('error');
    }

    setIsLoading(false);
  }, [fetchSession, createSession, startSSE]);

  // Add stamp
  const addStamp = useCallback(async () => {
    if (!session || status !== 'pass_installed') return;

    setIsStamping(true);
    try {
      const response = await fetch(`${API_URL}/demo/sessions/${session.session_token}/stamp`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to add stamp');
      }

      const data = await response.json();
      setStamps(data.stamps);
    } catch (err) {
      console.error('Error adding stamp:', err);
      setError(err instanceof Error ? err.message : 'Failed to add stamp');
    } finally {
      setIsStamping(false);
    }
  }, [session, status]);

  // Reset session
  const reset = useCallback(() => {
    stopAllConnections();

    // Clear localStorage and state
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
    setStatus('loading');
    statusRef.current = 'loading';
    setStamps(0);
    setError(null);
    activeTokenRef.current = null;
    sseRetryCountRef.current = 0;

    // Create new session
    initSession();
  }, [initSession, stopAllConnections]);

  // Initialize on mount + visibility handling
  useEffect(() => {
    initSession();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab hidden — stop all background traffic
        stopAllConnections();
      } else {
        // Tab visible — reconnect
        const token = activeTokenRef.current;
        if (token) {
          sseRetryCountRef.current = 0;
          lastStatusChangeRef.current = Date.now();
          startSSE(token);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopAllConnections();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Build QR URL
  const qrUrl = session ? `${API_URL}/demo/pass/${session.session_token}` : null;

  return {
    qrUrl,
    status,
    stamps,
    sessionToken: session?.session_token ?? null,
    isLoading,
    isStamping,
    error,
    addStamp,
    reset,
  };
}
