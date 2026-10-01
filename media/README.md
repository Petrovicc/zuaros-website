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
| `play-console/developer-icon/zuaros-developer-icon-512.png` | 512 x 512 px, 32-bit RGBA PNG, 37,813 bytes |
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
the reusable vector sources, not upload files. The current icon uses the master
Z and spark with three master orbital paths and two tiny points. Its compact
composition was reviewed at 512, 128, 64, 48 and 32 px; see
`play-console/preview/zuaros-developer-icon-sizes.png`.

The approved header PNG, JPG and SVG source are unchanged. Their original SHA-256
hashes are checked by the validator. Promotional text also remains unchanged.

## Business Cards

**PRIMARY / RECOMMENDED: the bilingual card, Serbian Cyrillic front and English
back, with the integrated gold QR on both sides.** This is the official current
Zuaros business card. The two professional fields are Software Development and
Engineering Solutions; the Serbian equivalents are Развој софтвера and
Инжењерска решења. No game category, address, telephone number or job title is
included in the primary package.

Start with `business-cards/previews/zuaros-business-card-bilingual-preview.png`.
The Serbian front is on the left and the English back is on the right.

| Side | SVG and 600 dpi PNG (same basename) | Vector print PDF |
| --- | --- | --- |
| Serbian front | `business-cards/bilingual/zuaros-business-card-bilingual-front-sr.svg` / `.png` | `business-cards/print/zuaros-card-bilingual-front-sr.pdf` |
| English back | `business-cards/bilingual/zuaros-business-card-bilingual-back-en.svg` / `.png` | `business-cards/print/zuaros-card-bilingual-back-en.pdf` |

For the print shop, send **`business-cards/print/zuaros-card-bilingual-duplex.pdf`**.
It contains the Serbian front, then the English back, both upright with the same
top edge. The separate `-with-qr` variants have been superseded and removed:
QR is part of the primary design, so there is only one current bilingual pair.

### Layout and orbital background

The existing upper-left orbital emblem and master wordmark, name block, and
contact hierarchy are retained. Website remains gold and prominent; email is
secondary and the social line tertiary. Contact information matches on both sides.

Three oversized master ellipses create large partial arcs cropped at the card
edges. Two sweep through the upper-right region; a third briefly enters at the
bottom. The English side shifts the placements slightly within the same system.
They use the existing orbit gold **#B59A70**, flattened onto graphite at 15%, 12%
and 10% to preserve low prominence without relying on print transparency.
Their **0.25 mm** strokes are vector and stay clear of the name, descriptors,
contacts and QR quiet zone. The logo's three master orbits retain 0.20 mm strokes.

### Print shop handoff

- **Final trim:** 85 x 55 mm, landscape.
- **Bleed:** 3 mm on every side; full MediaBox and BleedBox are 91 x 61 mm.
- **TrimBox:** inset 3 mm, from (3, 3) to (88, 58) mm.
- Important text is at least **4.5 mm inside trim**; name 14 pt, website 10.5 pt,
  email/descriptors 8 pt, social line 7.5 pt.
- Print at supplied size. The printer should impose a head-to-head pair using
  the PDF boxes and add any required crop marks outside the bleed.
- Production SVG and PDF text is outlined. All artwork remains vector; no
  rasterized text, font substitution, or external font dependency is required.
- These are **RGB vector masters**, not CMYK or certified PDF/X files. The print
  shop should interpret the RGB values as sRGB, convert using its actual press
  and stock ICC profile, and supply a proof. No rich-black recipe or foil/spot
  separation is invented.
- Exact brand colors: graphite **#101211**, primary gold **#EDB466**, spark
  **#F6C580**, off-white **#F1F0E9**. QR modules use the same primary gold as the
  Z and website. Existing subdued logo/divider color **#847456** is retained.

### QR validation

Both sides point only to **https://zuaros.com**. The QR is **19 x 19 mm** including
its four-module quiet zone. The pattern is 25 x 25 modules, approximately
**0.576 mm per module**, with **Q error correction**. Gold modules sit directly on
**#101211 graphite**, including all negative space and the quiet zone. There is
no white square, frame or content in that zone.

ZXing decoded both sides from the final PDFs at **600, 300, 150 and 120 dpi**,
without recoloring or manually inverting the rendered images. The full 600 dpi
PNG exports also decode. Pixel inspection confirms all four quiet-zone strips
are pure graphite. A real press/stock proof remains necessary; no physical print
was performed here.

### Editable sources, previews and office use

`business-cards/source/zuaros-business-card-bilingual-*-editable.svg` retains live
text and embedded fonts. The supplied static Inter subset TTFs and OFL license
are unchanged. In editors that ignore embedded SVG fonts, install those uniquely
named subsets. The master wordmark remains custom vector geometry. After edits,
regenerate and validate the outlined production assets.

For **Word/PowerPoint**, use the outlined SVG or the flat
`business-cards/previews/zuaros-business-card-bilingual-*-trim.png` previews.
Production PNGs include bleed and are **2150 x 1441 px at 600 dpi**. Trim previews
omit bleed. Preview PNGs are not print-layout templates.

The updated A4 `business-cards/previews/zuaros-business-cards-actual-size.pdf`
shows the two primary sides at physical size, with a 50 mm calibration ruler.
Print at **100% / Actual size**, with fit-to-page disabled. Screen previews do
not guarantee physical size on an uncalibrated display.

### Historical/reference designs

Existing `sr-cyrillic/`, `en/`, their corresponding print files, and the original
`previews/zuaros-business-cards-preview.png` overview remain unchanged as
**historical/reference assets only**. That old overview shows superseded card
content and is not the production selection guide. The exporter no longer
regenerates monolingual cards. Use the primary bilingual files above for new work.

`profile-business-validation.json` records actual metadata, print boxes, exact
text, safe areas, QR results, master icon geometry and protected header hashes.
See `../tools/profile-media/README.md` for reproduction. Website source, website
logos, studio intro, approved header and unrelated media are unchanged.
