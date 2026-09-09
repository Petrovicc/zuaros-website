import { spawn } from "node:child_process";
import {
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "../..");
const mediaRoot = path.join(repositoryRoot, "media");
const mark = JSON.parse(
  await readFile(path.join(repositoryRoot, "src/brand/mark.json"), "utf8"),
);
const introConfig = JSON.parse(
  await readFile(
    path.join(repositoryRoot, "src/animation/studioIntroConfig.json"),
    "utf8",
  ),
);

const FPS = introConfig.framesPerSecond;
const DURATION_MS = introConfig.durationMs;
const FRAME_COUNT = Math.round((DURATION_MS / 1000) * FPS);
const orbitOpacities = [0.44, 0.58, 0.42, 0.5];
const introOrbitOpacities = [0.42, 0.455, 0.49, 0.525];

const palettes = {
  darkCompatible: {
    symbol: "#EDB466",
    spark: "#F6C580",
    orbit: "#B59A70",
    particle: "#F6C580",
    wordmark: "#F1F0E9",
  },
  document: {
    symbol: "#976018",
    spark: "#A86D1D",
    orbit: "#34382F",
    particle: "#976018",
    wordmark: "#101211",
  },
  monochromeDark: {
    symbol: "#101211",
    spark: "#101211",
    orbit: "#101211",
    particle: "#101211",
    wordmark: "#101211",
  },
  monochromeLight: {
    symbol: "#F1F0E9",
    spark: "#F1F0E9",
    orbit: "#F1F0E9",
    particle: "#F1F0E9",
    wordmark: "#F1F0E9",
  },
};

function ensureInside(parent, child) {
  const relative = path.relative(path.resolve(parent), path.resolve(child));
  if (relative.startsWith("..") || path.isAbsolute(relative))
    throw new Error(`Refusing to operate outside ${parent}: ${child}`);
}

async function resetDirectory(directory, allowedParent = repositoryRoot) {
  ensureInside(allowedParent, directory);
  if (path.resolve(directory) === path.resolve(allowedParent))
    throw new Error(`Refusing to reset the allowed parent ${allowedParent}`);
  await rm(directory, { recursive: true, force: true });
  await mkdir(directory, { recursive: true });
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function wrapSvg(body, viewBox, title, attributes = "") {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" ${attributes}><title>${escapeXml(title)}</title>${body}</svg>`;
}

function symbolArtwork(palette) {
  return `<path d="${mark.body}" fill="${palette.symbol}"/><path d="${mark.spark}" fill="${palette.spark}"/>`;
}

function wordmarkArtwork(color) {
  return `<g fill="none" stroke="${color}" stroke-width="${mark.wordmark.strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${mark.wordmark.paths.map((entry) => `<path d="${entry}"/>`).join("")}</g>`;
}

function symbolTransform() {
  const { center, symbol } = mark.orbital;
  return `rotate(${symbol.rotation} ${center.x} ${center.y}) translate(${symbol.x} ${symbol.y}) scale(${symbol.scale})`;
}

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

function particlePoint(particle, seconds) {
  const orbit = mark.orbital.orbits.find(
    (candidate) => candidate.id === particle.orbit,
  );
  return pointOnOrbit(
    orbit,
    particle.phase + (particle.direction * seconds) / particle.period,
  );
}

function orbitalArtwork(palette) {
  const orbits = mark.orbital.orbits
    .map(
      (orbit, index) =>
        `<ellipse cx="${mark.orbital.center.x}" cy="${mark.orbital.center.y}" rx="${orbit.rx}" ry="${orbit.ry}" transform="rotate(${orbit.rotation} ${mark.orbital.center.x} ${mark.orbital.center.y})" fill="none" stroke="${palette.orbit}" stroke-width="${index === 0 ? 1.15 : 1.35}" opacity="${orbitOpacities[index]}"/>`,
    )
    .join("");
  const particles = mark.orbital.particles
    .map((particle) => {
      const point = particlePoint(particle, 0);
      return `<circle cx="${point.x.toFixed(3)}" cy="${point.y.toFixed(3)}" r="${particle.radius}" fill="${palette.particle}" opacity="${Math.max(0.58, particle.opacity)}"/>`;
    })
    .join("");
  return `${orbits}<g>${particles}</g><g transform="${symbolTransform()}">${symbolArtwork(palette)}</g>`;
}

function coreSvg(palette, title) {
  return wrapSvg(symbolArtwork(palette), mark.viewBox, title);
}

function orbitalSvg(palette, title) {
  return wrapSvg(orbitalArtwork(palette), mark.orbital.viewBox, title);
}

function horizontalSvg(palette, title) {
  const layout = mark.lockups.horizontal;
  return wrapSvg(
    `<g transform="translate(${layout.emblemX} ${layout.emblemY}) scale(${layout.emblemScale})">${orbitalArtwork(palette)}</g><g transform="translate(${layout.wordmarkX} ${layout.wordmarkY}) scale(${layout.wordmarkScale})">${wordmarkArtwork(palette.wordmark)}</g>`,
    layout.viewBox,
    title,
  );
}

function verticalSvg(palette, title) {
  const layout = mark.lockups.vertical;
  return wrapSvg(
    `${orbitalArtwork(palette)}<g transform="translate(${layout.wordmarkX} ${layout.wordmarkY}) scale(${layout.wordmarkScale})">${wordmarkArtwork(palette.wordmark)}</g>`,
    layout.viewBox,
    title,
  );
}

async function put(relativePath, contents) {
  const destination = path.join(mediaRoot, relativePath);
  ensureInside(mediaRoot, destination);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, contents);
  return destination;
}

