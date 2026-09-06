export const DEFAULT_INTRO_DURATION_MS = 1900;
export const MIN_INTRO_DURATION_MS = 1500;
export const MAX_INTRO_DURATION_MS = 2200;

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const segment = (milliseconds: number, start: number, end: number) =>
  clamp01((milliseconds - start) / (end - start));
const easeOut = (value: number) => 1 - Math.pow(1 - value, 3);

export interface IntroFrame {
  ignitionOpacity: number;
  bodyOpacity: number;
  bodyScale: number;
  sparkOpacity: number;
  sparkGlow: number;
  orbitProgress: number[];
  particleOpacity: number;
  wordmarkOpacity: number;
}

/** A finite, normalized studio sequence; all phase times scale with Duration. */
export function introFrameInto(
  target: IntroFrame,
  elapsedMs: number,
  durationMs = DEFAULT_INTRO_DURATION_MS,
  showWordmark = false,
): IntroFrame {
  const scale = durationMs / DEFAULT_INTRO_DURATION_MS;
  const milliseconds = Math.max(0, Math.min(durationMs, elapsedMs)) / scale;
  const ignitionIn = easeOut(segment(milliseconds, 0, 190));
  const ignitionOut = 1 - segment(milliseconds, 260, 540);
  const body = easeOut(segment(milliseconds, 160, 520));
  const spark = easeOut(segment(milliseconds, 430, 650));
  const sparkPulse = Math.sin(segment(milliseconds, 430, 720) * Math.PI);

  target.ignitionOpacity = ignitionIn * ignitionOut * 0.82;
  target.bodyOpacity = body;
  target.bodyScale = 0.92 + body * 0.08;
  target.sparkOpacity = spark;
  target.sparkGlow = Math.max(0, sparkPulse);
  for (let index = 0; index < 4; index++)
    target.orbitProgress[index] = easeOut(
      segment(milliseconds, 520 + index * 70, 980 + index * 70),
    );
  target.particleOpacity = easeOut(segment(milliseconds, 700, 860));
  target.wordmarkOpacity = showWordmark
    ? easeOut(segment(milliseconds, 1180, 1360))
    : 0;
  return target;
}

export function introFrame(
  elapsedMs: number,
  durationMs = DEFAULT_INTRO_DURATION_MS,
  showWordmark = false,
) {
  return introFrameInto(
    {
      ignitionOpacity: 0,
      bodyOpacity: 0,
      bodyScale: 0.92,
      sparkOpacity: 0,
      sparkGlow: 0,
      orbitProgress: [0, 0, 0, 0],
      particleOpacity: 0,
      wordmarkOpacity: 0,
    },
    elapsedMs,
    durationMs,
    showWordmark,
  );
}
