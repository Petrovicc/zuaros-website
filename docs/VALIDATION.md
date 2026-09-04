# Refinement validation

Validated on 4 September 2026 with Node.js 24 and the production Vite build.

## Automated checks

- ESLint, strict TypeScript, and production build pass.
- **31 Playwright tests pass** against both root hosting and the `/zuaros-website/` production build.
- The five requested sizes are covered in both English and Serbian: 375×812, 430×932, 768×1024, 1366×768, and 1920×1080.
- Axe-core WCAG A/AA checks pass in both languages at desktop and mobile widths.
- No horizontal overflow, failed image requests, broken section anchors, or browser runtime errors in the tested layouts.
- Language persistence, Serbian browser locale, blocked storage, mobile menu selection/Escape/outside click/resizing, email links, clipboard success/denial, keyboard skip link, reduced motion, and 200% text enlargement pass.
- `npm audit` reports **0 vulnerabilities**.
- Project-subpath bundle: approximately **227 kB JavaScript / 71.2 kB gzip** and **28 kB CSS / 6.7 kB gzip**. No animation dependency was added.

## Logo and visual review

Three related Z/spark variations were compared privately at 16, 24, navbar, 128, and hero sizes. The clipped-terminal version retains a clear Z silhouette and separated spark at favicon scale. Final paths are shared by React and every generated SVG/raster derivative; the original wordmark paths and alignment remain unchanged.

Reviewed the hero in both languages at all five requested viewports, plus services, About, engineering, software, research, games, the empty project state, approach, contact, footer, and the revised social image. Reviewed the narrow Serbian contact layout separately. No clipping, awkward hero line breaks, or CTA overflow was observed in these checks. The existing page structure, typography, and graphite/amber direction remain intact.

English and Serbian copy were reviewed together for factual scope, natural phrasing, and consistent CTA intent. Contact remains Nikola Petrović / zuaros.dev@gmail.com. Project and game placeholders do not imply published work. The engineering graphic is still explicitly conceptual, not live telemetry.

## Particle direction and history

`tests/orbits.spec.ts` independently reverses the ellipse transform to recover each rendered point's path phase. All four particles are tested in **both directions**, including loop boundaries and multiple complete cycles, with desktop and mobile sampling.

For every point, signed phase lag must equal `age / period`. Every trail point must lie on the same path, have a positive historical age, and be smaller and dimmer than the point before it. The head must occupy the expected current position. This catches a tail in front of its head and does not rely on visual appearance alone.

Browser tests verify actual movement direction and all visible tail positions at desktop and mobile widths. The primary/tertiary particles run clockwise, secondary/distant counterclockwise. Periods are 14/19/25/31 seconds. Mobile has three active particles and five shorter trail samples each; desktop has four and eight respectively.

## Animation lifecycle and performance

- One requestAnimationFrame loop, cached SVG nodes, batched transform writes, no layout reads or frame-driven React state.
- Offscreen pause/resume and dynamic reduced-motion changes pass in the browser. Stationary reduced-motion heads have no visible tails.
- Ten repeated controller mount/dispose cycles check one outstanding frame at most, document-hidden pause/resume, media changes, observer disconnection, listener removal, and late-callback safety.
- Chromium performance counters show stable DOM-node and listener counts. SVG transform updates are bounded to at most one normal layout bookkeeping pass per animation frame, rather than repeated read/write layout thrashing.
- One local 700 ms sample recorded 43 frames, about 1.4 ms total SVG layout time and 4.4 ms script time. This is a desktop lab sample, not a device-independent performance guarantee.
- While the hero is offscreen, its RAF count stops and the measured layout count remains unchanged.
- No continuously animated large blur or individual compositor-layer promotion is used for the particles.

These are local browser and lifecycle checks, not long-running physical-device battery/GPU measurements. No physical iPhone/Android hardware test was performed.

## Static hosting

The complete suite passes against `/zuaros-website/`. Deployment metadata, asset URLs, canonical URL, and sitemap derive from the actual Pages URL. The existing workflow and routing/localization architecture are unchanged. There is no form backend, required runtime API, analytics, or third-party font request.

## Earlier launch baseline

Before this refinement, WebKit 26.5 smoke checks passed at the same five widths and Lighthouse 13.4.1 recorded performance 95, accessibility 100, best practices 100, and SEO 100 (simulated mobile, local production build). Those WebKit/Lighthouse measurements were **not rerun for this refinement** and should not be represented as measurements of the new animation.
