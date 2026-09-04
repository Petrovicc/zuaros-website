export interface Orbit {
  id: string;
  rx: number;
  ry: number;
  rotation: number;
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

// The same definitions drive visible paths and particle positions.
export const orbits: Orbit[] = [
  { id: "inner", rx: 185, ry: 185, rotation: 0 },
  { id: "ascending", rx: 236, ry: 116, rotation: -38 },
  { id: "descending", rx: 236, ry: 116, rotation: 38 },
  { id: "outer", rx: 90, ry: 235, rotation: 38 },
];

export const particles: Particle[] = [
  {
    id: "primary",
    orbit: orbits[0],
    period: 14,
    phase: 0.06,
    direction: 1,
    radius: 3.5,
    opacity: 1,
    trailDuration: 0.52,
    mobile: true,
  },
  {
    id: "secondary",
    orbit: orbits[1],
    period: 19,
    phase: 0.43,
    direction: -1,
    radius: 2.7,
    opacity: 0.78,
    trailDuration: 0.46,
    mobile: true,
  },
  {
    id: "tertiary",
    orbit: orbits[2],
    period: 25,
    phase: 0.74,
    direction: 1,
    radius: 2.2,
    opacity: 0.62,
    trailDuration: 0.64,
    mobile: true,
  },
  {
    id: "distant",
    orbit: orbits[3],
    period: 31,
    phase: 0.21,
    direction: -1,
    radius: 1.6,
    opacity: 0.42,
    trailDuration: 0.42,
    mobile: false,
  },
];

export const TRAIL_COUNT = 8;
export const MOBILE_TRAIL_COUNT = 5;

export function pointOnOrbit(orbit: Orbit, turns: number) {
  const angle = (((turns % 1) + 1) % 1) * Math.PI * 2;
  const rotation = (orbit.rotation * Math.PI) / 180;
  const x = orbit.rx * Math.cos(angle);
  const y = orbit.ry * Math.sin(angle);
  return {
    x: 300 + x * Math.cos(rotation) - y * Math.sin(rotation),
    y: 300 + x * Math.sin(rotation) + y * Math.cos(rotation),
  };
}

export function particleAt(particle: Particle, seconds: number) {
  return pointOnOrbit(
    particle.orbit,
    particle.phase + (particle.direction * seconds) / particle.period,
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
