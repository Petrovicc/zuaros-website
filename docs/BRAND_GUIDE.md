# Zuaros visual identity

## Brand idea

The Zuaros identity has one core and two levels of expression. The geometric **Z** is the brand; its detached upper-right fragment is the **spark**. At larger sizes, a restrained orbital energy system expresses interconnected software, engineering, and controlled complexity around that core.

The orbital emblem is a direct simplification of the website hero. It keeps the hero's four shared paths, mixed directions, and deliberate asymmetry, but excludes its crosshairs, coordinate note, guide circles, measurement marks, background grid, and other instrumentation. The paths always sit behind the core, remain much thinner than the Z, and do not require glow for legibility.

## Two-level identity system

### Compact Core Mark — Z + spark

Use the Core Mark for:

- favicon and browser icons;
- navbar and compact footer placement;
- app icons and the operating system's native mobile splash;
- GitHub and other small avatars;
- any placement below the Full Orbital Emblem's minimum size.

The Core Mark is the correct choice at tiny sizes. Never squeeze orbital paths into a favicon or a small navigation control.

### Full Orbital Emblem — Z + spark + orbital system

Use the Full Orbital Emblem for:

- Word and PDF document covers or headers;
- PowerPoint and presentation title pages;
- reports, posters, splash screens, and social graphics;
- the in-app game studio intro;
- large website and event-branding placements.

Use the emblem-only asset when the surrounding context already says Zuaros. Use the horizontal lockup for document headers and wide layouts. Use the vertical lockup for covers, posters, and centered title pages.

## Master geometry

[`src/brand/zuaros-master.svg`](../src/brand/zuaros-master.svg) is the single editable vector source. Its visible vertical lockup and structured SVG attributes contain:

- the exact 64-unit Z and spark paths;
- the existing outlined lowercase wordmark paths;
- the 600-unit emblem center and core transform;
- four hero-derived orbit definitions;
- four particle phases, directions, sizes, periods, and trail durations.

Running `npm run brand` reads that SVG and regenerates `src/brand/mark.json`, the complete SVG/PNG library, social artwork, native splash, and `ZuarosGeometry.Generated.cs`. React consumes the generated JSON manifest. Do not hand-edit the manifest or generated outputs; change the master SVG and regenerate instead.

## Asset library

All production artwork lives under `public/brand/`. Existing root-level asset URLs remain as compatibility aliases for the live website.

```text
public/brand/
  core/
    zuaros-core.svg
    zuaros-core-dark.svg
    zuaros-core-light.svg
    zuaros-core-mono-dark.svg
    zuaros-core-mono-light.svg

  orbital/
    zuaros-orbital.svg
    zuaros-orbital-on-dark.svg
    zuaros-orbital-on-light.svg
    zuaros-orbital-mono-dark.svg
    zuaros-orbital-mono-light.svg
    zuaros-orbital-horizontal*.svg
    zuaros-orbital-vertical*.svg

  raster/
    core/
    orbital/
    lockups/
```

The raster folders contain transparent PNGs at 256, 512, 1024, and 2048 px. The number is the exported width; square marks are the same height, while horizontal and vertical lockups preserve their SVG aspect ratio. Prefer SVG whenever the destination supports it. Use 1024 or 2048 PNGs for office documents, PDF workflows that rasterize placed artwork, and social production.

### Variant naming

| Suffix | Intended surface | Construction |
| --- | --- | --- |
| `on-dark` or the unsuffixed orbital asset | Graphite/dark | Solar-gold core, light spark, muted-gold paths |
| `on-light` | White/light | Contrast gold core, graphite paths and wordmark |
| `mono-dark` | White/light print | Graphite-only artwork |
| `mono-light` | Dark single-color use | Soft-white artwork |

`zuaros-orbital-dark.svg` and `zuaros-orbital-light.svg` are convenient aliases for dark- and light-background artwork. Prefer the explicit `on-dark` / `on-light` names in new integrations. The older root-level `zuaros-logo-light.svg` name is retained only because the deployed navbar already references it.

For the compact set, `zuaros-core-dark.svg` is intended for a dark canvas and `zuaros-core-light.svg` is tuned for a light canvas.

## Minimum sizes and spacing

| Mark | Recommended minimum | Notes |
| --- | --- | --- |
| Core Mark | 24 px / 6 mm | The purpose-built favicon is the 16 px exception |
| Full Orbital Emblem | 128 px / 32 mm | Switch to Core Mark below this size |
| Horizontal Orbital Lockup | 520 px / 130 mm wide | Keeps its embedded orbital emblem at the 128 px / 32 mm minimum |
| Vertical Orbital Lockup | 160 px / 40 mm wide | Best for covers and title pages |

Keep at least one spark-width of clear space around the Core Mark. Around an orbital emblem, keep at least 8% of the emblem width clear. Never crop an orbit or let nearby rules appear to continue one of its paths.

Do not stretch, outline, redraw, mirror, add rays, enclose in a crest, or place the mark over a busy image. A restrained warm glow is allowed in a large animated or decorative context, but it is never part of the required logo geometry.