async function renderPng(svg, relativePath, options = {}) {
  const destination = path.join(mediaRoot, relativePath);
  ensureInside(mediaRoot, destination);
  await mkdir(path.dirname(destination), { recursive: true });
  let image = sharp(Buffer.from(svg), { density: options.density ?? 72 });
  if (options.width && options.height) {
    image = image.resize({
      width: options.width,
      height: options.height,
      fit: options.fit ?? "contain",
    });
  } else if (options.width) {
    image = image.resize({ width: options.width });
  }
  await image.png({ compressionLevel: 9 }).toFile(destination);
  return destination;
}

function canvasSvg(width, height, artwork, viewBox, options = {}) {
  const [, , sourceWidth, sourceHeight] = viewBox.split(/\s+/).map(Number);
  const maxWidth = options.maxWidth ?? width * 0.72;
  const maxHeight = options.maxHeight ?? height * 0.72;
  const scale = Math.min(maxWidth / sourceWidth, maxHeight / sourceHeight);
  const x = (width - sourceWidth * scale) / 2;
  const y = (height - sourceHeight * scale) / 2;
  const background = options.background
    ? `<defs><radialGradient id="bg" cx="50%" cy="48%" r="44%"><stop offset="0" stop-color="#24221D"/><stop offset=".58" stop-color="#151714"/><stop offset="1" stop-color="#101211"/></radialGradient></defs><rect width="${width}" height="${height}" fill="url(#bg)"/>`
    : "";
  return wrapSvg(
    `${background}<g transform="translate(${x.toFixed(3)} ${y.toFixed(3)}) scale(${scale.toFixed(7)})">${artwork}</g>`,
    `0 0 ${width} ${height}`,
    options.title ?? "Zuaros brand asset",
    `width="${width}" height="${height}"`,
  );
}

const clamp01 = (value) => Math.max(0, Math.min(1, value));
const segment = (milliseconds, start, end) =>
  clamp01((milliseconds - start) / (end - start));
const easeOut = (value) => 1 - Math.pow(1 - value, 3);

