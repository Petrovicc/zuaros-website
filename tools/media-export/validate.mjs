import { execFile } from "node:child_process";
import { readdir, readFile, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const execFileAsync = promisify(execFile);
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "../..");
const mediaRoot = path.join(repositoryRoot, "media");
const errors = [];

function fail(message) {
  errors.push(message);
}

async function exists(relativePath) {
  try {
    return await stat(path.join(mediaRoot, relativePath));
  } catch {
    fail(`Missing ${relativePath}`);
    return null;
  }
}

async function validateSvg(relativePath) {
  if (!(await exists(relativePath))) return;
  const svg = await readFile(path.join(mediaRoot, relativePath), "utf8");
  if (!/<svg\b/.test(svg) || !/viewBox="[^"]+"/.test(svg))
    fail(`${relativePath} does not contain a standalone SVG viewBox`);
  if (/<script\b|(?:href|src)="https?:|@import/i.test(svg))
    fail(`${relativePath} contains an external or executable dependency`);
}

async function validatePng(relativePath, width, height, alphaExpected) {
  if (!(await exists(relativePath))) return;
  const image = sharp(path.join(mediaRoot, relativePath));
  const metadata = await image.metadata();
  if (metadata.format !== "png" || metadata.width !== width || metadata.height !== height)
    fail(
      `${relativePath} expected ${width}x${height} PNG, got ${metadata.width}x${metadata.height} ${metadata.format}`,
    );
  if (alphaExpected && !metadata.hasAlpha)
    fail(`${relativePath} is missing its alpha channel`);
  if (alphaExpected === true) {
    const stats = await image.stats();
    const alpha = stats.channels[3];
    if (!alpha || alpha.min !== 0 || alpha.max !== 255)
      fail(`${relativePath} does not contain both transparent and opaque pixels`);
  }
}

async function probe(relativePath, expected) {
  if (!(await exists(relativePath))) return;
  const fullPath = path.join(mediaRoot, relativePath);
  const { stdout } = await execFileAsync("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "stream=codec_name,width,height,pix_fmt:stream_tags=alpha_mode:format=duration,size",
    "-of",
    "json",
    fullPath,
  ]);
  const data = JSON.parse(stdout);
  const stream = data.streams?.[0];
  const duration = Number(data.format?.duration);
  if (!stream) return fail(`${relativePath} has no video stream`);
  if (stream.codec_name !== expected.codec)
    fail(`${relativePath} expected ${expected.codec}, got ${stream.codec_name}`);
  if (stream.width !== expected.width || stream.height !== expected.height)
    fail(`${relativePath} expected ${expected.width}x${expected.height}`);
  if (Math.abs(duration - 1.9) > 0.08)
    fail(`${relativePath} duration ${duration} is not approximately 1.9 seconds`);
  if (expected.alpha && stream.tags?.ALPHA_MODE !== "1")
    fail(`${relativePath} is missing VP9 alpha metadata`);
}

async function validateDecodedAlpha(relativePath) {
  const source = path.join(mediaRoot, relativePath);
  if (!(await exists(relativePath))) return;
  const decoded = path.join(
    os.tmpdir(),
    `zuaros-alpha-${process.pid}-${path.basename(relativePath)}.png`,
  );
  try {
    await execFileAsync("ffmpeg", [
      "-y",
      "-hide_banner",
      "-loglevel",
      "error",
      "-c:v",
      "libvpx-vp9",
      "-ss",
      "1",
      "-i",
      source,
      "-frames:v",
      "1",
      decoded,
    ]);
    const metadata = await sharp(decoded).metadata();
    const stats = await sharp(decoded).stats();
    const alpha = stats.channels[3];
    if (!metadata.hasAlpha || !alpha || alpha.min !== 0 || alpha.max !== 255)
      fail(`${relativePath} did not decode with a genuine variable alpha channel`);
  } finally {
    await import("node:fs/promises").then(({ rm }) => rm(decoded, { force: true }));
  }
}

const requiredSvgs = [
  "logos/svg/zuaros-orbital.svg",
  "logos/svg/zuaros-core.svg",
  "logos/svg/zuaros-orbital-light.svg",
  "logos/svg/zuaros-orbital-dark.svg",
  "logos/svg/zuaros-orbital-monochrome-dark.svg",
  "logos/svg/zuaros-orbital-monochrome-light.svg",
  "wordmarks/horizontal/zuaros-horizontal-document.svg",
  "wordmarks/horizontal/zuaros-horizontal-dark.svg",
  "wordmarks/vertical/zuaros-vertical-document.svg",
  "wordmarks/vertical/zuaros-vertical-dark.svg",
];
for (const entry of requiredSvgs) await validateSvg(entry);

