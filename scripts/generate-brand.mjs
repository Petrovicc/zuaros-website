import { copyFile, mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";

// Original vector geometry: an open Z path, separated solar spark, and custom wordmark.
const symbol =
  '<path d="M10 16H43L13 48H48" fill="none" stroke="currentColor" stroke-width="9" stroke-linejoin="bevel"/><path d="m53 5 5 5-5 5-5-5Z" fill="currentColor"/>';
const wordmark =
  '<g fill="none" stroke="currentColor" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h20L4 34h21M37 12v14q0 9 9 9t9-9V12M86 34V12M85 17q-3-6-9-6-11 0-11 12t11 12q6 0 9-6M99 34V13m0 8q3-10 14-9M133 11q-11 0-11 12t11 12q11 0 11-12t-11-12ZM173 14q-4-3-9-3-10 0-10 6 0 5 10 6t10 6q0 6-10 6-6 0-11-4"/></g>';
const wrap = (body, viewBox, extra = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" ${extra}>${body}</svg>`;
await mkdir("public/brand", { recursive: true });
await mkdir("public/brand/licenses", { recursive: true });
await copyFile(
  "node_modules/@fontsource-variable/space-grotesk/LICENSE",
  "public/brand/licenses/Space-Grotesk-OFL.txt",
);
await copyFile(
  "node_modules/@fontsource-variable/inter/LICENSE",
  "public/brand/licenses/Inter-OFL.txt",
);
for (const [name, ink, accent] of [
  ["zuaros-logo", "#f1f0e9", "#edb466"],
  ["zuaros-logo-light", "#f1f0e9", "#edb466"],
  ["zuaros-logo-dark", "#101211", "#976018"],
  ["zuaros-logo-mono", "#101211", "#101211"],
]) {
  await writeFile(
    `public/brand/${name}.svg`,
    wrap(
      `<title>Zuaros</title><g color="${accent}">${symbol}</g><g color="${ink}" transform="translate(78 2) scale(1.27)">${wordmark}</g>`,
      "0 0 310 64",
      'role="img"',
    ),
  );
}
await writeFile(
  "public/brand/zuaros-symbol.svg",
  wrap(
    `<title>Zuaros symbol</title><g color="#edb466">${symbol}</g>`,
    "0 0 64 64",
    'role="img"',
  ),
);
const favicon = wrap(
  `<rect width="80" height="80" rx="16" fill="#101211"/><g color="#edb466" transform="translate(8 8)">${symbol}</g>`,
  "0 0 80 80",
);
await writeFile("public/brand/favicon.svg", favicon);
await sharp(Buffer.from(favicon))
  .resize(32, 32)
  .png()
  .toFile("public/brand/favicon-32.png");
await sharp(Buffer.from(favicon))
  .resize(180, 180)
  .png()
  .toFile("public/brand/apple-touch-icon.png");
await sharp(Buffer.from(favicon))
  .resize(512, 512)
  .png()
  .toFile("public/brand/zuaros-avatar.png");
const social = wrap(
  `<rect width="1200" height="630" fill="#101211"/><g transform="translate(65 50)"><g color="#edb466">${symbol}</g><g color="#f1f0e9" transform="translate(78 2) scale(1.27)">${wordmark}</g></g><g fill="none" stroke="#494330"><circle cx="948" cy="295" r="196"/><circle cx="948" cy="295" r="155" stroke-dasharray="2 7"/><ellipse cx="948" cy="295" rx="195" ry="95" transform="rotate(-40 948 295)"/><ellipse cx="948" cy="295" rx="195" ry="95" transform="rotate(40 948 295)"/></g><g color="#edb466" transform="translate(865 218) scale(2.8)">${symbol}</g><g font-family="Arial, sans-serif"><text x="65" y="244" font-size="65" letter-spacing="-3" fill="#f1f0e9">Ideas sparked.</text><text x="65" y="320" font-size="65" letter-spacing="-3" fill="#edb466">Systems engineered.</text><text x="68" y="390" font-size="21" fill="#a4aaa1">Custom software. Engineering. Research. Play.</text><text x="68" y="559" font-size="13" letter-spacing="3" fill="#a4aaa1">FROM THE FIRST SPARK TO A WORKING SYSTEM</text></g><path d="M65 510h1070" stroke="#34382f"/>`,
  "0 0 1200 630",
  'width="1200" height="630"',
);
await writeFile("public/brand/social-preview.svg", social);
await sharp(Buffer.from(social))
  .png()
  .toFile("public/brand/social-preview.png");