## Palette

| Token | Value | Role |
| --- | --- | --- |
| Graphite | `#101211` | Primary background and monochrome dark ink |
| Charcoal | `#161917` | Secondary surfaces |
| Soft white | `#F1F0E9` | Wordmark/text on dark and monochrome light |
| Muted gray | `#A4AAA1` | Supporting text |
| Solar amber | `#EDB466` | Core brand gold on dark |
| Light amber | `#F6C580` | Spark, particle heads, focus accents |
| Muted amber | `#B59A70` | Orbital paths on dark |
| Contrast gold | `#976018` | Core mark on white/light documents |
| Orbital graphite | `#34382F` | Orbital paths on white/light documents |

The contrast-gold version is deliberately darker than the web accent so the mark remains readable on white. Do not introduce blue/purple gradients, realistic planets, starscapes, lens flares, 3D metal, crypto styling, or gaming-clan treatments.

## Typography and wordmark

The lowercase `zuaros` wordmark is custom outlined vector geometry with open counters and restrained rounded joins. It does not depend on an installed font. Do not typeset a replacement wordmark.

Use **Space Grotesk Variable** for headings and **Inter Variable** for body/UI copy. Both website fonts are self-hosted and OFL-licensed; license copies are in `public/brand/licenses/`.

## Studio intro

The reusable React reference is [`src/components/ZuarosStudioIntro.tsx`](../src/components/ZuarosStudioIntro.tsx). The default sequence lasts **1.9 seconds**, inside the approved 1.5–2.2 second range:

1. ignition point appears during roughly 0–200 ms;
2. the Z fades and scales gently into place from roughly 160–520 ms;
3. the spark appears and gives one restrained pulse from roughly 430–720 ms;
4. four orbital paths draw in with 70 ms staggering from roughly 520–1,190 ms;
5. four particles activate from roughly 700 ms and move at distinct speeds in both directions;
6. the optional wordmark fades in from 1,180–1,360 ms and remains fully visible for about 540 ms.

Every trail is physical history. The head is evaluated at `P(t)` and each trail sample at `P(t − age)`. Direction is inside `P`, so clockwise and counter-clockwise particles both leave their trails behind their heads. No directional gradient is used.

### Finished variants

- **Variant A — Symbol only:** `showWordmark={false}`. Use when a game immediately presents its own strong title screen.
- **Variant B — Studio wordmark:** `showWordmark`. Use when explicit studio recognition matters.
- **Recommended hybrid:** run the same core/orbit activation, reveal `zuaros` for the last recognition beat, then crossfade immediately into the prepared application content. This is the default recommendation because it names the studio without adding a long logo hold.

The React component exposes `durationMs`, `autoDismiss`, `reducedMotion`, `exitStyle`, `exiting`, and `onComplete`. A host can use a 180–220 ms fade, a slight scale-up plus fade, or its own crossfade into the game. Reduced motion resolves to the stable final composition, removes trails, and still completes—never wait for a disabled CSS animation event.

## .NET MAUI games

Do not use the animated two-second sequence as the operating system's native splash. Native splash behavior differs by platform and should remain static.

1. Copy [`extras/maui/ZuarosIntro/Resources/Splash/zuaros-splash.svg`](../extras/maui/ZuarosIntro/Resources/Splash/zuaros-splash.svg) into the game's `Resources/Splash/` and register it as `MauiSplashScreen` with graphite `#101211`.
2. Show `ZuarosIntroView` as an in-app layer immediately after initialization, over an already-prepared first screen.
3. Select `ShowWordmark`, `Duration`, `BackgroundColor`, `AutoDismiss`, and `ReducedMotion` through `ZuarosIntroOptions`.

The support package in [`extras/maui/ZuarosIntro/`](../extras/maui/ZuarosIntro/) uses `GraphicsView`, `IDrawable`, MAUI's native animation clock, normalized coordinates, cached paths, and no third-party animation dependency. Its README contains copy/reference integration examples.

## Practical application

- **Small UI, favicon, avatar:** Core Mark.
- **Document header:** horizontal orbital lockup, preferably `on-light` for a white page.
- **Report or presentation cover:** Full Orbital Emblem or vertical lockup.
- **Dark presentation title page:** `on-dark` emblem or lockup.
- **Monochrome print:** `mono-dark`; use `mono-light` only when printing light ink on a dark field.
- **Game startup:** static Core Mark as native splash, then the in-app Orbital Intro.
- **Social graphic:** Full Orbital Emblem with sufficient clear space; do not add astronomical scenery.

## Preview and maintenance

Run `npm run dev`, then open:

- `/?brand-preview=1` — complete asset and animation QA page;
- `/?brand-preview=1&intro=symbol` — full-screen symbol-only intro;
- `/?brand-preview=1&intro=wordmark` — full-screen studio-wordmark intro.

The preview is intentionally not linked from public navigation. It shows Core Mark sizes, Full Orbital Emblem sizes, light/dark/monochrome contexts, horizontal and vertical lockups, and independently replayable intro variants.
