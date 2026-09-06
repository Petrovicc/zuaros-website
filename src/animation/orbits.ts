import mark from "../brand/mark.json" with { type: "json" };

export interface Orbit {
  id: string;
  rx: number;
  ry: number;
  rotation: number;
}

export interface OrbitPoint {
  x: number;
  y: number;
}

export interface Particle {
  id: string;
  orbit: Orbit;
  period: number;
  phase: number;
  direction: 1 | -1;
  radius: number;
  opacity: number;
  trailDuration: number;
  mobile: boolean;
}

// Hero, exported emblem, preview intro, and MAUI generator all start here.
export const orbits: Orbit[] = mark.orbital.orbits.map((orbit) => ({
  ...orbit,
}));

export const particles: Particle[] = mark.orbital.particles.map((particle) => ({
  ...particle,
  direction: particle.direction as 1 | -1,
  orbit: orbits.find((orbit) => orbit.id === particle.orbit)!,
}));

export const TRAIL_COUNT = 8;
export const MOBILE_TRAIL_COUNT = 5;

export function pointOnOrbitInto(
  orbit: Orbit,
  turns: number,
  target: OrbitPoint,
) {
  const angle = (((turns % 1) + 1) % 1) * Math.PI * 2;
  const rotation = (orbit.rotation * Math.PI) / 180;
  const x = orbit.rx * Math.cos(angle);
  const y = orbit.ry * Math.sin(angle);
  target.x = mark.orbital.center.x + x * Math.cos(rotation) - y * Math.sin(rotation);
  target.y = mark.orbital.center.y + x * Math.sin(rotation) + y * Math.cos(rotation);
  return target;
}

export function pointOnOrbit(orbit: Orbit, turns: number) {
  return pointOnOrbitInto(orbit, turns, { x: 0, y: 0 });
}

export function particleAt(particle: Particle, seconds: number) {
  return pointOnOrbit(
    particle.orbit,
    particle.phase + (particle.direction * seconds) / particle.period,
  );
}

export function particleAtInto(
  particle: Particle,
  seconds: number,
  target: OrbitPoint,
) {
  return pointOnOrbitInto(
    particle.orbit,
    particle.phase + (particle.direction * seconds) / particle.period,
    target,
  );
}

export function sampleParticle(
  particle: Particle,
  seconds: number,
  mobile = false,
) {
  const count = mobile ? MOBILE_TRAIL_COUNT : TRAIL_COUNT;
  const duration = particle.trailDuration * (mobile ? 0.6 : 1);
  return {
    head: particleAt(particle, seconds),
    trail: Array.from({ length: count }, (_, index) => {
      const age = (duration * (index + 1)) / count;
      const fade = 1 - (index + 1) / (count + 1);
      return {
        // Sample an EARLIER TIME, not an unsigned spatial offset.
        // Direction is applied inside particleAt, so reversing it reverses the trail too.
        ...particleAt(particle, seconds - age),
        age,
        radius: particle.radius * (0.22 + 0.46 * fade),
        opacity: particle.opacity * 0.56 * fade * fade,
      };
    }),
  };
}