function introState(milliseconds, showWordmark) {
  const ignitionIn = easeOut(
    segment(
      milliseconds,
      introConfig.ignition.inStartMs,
      introConfig.ignition.inEndMs,
    ),
  );
  const ignitionOut =
    1 -
    segment(
      milliseconds,
      introConfig.ignition.outStartMs,
      introConfig.ignition.outEndMs,
    );
  const body = easeOut(
    segment(
      milliseconds,
      introConfig.body.startMs,
      introConfig.body.endMs,
    ),
  );
  const spark = easeOut(
    segment(
      milliseconds,
      introConfig.spark.startMs,
      introConfig.spark.endMs,
    ),
  );
  const sparkPulse = Math.sin(
    segment(
      milliseconds,
      introConfig.spark.startMs,
      introConfig.spark.pulseEndMs,
    ) * Math.PI,
  );
  const settleProgress = easeOut(
    segment(
      milliseconds,
      introConfig.motion.settleStartMs,
      introConfig.motion.settleEndMs,
    ),
  );
  return {
    ignitionOpacity:
      ignitionIn * ignitionOut * introConfig.ignition.maxOpacity,
    bodyOpacity: body,
    bodyScale:
      introConfig.body.initialScale +
      body * (1 - introConfig.body.initialScale),
    sparkOpacity: spark,
    sparkGlow: Math.max(0, sparkPulse),
    orbitProgress: mark.orbital.orbits.map((_, index) =>
      easeOut(
        segment(
          milliseconds,
          introConfig.orbits.startMs + index * introConfig.orbits.staggerMs,
          introConfig.orbits.startMs +
            introConfig.orbits.durationMs +
            index * introConfig.orbits.staggerMs,
        ),
      ),
    ),
    particleOpacity: easeOut(
      segment(
        milliseconds,
        introConfig.particles.startMs,
        introConfig.particles.endMs,
      ),
    ),
    motionSeconds: resolvedMotionSeconds(milliseconds),
    trailOpacity:
      1 -
      (1 - introConfig.motion.finalTrailOpacity) * settleProgress,
    wordmarkOpacity: showWordmark
      ? easeOut(
          segment(
            milliseconds,
            introConfig.wordmark.startMs,
            introConfig.wordmark.endMs,
          ),
        )
      : 0,
  };
}

function resolvedMotionSeconds(milliseconds) {
  const { startOffsetSeconds, rate, settleStartMs, settleEndMs } =
    introConfig.motion;
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

function orbitArc(orbit, progress) {
  if (progress <= 0) return "";
  const steps = Math.max(2, Math.ceil(240 * progress));
  const points = [];
  for (let index = 0; index <= steps; index++) {
    const point = pointOnOrbit(orbit, (progress * index) / steps);
    points.push(`${index === 0 ? "M" : "L"}${point.x.toFixed(3)} ${point.y.toFixed(3)}`);
  }
  return points.join(" ");
}

function animatedArtwork(milliseconds, showWordmark) {
  const state = introState(milliseconds, showWordmark);
  const orbits = mark.orbital.orbits
    .map((orbit, index) => {
      const progress = state.orbitProgress[index];
      const d = orbitArc(orbit, progress);
      return d
        ? `<path d="${d}" fill="none" stroke="#B59A70" stroke-width="${index === 0 ? 1.15 : 1.35}" stroke-linecap="round" stroke-linejoin="round" opacity="${(progress * introOrbitOpacities[index]).toFixed(4)}"/>`
        : "";
    })
    .join("");
  const particleGroups = mark.orbital.particles
    .map((particle) => {
      const head = particlePoint(particle, state.motionSeconds);
      const trail = Array.from({ length: 8 }, (_, index) => {
        const age = (particle.trailDuration * (index + 1)) / 8;
        const fade = 1 - (index + 1) / 9;
        const point = particlePoint(particle, state.motionSeconds - age);
        const radius = particle.radius * (0.22 + 0.46 * fade);
        const opacity =
          particle.opacity * 0.56 * fade * fade * state.trailOpacity;
        return `<circle cx="${point.x.toFixed(3)}" cy="${point.y.toFixed(3)}" r="${radius.toFixed(3)}" fill="#EDB466" opacity="${opacity.toFixed(4)}"/>`;
      }).join("");
      return `<g opacity="${state.particleOpacity.toFixed(4)}">${trail}<circle cx="${head.x.toFixed(3)}" cy="${head.y.toFixed(3)}" r="${particle.radius}" fill="#F6C580" opacity="${particle.opacity}"/></g>`;
    })
    .join("");
  const core = mark.orbital.center;
  const baseTransform = symbolTransform();
  const wordmark = showWordmark
    ? `<g transform="translate(${mark.lockups.vertical.wordmarkX} ${mark.lockups.vertical.wordmarkY}) scale(${mark.lockups.vertical.wordmarkScale})" opacity="${state.wordmarkOpacity.toFixed(4)}">${wordmarkArtwork("#F1F0E9")}</g>`
    : "";
  const glowRadius = (2 + state.sparkGlow * 7).toFixed(2);
  const glowOpacity = (0.08 + state.sparkGlow * 0.3).toFixed(3);
  return `<defs><filter id="spark-glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="${glowRadius}" result="blur"/><feFlood flood-color="#F6C580" flood-opacity="${glowOpacity}"/><feComposite in2="blur" operator="in"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="ignition-glow" x="-500%" y="-500%" width="1000%" height="1000%"><feGaussianBlur stdDeviation="10" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><circle cx="${core.x}" cy="${core.y}" r="9" fill="#F6C580" opacity="${state.ignitionOpacity.toFixed(4)}" filter="url(#ignition-glow)"/>${orbits}<g>${particleGroups}</g><g transform="translate(${core.x} ${core.y}) scale(${state.bodyScale.toFixed(5)}) translate(${-core.x} ${-core.y}) ${baseTransform}" opacity="${state.bodyOpacity.toFixed(4)}"><path d="${mark.body}" fill="#EDB466"/></g><g transform="${baseTransform}" opacity="${state.sparkOpacity.toFixed(4)}" filter="url(#spark-glow)"><path d="${mark.spark}" fill="#F6C580"/></g>${wordmark}`;
}

function introFrameSvg(width, height, milliseconds, showWordmark, background) {
  const viewBox = showWordmark
    ? mark.lockups.vertical.viewBox
    : mark.orbital.viewBox;
  const portrait = height > width;
  const maxWidth = width * (portrait ? (showWordmark ? 0.72 : 0.76) : 0.7);
  const maxHeight = height * (portrait ? 0.55 : showWordmark ? 0.82 : 0.74);
  return canvasSvg(
    width,
    height,
    animatedArtwork(milliseconds, showWordmark),
    viewBox,
    {
      background,
      maxWidth,
      maxHeight,
      title: showWordmark
        ? "Zuaros studio intro with wordmark"
        : "Zuaros studio intro symbol",
    },
  );
}

async function run(command, args, options = {}) {
  await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: repositoryRoot,
      stdio: options.quiet ? "ignore" : "inherit",
      windowsHide: true,
    });
    child.once("error", reject);
    child.once("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with code ${code}`));
    });
  });
}

