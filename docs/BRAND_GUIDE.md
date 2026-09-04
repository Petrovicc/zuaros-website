# Zuaros visual identity

## The mark: a Z with a spark terminal

A geometric **Z** ends in a clipped upper terminal. A detached quadrilateral continues its cut angle, making the spark a related fragment rather than an independent decoration. Three closely related variations were compared at 16, 24, navbar, 128, and large hero sizes. The selected version retains a continuous, legible Z and a clear gap to the spark at small sizes. It is deliberately not a flame pictogram, sun icon, or religious emblem. The name's Svarožić connection is brand inspiration supplied by the company.

The custom lowercase wordmark uses consistent monoline geometry, open counters, and restrained rounded joins. Every letter is a vector path: it does not depend on an installed font.

## Assets

All reusable assets are in `public/brand/`. The final body and spark paths live in `src/brand/mark.json`, shared by the React symbol and `scripts/generate-brand.mjs` (`npm run brand`). Navbar, hero, standalone mark, monochrome export, favicon, avatar, and social artwork use identical underlying geometry. The existing wordmark paths, scale, and placement are unchanged. Exploratory variants are not shipped.

| Asset                                      | Use                                                           |
| ------------------------------------------ | ------------------------------------------------------------- |
| `zuaros-logo.svg`, `zuaros-logo-light.svg` | Primary horizontal mark on graphite/dark backgrounds          |
| `zuaros-logo-dark.svg`                     | Dark lettering, bronze symbol on white/light backgrounds      |
| `zuaros-logo-mono.svg`                     | Single-color black artwork for print and restricted-color use |
| `zuaros-symbol.svg`                        | Standalone solar Z, amber on transparent background           |
| `favicon.svg`, `favicon-32.png`            | Small browser icons with a dark protective tile               |
| `apple-touch-icon.png`                     | 180 px touch icon                                             |
| `zuaros-avatar.png`                        | 512 px avatar, no account changes made                        |
| `social-preview.svg`, `social-preview.png` | 1200 × 630 share artwork                                      |

The light/dark suffix describes the artwork, not the intended background. The light logo is for dark backgrounds.

## Logo rules

- Keep at least one spark-width of clear space around the symbol; for the horizontal mark, prefer half the symbol's height.
- Use the horizontal mark at least 120 CSS pixels wide; use the symbol alone below that.
- Keep the symbol legible at 16 px. The favicon's dark tile supplies contrast.
- Preserve proportions, the detached spark, and the direction of the Z.
- Do not stretch, outline, add rays, surround it with a crest, or add heavy effects.
- A restrained glow is allowed in large decorative brand visuals, never required for legibility.
- Keep accessible labels on linked logos. Decorative repeated symbols should be hidden from assistive technology.

## Palette

| Token               | Value     | Role                                       |
| ------------------- | --------- | ------------------------------------------ |
| Graphite            | `#101211` | Main background                            |
| Charcoal            | `#161917` | Secondary surfaces                         |
| Soft white          | `#F1F0E9` | Primary text                               |
| Muted gray          | `#A4AAA1` | Supporting text                            |
| Solar amber         | `#EDB466` | Brand mark, links, primary CTA backgrounds |
| Light amber         | `#F6C580` | Hover and keyboard-focus accents           |
| Muted amber         | `#B59A70` | Decorative markers and secondary gold      |
| Orbital line        | `#4A4940` | Decorative technical paths                 |
| Technical sage-cyan | `#9ABBB4` | Engineering diagrams and secondary accents |
| Structural line     | `#34382F` | Nonessential separators                    |

Use dark text on amber buttons. Thin low-contrast lines are decorative, not the sole way of identifying an interactive control. Do not use the muted structural lines for body text.

The CSS tokens `--bg`, `--surface`, `--surface-light`, `--ink`, `--muted`, `--accent`, `--accent-bright`, `--accent-muted`, `--line`, and `--orbit-line` define the system. Translucent gold uses `rgb(var(--accent-rgb) / opacity)`, not unrelated orange shades. The bronze in the light-background logo is a deliberate contrast variant, not another web accent.

## Typography

**Space Grotesk Variable** for headings. **Inter Variable** for body copy and UI. Both are self-hosted OFL-licensed fonts supplied through Fontsource; Latin and extended Latin files support Serbian diacritics. Font licenses are in the installed font packages and copied to `public/brand/licenses/`.

Headings use medium weight and slightly tight tracking. Body copy is calm and left-aligned. Uppercase tracking is reserved for short section labels. Avoid full paragraphs in uppercase, excessive bold, and narrow line spacing.

## Layout and motion

- Desktop: up to 1320 px of content, generous section spacing, alternating editorial columns.
- Mobile: content-first vertical order, deliberate navigation disclosure, no sideways scrolling.
- Prefer fine rules, open layouts, and near-square corners over a page full of rounded cards.
- The solar core uses geometric orbital paths, not an astronomical simulation.
- Engineering flow means signal → acquisition → processing → insight. It is explicitly labeled as conceptual, never live telemetry.
- Research loops express ask → test → learn. Game particles loosen the same geometric vocabulary.
- Contact uses a single stable mark.
- Continuous motion is slow and restrained. Hover motion is short. All motion is disabled under `prefers-reduced-motion`.

### Hero particles

Four particles share the visible path definitions in `src/animation/orbits.ts`. Positive motion is clockwise in the SVG's downward-Y coordinate system.

| Particle  | Orbit              | Direction        | Period | Head radius | Opacity | Tail history |
| --------- | ------------------ | ---------------- | ------ | ----------- | ------- | ------------ |
| Primary   | Inner circle       | Clockwise        | 14 s   | 3.5         | 1.00    | 0.52 s       |
| Secondary | Ascending ellipse  | Counterclockwise | 19 s   | 2.7         | 0.78    | 0.46 s       |
| Tertiary  | Descending ellipse | Clockwise        | 25 s   | 2.2         | 0.62    | 0.64 s       |
| Distant   | Outer ellipse      | Counterclockwise | 31 s   | 1.6         | 0.42    | 0.42 s       |

Radii are in the shared 600-unit SVG coordinate system. Each tail contains eight progressively smaller, dimmer points. Head position is `P(t)`; every tail point is `P(t - age)`. Direction is applied inside `P`, so changing direction also reverses the trail correctly. Gradient direction does not control the tail.

At widths of 680 px or less, the distant particle is hidden and not updated; the remaining three use five tail points and 60% of the desktop tail duration. Reduced motion leaves stationary heads without tails. One requestAnimationFrame loop writes transforms to cached SVG nodes, with no frame-driven React state or layout reads. It pauses offscreen or when the document is hidden. Cleanup cancels the frame and removes the observer and all three listeners. The central mark no longer has a separate continuous breathing animation.

## Voice

Specific, direct, quietly confident. Describe actual capabilities. No invented clients, project counts, awards, releases, partners, team size, or infrastructure deployments. English and Serbian Latin are independently phrased, not mechanically translated. The contact person is **Nikola Petrović**, at **zuaros.dev@gmail.com**.

The hero states “Software for specialized requirements.” / “Softver za specifične zahteve.” Use “Discuss your project,” “View our services,” and “Contact,” with natural Serbian equivalents. Describe requirements, software, monitoring, simulation, data processing, research, and games directly. Avoid ignition metaphors in sales copy, future-building slogans, startup jargon, and unsupported operating claims. Keep the name's origin to a brief explanation in About.