for (const size of [256, 512, 1024, 2048]) {
  await validatePng(
    `logos/png/core/zuaros-core-dark-compatible-${size}.png`,
    size,
    size,
    true,
  );
  await validatePng(
    `logos/png/core/zuaros-core-document-${size}.png`,
    size,
    size,
    true,
  );
}
for (const size of [512, 1024, 2048, 4096]) {
  await validatePng(
    `logos/png/orbital/zuaros-orbital-dark-compatible-${size}.png`,
    size,
    size,
    true,
  );
  await validatePng(
    `logos/png/orbital/zuaros-orbital-document-${size}.png`,
    size,
    size,
    true,
  );
}
for (const [width, height] of [
  [1080, 1920],
  [1440, 2560],
  [1440, 3200],
]) {
  for (const kind of ["core", "orbital"]) {
    await validatePng(
      `splash/dark/${kind}/zuaros-splash-${kind}-${width}x${height}.png`,
      width,
      height,
      false,
    );
    await validatePng(
      `splash/transparent/${kind}/zuaros-splash-${kind}-${width}x${height}.png`,
      width,
      height,
      true,
    );
  }
}
for (const variant of ["symbol", "wordmark"]) {
  for (const [width, height] of [
    [1080, 1920],
    [1440, 2560],
    [1920, 1080],
  ])
    await probe(
      `studio-intro/mp4/zuaros-intro-${variant}-${width}x${height}.mp4`,
      { codec: "h264", width, height },
    );
  for (const [width, height] of [
    [1080, 1920],
    [1920, 1080],
  ])
    await probe(
      `studio-intro/webm/zuaros-intro-${variant}-${width}x${height}.webm`,
      { codec: "vp9", width, height },
    );
}
for (const [width, height] of [
  [1080, 1920],
  [1920, 1080],
]) {
  const relativePath = `studio-intro/webm/zuaros-intro-symbol-transparent-${width}x${height}.webm`;
  await probe(relativePath, { codec: "vp9", width, height, alpha: true });
  await validateDecodedAlpha(relativePath);
}

const framesDirectory = path.join(mediaRoot, "studio-intro/frames/symbol");
const frames = (await readdir(framesDirectory)).filter((entry) => entry.endsWith(".png"));
if (frames.length !== 57) fail(`Expected 57 symbol frames, got ${frames.length}`);
for (let index = 0; index < frames.length; index++) {
  const expected = `frame_${String(index + 1).padStart(4, "0")}.png`;
  if (frames[index] !== expected) fail(`Frame ${index + 1} is ${frames[index]}, expected ${expected}`);
}
await validatePng("studio-intro/frames/symbol/frame_0001.png", 1080, 1920, "channel");
await validatePng("studio-intro/frames/symbol/frame_0029.png", 1080, 1920, true);
await validatePng("studio-intro/frames/symbol/frame_0057.png", 1080, 1920, true);

for (const variant of ["symbol", "wordmark"]) {
  const relativePath = `studio-intro/gif/zuaros-intro-${variant}-preview.gif`;
  const info = await exists(relativePath);
  if (info) {
    const metadata = await sharp(path.join(mediaRoot, relativePath), {
      animated: true,
    }).metadata();
    if (
      metadata.format !== "gif" ||
      metadata.width !== 720 ||
      metadata.pageHeight !== 1280
    )
      fail(`${relativePath} is not a 720x1280 GIF`);
    if (!metadata.pages || metadata.pages < 20)
      fail(`${relativePath} does not contain enough animated frames`);
    if (info.size > 15 * 1024 * 1024)
      fail(`${relativePath} is larger than the 15 MiB preview budget`);
  }
}

for (const entry of [
  "preview/zuaros-intro-final-symbol.png",
  "preview/zuaros-intro-final-wordmark.png",
  "preview/zuaros-brand-preview.png",
  "preview/zuaros-animation-preview.png",
  "README.md",
  "manifest.json",
])
  await exists(entry);

if (errors.length) {
  console.error(`Media validation failed (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log("Media validation passed:");
  console.log("- standalone SVGs contain viewBoxes and no external dependencies");
  console.log("- requested transparent PNG dimensions and alpha channels are valid");
  console.log("- 6 H.264 MP4 and 4 graphite VP9 WebM files are approximately 1.9 s");
  console.log("- 2 VP9 WebM files decode with genuine variable alpha");
  console.log("- 2 animated GIF previews are 720x1280 and within 15 MiB");
  console.log("- 57 sequential 1080x1920 RGBA PNG frames are present");
}
