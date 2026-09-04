# Zuaros visual identity

## The idea: a spark becomes a system

An open, geometric **Z** carries a small detached diamond: the first spark. The stroke connects an idea to a working system; the separated spark keeps the mark open and forward-looking. It is deliberately not a flame pictogram or a religious emblem. The name's Svarožić connection is inspiration supplied by the company, not a historical claim researched or asserted by the site.

The custom lowercase wordmark uses consistent monoline geometry, open counters, and restrained rounded joins. Every letter is a vector path: it does not depend on an installed font.

## Assets

All reusable assets are in `public/brand/`. Source generation is in `scripts/generate-brand.mjs` (`npm run brand`).

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
| Technical sage-cyan | `#9ABBB4` | Engineering diagrams and secondary accents |
| Structural line     | `#34382F` | Nonessential separators                    |

Use dark text on amber buttons. Thin low-contrast lines are decorative, not the sole way of identifying an interactive control. Do not use the muted structural lines for body text.

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
- Contact returns to a single stable mark, closing the spark-to-system narrative.
- Continuous motion is slow and restrained. Hover motion is short. All motion is disabled under `prefers-reduced-motion`.

## Voice

Specific, direct, quietly confident. Describe actual capabilities. No invented clients, project counts, awards, releases, partners, team size, or infrastructure deployments. English and Serbian Latin are independently phrased, not mechanically translated. The contact person is **Nikola Petrović**, at **zuaros.dev@gmail.com**.