async function renderSequence(
  directory,
  width,
  height,
  showWordmark,
  allowedParent = repositoryRoot,
) {
  await resetDirectory(directory, allowedParent);
  for (let index = 0; index < FRAME_COUNT; index++) {
    const milliseconds = (index * 1000) / FPS;
    const filename = `frame_${String(index + 1).padStart(4, "0")}.png`;
    const svg = introFrameSvg(
      width,
      height,
      milliseconds,
      showWordmark,
      false,
    );
    await sharp(Buffer.from(svg), { density: 72 })
      .png({ compressionLevel: 9 })
      .toFile(path.join(directory, filename));
  }
}

async function renderBackground(destination, width, height) {
  const svg = canvasSvg(width, height, "", `0 0 ${width} ${height}`, {
    background: true,
    maxWidth: width,
    maxHeight: height,
    title: "Zuaros graphite background",
  });
  await sharp(Buffer.from(svg)).png().toFile(destination);
}

function imageSequence(directory) {
  return path.join(directory, "frame_%04d.png");
}

async function encodeDarkVideo({
  frames,
  background,
  output,
  width,
  height,
  codec,
  scaleFrames = false,
}) {
  const overlayInput = scaleFrames
    ? `[1:v]scale=${width}:${height}:flags=lanczos[logo];[0:v][logo]overlay=shortest=1:format=auto`
    : `[0:v][1:v]overlay=shortest=1:format=auto`;
  const common = [
    "-y",
    "-hide_banner",
    "-loglevel",
    "warning",
    "-loop",
    "1",
    "-framerate",
    String(FPS),
    "-i",
    background,
    "-framerate",
    String(FPS),
    "-start_number",
    "1",
    "-i",
    imageSequence(frames),
    "-filter_complex",
    `${overlayInput},format=${codec === "h264" ? "yuv420p" : "yuv420p"}`,
    "-frames:v",
    String(FRAME_COUNT),
    "-an",
  ];
  const codecArgs =
    codec === "h264"
      ? [
          "-c:v",
          "libx264",
          "-preset",
          "slow",
          "-crf",
          "18",
          "-profile:v",
          "high",
          "-pix_fmt",
          "yuv420p",
          "-movflags",
          "+faststart",
        ]
      : [
          "-c:v",
          "libvpx-vp9",
          "-crf",
          "27",
          "-b:v",
          "0",
          "-deadline",
          "good",
          "-cpu-used",
          "2",
          "-row-mt",
          "1",
          "-pix_fmt",
          "yuv420p",
        ];
  await run("ffmpeg", [...common, ...codecArgs, output]);
}

