import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

const masterSource = await readFile("src/brand/zuaros-master.svg", "utf8");
const attributes = (tag) =>
  Object.fromEntries(
    [...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map((match) => [
      match[1],
      match[2],
    ]),
  );
const element = (id) => {
  const match = masterSource.match(new RegExp(`<[^>]+\\bid="${id}"[^>]*>`));
  if (!match) throw new Error(`Missing #${id} in the master SVG`);
  return attributes(match[0]);
};
const groupBody = (id) => {
  const match = masterSource.match(
    new RegExp(`<g[^>]+\\bid="${id}"[^>]*>([\\s\\S]*?)<\\/g>`),
  );
  if (!match) throw new Error(`Missing #${id} contents in the master SVG`);
  return match[1];
};
const number = (value, label) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error(`Invalid ${label}: ${value}`);
  return parsed;
};

const master = element("zuaros-master");
const emblem = element("zuaros-emblem");
const core = element("zuaros-core");
const wordmarkElement = element("zuaros-wordmark");
const horizontal = element("zuaros-horizontal-layout");
const vertical = element("zuaros-vertical-layout");
const orbitElements = [...masterSource.matchAll(/<ellipse\s+[^>]*data-orbit="[^"]+"[^>]*\/?\s*>/g)].map(
  (match) => attributes(match[0]),
);
const particleElements = [
  ...masterSource.matchAll(/<circle\s+[^>]*data-particle="[^"]+"[^>]*\/?\s*>/g),
].map((match) => attributes(match[0]));
const wordmarkPaths = [
  ...groupBody("zuaros-wordmark").matchAll(/<path\s+[^>]*d="([^"]+)"[^>]*\/?\s*>/g),
].map((match) => match[1]);

const mark = {
  viewBox: master["data-core-view-box"],
  body: element("zuaros-core-body").d,
  spark: element("zuaros-core-spark").d,
  wordmark: {
    viewBox: wordmarkElement["data-view-box"],
    strokeWidth: number(
      wordmarkElement["data-stroke-width"],
      "wordmark stroke width",
    ),
    paths: wordmarkPaths,
  },
  orbital: {
    viewBox: master["data-emblem-view-box"],
    center: {
      x: number(emblem["data-center-x"], "emblem center x"),
      y: number(emblem["data-center-y"], "emblem center y"),
    },
    symbol: {
      x: number(core["data-x"], "core x"),
      y: number(core["data-y"], "core y"),
      scale: number(core["data-scale"], "core scale"),
      rotation: number(core["data-rotation"], "core rotation"),
    },
    orbits: orbitElements.map((orbit) => ({
      id: orbit["data-orbit"],
      rx: number(orbit.rx, `${orbit["data-orbit"]} rx`),
      ry: number(orbit.ry, `${orbit["data-orbit"]} ry`),
      rotation: number(
        orbit["data-rotation"],
        `${orbit["data-orbit"]} rotation`,
      ),
    })),
    particles: particleElements.map((particle) => ({
      id: particle["data-particle"],
      orbit: particle["data-orbit"],
      period: number(particle["data-period"], "particle period"),
      phase: number(particle["data-phase"], "particle phase"),
      direction: number(particle["data-direction"], "particle direction"),
      radius: number(particle.r, "particle radius"),
      opacity: number(particle.opacity, "particle opacity"),
      trailDuration: number(
        particle["data-trail-duration"],
        "particle trail duration",
      ),
      mobile: particle["data-mobile"] === "true",
    })),
  },
  lockups: {
    horizontal: {
      viewBox: horizontal["data-view-box"],
      emblemX: number(horizontal["data-emblem-x"], "horizontal emblem x"),
      emblemY: number(horizontal["data-emblem-y"], "horizontal emblem y"),
      emblemScale: number(
        horizontal["data-emblem-scale"],
        "horizontal emblem scale",
      ),
      wordmarkX: number(
        horizontal["data-wordmark-x"],
        "horizontal wordmark x",
      ),
      wordmarkY: number(
        horizontal["data-wordmark-y"],
        "horizontal wordmark y",
      ),
      wordmarkScale: number(
        horizontal["data-wordmark-scale"],
        "horizontal wordmark scale",
      ),
    },
    vertical: {
      viewBox: vertical["data-view-box"],
      wordmarkX: number(vertical["data-wordmark-x"], "vertical wordmark x"),
      wordmarkY: number(vertical["data-wordmark-y"], "vertical wordmark y"),
      wordmarkScale: number(
        vertical["data-wordmark-scale"],
        "vertical wordmark scale",
      ),
    },
  },
};

