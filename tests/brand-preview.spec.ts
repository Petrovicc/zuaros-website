import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import sharp from "sharp";
import { particles, type Orbit } from "../src/animation/orbits";
import {
  DEFAULT_INTRO_DURATION_MS,
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

test("intro timeline stays short, ordered, and gives the wordmark a final hold", () => {
  expect(DEFAULT_INTRO_DURATION_MS).toBeGreaterThanOrEqual(
    MIN_INTRO_DURATION_MS,
  );
  expect(DEFAULT_INTRO_DURATION_MS).toBeLessThanOrEqual(MAX_INTRO_DURATION_MS);
  expect(introFrame(0).bodyOpacity).toBe(0);
  expect(introFrame(200).ignitionOpacity).toBeGreaterThan(0);
  expect(introFrame(540).bodyOpacity).toBe(1);
  expect(introFrame(560).orbitProgress[0]).toBeGreaterThan(0);
  expect(introFrame(560).orbitProgress[1]).toBe(0);
  expect(introFrame(900).particleOpacity).toBe(1);
  expect(introFrame(1360, DEFAULT_INTRO_DURATION_MS, true).wordmarkOpacity).toBe(
    1,
  );
  expect(introFrame(DEFAULT_INTRO_DURATION_MS, DEFAULT_INTRO_DURATION_MS, true)).toMatchObject(
    { bodyOpacity: 1, sparkOpacity: 1, particleOpacity: 1, wordmarkOpacity: 1 },
  );
  expect(introFrame(DEFAULT_INTRO_DURATION_MS).wordmarkOpacity).toBe(0);
  expect(DEFAULT_INTRO_DURATION_MS - 1360).toBeGreaterThanOrEqual(300);
  expect(DEFAULT_INTRO_DURATION_MS - 1360).toBeLessThanOrEqual(600);
});

test("brand preview exposes every asset family and both intro variants", async ({
  page,
}) => {
  await page.goto("./?brand-preview=1");
  await expect(page.locator(".brand-preview-page")).toBeVisible();
  await expect(page.locator(".site-header")).toHaveCount(0);
  await expect(page.getByText("Core mark · dark surface")).toBeVisible();
  await expect(page.getByText("Full orbital emblem · dark surface")).toBeVisible();
  await expect(page.getByText("Horizontal lockup", { exact: true })).toBeVisible();
  await expect(page.getByText("Vertical lockup", { exact: true })).toBeVisible();
  await expect(page.getByText("Monochrome dark", { exact: true })).toBeVisible();
  await expect(page.getByText("Monochrome light", { exact: true })).toBeVisible();
  await expect(page.locator('.studio-intro[data-variant="symbol"]')).toHaveCount(1);
  await expect(page.locator('.studio-intro[data-variant="wordmark"]')).toHaveCount(1);
  expect(
    await page.locator(".brand-asset-card img").evaluateAll((images) =>
      images.every(
        (image) =>
          image instanceof HTMLImageElement &&
          image.complete &&
          image.naturalWidth > 0,
      ),
    ),
  ).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    await page.evaluate(() => innerWidth),
  );
  const accessibility = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(accessibility.violations).toEqual([]);
});

