import {
  particleAtInto,
  particles,
  TRAIL_COUNT,
  type OrbitPoint,
} from "./orbits";
import {
  DEFAULT_INTRO_DURATION_MS,
  introFrameInto,
  MAX_INTRO_DURATION_MS,
  MIN_INTRO_DURATION_MS,
  type IntroFrame,
} from "./introTimeline";

interface ParticleNodes {
  particle: (typeof particles)[number];
  group: SVGGElement;
  head: SVGCircleElement;
  headPoint: OrbitPoint;
  trailGroup: SVGGElement;
  trail: { node: SVGCircleElement; point: OrbitPoint }[];
}

export interface IntroAnimationOptions {
  durationMs?: number;
  showWordmark?: boolean;
  reducedMotion?: boolean;
  onComplete?: () => void;
}

/** Reuses cached SVG nodes and coordinate objects throughout one finite intro. */
export function animateIntro(
  svg: SVGSVGElement,
  viewport: HTMLElement,
  options: IntroAnimationOptions = {},
) {
  const durationMs = Math.max(
    MIN_INTRO_DURATION_MS,
    Math.min(MAX_INTRO_DURATION_MS, options.durationMs ?? DEFAULT_INTRO_DURATION_MS),
  );
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  const ignition = svg.querySelector<SVGCircleElement>("[data-intro-ignition]")!;
  const body = svg.querySelector<SVGGElement>("[data-intro-body]")!;
  const spark = svg.querySelector<SVGGElement>("[data-intro-spark]")!;
  const orbitNodes = [
    ...svg.querySelectorAll<SVGEllipseElement>("[data-intro-orbit]"),
  ];
  const wordmark = svg.querySelector<SVGGElement>("[data-intro-wordmark]");
  const particleNodes: ParticleNodes[] = particles.map((particle) => {
    const group = svg.querySelector<SVGGElement>(
      `[data-intro-particle="${particle.id}"]`,
    )!;
    return {
      particle,
      group,
      head: group.querySelector<SVGCircleElement>(".intro-particle-head")!,
      headPoint: { x: 0, y: 0 },
      trailGroup: group.querySelector<SVGGElement>(".intro-particle-trail")!,
      trail: [
        ...group.querySelectorAll<SVGCircleElement>(".intro-particle-trail circle"),
      ].map((node) => ({ node, point: { x: 0, y: 0 } })),
    };
  });
  const symbolTransform = body.dataset.baseTransform!;
  const centerX = Number(body.dataset.centerX);
  const centerY = Number(body.dataset.centerY);
  let frame: number | null = null;
  let elapsed = 0;
  let previous: number | null = null;
  let inView = !("IntersectionObserver" in window);
  let disposed = false;
  let completed = false;
  const state: IntroFrame = {
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
  };

  function isReduced() {
    return options.reducedMotion ?? media.matches;
  }

  function complete() {
    if (completed || disposed) return;
    completed = true;
    viewport.dataset.state = "complete";
    options.onComplete?.();
  }

  function draw(milliseconds: number) {
    introFrameInto(state, milliseconds, durationMs, options.showWordmark);
    ignition.setAttribute("opacity", state.ignitionOpacity.toFixed(3));
    body.setAttribute("opacity", state.bodyOpacity.toFixed(3));
    body.setAttribute(
      "transform",
      `translate(${centerX} ${centerY}) scale(${state.bodyScale.toFixed(4)}) translate(${-centerX} ${-centerY}) ${symbolTransform}`,
    );
    spark.setAttribute("opacity", state.sparkOpacity.toFixed(3));
    spark.style.filter = `drop-shadow(0 0 ${(2 + state.sparkGlow * 7).toFixed(2)}px rgb(246 197 128 / ${(0.08 + state.sparkGlow * 0.3).toFixed(3)}))`;
    for (let index = 0; index < orbitNodes.length; index++) {
      const orbit = orbitNodes[index];
      const progress = state.orbitProgress[index];
      orbit.style.strokeDashoffset = (1 - progress).toFixed(4);
      orbit.setAttribute("opacity", (progress * (0.42 + index * 0.035)).toFixed(3));
    }
    wordmark?.setAttribute("opacity", state.wordmarkOpacity.toFixed(3));

    for (const entry of particleNodes) {
      const { particle } = entry;
      entry.group.setAttribute("opacity", state.particleOpacity.toFixed(3));
      entry.trailGroup.setAttribute("opacity", state.trailOpacity.toFixed(3));
      particleAtInto(particle, state.motionSeconds, entry.headPoint);
      entry.head.style.transform = `translate(${entry.headPoint.x.toFixed(3)}px, ${entry.headPoint.y.toFixed(3)}px)`;
      for (let index = 0; index < entry.trail.length; index++) {
        const age = (particle.trailDuration * (index + 1)) / TRAIL_COUNT;
        const trail = entry.trail[index];
        particleAtInto(particle, state.motionSeconds - age, trail.point);
        trail.node.style.transform = `translate(${trail.point.x.toFixed(3)}px, ${trail.point.y.toFixed(3)}px)`;
      }
    }
  }

  function tick(now: number) {
    frame = null;
    if (disposed) return;
    if (previous !== null) elapsed += Math.min(now - previous, 100);
    previous = now;
    draw(elapsed);
    if (elapsed >= durationMs) {
      complete();
      return;
    }
    frame = requestAnimationFrame(tick);
  }

  function update() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    previous = null;
    if (disposed || completed) return;
    if (isReduced()) {
      viewport.dataset.state = "reduced";
      draw(durationMs);
      frame = requestAnimationFrame(() => {
        frame = null;
        complete();
      });
      return;
    }
    const running = !document.hidden && inView;
    viewport.dataset.state = running ? "running" : "paused";
    draw(elapsed);
    if (running) frame = requestAnimationFrame(tick);
  }

  const observer =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          ([entry]) => {
            inView = entry.isIntersecting;
            update();
          },
          { threshold: 0.05 },
        )
      : null;
  observer?.observe(viewport);
  media.addEventListener("change", update);
  document.addEventListener("visibilitychange", update);
  update();

  return () => {
    disposed = true;
    if (frame !== null) cancelAnimationFrame(frame);
    observer?.disconnect();
    media.removeEventListener("change", update);
    document.removeEventListener("visibilitychange", update);
  };
}
