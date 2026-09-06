import {
  MOBILE_TRAIL_COUNT,
  particles,
  particleAtInto,
  sampleParticle,
  TRAIL_COUNT,
} from "./orbits";

/** Owns one RAF and cached SVG nodes. No per-frame React work or layout reads. */
export function animateOrbits(layer: SVGGElement, viewport: HTMLElement) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobile = window.matchMedia("(max-width: 680px)");
  const nodes = particles.map((particle) => {
    const group = layer.querySelector<SVGGElement>(
      `[data-particle="${particle.id}"]`,
    )!;
    return {
      particle,
      head: group.querySelector<SVGCircleElement>(".orbit-head")!,
      headPoint: { x: 0, y: 0 },
      trail: [...group.querySelectorAll<SVGCircleElement>(".orbit-trail circle")].map(
        (node) => ({ node, point: { x: 0, y: 0 } }),
      ),
    };
  });
  let frame: number | null = null;
  let elapsed = 0;
  let previous: number | null = null;
  let inView = !("IntersectionObserver" in window);
  let disposed = false;

  function draw(seconds: number) {
    const isMobile = mobile.matches;
    const trailCount = isMobile ? MOBILE_TRAIL_COUNT : TRAIL_COUNT;
    for (const { particle, head, headPoint, trail } of nodes) {
      if (mobile.matches && !particle.mobile) continue;
      particleAtInto(particle, seconds, headPoint);
      head.style.transform = `translate(${headPoint.x.toFixed(3)}px, ${headPoint.y.toFixed(3)}px)`;
      const duration = particle.trailDuration * (isMobile ? 0.6 : 1);
      for (let index = 0; index < trailCount; index++) {
        const age = (duration * (index + 1)) / trailCount;
        const entry = trail[index];
        particleAtInto(particle, seconds - age, entry.point);
        entry.node.style.transform =
          `translate(${entry.point.x.toFixed(3)}px, ${entry.point.y.toFixed(3)}px)`;
      }
    }
  }

  function tick(now: number) {
    frame = null;
    if (disposed) return;
    if (previous !== null) elapsed += Math.min((now - previous) / 1000, 0.1);
    previous = now;
    draw(elapsed);
    frame = requestAnimationFrame(tick);
  }

  function update() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    previous = null;
    if (disposed) return;
    const running = !reduced.matches && !document.hidden && inView;
    layer.dataset.motion = reduced.matches
      ? "reduced"
      : running
        ? "running"
        : "paused";
    // Refresh static styles on mode/visibility changes, never in the frame loop.
    for (const { particle, trail } of nodes) {
      sampleParticle(particle, 0, mobile.matches).trail.forEach(
        (point, index) => {
          trail[index].node.setAttribute("r", String(point.radius));
          trail[index].node.setAttribute("opacity", String(point.opacity));
        },
      );
    }
    draw(reduced.matches ? 0 : elapsed);
    if (running) frame = requestAnimationFrame(tick);
  }

  const observer =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          ([entry]) => {
            inView = entry.isIntersecting;
            update();
          },
          { threshold: 0 },
        )
      : null;
  observer?.observe(viewport);
  reduced.addEventListener("change", update);
  mobile.addEventListener("change", update);
  document.addEventListener("visibilitychange", update);
  update();

  return () => {
    disposed = true;
    if (frame !== null) cancelAnimationFrame(frame);
    observer?.disconnect();
    reduced.removeEventListener("change", update);
    mobile.removeEventListener("change", update);
    document.removeEventListener("visibilitychange", update);
  };
}