async function encodeAlphaWebm(frames, output) {
  await run("ffmpeg", [
    "-y",
    "-hide_banner",
    "-loglevel",
    "warning",
    "-framerate",
    String(FPS),
    "-start_number",
    "1",
    "-i",
    imageSequence(frames),
    "-frames:v",
    String(FRAME_COUNT),
    "-an",
    "-c:v",
    "libvpx-vp9",
    "-crf",
    "24",
    "-b:v",
    "0",
    "-deadline",
    "good",
    "-cpu-used",
    "2",
    "-row-mt",
    "1",
    "-auto-alt-ref",
    "0",
    "-pix_fmt",
    "yuva420p",
    "-metadata:s:v:0",
    "alpha_mode=1",
    output,
  ]);
}

async function encodeGif(input, output) {
  await run("ffmpeg", [
    "-y",
    "-hide_banner",
    "-loglevel",
    "warning",
    "-i",
    input,
    "-filter_complex",
    "fps=15,scale=720:1280:flags=lanczos,split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle",
    "-loop",
    "0",
    output,
  ]);
}

async function cardImage(svg, width, height, background) {
  return sharp(Buffer.from(svg), { density: 180 })
    .resize({ width, height, fit: "contain", background })
    .flatten({ background })
    .png()
    .toBuffer();
}

async function contactSheet(relativePath, title, cards, columns) {
  const width = 2400;
  const height = 1600;
  const margin = 48;
  const header = 132;
  const gap = 24;
  const rows = Math.ceil(cards.length / columns);
  const cardWidth = (width - margin * 2 - gap * (columns - 1)) / columns;
  const cardHeight = (height - header - margin - gap * (rows - 1)) / rows;
  const images = [];
  for (let index = 0; index < cards.length; index++) {
    const card = cards[index];
    const image = await cardImage(
      card.svg,
      Math.round(cardWidth - 48),
      Math.round(cardHeight - 116),
      card.background,
    );
    images.push({ ...card, index, image });
  }
  const base = sharp({
    create: {
      width,
      height,
      channels: 4,
      background: "#E9E6DE",
    },
  });
  const composites = images.map((card) => {
    const column = card.index % columns;
    const row = Math.floor(card.index / columns);
    const left = Math.round(margin + column * (cardWidth + gap));
    const top = Math.round(header + row * (cardHeight + gap));
    const cardSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(cardWidth)}" height="${Math.round(cardHeight)}"><rect width="100%" height="100%" rx="18" fill="${card.background}" stroke="${card.border ?? "#CBC6BA"}" stroke-width="2"/><image href="data:image/png;base64,${card.image.toString("base64")}" x="24" y="18" width="${Math.round(cardWidth - 48)}" height="${Math.round(cardHeight - 116)}" preserveAspectRatio="xMidYMid meet"/><text x="28" y="${Math.round(cardHeight - 52)}" fill="${card.text ?? "#101211"}" font-family="Arial, sans-serif" font-size="25" font-weight="600">${escapeXml(card.label)}</text></svg>`;
    return { input: Buffer.from(cardSvg), left, top };
  });
  const titleSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${header}"><rect width="100%" height="100%" fill="#101211"/><text x="48" y="76" fill="#F1F0E9" font-family="Arial, sans-serif" font-size="44" font-weight="700">${escapeXml(title)}</text><circle cx="2314" cy="66" r="9" fill="#F6C580"/><path d="M2240 53h35l7 7-28 29h38v10h-52V89l29-26h-29Z" fill="#EDB466"/></svg>`;
  const destination = path.join(mediaRoot, relativePath);
  await mkdir(path.dirname(destination), { recursive: true });
  await base
    .composite([{ input: Buffer.from(titleSvg), left: 0, top: 0 }, ...composites])
    .png({ compressionLevel: 9 })
    .toFile(destination);
}

