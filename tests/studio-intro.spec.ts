import { expect, test } from "@playwright/test";
import { particleAt, particles, type Orbit } from "../src/animation/orbits";
import {
  DEFAULT_INTRO_DURATION_MS,
  INTRO_FINAL_HOLD_MS,
  introFrame,
  MAX_INTRO_DURATION_MS,
  MIN_INTRO_DURATION_MS,
} from "../src/animation/introTimeline";

const tau = Math.PI * 2;
const wrap = (turns: number) => ((turns % 1) + 1) % 1;

function positionOnPath(orbit: Orbit, x: number, y: number) {
  const rotation = (orbit.rotation * Math.PI) / 180;
  const dx = x - 300;
  const dy = y - 300;
  const u = (dx * Math.cos(rotation) + dy * Math.sin(rotation)) / orbit.rx;
  const v = (-dx * Math.sin(rotation) + dy * Math.cos(rotation)) / orbit.ry;
  return { phase: wrap(Math.atan2(v, u) / tau), norm: u * u + v * v };
}

test("studio intro follows a complete ordered 2.8-second arc", () => {
  expect(DEFAULT_INTRO_DURATION_MS).toBe(2800);
  expect(DEFAULT_INTRO_DURATION_MS).toBeGreaterThanOrEqual(
    MIN_INTRO_DURATION_MS,
  );
  expect(DEFAULT_INTRO_DURATION_MS).toBeLessThanOrEqual(MAX_INTRO_DURATION_MS);
  expect(introFrame(0).bodyOpacity).toBe(0);
  expect(introFrame(200).ignitionOpacity).toBeGreaterThan(0);
  expect(introFrame(650).bodyOpacity).toBe(1);
  expect(introFrame(650).sparkOpacity).toBeGreaterThan(0);
  expect(introFrame(600).orbitProgress[0]).toBeGreaterThan(0);
  expect(introFrame(600).orbitProgress[1]).toBe(0);
  expect(introFrame(1360).orbitProgress).toEqual([1, 1, 1, 1]);
  expect(introFrame(940).particleOpacity).toBe(1);
});

test("orbital motion decelerates into a 450 ms stable final hold", () => {
  const moving = introFrame(1950);
  const settling = introFrame(2150);
  const resolved = introFrame(2350);
  const finished = introFrame(DEFAULT_INTRO_DURATION_MS);
  expect(settling.motionSeconds).toBeGreaterThan(moving.motionSeconds);
  expect(resolved.motionSeconds).toBeGreaterThan(settling.motionSeconds);
  expect(finished.motionSeconds).toBe(resolved.motionSeconds);
  expect(resolved.trailOpacity).toBeCloseTo(0.42, 6);
  expect(finished.trailOpacity).toBe(resolved.trailOpacity);
  expect(INTRO_FINAL_HOLD_MS).toBe(450);
  expect(DEFAULT_INTRO_DURATION_MS - 2350).toBe(INTRO_FINAL_HOLD_MS);
});

test("wordmark waits for the formed identity and remains readable through resolution", () => {
  expect(introFrame(1499, DEFAULT_INTRO_DURATION_MS, true).wordmarkOpacity).toBe(
    0,
  );
  const established = introFrame(1760, DEFAULT_INTRO_DURATION_MS, true);
  expect(established.orbitProgress).toEqual([1, 1, 1, 1]);
  expect(established.particleOpacity).toBe(1);
  expect(established.wordmarkOpacity).toBe(1);
  expect(
    introFrame(DEFAULT_INTRO_DURATION_MS, DEFAULT_INTRO_DURATION_MS, true),
  ).toMatchObject({
    bodyOpacity: 1,
    sparkOpacity: 1,
    particleOpacity: 1,
    wordmarkOpacity: 1,
  });
  expect(introFrame(DEFAULT_INTRO_DURATION_MS).wordmarkOpacity).toBe(0);
});

test("resolved particle positions are balanced and every trail remains behind its head", () => {
  const frame = introFrame(DEFAULT_INTRO_DURATION_MS);
  const finalPoints = particles.map((particle) => {
    const headPoint = particleAt(particle, frame.motionSeconds);
    const head = positionOnPath(particle.orbit, headPoint.x, headPoint.y);
    expect(head.norm).toBeCloseTo(1, 8);
    for (let index = 0; index < 8; index++) {
      const age = (particle.trailDuration * (index + 1)) / 8;
      const trailPoint = particleAt(particle, frame.motionSeconds - age);
      const trail = positionOnPath(
        particle.orbit,
        trailPoint.x,
        trailPoint.y,
      );
      expect(trail.norm).toBeCloseTo(1, 8);
      expect(wrap(particle.direction * (head.phase - trail.phase))).toBeCloseTo(
        age / particle.period,
        8,
      );
    }
    return headPoint;
  });
  const xs = finalPoints.map((point) => point.x);
  const ys = finalPoints.map((point) => point.y);
  expect(Math.min(...xs)).toBeGreaterThan(40);
  expect(Math.max(...xs)).toBeLessThan(560);
  expect(Math.max(...xs) - Math.min(...xs)).toBeGreaterThan(250);
  expect(Math.max(...ys) - Math.min(...ys)).toBeGreaterThan(220);
  expect(
    new Set(
      finalPoints.map(
        (point) => `${point.x < 300 ? "left" : "right"}-${point.y < 300 ? "top" : "bottom"}`,
      ),
    ).size,
  ).toBe(4);
});