await writeFile("src/brand/mark.json", `${JSON.stringify(mark, null, 2)}\n`);

const root = "public/brand";
const coreDir = `${root}/core`;
const orbitalDir = `${root}/orbital`;
const rasterDir = `${root}/raster`;
const mauiDir = "extras/maui/ZuarosIntro";
const sizes = [256, 512, 1024, 2048];

// The master SVG supplies React, vector exports, raster derivatives, and MAUI.
const symbol = (bodyColor, sparkColor = bodyColor) =>
  `<path d="${mark.body}" fill="${bodyColor}"/><path d="${mark.spark}" fill="${sparkColor}"/>`;

const wordmark = (color) =>
  `<g fill="none" stroke="${color}" stroke-width="${mark.wordmark.strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${mark.wordmark.paths.map((path) => `<path d="${path}"/>`).join("")}</g>`;

const wrap = (body, viewBox, title, extra = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img" ${extra}><title>${title}</title>${body}</svg>`;

const palettes = {
  onDark: {
    symbol: "#EDB466",
    spark: "#F6C580",
    orbit: "#B59A70",
    particle: "#F6C580",
    wordmark: "#F1F0E9",
  },
  onLight: {
    symbol: "#976018",
    spark: "#A86D1D",
    orbit: "#34382F",
    particle: "#976018",
    wordmark: "#101211",
  },
  monoDark: {
    symbol: "#101211",
    spark: "#101211",
    orbit: "#101211",
    particle: "#101211",
    wordmark: "#101211",
  },
  monoLight: {
    symbol: "#F1F0E9",
    spark: "#F1F0E9",
    orbit: "#F1F0E9",
    particle: "#F1F0E9",
    wordmark: "#F1F0E9",
  },
};

const symbolTransform = () => {
  const { center, symbol: layout } = mark.orbital;
  return `rotate(${layout.rotation} ${center.x} ${center.y}) translate(${layout.x} ${layout.y}) scale(${layout.scale})`;
};

function pointOnOrbit(orbit, turns) {
  const angle = (((turns % 1) + 1) % 1) * Math.PI * 2;
  const rotation = (orbit.rotation * Math.PI) / 180;
  const x = orbit.rx * Math.cos(angle);
  const y = orbit.ry * Math.sin(angle);
  return {
    x:
      mark.orbital.center.x +
      x * Math.cos(rotation) -
      y * Math.sin(rotation),
    y:
      mark.orbital.center.y +
      x * Math.sin(rotation) +
      y * Math.cos(rotation),
  };
}

function orbitalArtwork(palette) {
  const orbitLines = mark.orbital.orbits
    .map(
      (orbit, index) =>
        `<ellipse cx="${mark.orbital.center.x}" cy="${mark.orbital.center.y}" rx="${orbit.rx}" ry="${orbit.ry}" transform="rotate(${orbit.rotation} ${mark.orbital.center.x} ${mark.orbital.center.y})" fill="none" stroke="${palette.orbit}" stroke-width="${index === 0 ? 1.15 : 1.35}" opacity="${[0.44, 0.58, 0.42, 0.5][index]}"/>`,
    )
    .join("");
  const particleBodies = mark.orbital.particles
    .map((particle) => {
      const orbit = mark.orbital.orbits.find(
        (candidate) => candidate.id === particle.orbit,
      );
      const point = pointOnOrbit(orbit, particle.phase);
      return `<circle cx="${point.x.toFixed(3)}" cy="${point.y.toFixed(3)}" r="${particle.radius}" fill="${palette.particle}" opacity="${Math.max(0.58, particle.opacity)}"/>`;
    })
    .join("");
  return `${orbitLines}<g>${particleBodies}</g><g transform="${symbolTransform()}">${symbol(palette.symbol, palette.spark)}</g>`;
}

const coreSvg = (palette, title) =>
  wrap(symbol(palette.symbol, palette.spark), mark.viewBox, title);

const orbitalSvg = (palette, title) =>
  wrap(orbitalArtwork(palette), mark.orbital.viewBox, title);

const horizontalSvg = (palette, title) =>
  wrap(
    `<g transform="translate(${mark.lockups.horizontal.emblemX} ${mark.lockups.horizontal.emblemY}) scale(${mark.lockups.horizontal.emblemScale})">${orbitalArtwork(palette)}</g><g transform="translate(${mark.lockups.horizontal.wordmarkX} ${mark.lockups.horizontal.wordmarkY}) scale(${mark.lockups.horizontal.wordmarkScale})">${wordmark(palette.wordmark)}</g>`,
    mark.lockups.horizontal.viewBox,
    title,
  );

const verticalSvg = (palette, title) =>
  wrap(
    `${orbitalArtwork(palette)}<g transform="translate(${mark.lockups.vertical.wordmarkX} ${mark.lockups.vertical.wordmarkY}) scale(${mark.lockups.vertical.wordmarkScale})">${wordmark(palette.wordmark)}</g>`,
    mark.lockups.vertical.viewBox,
    title,
  );

async function put(path, contents) {
  await writeFile(path, contents);
  return contents;
}

async function png(svg, path, width) {
  await sharp(Buffer.from(svg)).resize({ width }).png().toFile(path);
}

const csharpNumber = (value) => `${Number(value.toFixed(6))}f`;
const parseViewBox = (value, label) => {
  const values = value.split(/\s+/).map(Number);
  if (values.length !== 4 || values.some((entry) => !Number.isFinite(entry)))
    throw new Error(`Invalid ${label} viewBox: ${value}`);
  return values;
};

function csharpPath(svgPath) {
  const tokens = svgPath.match(/[a-zA-Z]|[-+]?(?:\d*\.)?\d+(?:e[-+]?\d+)?/gi);
  if (!tokens) throw new Error(`Cannot parse SVG path: ${svgPath}`);
  const lines = [];
  let index = 0;
  let command = "";
  let x = 0;
  let y = 0;
  let startX = 0;
  let startY = 0;
  let controlX = 0;
  let controlY = 0;
  let hasQuadraticControl = false;
  const isCommand = (token) => /^[a-zA-Z]$/.test(token);
  const read = () => Number(tokens[index++]);
  const absolute = (value, current, relative) =>
    relative ? current + value : value;

  while (index < tokens.length) {
    if (isCommand(tokens[index])) command = tokens[index++];
    const relative = command === command.toLowerCase();
    switch (command.toUpperCase()) {
      case "M": {
        x = absolute(read(), x, relative);
        y = absolute(read(), y, relative);
        startX = x;
        startY = y;
        lines.push(`path.MoveTo(${csharpNumber(x)}, ${csharpNumber(y)});`);
        command = relative ? "l" : "L";
        hasQuadraticControl = false;
        break;
      }
      case "L": {
        x = absolute(read(), x, relative);
        y = absolute(read(), y, relative);
        lines.push(`path.LineTo(${csharpNumber(x)}, ${csharpNumber(y)});`);
        hasQuadraticControl = false;
        break;
      }
      case "H": {
        x = absolute(read(), x, relative);
        lines.push(`path.LineTo(${csharpNumber(x)}, ${csharpNumber(y)});`);
        hasQuadraticControl = false;
        break;
      }
      case "V": {
        y = absolute(read(), y, relative);
        lines.push(`path.LineTo(${csharpNumber(x)}, ${csharpNumber(y)});`);
        hasQuadraticControl = false;
        break;
      }
      case "Q": {
        controlX = absolute(read(), x, relative);
        controlY = absolute(read(), y, relative);
        x = absolute(read(), x, relative);
        y = absolute(read(), y, relative);
        lines.push(
          `path.QuadTo(${csharpNumber(controlX)}, ${csharpNumber(controlY)}, ${csharpNumber(x)}, ${csharpNumber(y)});`,
        );
        hasQuadraticControl = true;
        break;
      }
      case "T": {
        controlX = hasQuadraticControl ? x * 2 - controlX : x;
        controlY = hasQuadraticControl ? y * 2 - controlY : y;
        x = absolute(read(), x, relative);
        y = absolute(read(), y, relative);
        lines.push(
          `path.QuadTo(${csharpNumber(controlX)}, ${csharpNumber(controlY)}, ${csharpNumber(x)}, ${csharpNumber(y)});`,
        );
        hasQuadraticControl = true;
        break;
      }
      case "Z": {
        lines.push("path.Close();");
        x = startX;
        y = startY;
        command = "";
        hasQuadraticControl = false;
        break;
      }
      default:
        throw new Error(`Unsupported SVG command ${command} in ${svgPath}`);
    }
  }
  return lines.map((line) => `        ${line}`).join("\n");
}

function mauiGeometrySource() {
  const [emblemMinX, emblemMinY, emblemWidth, emblemHeight] = parseViewBox(
    mark.orbital.viewBox,
    "orbital",
  );
  if (emblemWidth !== emblemHeight)
    throw new Error("The MAUI normalized emblem requires a square master viewBox");
  const normalizedScale = 100 / emblemWidth;
  const normalizedCenterX =
    (mark.orbital.center.x - emblemMinX) * normalizedScale;
  const normalizedCenterY =
    (mark.orbital.center.y - emblemMinY) * normalizedScale;
  const [verticalMinX, verticalMinY, verticalWidth, verticalHeight] =
    parseViewBox(mark.lockups.vertical.viewBox, "vertical lockup");
  const verticalScale = 100 / verticalWidth;
  const wordmarkCanvasHeight = verticalHeight * verticalScale;
  const coreScale = mark.orbital.symbol.scale * normalizedScale;
  const coreX = (mark.orbital.symbol.x - emblemMinX) * normalizedScale;
  const coreY = (mark.orbital.symbol.y - emblemMinY) * normalizedScale;
  const wordmarkScale = mark.lockups.vertical.wordmarkScale * verticalScale;
  const wordmarkX =
    (mark.lockups.vertical.wordmarkX - verticalMinX) * verticalScale;
  const wordmarkY =
    (mark.lockups.vertical.wordmarkY - verticalMinY) * verticalScale;
  const orbitIndex = new Map(
    mark.orbital.orbits.map((orbit, index) => [orbit.id, index]),
  );
  const orbits = mark.orbital.orbits
    .map(
      (orbit) =>
        `        new(${csharpNumber(orbit.rx * normalizedScale)}, ${csharpNumber(orbit.ry * normalizedScale)}, ${csharpNumber(orbit.rotation)}),`,
    )
    .join("\n");
  const particles = mark.orbital.particles
    .map(
      (particle) =>
        `        new(${orbitIndex.get(particle.orbit)}, ${csharpNumber(particle.period)}, ${csharpNumber(particle.phase)}, ${csharpNumber(particle.direction)}, ${csharpNumber(particle.radius * normalizedScale)}, ${csharpNumber(particle.opacity)}, ${csharpNumber(particle.trailDuration)}),`,
    )
    .join("\n");
  const wordmarkCommands = mark.wordmark.paths.map(csharpPath).join("\n\n");

  return `// <auto-generated />
using System.Numerics;
using Microsoft.Maui.Graphics;

namespace Zuaros.Intro;

// Generated by scripts/generate-brand.mjs from src/brand/zuaros-master.svg.
public static partial class ZuarosGeometry
{
    public const string CoreViewBox = "${mark.viewBox}";
    public const string CoreBodySvgPath = "${mark.body}";
    public const string CoreSparkSvgPath = "${mark.spark}";
    internal const float CenterX = ${csharpNumber(normalizedCenterX)};
    internal const float CenterY = ${csharpNumber(normalizedCenterY)};
    internal const float WordmarkCanvasHeight = ${csharpNumber(wordmarkCanvasHeight)};

    internal static readonly OrbitDefinition[] Orbits =
    {
${orbits}
    };

    internal static readonly ParticleDefinition[] Particles =
    {
${particles}
    };

    internal static readonly PathF[] OrbitPaths = CreateOrbitPaths();
    internal static readonly PathF CoreBodyPath = CreateCoreBodyPath();
    internal static readonly PathF CoreSparkPath = CreateCoreSparkPath();
    internal static readonly PathF WordmarkPath = CreateWordmarkPath();

    private static PathF CreateCoreBodyPath()
    {
        PathF path = new();
${csharpPath(mark.body)}
        TransformCore(path);
        return path;
    }

    private static PathF CreateCoreSparkPath()
    {
        PathF path = new();
${csharpPath(mark.spark)}
        TransformCore(path);
        return path;
    }

    private static void TransformCore(PathF path)
    {
        Matrix3x2 transform =
            Matrix3x2.CreateScale(${csharpNumber(coreScale)}) *
            Matrix3x2.CreateTranslation(${csharpNumber(coreX)}, ${csharpNumber(coreY)}) *
            Matrix3x2.CreateRotation(${csharpNumber(mark.orbital.symbol.rotation)} * MathF.PI / 180f, new Vector2(CenterX, CenterY));
        path.Transform(transform);
    }

    private static PathF CreateWordmarkPath()
    {
        PathF path = new();
${wordmarkCommands}
        path.Transform(
            Matrix3x2.CreateScale(${csharpNumber(wordmarkScale)}) *
            Matrix3x2.CreateTranslation(${csharpNumber(wordmarkX)}, ${csharpNumber(wordmarkY)}));
        return path;
    }
}
`;
}

for (const directory of [
  root,
  coreDir,
  orbitalDir,
  `${rasterDir}/core`,
  `${rasterDir}/orbital`,
  `${rasterDir}/lockups`,
  `${root}/licenses`,
  `${mauiDir}/Resources/Splash`,
])
  await mkdir(directory, { recursive: true });

await copyFile(
  "node_modules/@fontsource-variable/space-grotesk/LICENSE",
  `${root}/licenses/Space-Grotesk-OFL.txt`,
);
await copyFile(
  "node_modules/@fontsource-variable/inter/LICENSE",
  `${root}/licenses/Inter-OFL.txt`,
);

const coreOnDark = coreSvg(
  palettes.onDark,
  "Zuaros core mark for dark backgrounds",
);
const coreOnLight = coreSvg(
  palettes.onLight,
  "Zuaros core mark for light backgrounds",
);
const coreMonoDark = coreSvg(
  palettes.monoDark,
  "Zuaros core mark, dark monochrome",
);
const coreMonoLight = coreSvg(
  palettes.monoLight,
  "Zuaros core mark, light monochrome",
);
await put(`${coreDir}/zuaros-core.svg`, coreOnDark);
await put(`${coreDir}/zuaros-core-dark.svg`, coreOnDark);
await put(`${coreDir}/zuaros-core-light.svg`, coreOnLight);
await put(`${coreDir}/zuaros-core-mono-dark.svg`, coreMonoDark);
await put(`${coreDir}/zuaros-core-mono-light.svg`, coreMonoLight);

const orbitalOnDark = orbitalSvg(
  palettes.onDark,
  "Zuaros full orbital emblem for dark backgrounds",
);
const orbitalOnLight = orbitalSvg(
  palettes.onLight,
  "Zuaros full orbital emblem for light backgrounds",
);
const orbitalMonoDark = orbitalSvg(
  palettes.monoDark,
  "Zuaros full orbital emblem, dark monochrome",
);
const orbitalMonoLight = orbitalSvg(
  palettes.monoLight,
  "Zuaros full orbital emblem, light monochrome",
);
await put(`${orbitalDir}/zuaros-orbital.svg`, orbitalOnDark);
await put(`${orbitalDir}/zuaros-orbital-dark.svg`, orbitalOnDark);
await put(`${orbitalDir}/zuaros-orbital-light.svg`, orbitalOnLight);
await put(`${orbitalDir}/zuaros-orbital-on-dark.svg`, orbitalOnDark);
await put(`${orbitalDir}/zuaros-orbital-on-light.svg`, orbitalOnLight);
await put(`${orbitalDir}/zuaros-orbital-monochrome.svg`, orbitalMonoDark);
await put(`${orbitalDir}/zuaros-orbital-mono-dark.svg`, orbitalMonoDark);
await put(`${orbitalDir}/zuaros-orbital-mono-light.svg`, orbitalMonoLight);

const horizontalOnDark = horizontalSvg(
  palettes.onDark,
  "Zuaros orbital horizontal lockup for dark backgrounds",
);
const horizontalOnLight = horizontalSvg(
  palettes.onLight,
  "Zuaros orbital horizontal lockup for light backgrounds",
);
const horizontalMonoDark = horizontalSvg(
  palettes.monoDark,
  "Zuaros orbital horizontal lockup, dark monochrome",
);
const horizontalMonoLight = horizontalSvg(
  palettes.monoLight,
  "Zuaros orbital horizontal lockup, light monochrome",
);
const verticalOnDark = verticalSvg(
  palettes.onDark,
  "Zuaros orbital vertical lockup for dark backgrounds",
);
const verticalOnLight = verticalSvg(
  palettes.onLight,
  "Zuaros orbital vertical lockup for light backgrounds",
);
const verticalMonoDark = verticalSvg(
  palettes.monoDark,
  "Zuaros orbital vertical lockup, dark monochrome",
);
const verticalMonoLight = verticalSvg(
  palettes.monoLight,
  "Zuaros orbital vertical lockup, light monochrome",
);
for (const [name, svg] of [
  ["zuaros-orbital-horizontal.svg", horizontalOnDark],
  ["zuaros-orbital-horizontal-on-light.svg", horizontalOnLight],
  ["zuaros-orbital-horizontal-mono-dark.svg", horizontalMonoDark],
  ["zuaros-orbital-horizontal-mono-light.svg", horizontalMonoLight],
  ["zuaros-orbital-vertical.svg", verticalOnDark],
  ["zuaros-orbital-vertical-on-light.svg", verticalOnLight],
  ["zuaros-orbital-vertical-mono-dark.svg", verticalMonoDark],
  ["zuaros-orbital-vertical-mono-light.svg", verticalMonoLight],
])
  await put(`${orbitalDir}/${name}`, svg);

// Legacy public paths remain stable for the existing website and external users.
const legacyWordmark = (palette, title) =>
  wrap(
    `<g>${symbol(palette.symbol, palette.spark)}</g><g transform="translate(78 2) scale(1.27)">${wordmark(palette.wordmark)}</g>`,
    "0 0 310 64",
    title,
  );
await put(`${root}/zuaros-logo.svg`, legacyWordmark(palettes.onDark, "Zuaros"));
await put(
  `${root}/zuaros-logo-light.svg`,
  legacyWordmark(palettes.onDark, "Zuaros"),
);
await put(
  `${root}/zuaros-logo-dark.svg`,
  legacyWordmark(palettes.onLight, "Zuaros"),
);
await put(
  `${root}/zuaros-logo-mono.svg`,
  legacyWordmark(palettes.monoDark, "Zuaros"),
);
await put(`${root}/zuaros-symbol.svg`, coreOnDark);

const favicon = wrap(
  `<rect width="80" height="80" rx="16" fill="#101211"/><g transform="translate(8 8)">${symbol(palettes.onDark.symbol, palettes.onDark.spark)}</g>`,
  "0 0 80 80",
  "Zuaros",
);
await put(`${root}/favicon.svg`, favicon);
await sharp(Buffer.from(favicon))
  .resize(32, 32)
  .png()
  .toFile(`${root}/favicon-32.png`);
await sharp(Buffer.from(favicon))
  .resize(180, 180)
  .png()
  .toFile(`${root}/apple-touch-icon.png`);
await sharp(Buffer.from(favicon))
  .resize(512, 512)
  .png()
  .toFile(`${root}/zuaros-avatar.png`);

const social = wrap(
  `<rect width="1200" height="630" fill="#101211"/><g transform="translate(65 50)"><g>${symbol(palettes.onDark.symbol, palettes.onDark.spark)}</g><g transform="translate(78 2) scale(1.27)">${wordmark(palettes.onDark.wordmark)}</g></g><g transform="translate(700 80) scale(.72)">${orbitalArtwork(palettes.onDark)}</g><g font-family="Arial, sans-serif"><text x="65" y="244" font-size="65" letter-spacing="-3" fill="#F1F0E9">Custom software.</text><text x="65" y="320" font-size="65" letter-spacing="-3" fill="#EDB466">Engineering tools.</text><text x="68" y="390" font-size="21" fill="#A4AAA1">Business. Engineering. Research.</text><text x="68" y="559" font-size="13" letter-spacing="3" fill="#A4AAA1">SOFTWARE DEVELOPMENT · ENGINEERING · DIGITAL PRODUCTS</text></g><path d="M65 510h1070" stroke="#34382F"/>`,
  "0 0 1200 630",
  "Zuaros social preview",
  'width="1200" height="630"',
);
await put(`${root}/social-preview.svg`, social);
await sharp(Buffer.from(social)).png().toFile(`${root}/social-preview.png`);

for (const size of sizes) {
  for (const [name, svg] of [
    ["zuaros-core", coreOnDark],
    ["zuaros-core-on-light", coreOnLight],
    ["zuaros-core-mono-dark", coreMonoDark],
    ["zuaros-core-mono-light", coreMonoLight],
  ])
    await png(svg, `${rasterDir}/core/${name}-${size}.png`, size);
  for (const [name, svg] of [
    ["zuaros-orbital", orbitalOnDark],
    ["zuaros-orbital-on-light", orbitalOnLight],
    ["zuaros-orbital-mono-dark", orbitalMonoDark],
    ["zuaros-orbital-mono-light", orbitalMonoLight],
  ])
    await png(svg, `${rasterDir}/orbital/${name}-${size}.png`, size);
  for (const [name, svg] of [
    ["zuaros-orbital-horizontal", horizontalOnDark],
    ["zuaros-orbital-horizontal-on-light", horizontalOnLight],
    ["zuaros-orbital-horizontal-mono-dark", horizontalMonoDark],
    ["zuaros-orbital-horizontal-mono-light", horizontalMonoLight],
    ["zuaros-orbital-vertical", verticalOnDark],
    ["zuaros-orbital-vertical-on-light", verticalOnLight],
    ["zuaros-orbital-vertical-mono-dark", verticalMonoDark],
    ["zuaros-orbital-vertical-mono-light", verticalMonoLight],
  ])
    await png(svg, `${rasterDir}/lockups/${name}-${size}.png`, size);
}

await put(`${mauiDir}/ZuarosGeometry.Generated.cs`, mauiGeometrySource());
await put(
  `${mauiDir}/Resources/Splash/zuaros-splash.svg`,
  wrap(
    symbol(palettes.onDark.symbol),
    mark.viewBox,
    "Zuaros native splash mark",
  ),
);