async function generateStaticAssets() {
  const coreDark = coreSvg(
    palettes.darkCompatible,
    "Zuaros core mark for dark backgrounds",
  );
  const coreDocument = coreSvg(
    palettes.document,
    "Zuaros core mark for light documents",
  );
  const orbitalDark = orbitalSvg(
    palettes.darkCompatible,
    "Zuaros orbital emblem for dark backgrounds",
  );
  const orbitalDocument = orbitalSvg(
    palettes.document,
    "Zuaros orbital emblem for light documents",
  );
  const orbitalMonoDark = orbitalSvg(
    palettes.monochromeDark,
    "Zuaros orbital emblem, dark monochrome",
  );
  const orbitalMonoLight = orbitalSvg(
    palettes.monochromeLight,
    "Zuaros orbital emblem, light monochrome",
  );
  const horizontalDocument = horizontalSvg(
    palettes.document,
    "Zuaros horizontal document logo",
  );
  const horizontalDark = horizontalSvg(
    palettes.darkCompatible,
    "Zuaros horizontal logo for dark presentations",
  );
  const verticalDocument = verticalSvg(
    palettes.document,
    "Zuaros vertical document logo",
  );
  const verticalDark = verticalSvg(
    palettes.darkCompatible,
    "Zuaros vertical logo for dark presentations",
  );

  const svgs = [
    ["logos/svg/zuaros-orbital.svg", orbitalDark],
    ["logos/svg/zuaros-core.svg", coreDark],
    ["logos/svg/zuaros-orbital-light.svg", orbitalDocument],
    ["logos/svg/zuaros-orbital-dark.svg", orbitalDark],
    ["logos/svg/zuaros-orbital-monochrome-dark.svg", orbitalMonoDark],
    ["logos/svg/zuaros-orbital-monochrome-light.svg", orbitalMonoLight],
    ["logos/monochrome/zuaros-orbital-dark.svg", orbitalMonoDark],
    ["logos/monochrome/zuaros-orbital-light.svg", orbitalMonoLight],
    ["wordmarks/horizontal/zuaros-horizontal-document.svg", horizontalDocument],
    ["wordmarks/horizontal/zuaros-horizontal-dark.svg", horizontalDark],
    ["wordmarks/vertical/zuaros-vertical-document.svg", verticalDocument],
    ["wordmarks/vertical/zuaros-vertical-dark.svg", verticalDark],
  ];
  for (const [relativePath, svg] of svgs) await put(relativePath, svg);

  for (const size of [256, 512, 1024, 2048]) {
    await renderPng(
      coreDark,
      `logos/png/core/zuaros-core-dark-compatible-${size}.png`,
      { width: size },
    );
    await renderPng(
      coreDocument,
      `logos/png/core/zuaros-core-document-${size}.png`,
      { width: size },
    );
  }
  for (const size of [512, 1024, 2048, 4096]) {
    await renderPng(
      orbitalDark,
      `logos/png/orbital/zuaros-orbital-dark-compatible-${size}.png`,
      { width: size },
    );
    await renderPng(
      orbitalDocument,
      `logos/png/orbital/zuaros-orbital-document-${size}.png`,
      { width: size },
    );
  }
  await renderPng(
    orbitalMonoDark,
    "logos/monochrome/zuaros-orbital-dark-2048.png",
    { width: 2048 },
  );
  await renderPng(
    orbitalMonoLight,
    "logos/monochrome/zuaros-orbital-light-2048.png",
    { width: 2048 },
  );
  for (const [relativePath, svg] of [
    ["wordmarks/horizontal/zuaros-horizontal-document-2048.png", horizontalDocument],
    ["wordmarks/horizontal/zuaros-horizontal-dark-2048.png", horizontalDark],
    ["wordmarks/vertical/zuaros-vertical-document-2048.png", verticalDocument],
    ["wordmarks/vertical/zuaros-vertical-dark-2048.png", verticalDark],
  ])
    await renderPng(svg, relativePath, { width: 2048 });

  for (const [width, height] of [
    [1080, 1920],
    [1440, 2560],
    [1440, 3200],
  ]) {
    for (const background of [true, false]) {
      const group = background ? "dark" : "transparent";
      await renderPng(
        canvasSvg(
          width,
          height,
          symbolArtwork(palettes.darkCompatible),
          mark.viewBox,
          {
            background,
            maxWidth: width * 0.32,
            maxHeight: height * 0.24,
            title: "Zuaros core mobile splash",
          },
        ),
        `splash/${group}/core/zuaros-splash-core-${width}x${height}.png`,
      );
      await renderPng(
        canvasSvg(
          width,
          height,
          orbitalArtwork(palettes.darkCompatible),
          mark.orbital.viewBox,
          {
            background,
            maxWidth: width * 0.74,
            maxHeight: height * 0.5,
            title: "Zuaros orbital mobile splash",
          },
        ),
        `splash/${group}/orbital/zuaros-splash-orbital-${width}x${height}.png`,
      );
    }
  }

  const finalSymbol = introFrameSvg(2048, 2048, DURATION_MS, false, true);
  const finalWordmark = introFrameSvg(2048, 2048, DURATION_MS, true, true);
  await renderPng(finalSymbol, "preview/zuaros-intro-final-symbol.png");
  await renderPng(finalWordmark, "preview/zuaros-intro-final-wordmark.png");

  await renderPng(
    canvasSvg(
      2048,
      2048,
      orbitalArtwork(palettes.darkCompatible),
      mark.orbital.viewBox,
      {
        background: true,
        maxWidth: 1460,
        maxHeight: 1460,
        title: "Zuaros social profile image",
      },
    ),
    "social/zuaros-social-profile-2048.png",
  );
  await copyFile(
    path.join(repositoryRoot, "public/brand/social-preview.svg"),
    path.join(mediaRoot, "social/zuaros-social-preview.svg"),
  );
  await copyFile(
    path.join(repositoryRoot, "public/brand/social-preview.png"),
    path.join(mediaRoot, "social/zuaros-social-preview-1200x630.png"),
  );

  await contactSheet(
    "preview/zuaros-brand-preview.png",
    "Zuaros standalone brand media",
    [
      { label: "Core mark · dark background", svg: canvasSvg(600, 600, symbolArtwork(palettes.darkCompatible), mark.viewBox, { background: true, maxWidth: 300, maxHeight: 300 }), background: "#101211", border: "#34382F", text: "#F1F0E9" },
      { label: "Core mark · white document", svg: coreDocument, background: "#FFFFFF" },
      { label: "Orbital emblem · dark", svg: canvasSvg(600, 600, orbitalArtwork(palettes.darkCompatible), mark.orbital.viewBox, { background: true, maxWidth: 500, maxHeight: 500 }), background: "#101211", border: "#34382F", text: "#F1F0E9" },
      { label: "Orbital emblem · document", svg: orbitalDocument, background: "#FFFFFF" },
      { label: "Horizontal document logo", svg: horizontalDocument, background: "#FFFFFF" },
      { label: "Horizontal dark presentation", svg: horizontalDark, background: "#101211", border: "#34382F", text: "#F1F0E9" },
      { label: "Vertical document logo", svg: verticalDocument, background: "#FFFFFF" },
      { label: "Portrait orbital splash", svg: canvasSvg(600, 760, orbitalArtwork(palettes.darkCompatible), mark.orbital.viewBox, { background: true, maxWidth: 460, maxHeight: 460 }), background: "#101211", border: "#34382F", text: "#F1F0E9" },
    ],
    4,
  );
  return { coreDark, orbitalDark, horizontalDocument, verticalDocument };
}

