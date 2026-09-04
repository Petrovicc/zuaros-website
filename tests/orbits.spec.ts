import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import mark from "../src/brand/mark.json" with { type: "json" };
import { particles, sampleParticle, type Orbit } from "../src/animation/orbits";

const tau = 2 * Math.PI;
const wrap = (turns: number) => ((turns % 1) + 1) % 1;

// Independent inverse geometry: undo the ellipse rotation and recover its phase.
function positionOnPath(orbit: Orbit, x: number, y: number) {
  const rotation = (orbit.rotation * Math.PI) / 180;
  const dx = x - 300,
    dy = y - 300;
  const u = (dx * Math.cos(rotation) + dy * Math.sin(rotation)) / orbit.rx;
  const v = (-dx * Math.sin(rotation) + dy * Math.cos(rotation)) / orbit.ry;
  return { phase: wrap(Math.atan2(v, u) / tau), norm: u * u + v * v };
}

for (const original of particles) {
  for (const direction of [1, -1] as const) {
    test(`${original.id}: ${direction === 1 ? "clockwise" : "counterclockwise"} head leads every historical sample`, () => {
      const particle = { ...original, direction };
      for (const mobile of [false, true]) {
        const count = mobile ? 5 : 8;
        const duration = particle.trailDuration * (mobile ? 0.6 : 1);
        // Includes zero, wrap boundaries, negative history and many complete loops.
        for (let step = 0; step <= 200; step++) {
          const seconds =
            ((step / 200) * 4 - particle.phase * direction) * particle.period;
          const sample = sampleParticle(particle, seconds, mobile);
          expect(sample.trail).toHaveLength(count);
          const head = positionOnPath(
            particle.orbit,
            sample.head.x,
            sample.head.y,
          );
          expect(head.norm).toBeCloseTo(1, 10);
          const expectedHead = wrap(
            particle.phase + (direction * seconds) / particle.period,
          );
          expect(
            Math.abs(Math.sin((head.phase - expectedHead) * tau)),
          ).toBeLessThan(1e-10);
          expect(Math.cos((head.phase - expectedHead) * tau)).toBeCloseTo(
            1,
            10,
          );
          let lastRadius = particle.radius,
            lastOpacity = particle.opacity;
          sample.trail.forEach((point, index) => {
            const tail = positionOnPath(particle.orbit, point.x, point.y);
            const age = (duration * (index + 1)) / count;
            expect(tail.norm).toBeCloseTo(1, 10);
            // Signed phase lag must equal elapsed past time, for either direction.
            expect(wrap(direction * (head.phase - tail.phase))).toBeCloseTo(
              age / particle.period,
              10,
            );
            expect(point.age).toBeCloseTo(age, 10);
            expect(point.radius).toBeLessThan(lastRadius);
            expect(point.opacity).toBeLessThan(lastOpacity);
            lastRadius = point.radius;
            lastOpacity = point.opacity;
          });
        }
      }
    });
  }
}

test("all exported SVGs and the hero use the one final mark", async ({
  page,
}) => {
  for (const file of [
    "zuaros-logo.svg",
    "zuaros-logo-light.svg",
    "zuaros-logo-dark.svg",
    "zuaros-logo-mono.svg",
    "zuaros-symbol.svg",
    "favicon.svg",
    "social-preview.svg",
  ]) {
    const svg = await readFile(`public/brand/${file}`, "utf8");
    expect(svg).toContain(`d="${mark.body}"`);
    expect(svg).toContain(`d="${mark.spark}"`);
  }
  await page.goto("./");
  await expect(page.locator(".core-symbol path").nth(0)).toHaveAttribute(
    "d",
    mark.body,
  );
  await expect(page.locator(".core-symbol path").nth(1)).toHaveAttribute(
    "d",
    mark.spark,
  );
  await expect(page.locator(".header-inner img")).toHaveAttribute(
    "src",
    /brand\/zuaros-logo-light\.svg$/,
  );
});

