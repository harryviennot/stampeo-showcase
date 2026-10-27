"use client";

import { motion, useTransform, easeOut, type MotionValue } from "framer-motion";
import {
  ENTRY_T,
  FADE_END,
  FADE_START,
  FOOTSTEPS,
  NOTIFY_T,
  RING_R,
  ROUTE,
  SHOP,
  WAYPOINT_TIMES,
  type Point,
} from "@/lib/feature-pages/geolocation/geofence-walk";

/**
 * The street map behind the geolocation hero phone, drawn in the site's paper
 * and ink, playing the walk in geofence-walk.ts on the hero's clock `t`.
 */

export const MAP_WIDTH = 400;
export const MAP_HEIGHT = 436;

/* Streets are the paper between blocks: the avenue x 70–96, streets x 214–232
   and 336–352, street y 92–108, the boulevard y 232–264, the quay y 352–378,
   then the canal. */
const COLS: readonly Point[] = [
  [-20, 70],
  [96, 214],
  [232, 336],
  [352, 420],
];
const ROWS: readonly Point[] = [
  [-20, 92],
  [108, 232],
  [264, 352],
];
const CANAL_TOP = 378;
const PARK = { col: 1, row: 2 };
const TREES: readonly (readonly [number, number, number])[] = [
  [118, 292, 9],
  [140, 322, 7],
  [192, 286, 8],
  [178, 330, 10],
  [204, 316, 6],
];

const INK = "var(--near-black)";
const ACCENT = "var(--accent)";
const PAPER = "#faf9f6";

/** A city block with its buildings: four lots, one left open as a courtyard on some blocks. */
function Block({ x0, x1, y0, y1, seed }: { x0: number; x1: number; y0: number; y1: number; seed: number }) {
  const inset = 6;
  const gap = 4;
  const [ix0, iy0, ix1, iy1] = [x0 + inset, y0 + inset, x1 - inset, y1 - inset];
  const sx = ix0 + (ix1 - ix0) * (0.42 + (seed % 3) * 0.08);
  const sy = iy0 + (iy1 - iy0) * (0.4 + ((seed + 1) % 3) * 0.1);
  const lots = [
    [ix0, iy0, sx - gap / 2, sy - gap / 2],
    [sx + gap / 2, iy0, ix1, sy - gap / 2],
    [ix0, sy + gap / 2, sx - gap / 2, iy1],
    [sx + gap / 2, sy + gap / 2, ix1, iy1],
  ];
  const courtyard = seed % 3 === 1 ? seed % 4 : -1;
  return (
    <g>
      <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} rx={10} fill="#f2ece0" stroke={INK} strokeOpacity={0.16} strokeWidth={1.25} />
      {lots.map(([a, b, c, d], i) =>
        i === courtyard ? null : (
          <rect key={i} x={a} y={b} width={c - a} height={d - b} rx={3} fill="#e8dfcf" />
        ),
      )}
    </g>
  );
}

/** The canal along the bottom, with the avenue crossing it on a bridge. */
function Canal() {
  return (
    <g>
      <rect x={-20} y={CANAL_TOP} width={MAP_WIDTH + 40} height={MAP_HEIGHT - CANAL_TOP + 20} fill="#d6e4e1" />
      <path d={`M-20 ${CANAL_TOP} H${MAP_WIDTH + 20}`} stroke={INK} strokeOpacity={0.22} strokeWidth={1.25} />
      <path
        d="M22 404 q5 -4 10 0 t10 0 M136 416 q5 -4 10 0 t10 0 M246 400 q5 -4 10 0 t10 0 M180 398 q4 -3 8 0 M30 424 q4 -3 8 0"
        stroke={INK}
        strokeOpacity={0.22}
        strokeWidth={1.25}
        strokeLinecap="round"
        fill="none"
      />
      <rect x={68} y={CANAL_TOP - 2} width={30} height={MAP_HEIGHT - CANAL_TOP + 22} fill={PAPER} />
      <path d={`M68 ${CANAL_TOP - 2} V${MAP_HEIGHT + 20} M98 ${CANAL_TOP - 2} V${MAP_HEIGHT + 20}`} stroke={INK} strokeOpacity={0.3} strokeWidth={1.25} />
    </g>
  );
}

function Park({ x0, x1, y0, y1 }: { x0: number; x1: number; y0: number; y1: number }) {
  return (
    <g>
      <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} rx={10} fill="var(--stamp-sage)" fillOpacity={0.2} stroke={INK} strokeOpacity={0.16} strokeWidth={1.25} />
      {/* A footpath across the grass */}
      <path
        d={`M${x0 + 4} ${y1 - 22} C${x0 + 40} ${y1 - 30} ${x0 + 60} ${y0 + 30} ${x1 - 4} ${y0 + 20}`}
        stroke={PAPER}
        strokeWidth={4}
        strokeLinecap="round"
        fill="none"
      />
      {TREES.map(([cx, cy, r]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill="var(--stamp-sage)" fillOpacity={0.55} stroke={INK} strokeOpacity={0.22} strokeWidth={1.25} />
      ))}
    </g>
  );
}

function Footstep({ t, point, at }: { t: MotionValue<number>; point: Point; at: number }) {
  const opacity = useTransform(t, [at, at + 0.2, FADE_START, FADE_END], [0, 0.45, 0.45, 0]);
  return <motion.circle cx={point[0]} cy={point[1]} r={2} fill={INK} style={{ opacity }} />;
}

