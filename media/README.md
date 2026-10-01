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

## Google Play Developer Profile

Open `play-console/` for the developer/company profile package. These are not
individual app or game listing assets.

**Production files for direct Play Console upload:**

| File | Verified specification |
| --- | --- |
| `play-console/developer-icon/zuaros-developer-icon-512.png` | 512 x 512 px, 32-bit RGBA PNG, 6,219 bytes |
| `play-console/header-image/zuaros-developer-header-4096x2304.png` | 4096 x 2304 px, 24-bit RGB PNG, no alpha, 337,030 bytes |
| `play-console/header-image/zuaros-developer-header-4096x2304.jpg` | 4096 x 2304 px, RGB JPEG, quality 96, 4:4:4, 477,713 bytes |

All three carry an sRGB profile. The icon deliberately has an alpha channel
(32-bit format) with an opaque graphite background. Upload either header format.
The official [Google developer-profile requirements](https://support.google.com/googleplay/android-developer/answer/9873827?hl=en)
were checked on 2026-10-01.

Copy the text itself, without the language/count labels, from
`play-console/promotional-text/promotional-text.txt`:

- English, **99 characters**: Zuaros develops custom software, engineering applications, digital products, and independent games.
- Serbian Cyrillic, **92 characters**: Zuaros развија софтвер по мери, инжењерске апликације, дигиталне производе и независне игре.

Counts include spaces and punctuation. Both fit the 140-character limit.
`play-console/preview/play-console-profile-preview.png` is a **static local preview
only**, not an exact reproduction of Google's UI. `play-console/source/` contains
the reusable vector sources, not upload files. Three icon compositions were
compared at 32 and 64 px; the Z + spark composition was selected for clarity.
Two headers were compared; emblem + master wordmark was selected for recognition.
Unselected variants are not part of the delivery.

## Business Cards

Open `business-cards/previews/zuaros-business-cards-preview.png` to compare every
front/back pair. The practical international version is **bilingual**, with
Serbian Cyrillic on the front and English on the back.

| Version | SVG and 600 dpi PNG artwork | Two-page print PDF |
| --- | --- | --- |
| Serbian Cyrillic | `business-cards/sr-cyrillic/` | `business-cards/print/zuaros-card-sr-duplex.pdf` |
| English | `business-cards/en/` | `business-cards/print/zuaros-card-en-duplex.pdf` |
| Bilingual, SR front / EN back | `business-cards/bilingual/` | `business-cards/print/zuaros-card-bilingual-duplex.pdf` |
| Bilingual QR alternative | `business-cards/bilingual/*-with-qr.*` | `business-cards/print/zuaros-card-bilingual-with-qr-duplex.pdf` |

Each language directory contains `zuaros-business-card-<version>-<side>.svg` and
matching `.png` files. Bilingual names end in `-front-sr` or `-back-en`.
The QR alternative adds `-with-qr`. The monolingual reverse is a restrained
emblem, wordmark, and website composition; the bilingual reverse contains the
English identity and contacts.

### Print shop handoff

Send the desired two-page PDF from `business-cards/print/` and these instructions:

- **Final trim:** 85 x 55 mm, landscape.
- **Bleed:** 3 mm on every side; full MediaBox and BleedBox are 91 x 61 mm.
- **TrimBox:** inset 3 mm, from (3, 3) to (88, 58) mm in the artwork.
- All important text is at least **4.5 mm inside trim**; name 14 pt, website
  10.5 pt, email/descriptors 8 pt, social line 7.5 pt.
- Both pages are upright, front first and back second, with the same top edge.
  Printer to impose as a head-to-head pair. Do not rotate a supplied side or
  resize to fit. Crop marks are intentionally omitted from production artwork;
  use PDF boxes for imposition and add marks outside the bleed if needed.
- All artwork and final text are **vector paths**. No rasterized text, font
  substitution, or external font dependency exists in production SVG/PDF files.
- Minimum technical line width is **0.20 mm** (about 0.57 pt); three master
  orbital paths are used on cards for small-format clarity.
- These are **RGB vector print masters**, not CMYK or certified PDF/X files.
  The printer should interpret the brand RGB values as sRGB and perform final
  CMYK conversion using the actual press/paper ICC profile, then supply a proof.
  No invented rich-black formula, spot gold, or foil separation is supplied.
- Exact brand colors: graphite **#101211**, solar gold **#EDB466**, spark
  **#F6C580**, off-white **#F1F0E9**. Print orbit/rule color **#847456** is a
  deliberate solid subdued gold; minor technical detail uses **#34382F**.
  The graphite is intentional. Confirm solid dark coverage on the chosen stock.

Individual one-page print files are also supplied:

```text
business-cards/print/zuaros-card-sr-front.pdf
business-cards/print/zuaros-card-sr-back.pdf
business-cards/print/zuaros-card-en-front.pdf
business-cards/print/zuaros-card-en-back.pdf
business-cards/print/zuaros-card-bilingual-front-sr.pdf
business-cards/print/zuaros-card-bilingual-back-en.pdf
business-cards/print/zuaros-card-bilingual-front-sr-with-qr.pdf
business-cards/print/zuaros-card-bilingual-back-en-with-qr.pdf
```

### QR, editing, and office use

The QR alternatives point only to **https://zuaros.com**. The 17 mm square
includes a four-module white quiet zone, with approximately 0.515 mm modules
and error correction M. Both languages were decoded from independently
rendered final PDFs at 300 and 150 dpi. A physical stock/press proof is still
needed to verify real printing conditions; no physical print was performed here.

`business-cards/source/` retains editable SVG text, self-contained embedded
font data, and the corresponding static Inter subset TTFs with the OFL license.
These are derived from the website's installed Inter variable fonts. Inter is
used consistently across both scripts because the installed Space Grotesk
subsets do not support Cyrillic. The wordmark remains the existing custom vector
geometry. In an editor that ignores embedded SVG fonts, install the supplied
uniquely named subsets before editing. Edit whole text runs or the generator,
then regenerate and revalidate the outlined production copies.

For **Word/PowerPoint**, insert an outlined SVG from a language directory for
crisp scaling, or a PNG from `business-cards/previews/*-trim.png` for compatibility.
The language-directory PNGs include bleed and are 2150 x 1441 px at 600 dpi;
the `*-trim.png` previews omit bleed. They are not print-layout templates.

All files in `business-cards/previews/` are **preview/proof only**. The A4
`zuaros-business-cards-actual-size.pdf` provides a true-size layout and 50 mm
calibration ruler: print at **100% / Actual size**, with fit-to-page disabled.
Check the ruler with a physical ruler. Screen previews cannot guarantee physical
size on an uncalibrated display.

The metadata, text, safe-area, vector-content and QR checks are recorded in
`profile-business-validation.json`. Generation and validation instructions are
in `../tools/profile-media/README.md`. Existing media and website files are
untouched by these tools.