test("intro uses historical positions behind all four moving heads", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto("./?brand-preview=1&intro=symbol");
  await expect(page.locator(".studio-intro")).toHaveAttribute(
    "data-state",
    "running",
  );
  await page.waitForTimeout(950);
  const rendered = await page.locator("[data-intro-particle]").evaluateAll((groups) =>
    groups.map((group) => {
      const point = (node: Element) => {
        const matrix = new DOMMatrix(getComputedStyle(node).transform);
        return { x: matrix.e, y: matrix.f };
      };
      return {
        id: group.getAttribute("data-intro-particle")!,
        opacity: Number(group.getAttribute("opacity")),
        head: point(group.querySelector(".intro-particle-head")!),
        trail: [...group.querySelectorAll(".intro-particle-trail circle")].map(point),
      };
    }),
  );
  expect(rendered).toHaveLength(4);
  for (const renderedParticle of rendered) {
    const particle = particles.find((candidate) => candidate.id === renderedParticle.id)!;
    expect(renderedParticle.opacity).toBeGreaterThan(0.9);
    const head = positionOnPath(particle.orbit, renderedParticle.head.x, renderedParticle.head.y);
    expect(head.norm).toBeCloseTo(1, 4);
    expect(renderedParticle.trail).toHaveLength(8);
    renderedParticle.trail.forEach((point, index) => {
      const trail = positionOnPath(particle.orbit, point.x, point.y);
      const age = (particle.trailDuration * (index + 1)) / renderedParticle.trail.length;
      expect(trail.norm).toBeCloseTo(1, 4);
      expect(wrap(particle.direction * (head.phase - trail.phase))).toBeCloseTo(
        age / particle.period,
        4,
      );
    });
  }
  await expect(page.locator(".studio-intro")).toHaveAttribute(
    "data-state",
    "complete",
  );
  const completedPositions = await page
    .locator(".intro-particle-head")
    .evaluateAll((heads) => heads.map((head) => head.getAttribute("style")));
  await page.waitForTimeout(250);
  expect(
    await page
      .locator(".intro-particle-head")
      .evaluateAll((heads) => heads.map((head) => head.getAttribute("style"))),
  ).toEqual(completedPositions);
});

test("reduced motion resolves safely and completion does not restart on rerender", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./?brand-preview=1&intro=wordmark");
  await expect(page.locator(".studio-intro")).toHaveAttribute(
    "data-state",
    "complete",
  );
  await expect(page.locator("[data-intro-body]")).toHaveAttribute("opacity", "1.000");
  await expect(page.locator("[data-intro-wordmark]")).toHaveAttribute(
    "opacity",
    "1.000",
  );
  await expect(page.locator(".intro-particle-trail").first()).toBeHidden();
  const position = await page
    .locator(".intro-particle-head")
    .first()
    .getAttribute("style");
  await page.waitForTimeout(250);
  expect(
    await page.locator(".intro-particle-head").first().getAttribute("style"),
  ).toBe(position);

  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("./?brand-preview=1&intro=completion-test");
  await expect(page.locator("[data-completion-count]")).toHaveText("1");
  await expect(page.locator(".studio-intro")).toBeHidden();
  await page.waitForTimeout(1700);
  await expect(page.locator("[data-completion-count]")).toHaveText("1");
});

test("intro remains centered at the three target output resolutions", async ({
  browser,
}) => {
  for (const target of [
    { viewport: { width: 360, height: 800 }, deviceScaleFactor: 3 },
    { viewport: { width: 480, height: 1067 }, deviceScaleFactor: 3 },
    { viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 },
  ]) {
    const context = await browser.newContext(target);
    const page = await context.newPage();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(
      `${test.info().project.use.baseURL as string}?brand-preview=1&intro=wordmark`,
    );
    await expect(page.locator(".studio-intro")).toHaveAttribute(
      "data-state",
      "complete",
    );
    const layout = await page.locator(".studio-intro > svg").evaluate((svg) => {
      const box = svg.getBoundingClientRect();
      return {
        centerX: box.left + box.width / 2,
        centerY: box.top + box.height / 2,
        inside:
          box.left >= 0 &&
          box.top >= 0 &&
          box.right <= innerWidth &&
          box.bottom <= innerHeight,
        overflow: document.documentElement.scrollWidth > innerWidth,
      };
    });
    expect(layout.centerX).toBeCloseTo(target.viewport.width / 2, 0);
    expect(layout.centerY).toBeCloseTo(target.viewport.height / 2, 0);
    expect(layout.inside).toBe(true);
    expect(layout.overflow).toBe(false);
    const metadata = await sharp(await page.screenshot()).metadata();
    expect(metadata.width).toBe(target.viewport.width * target.deviceScaleFactor);
    expect(metadata.height).toBe(target.viewport.height * target.deviceScaleFactor);
    await context.close();
  }
});