async function generateAnimationAssets(tempRoot) {
  const symbolPortraitFrames = path.join(
    mediaRoot,
    "studio-intro/frames/symbol",
  );
  const wordmarkPortraitFrames = path.join(tempRoot, "wordmark-portrait");
  const symbolLandscapeFrames = path.join(tempRoot, "symbol-landscape");
  const wordmarkLandscapeFrames = path.join(tempRoot, "wordmark-landscape");
  await renderSequence(symbolPortraitFrames, 1080, 1920, false);
  await renderSequence(wordmarkPortraitFrames, 1080, 1920, true, tempRoot);
  await renderSequence(symbolLandscapeFrames, 1920, 1080, false, tempRoot);
  await renderSequence(wordmarkLandscapeFrames, 1920, 1080, true, tempRoot);

  const backgrounds = {
    portrait1080: path.join(tempRoot, "background-1080x1920.png"),
    portrait1440: path.join(tempRoot, "background-1440x2560.png"),
    landscape: path.join(tempRoot, "background-1920x1080.png"),
  };
  await renderBackground(backgrounds.portrait1080, 1080, 1920);
  await renderBackground(backgrounds.portrait1440, 1440, 2560);
  await renderBackground(backgrounds.landscape, 1920, 1080);

  const mp4Dir = path.join(mediaRoot, "studio-intro/mp4");
  const webmDir = path.join(mediaRoot, "studio-intro/webm");
  const gifDir = path.join(mediaRoot, "studio-intro/gif");
  for (const directory of [mp4Dir, webmDir, gifDir])
    await mkdir(directory, { recursive: true });

  for (const variant of [
    {
      name: "symbol",
      portrait: symbolPortraitFrames,
      landscape: symbolLandscapeFrames,
    },
    {
      name: "wordmark",
      portrait: wordmarkPortraitFrames,
      landscape: wordmarkLandscapeFrames,
    },
  ]) {
    await encodeDarkVideo({
      frames: variant.portrait,
      background: backgrounds.portrait1080,
      output: path.join(mp4Dir, `zuaros-intro-${variant.name}-1080x1920.mp4`),
      width: 1080,
      height: 1920,
      codec: "h264",
    });
    await encodeDarkVideo({
      frames: variant.portrait,
      background: backgrounds.portrait1440,
      output: path.join(mp4Dir, `zuaros-intro-${variant.name}-1440x2560.mp4`),
      width: 1440,
      height: 2560,
      codec: "h264",
      scaleFrames: true,
    });
    await encodeDarkVideo({
      frames: variant.landscape,
      background: backgrounds.landscape,
      output: path.join(mp4Dir, `zuaros-intro-${variant.name}-1920x1080.mp4`),
      width: 1920,
      height: 1080,
      codec: "h264",
    });
    await encodeDarkVideo({
      frames: variant.portrait,
      background: backgrounds.portrait1080,
      output: path.join(webmDir, `zuaros-intro-${variant.name}-1080x1920.webm`),
      width: 1080,
      height: 1920,
      codec: "vp9",
    });
    await encodeDarkVideo({
      frames: variant.landscape,
      background: backgrounds.landscape,
      output: path.join(webmDir, `zuaros-intro-${variant.name}-1920x1080.webm`),
      width: 1920,
      height: 1080,
      codec: "vp9",
    });
    await encodeGif(
      path.join(mp4Dir, `zuaros-intro-${variant.name}-1080x1920.mp4`),
      path.join(gifDir, `zuaros-intro-${variant.name}-preview.gif`),
    );
  }

  await encodeAlphaWebm(
    symbolPortraitFrames,
    path.join(
      webmDir,
      "zuaros-intro-symbol-transparent-1080x1920.webm",
    ),
  );
  await encodeAlphaWebm(
    symbolLandscapeFrames,
    path.join(
      webmDir,
      "zuaros-intro-symbol-transparent-1920x1080.webm",
    ),
  );

  const animationCards = [];
  for (const milliseconds of [0, 350, 750, 1150, 1950, DURATION_MS]) {
    animationCards.push({
      label: `${(milliseconds / 1000).toFixed(1)} s`,
      svg: introFrameSvg(
        720,
        405,
        milliseconds,
        milliseconds === DURATION_MS,
        true,
      ),
      background: "#101211",
      border: "#34382F",
      text: "#F1F0E9",
    });
  }
  await contactSheet(
    "preview/zuaros-animation-preview.png",
    `Zuaros studio intro · ${(DURATION_MS / 1000).toFixed(1)} seconds · ${FPS} fps`,
    animationCards,
    3,
  );
}

