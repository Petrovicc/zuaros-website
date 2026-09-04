# Launch validation

Validated on 4 September 2026 with Node.js 24 and the production Vite build.

## Automated checks

- Strict TypeScript check and ESLint pass.
- Production build succeeds; initial JavaScript is approximately 225 kB, **71 kB gzip**. Styles are approximately 28 kB, **7 kB gzip**.
- `npm audit` reports **0 vulnerabilities**.
- **17 Playwright tests pass**, including an axe-core WCAG A/AA audit in both languages at desktop and mobile widths.
- All five requested sizes are covered in both English and Serbian: 375×812, 430×932, 768×1024, 1366×768, 1920×1080.
- No horizontal overflow, failed image requests, broken section anchors, or browser runtime errors in the tested layouts.
- Language persistence, Serbian browser locale, blocked storage, mobile menu selection/Escape/outside click/resizing, email links, clipboard success/denial, keyboard skip link, reduced motion, and 200% text enlargement are covered.

## Visual review

Reviewed desktop, tablet, and narrow mobile screenshots, including service cards, engineering diagram, Serbian contact copy, wordmark, favicon, and social image. Refined fine-print readability, card rhythm, Serbian line wrapping, and intrinsic grid sizing during review.

The engineering diagram is a labeled conceptual signal-to-insight flow, not random metrics or live infrastructure telemetry. The portfolio remains intentionally empty of unapproved project claims.

## Lighthouse

Lighthouse **13.4.1**, local production preview, simulated mobile throttling, headless Chromium:

| Category | Score |
| --- | --- |
| Performance | 95 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |

Observed FCP 2.3 s, LCP 2.4 s, total blocking time 0 ms, cumulative layout shift 0. Results are lab measurements, not real-user field metrics or a guarantee on every device. No physical iPhone/Android hardware test was performed.

## Static hosting

The full test suite is also run against the `/zuaros-website/` build. Deployment metadata derives from the actual Pages URL; root hosting and custom domains can use the same configuration. There is no fake form backend, no required runtime API, and no analytics or third-party font request.
