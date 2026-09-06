# Brand package validation

Validated on 6 September 2026 with Node.js 24, Chromium, Sharp, and the installed .NET 10 MAUI workloads.

## Automated website and asset checks

- ESLint, strict TypeScript, and the production Vite build pass.
- `npm audit` reports 0 vulnerabilities.
- **40 Playwright tests pass** against both root hosting and the `/zuaros-website/` GitHub Pages production bundle.
- The existing bilingual website still passes at 375×812, 430×932, 768×1024, 1366×768, and 1920×1080 in English and Serbian.
- Axe-core WCAG A/AA checks still pass for the public website at desktop and mobile widths.
- No normal-site route, public navigation item, localization path, deployment base, or existing brand URL was removed.
- Brand tests verify every Core Mark, orbital emblem, and lockup contains the exact master Z and spark paths.
- The clean orbital SVG is checked for four thin orbit paths, four bodies, correct layer order, transparent background, and absence of text, crosshairs, coordinate labels, dashed measurement marks, and background rectangles.
- Dark-background, light-background, monochrome-dark, and monochrome-light inks are verified.
- Transparent PNGs at 256, 512, 1024, and 2048 px are checked for exact dimensions, preserved lockup aspect ratios, a real alpha channel, transparent pixels, and opaque artwork pixels.
- Two consecutive brand generations produce byte-identical JSON, SVG, PNG, splash, and generated C# outputs.

## Static visual review

The maintenance preview was reviewed on both graphite and white presentation-like panels. The following actual display sizes are present in the preview:

- Core Mark: 24, 48, and 128 px;
- Full Orbital Emblem: 128, 256, and 512 px;
- horizontal and vertical lockups on dark;
- horizontal document lockup on white;
- all four background/monochrome emblem variants.

At 24 and 48 px, the Core Mark remains the intended choice. At 128 px and above, the orbital paths remain subordinate to the Z, the spark stays distinct, and the emblem reads without glow. The white-page version uses contrast gold `#976018` and graphite paths; the dark-page version uses solar amber and muted-gold paths. SVG is the master format and all PNGs preserve transparency.

The full emblem retains the hero's intentional asymmetry: one circular path, two opposing angled ellipses with different visual emphasis, one narrow offset-feeling ellipse, mixed particle sizes, and mixed phases. It does not include the hero's instrumentation or astronomical scenery.

## Studio intro behavior

The web reference uses a finite **1,900 ms** timeline, with one cached-node `requestAnimationFrame` controller and no React render per frame.

- Ignition, Z formation, spark pulse, staggered orbital drawing, particle activation, and optional wordmark appear in the required order.
- Four particles have distinct size, phase, opacity, period, and mixed clockwise/counter-clockwise directions.
- Every rendered trail point is independently mapped back onto its ellipse. Its signed phase lag must equal `age / period`, proving that each point is a previous position behind its head for either direction.
- The symbol-only variant contains no wordmark. The studio variant reaches a fully visible wordmark at about 1,360 ms and holds it for approximately 540 ms.
- Reduced motion immediately resolves to a stable completed frame, hides trails, stops movement, and does not deadlock completion.
- The component supports host-controlled fade or slight scale/fade exits, completion callbacks, and optional automatic dismissal.

The standalone intro was rendered and pixel dimensions were verified at:

| CSS viewport and scale | Output pixels | Result |
| --- | --- | --- |
| 360×800 at 3× | 1080×2400 | centered, contained, no overflow |
| 480×1067 at 3× | 1440×3201 (approximately 1440×3200) | centered, contained, no overflow |
| 1920×1080 at 1× | 1920×1080 | centered, contained, no overflow |

## Performance and lifecycle

- The existing hero still uses one cached-node RAF loop, pauses offscreen and while the document is hidden, responds to live reduced-motion changes, and removes its observer/listeners on cleanup.
- Hero particle rendering now reuses preallocated coordinate objects in the frame loop instead of allocating sample arrays each frame.
- Intro rendering queries DOM nodes once, reuses point objects, and stops permanently after its finite timeline.
- Existing lifecycle tests confirm repeated hero mount/dispose safety and bounded SVG layout work.
- No animation library, video, texture, canvas bitmap, or large blur dependency was added.

## .NET MAUI reference

`extras/maui/ZuarosIntro/` was validated as a standalone multi-target MAUI project:

- Android, iOS, Mac Catalyst, and Windows builds pass with **0 warnings and 0 errors**.
- `dotnet format --verify-no-changes` passes.
- The package uses one `GraphicsView`, one `IDrawable`, MAUI's native animation timing, cached paths/tables, and no third-party animation dependency.
- `npm run brand` reads the authoritative `src/brand/zuaros-master.svg`, generates the React JSON manifest, and derives the MAUI Z, spark, wordmark, orbit, center, transform, and particle definitions from the same vector source.
- The MAUI renderer evaluates trail samples at `t − age` with direction inside the orbit function.
- Normalized layout math was checked at 1080×2400, 1440×3200, and 1920×1080.
- The static native splash uses the Core Mark on transparent SVG artwork; full motion runs in-app after initialization.

These are local automated and rendered checks. No claim is made for physical-device battery use, OEM splash timing, or a hardware frame-rate measurement until the package is integrated into a specific game and profiled on its target devices.

## Preview locations

With `npm run dev` running:

- `/?brand-preview=1` — full brand QA surface;
- `/?brand-preview=1&intro=symbol` — full-screen symbol intro;
- `/?brand-preview=1&intro=wordmark` — full-screen wordmark intro.