async function writeManifest() {
  const manifest = {
    package: "Zuaros standalone brand media",
    generatedFrom: "src/brand/mark.json",
    intro: {
      durationSeconds: DURATION_MS / 1000,
      framesPerSecond: FPS,
      frameCount: FRAME_COUNT,
      finalHoldMilliseconds: introConfig.finalHoldMs,
      exportExitFadeMilliseconds: introConfig.exportExitFadeMs,
      normalBackground: "#101211",
      alphaWebm: true,
    },
    colors: {
      graphite: "#101211",
      gold: "#EDB466",
      spark: "#F6C580",
      orbit: "#B59A70",
      paperGold: "#976018",
      warmWhite: "#F1F0E9",
    },
  };
  await put("manifest.json", `${JSON.stringify(manifest, null, 2)}\n`);
  await copyFile(
    path.join(scriptDirectory, "media-readme.md"),
    path.join(mediaRoot, "README.md"),
  );
}

console.log("Resetting standalone media output...");
await resetDirectory(mediaRoot);
const tempRoot = await mkdtemp(path.join(os.tmpdir(), "zuaros-media-export-"));
try {
  console.log("Rendering static logos, wordmarks, splash assets, and previews...");
  await generateStaticAssets();
  console.log(
    `Rendering ${FRAME_COUNT}-frame studio intro sequences and encoding media...`,
  );
  await generateAnimationAssets(tempRoot);
  await writeManifest();
} finally {
  await rm(tempRoot, { recursive: true, force: true });
}
console.log(`Standalone media written to ${mediaRoot}`);
