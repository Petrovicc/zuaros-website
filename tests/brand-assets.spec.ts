import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import sharp from "sharp";
import mark from "../src/brand/mark.json" with { type: "json" };

const core = [
  "zuaros-core.svg",
  "zuaros-core-dark.svg",
  "zuaros-core-light.svg",
  "zuaros-core-mono-dark.svg",
  "zuaros-core-mono-light.svg",
];
const orbital = [
  "zuaros-orbital.svg",
  "zuaros-orbital-dark.svg",
  "zuaros-orbital-light.svg",
  "zuaros-orbital-on-dark.svg",
  "zuaros-orbital-on-light.svg",
  "zuaros-orbital-monochrome.svg",
  "zuaros-orbital-mono-dark.svg",
  "zuaros-orbital-mono-light.svg",
  "zuaros-orbital-horizontal.svg",
  "zuaros-orbital-horizontal-on-light.svg",
  "zuaros-orbital-horizontal-mono-dark.svg",
  "zuaros-orbital-horizontal-mono-light.svg",
  "zuaros-orbital-vertical.svg",
  "zuaros-orbital-vertical-on-light.svg",
  "zuaros-orbital-vertical-mono-dark.svg",
  "zuaros-orbital-vertical-mono-light.svg",
];
const aspectRatio = (viewBox: string) => {
  const [, , width, height] = viewBox.split(/\s+/).map(Number);
  return height / width;
};
const csharpNumber = (value: number) => `${Number(value.toFixed(6))}f`;

test("all brand SVGs preserve the master Z and spark geometry", async () => {
  for (const name of core) {
    const svg = await readFile(`public/brand/core/${name}`, "utf8");
    expect(svg).toContain(`d="${mark.body}"`);
    expect(svg).toContain(`d="${mark.spark}"`);
    expect(svg).not.toContain("<rect");
  }
  for (const name of orbital) {
    const svg = await readFile(`public/brand/orbital/${name}`, "utf8");
    expect(svg).toContain(`d="${mark.body}"`);
    expect(svg).toContain(`d="${mark.spark}"`);
    expect(svg.indexOf("<ellipse")).toBeLessThan(svg.indexOf(`d="${mark.body}"`));
  }
  const mauiGeometry = await readFile(
    "extras/maui/ZuarosIntro/ZuarosGeometry.Generated.cs",
    "utf8",
  );
  const mauiSplash = await readFile(
    "extras/maui/ZuarosIntro/Resources/Splash/zuaros-splash.svg",
    "utf8",
  );
  for (const source of [mauiGeometry, mauiSplash]) {
    expect(source).toContain(mark.body);
    expect(source).toContain(mark.spark);
  }
  const master = await readFile("src/brand/zuaros-master.svg", "utf8");
  expect(master).toContain(mark.body);
  expect(master).toContain(mark.spark);
  for (const orbit of mark.orbital.orbits) {
    expect(master).toContain(`data-orbit="${orbit.id}"`);
  }
  const [emblemMinX, , emblemWidth] = mark.orbital.viewBox
    .split(/\s+/)
    .map(Number);
  const normalizedScale = 100 / emblemWidth;
  expect(mauiGeometry).toContain(
    `CenterX = ${csharpNumber((mark.orbital.center.x - emblemMinX) * normalizedScale)}`,
  );
  for (const orbit of mark.orbital.orbits) {
    expect(mauiGeometry).toContain(
      `new(${csharpNumber(orbit.rx * normalizedScale)}, ${csharpNumber(orbit.ry * normalizedScale)}, ${csharpNumber(orbit.rotation)})`,
    );
  }
});

test("clean emblem contains only four thin paths, four bodies, and the core", async () => {
  const svg = await readFile(
    "public/brand/orbital/zuaros-orbital-on-dark.svg",
    "utf8",
  );
  expect(svg.match(/<ellipse/g)).toHaveLength(4);
  expect(svg.match(/<circle/g)).toHaveLength(4);
  expect(svg.match(/stroke-width="1\.(15|35)"/g)).toHaveLength(4);
  expect(svg).not.toMatch(/<text|crosshair|coordinate|Z \/ 001|stroke-dasharray/i);
  expect(svg).not.toContain("<rect");
});

test("background and monochrome variants use the documented inks", async () => {
  const onDark = await readFile(
    "public/brand/orbital/zuaros-orbital-on-dark.svg",
    "utf8",
  );
  const onLight = await readFile(
    "public/brand/orbital/zuaros-orbital-on-light.svg",
    "utf8",
  );
  const monoDark = await readFile(
    "public/brand/orbital/zuaros-orbital-mono-dark.svg",
    "utf8",
  );
  const monoLight = await readFile(
    "public/brand/orbital/zuaros-orbital-mono-light.svg",
    "utf8",
  );
  expect(onDark).toContain("#EDB466");
  expect(onDark).toContain("#B59A70");
  expect(onLight).toContain("#976018");
  expect(onLight).toContain("#34382F");
  expect(monoDark).not.toMatch(/#EDB466|#B59A70|#F1F0E9/);
  expect(monoLight).not.toMatch(/#EDB466|#B59A70|#101211/);
});

test("transparent PNG exports have the requested dimensions and alpha", async () => {
  for (const size of [256, 512, 1024, 2048]) {
    for (const [path, expectedRatio] of [
      [`public/brand/raster/core/zuaros-core-${size}.png`, 1],
      [`public/brand/raster/orbital/zuaros-orbital-${size}.png`, 1],
      [
        `public/brand/raster/orbital/zuaros-orbital-on-light-${size}.png`,
        1,
      ],
      [
        `public/brand/raster/lockups/zuaros-orbital-horizontal-${size}.png`,
        aspectRatio(mark.lockups.horizontal.viewBox),
      ],
      [
        `public/brand/raster/lockups/zuaros-orbital-vertical-${size}.png`,
        aspectRatio(mark.lockups.vertical.viewBox),
      ],
    ] as const) {
      const image = sharp(path);
      const metadata = await image.metadata();
      expect(metadata.width).toBe(size);
      expect(metadata.height).toBe(Math.round(size * expectedRatio));
      expect(metadata.hasAlpha).toBe(true);
      const stats = await image.stats();
      expect(stats.channels[3].min).toBe(0);
      expect(stats.channels[3].max).toBe(255);
    }
  }
});
