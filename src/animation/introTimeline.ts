import config from "./studioIntroConfig.json" with { type: "json" };

export const DEFAULT_INTRO_DURATION_MS = config.durationMs;
export const MIN_INTRO_DURATION_MS = config.minDurationMs;
export const MAX_INTRO_DURATION_MS = config.maxDurationMs;
export const INTRO_FINAL_HOLD_MS = config.finalHoldMs;

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
  motionSeconds: number;
  trailOpacity: number;
  wordmarkOpacity: number;
}

function resolvedMotionSeconds(milliseconds: number) {
  const { startOffsetSeconds, rate, settleStartMs, settleEndMs } = config.motion;
  if (milliseconds <= settleStartMs)
    return startOffsetSeconds + (milliseconds / 1000) * rate;
  const settleDurationSeconds = (settleEndMs - settleStartMs) / 1000;
  const settleProgress = segment(milliseconds, settleStartMs, settleEndMs);
  const deceleratedTime =
    settleDurationSeconds *
    (settleProgress - (settleProgress * settleProgress) / 2);
  return (
    startOffsetSeconds +
    (settleStartMs / 1000) * rate +
    deceleratedTime * rate
  );
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
  const ignitionIn = easeOut(
    segment(milliseconds, config.ignition.inStartMs, config.ignition.inEndMs),
  );
  const ignitionOut =
    1 - segment(milliseconds, config.ignition.outStartMs, config.ignition.outEndMs);
  const body = easeOut(
    segment(milliseconds, config.body.startMs, config.body.endMs),
  );
  const spark = easeOut(
    segment(milliseconds, config.spark.startMs, config.spark.endMs),
  );
  const sparkPulse = Math.sin(
    segment(milliseconds, config.spark.startMs, config.spark.pulseEndMs) *
      Math.PI,
  );

  target.ignitionOpacity =
    ignitionIn * ignitionOut * config.ignition.maxOpacity;
  target.bodyOpacity = body;
  target.bodyScale =
    config.body.initialScale + body * (1 - config.body.initialScale);
  target.sparkOpacity = spark;
  target.sparkGlow = Math.max(0, sparkPulse);
  for (let index = 0; index < 4; index++)
    target.orbitProgress[index] = easeOut(
      segment(
        milliseconds,
        config.orbits.startMs + index * config.orbits.staggerMs,
        config.orbits.startMs +
          config.orbits.durationMs +
          index * config.orbits.staggerMs,
      ),
    );
  target.particleOpacity = easeOut(
    segment(milliseconds, config.particles.startMs, config.particles.endMs),
  );
  target.motionSeconds = resolvedMotionSeconds(milliseconds);
  target.trailOpacity =
    1 -
    (1 - config.motion.finalTrailOpacity) *
      easeOut(
        segment(
          milliseconds,
          config.motion.settleStartMs,
          config.motion.settleEndMs,
        ),
      );
  target.wordmarkOpacity = showWordmark
    ? easeOut(
        segment(milliseconds, config.wordmark.startMs, config.wordmark.endMs),
      )
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
      motionSeconds: 0,
      trailOpacity: 1,
      wordmarkOpacity: 0,
    },
    elapsedMs,
    durationMs,
    showWordmark,
  );
}