for (const width of [430, 1366]) {
  test(`rendered particles follow their paths with trailing tails at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1024 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("./");
    await page.locator(".core-field").scrollIntoViewIfNeeded();
    await expect(page.locator(".orbit-particles")).toHaveAttribute(
      "data-motion",
      "running",
    );
    const previous = new Map<string, number>();
    // Two actual browser frames separated enough to identify direction, not just appearance.
    for (let frame = 0; frame < 2; frame++) {
      if (frame) await page.waitForTimeout(180);
      const rendered = await page
        .locator("[data-particle]")
        .evaluateAll((groups) =>
          groups.map((group) => {
            const read = (node: Element) => {
              const matrix = new DOMMatrix(getComputedStyle(node).transform);
              return {
                x: matrix.e,
                y: matrix.f,
                radius: Number(node.getAttribute("r")),
                opacity: Number(node.getAttribute("opacity")),
              };
            };
            return {
              id: group.getAttribute("data-particle")!,
              visible: getComputedStyle(group).display !== "none",
              head: read(group.querySelector(".orbit-head")!),
              trail: [...group.querySelectorAll(".orbit-trail circle")]
                .filter((node) => getComputedStyle(node).display !== "none")
                .map(read),
            };
          }),
        );
      expect(rendered.filter((p) => p.visible)).toHaveLength(
        width < 681 ? 3 : 4,
      );
      for (const renderedParticle of rendered.filter((p) => p.visible)) {
        const config = particles.find((p) => p.id === renderedParticle.id)!;
        const head = positionOnPath(
          config.orbit,
          renderedParticle.head.x,
          renderedParticle.head.y,
        );
        expect(head.norm).toBeCloseTo(1, 4);
        expect(renderedParticle.trail).toHaveLength(width < 681 ? 5 : 8);
        let radius = renderedParticle.head.radius,
          opacity = renderedParticle.head.opacity;
        for (const [index, point] of renderedParticle.trail.entries()) {
          const tail = positionOnPath(config.orbit, point.x, point.y);
          expect(tail.norm).toBeCloseTo(1, 4);
          const expectedAge =
            (config.trailDuration * (width < 681 ? 0.6 : 1) * (index + 1)) /
            renderedParticle.trail.length;
          expect(
            wrap(config.direction * (head.phase - tail.phase)),
          ).toBeCloseTo(expectedAge / config.period, 4);
          expect(point.radius).toBeLessThan(radius);
          expect(point.opacity).toBeLessThan(opacity);
          radius = point.radius;
          opacity = point.opacity;
        }
        if (previous.has(config.id)) {
          const progress = wrap(
            config.direction * (head.phase - previous.get(config.id)!),
          );
          expect(progress).toBeGreaterThan(0);
          expect(progress).toBeLessThan(0.12);
        }
        previous.set(config.id, head.phase);
      }
    }
  });
}

test("motion pauses offscreen and responds immediately to reduced-motion changes", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("./");
  const layer = page.locator(".orbit-particles");
  const heads = page.locator(".orbit-head");
  const positions = () =>
    heads.evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute("style")),
    );
  await expect(layer).toHaveAttribute("data-motion", "running");
  await page.locator("#contact").scrollIntoViewIfNeeded();
  await expect(layer).toHaveAttribute("data-motion", "paused");
  const paused = await positions();
  await page.waitForTimeout(200);
  expect(await positions()).toEqual(paused);
  await page.locator(".core-field").scrollIntoViewIfNeeded();
  await expect(layer).toHaveAttribute("data-motion", "running");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(layer).toHaveAttribute("data-motion", "reduced");
  for (const trail of await page.locator(".orbit-trail").all())
    await expect(trail).toBeHidden();
  const stationary = await positions();
  await page.waitForTimeout(200);
  expect(await positions()).toEqual(stationary);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(layer).toHaveAttribute("data-motion", "running");
});

test("SVG work is bounded per frame, with stable nodes/listeners and no hidden-page work", async ({
  page,
  context,
}) => {
  await page.addInitScript(() => {
    const scope = window as unknown as Window & { testFrameCount: number };
    scope.testFrameCount = 0;
    const request = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (callback) =>
      request((now) => {
        scope.testFrameCount++;
        callback(now);
      });
  });
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto("./");
  await expect(page.locator(".orbit-particles")).toHaveAttribute(
    "data-motion",
    "running",
  );
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1500); // Let the one-time entrance finish.
  const session = await context.newCDPSession(page);
  await session.send("Performance.enable");
  const metric = (metrics: { name: string; value: number }[], name: string) =>
    metrics.find((m) => m.name === name)!.value;
  const frameCount = () =>
    page.evaluate(
      () =>
        (window as unknown as Window & { testFrameCount: number })
          .testFrameCount,
    );
  const firstFrame = await frameCount();
  const before = await session.send("Performance.getMetrics");
  await page.waitForTimeout(700);
  const after = await session.send("Performance.getMetrics");
  const frames = (await frameCount()) - firstFrame;
  const layouts =
    metric(after.metrics, "LayoutCount") -
    metric(before.metrics, "LayoutCount");
  expect(frames).toBeGreaterThan(0);
  // Chromium includes normal SVG transform bookkeeping in LayoutCount.
  // Batched writes should cause at most one pass/frame, not read/write thrashing.
  expect(layouts).toBeLessThanOrEqual(frames + 2);
  for (const name of ["Nodes", "JSEventListeners"]) {
    expect(metric(after.metrics, name)).toBe(metric(before.metrics, name));
  }
  await test.info().attach("animation-metrics", {
    body: JSON.stringify({
      frames,
      layouts,
      layoutMilliseconds:
        (metric(after.metrics, "LayoutDuration") -
          metric(before.metrics, "LayoutDuration")) *
        1000,
      scriptMilliseconds:
        (metric(after.metrics, "ScriptDuration") -
          metric(before.metrics, "ScriptDuration")) *
        1000,
    }),
    contentType: "application/json",
  });
  await page.locator("#contact").scrollIntoViewIfNeeded();
  await expect(page.locator(".orbit-particles")).toHaveAttribute(
    "data-motion",
    "paused",
  );
  await page.waitForTimeout(150);
  const pausedFrame = await frameCount();
  const paused = await session.send("Performance.getMetrics");
  await page.waitForTimeout(300);
  const idle = await session.send("Performance.getMetrics");
  expect(await frameCount()).toBe(pausedFrame);
  expect(metric(idle.metrics, "LayoutCount")).toBe(
    metric(paused.metrics, "LayoutCount"),
  );
  await session.detach();
});