function Ripple({ t, delay }: { t: MotionValue<number>; delay: number }) {
  const start = ENTRY_T + delay;
  const r = useTransform(t, [start, start + 1.3], [RING_R * 0.92, RING_R * 1.42], { ease: easeOut });
  const opacity = useTransform(t, [start - 0.01, start, start + 1.3], [0, 0.7, 0]);
  return <motion.circle cx={SHOP[0]} cy={SHOP[1]} r={r} fill="none" stroke={ACCENT} strokeWidth={2} style={{ opacity }} />;
}

/** A storefront glyph: striped awning over a door. */
function ShopMarker() {
  const [cx, cy] = SHOP;
  return (
    <g transform={`translate(${cx - 18} ${cy - 22})`}>
      {/* Hard ink shadow, like the site's stamped cards */}
      <path d="M8 3 H28 Q33 3 33 8 V30 Q33 35 28 35 H23 L18 41 L13 35 H8 Q3 35 3 30 V8 Q3 3 8 3 Z" transform="translate(0 2.5)" fill={INK} />
      <path d="M8 3 H28 Q33 3 33 8 V30 Q33 35 28 35 H23 L18 41 L13 35 H8 Q3 35 3 30 V8 Q3 3 8 3 Z" fill={ACCENT} stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
      <g stroke="#fff" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M9.5 14 L11 9.5 H25 L26.5 14" />
        <path d="M9.5 14 Q11.75 17 14 14 Q16.25 17 18 14 Q20.25 17 22.5 14 Q24.75 17 26.5 14" />
        <path d="M11 16.5 V27.5 H25 V16.5" />
        <path d="M16 27.5 V21.5 H20 V27.5" />
      </g>
    </g>
  );
}

export function GeofenceMap({ t }: Readonly<{ t: MotionValue<number> }>) {
  const xs = ROUTE.map((p) => p[0]);
  const ys = ROUTE.map((p) => p[1]);
  const walkerX = useTransform(t, WAYPOINT_TIMES, xs);
  const walkerY = useTransform(t, WAYPOINT_TIMES, ys);
  const walkerOpacity = useTransform(t, [0, 0.3, FADE_START, FADE_END], [0, 1, 1, 0]);
  const ringFill = useTransform(t, [ENTRY_T, ENTRY_T + 0.4, FADE_START, FADE_END], [0.07, 0.16, 0.16, 0.07]);
  const ringStroke = useTransform(t, [ENTRY_T, ENTRY_T + 0.4, FADE_START, FADE_END], [0.55, 1, 1, 0.55]);
  const buzz = useTransform(
    t,
    [NOTIFY_T - 0.05, NOTIFY_T + 0.1, NOTIFY_T + 1.1, NOTIFY_T + 1.5],
    [0, 1, 1, 0],
  );
  const buzzScale = useTransform(t, [NOTIFY_T - 0.05, NOTIFY_T + 0.25], [0.6, 1], { ease: easeOut });

  return (
    <svg
      viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
      className="absolute inset-0 h-full w-full"
      aria-hidden
    >
      {/* Blocks and the park */}
      {ROWS.map(([y0, y1], r) =>
        COLS.map(([x0, x1], c) =>
          r === PARK.row && c === PARK.col ? (
            <Park key={`${r}-${c}`} x0={x0} x1={x1} y0={y0} y1={y1} />
          ) : (
            <Block key={`${r}-${c}`} x0={x0} x1={x1} y0={y0} y1={y1} seed={r * 4 + c} />
          ),
        ),
      )}

      <Canal />

      {/* Boulevard centre line and the crossing at the avenue */}
      <path d="M-10 248 H62 M104 248 H420" stroke={INK} strokeOpacity={0.2} strokeWidth={1.5} strokeDasharray="9 8" />
      <path
        d="M72 236 H94 M72 241.5 H94 M72 254.5 H94 M72 260 H94"
        stroke={INK}
        strokeOpacity={0.14}
        strokeWidth={2.5}
        strokeLinecap="round"
      />

      {/* The shop's ring */}
      <motion.circle
        cx={SHOP[0]}
        cy={SHOP[1]}
        r={RING_R}
        fill={ACCENT}
        style={{ fillOpacity: ringFill }}
      />
      <motion.circle
        cx={SHOP[0]}
        cy={SHOP[1]}
        r={RING_R}
        fill="none"
        stroke={ACCENT}
        strokeWidth={2}
        strokeDasharray="1 7"
        strokeLinecap="round"
        style={{ strokeOpacity: ringStroke }}
      />
      <Ripple t={t} delay={0} />
      <Ripple t={t} delay={0.4} />

      {/* The route so far */}
      {FOOTSTEPS.map(({ point, at }) => (
        <Footstep key={at} t={t} point={point} at={at} />
      ))}

      <ShopMarker />

      {/* The walker, and the buzz when their phone goes off */}
      <motion.g style={{ x: walkerX, y: walkerY, opacity: walkerOpacity }}>
        <circle r={13} fill={INK} fillOpacity={0.1} />
        <circle r={6.5} fill={INK} stroke={PAPER} strokeWidth={2.5} />
        <motion.g style={{ opacity: buzz, scale: buzzScale }}>
          <path
            d="M-12 -7 Q-17 0 -12 7 M12 -7 Q17 0 12 7 M-18 -11 Q-25 0 -18 11 M18 -11 Q25 0 18 11"
            stroke={ACCENT}
            strokeWidth={2.2}
            strokeLinecap="round"
            fill="none"
          />
        </motion.g>
      </motion.g>
    </svg>
  );
}
