# Zuaros standalone brand media

Everything in this folder opens without React, TypeScript, Vite, or the public
website. Start in `preview/` for two visual contact sheets and full-resolution
final frames.

## Quick choices

- **Word, PDF reports, papers, and light PowerPoint slides:** use
  `wordmarks/horizontal/zuaros-horizontal-document.svg` or its 2048 px PNG.
  The vertical document lockup is available beside it under `wordmarks/vertical/`.
- **Dark title slides and graphite backgrounds:** use the `*-dark.svg` or
  `*-dark-2048.png` wordmark. The emblem is warm gold and the wordmark warm white.
- **Favicon or app icon:** use `logos/svg/zuaros-core.svg`, or a suitably sized
  PNG from `logos/png/core/`. The core is the compact Z and detached spark.
- **Recommended game or application intro:** use
  `studio-intro/mp4/zuaros-intro-symbol-1920x1080.mp4` for landscape or the
  matching 1080x1920/1440x2560 file for portrait. The 2.8-second sequence
  resolves into a 450 ms stable final hold. Choose the wordmark variant when
  the product should explicitly identify Zuaros.

## Formats and transparency

- **SVG:** infinitely scalable, standalone vector artwork with no fonts,
  scripts, CSS, or external dependencies.
- **PNG:** lossless still image. Files in `logos/png/`, `logos/monochrome/`,
  `wordmarks/`, `splash/transparent/`, and `studio-intro/frames/symbol/` have
  transparent backgrounds. Files in `splash/dark/`, `preview/`, and `social/`
  use the graphite presentation background unless their name says otherwise.
- **MP4:** H.264 with a graphite background; best general compatibility for
  players, browsers, PowerPoint, and video editors. MP4 files are not transparent.
- **WebM:** VP9. Standard files use the graphite background. Files containing
  `-transparent-` carry a tested VP9 alpha channel; application support varies.
- **GIF:** compact 720x1280 looping previews for GitHub and chat. Use MP4 or WebM
  for production quality.
- **PNG frame sequence:** 84 sequential 1080x1920 RGBA frames at 30 fps, covering
  the complete 2.8-second symbol animation. These are intended for mobile, game,
  and editing pipelines.

## Naming

- `dark-compatible` means gold artwork intended for dark backgrounds.
- `document` or `light` means darker artwork intended for white/light pages.
- `monochrome-dark` is graphite artwork for light backgrounds.
- `monochrome-light` is warm-white artwork for dark backgrounds.

The animation and all logo variants are derived from the repository's canonical
Zuaros brand geometry. See `manifest.json` for timing and color values.
