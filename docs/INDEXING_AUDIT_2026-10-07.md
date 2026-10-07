# Indexing and Engineering audit — 7 October 2026

## Search Console evidence

The authenticated `zuaros.com` Domain property lists exactly these three URLs under **Page with redirect** (report last updated 4 October; inspected 7 October). They are expected host/protocol normalization, not broken content routes.

| Source URL | Status | Destination | Hops | Classification / action |
| --- | --- | --- | --- | --- |
| `http://www.zuaros.com/` | 301 → 200 | `https://zuaros.com/` | 1 | Expected HTTPS + canonical host redirect; preserved |
| `https://www.zuaros.com/` | 301 → 200 | `https://zuaros.com/` | 1 | Expected canonical host redirect; preserved |
| `http://zuaros.com/` | 301 → 200 | `https://zuaros.com/` | 1 | Expected HTTPS redirect; preserved |

The first two were last crawled on 2 October; the third on 1 October. None appears in our sitemap, rendered internal links, or canonical metadata. The destination returns 200, has a self-referencing canonical, and has no indexing prohibition.

No redirect configuration changes are needed. Google treats permanent redirects as signals for the destination canonical ([Google documentation](https://developers.google.com/search/docs/crawling-indexing/301-redirects)). Historical source URLs may remain in Search Console after recrawling; this category does not mean those source URLs should become indexable. No “Validate fix” request was made for intentional redirects.

## Production URL checks

All seven sitemap entries return HTTP 200 directly, with an exact self-referencing `https://zuaros.com` canonical and no `noindex` directive:

- `/`
- `/memospin/`
- `/privacy/`
- `/privacy/memospin/`
- `/privacy/acar/`
- `/privacy/spinstake/`
- `/privacy/algol/`

The six non-root routes without trailing slashes each return a single 301 to their slash-terminated canonical. `https://petrovicc.github.io/zuaros-website/` returns a single 301 to `https://zuaros.com/`. These expected redirects are preserved; none is used in the website's indexing signals.

Audit totals:

- Sitemap redirecting URLs: **0 / 7**.
- Internal redirecting links: **0 / 6 unique page destinations**, collected across all seven rendered pages (fragment links deduplicated).
- Canonical problems: **0 / 7**.
- Redirect chains longer than one hop: **0 / 10 tested redirect sources** (three Search Console URLs, old GitHub Pages URL, six slashless routes).
- Production links to the old GitHub origin or repository base path: **0**.

OpenGraph URLs, where present, match page canonicals. No hreflang, JSON-LD, or web manifest is emitted. `robots.txt` allows `/` and references `https://zuaros.com/sitemap.xml`. The sitemap contains neither utility files nor preview/query URLs. Its HTTP response is 200 with `Content-Type: application/xml`.

Search Console initially listed no submitted sitemaps. The existing canonical sitemap was submitted during this audit. Google confirmed submission; the first report then showed “Couldn't fetch” / “Sitemap could not be read”. Public HTTP checks, including a Googlebot user-agent check, return 200 with valid XML. Google's live URL test subsequently confirmed **URL is available to Google**, **Crawl allowed: Yes**, and **Page fetch: Successful** at 11:00 Europe/Belgrade. Submission acceptance and the successful live fetch do not by themselves confirm sitemap processing; the report must update independently. Google's [sitemap troubleshooting guidance](https://support.google.com/webmasters/answer/7451001?hl=en) distinguishes submission, fetching, and processing.

## Engineering visual

Replaced the green grid, numbered 01–04 pipeline, process labels, animated packet line, and disclaimer with a decorative SVG: warm gold signal curve, connected nodes, fine orbital curves, and a restrained central glow on graphite. Removed the obsolete English and Serbian strings and their CSS. No measurements, counters, alarms, or fabricated data are present.

Monitoring, Modeling, and Integration descriptions are unchanged. Mobile descriptions now use 14px text and a stacked title/description layout. The drawing is approximately 139–174px tall at the requested mobile widths, and 255px on desktop. It is static in both normal and reduced-motion modes; the existing section reveal already respects reduced motion. The decorative SVG is hidden from assistive technology.

## Validation and scope

- Lint, typecheck, and production build pass.
- All 76 Playwright tests pass, including accessibility, privacy direct routes, refresh, and exact legal-source fidelity.
- Added an indexing regression check for sitemap status, final canonical URLs, robots directives, OpenGraph URLs, and rendered internal links.
- Inspected 360×800, 375×812, 390×844, 430×932, 1366×768, and 1920×1080, with English and Serbian layout checks; no horizontal overflow.
- Custom domain, CNAME, Vite base, Pages workflow, privacy legal text, `app-ads.txt`, unrelated sections, and media are unchanged by this task.
- Started from remote `main` commit `55f035c`, preserving its existing Algol privacy and seller-list updates. Those updates are not part of this task's changes.

The final commit, GitHub Pages deployment outcome, and post-deployment checks are reported in the accompanying delivery message.
