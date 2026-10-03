# Privacy policy migration

Migration date: October 3, 2026. Production domain: **https://zuaros.com**.

## Inventory and URL mapping

During the initial migration, inspected Google Sites using the signed-in **zuaros.dev@gmail.com** account. Both the unfiltered inventory and **Owned by me** listed MemoSpin, ACAR, and SpinStake. Inspected each site's Pages panel: each contains one home policy page and no additional policy pages. Opened each **View published site** destination and independently retrieved its public content without authentication. A Sites search for **Algol** across the account returned no results. No Algol policy was created or inferred during that initial migration. Algol was subsequently supplied as an authoritative local HTML document; its addition is recorded below.

| App | Old URL | New Zuaros URL | Status | Content verified |
|---|---|---|---|---|
| MemoSpin | https://sites.google.com/view/memospin-privacy-policy/home | https://zuaros.com/privacy/memospin/ | Migrated / Verified | Yes |
| ACAR | https://sites.google.com/view/acar-privacy-policy/home | https://zuaros.com/privacy/acar/ | Migrated / Verified | Yes |
| SpinStake | https://sites.google.com/view/spinstake-privacy-policy/home | https://zuaros.com/privacy/spinstake/ | Migrated / Verified | Yes |
| Algol | Not supplied; local HTML source | https://zuaros.com/privacy/algol/ | Migrated / Verified | Yes |

The Google Sites URLs also work with their existing `?authuser=2` account-selection parameter; the table records public URLs without that browser-specific parameter. All three source sites use the site name/browser title **Zuaros Legal**.

| App | Source page heading | Original date | Contact | Sections / list items |
|---|---|---|---|---|
| MemoSpin | MemoSpin Privacy Policy | Last updated: October 2, 2026 | zuaros.dev@gmail.com | Account and data deletion + 14 numbered sections / 0 |
| ACAR | ACAR Privacy Policy | Effective date: August 26, 2026 | zuaros.dev@gmail.com | 12 numbered sections / 4 |
| SpinStake | SpinStake Privacy Policy | Last updated: September 4, 2026 | zuaros.dev@gmail.com | 10 numbered sections / 5 |
| Algol | Algol Privacy Policy | Last updated: 3 October 2026 | zuaros.dev@gmail.com | 9 sections / 3 |

## Content preservation

Full original body text is captured in [`privacy-sources/memospin.txt`](privacy-sources/memospin.txt), [`privacy-sources/acar.txt`](privacy-sources/acar.txt), and [`privacy-sources/spinstake.txt`](privacy-sources/spinstake.txt). Adjacent `.links.json` files record external links and visible URL references. Each application has a separate structured document in `src/privacy/policies/`.

The public browser DOM was compared independently with the downloaded source extraction. Whitespace-normalized, paragraph-separated text produced these matching FNV-1a fingerprints (UTF-16 code units; LF line endings): MemoSpin `ef52df9f` (11,963 characters / 50 blocks), ACAR `644ab659` (3,681 / 48), SpinStake `9b5f74ba` (6,744 / 41). These include the original date and ACAR's repeated body title. This is an extraction check, not a cryptographic signature.

Formatting-only adjustments:

- The app name is prominent under the Privacy Policy label, with the original date nearby.
- Numbered section labels and MemoSpin's account-deletion heading become semantic `h2` headings. Lists remain lists. Paragraph text, punctuation, capitalization, disclosures, dates, and contact details are preserved.
- Repeated blank lines and incidental non-breaking/trailing spaces from Google Sites are normalized.
- ACAR repeated **ACAR Privacy Policy** both in the page heading and the first body paragraph. The new page displays this identity once in its heading; the repeated body heading is omitted. No legal statement is removed.
- Existing visible URLs and the contact email become accessible links. SpinStake's named Google Privacy Policy link retains its original destination. No typo or destination correction was necessary.

External references retained:

| App | External URL |
|---|---|
| MemoSpin | https://unity.com/legal/privacy-policy |
| MemoSpin | https://docs.unity.com/en-us/grow/levelplay/platform/legal-resources/google-data-safety-questionnaire |
| MemoSpin | https://policies.google.com/privacy |
| MemoSpin | https://www.cloudflare.com/privacypolicy/ |
| ACAR | None in the source (Willhaben is named in prose without a link) |
| SpinStake | https://policies.google.com/privacy |

App-specific provisions retained include MemoSpin's package identity, Unity/Google/Cloudflare services, advertising choices, five-play verified rewards, purchases, account deletion and 13+ provision; ACAR's vehicle searches, Willhaben requests, local storage, background notifications and no-account/no-advertising wording; and SpinStake's local multiplayer, fictional mechanics, optional QR camera use, Android backups, retention and explicit lack of transport encryption. This migration does not change or assess those stated practices.

## Architecture and custom domain

- `/privacy/` is a directory only. Each policy is emitted as its own `dist/privacy/<slug>/index.html`, with its own full document, title, description and canonical URL.
- Legal HTML is rendered at build time using the existing React header, logo, footer, fonts and CSS tokens. JavaScript hydrates navigation; the legal text is readable without it. No legal-route marketing animation is added.
- Header/footer navigation uses `/` and `/#section` links on legal pages. The homepage receives only a restrained Privacy/Privatnost footer link and optional shared-component props; its hero, sections, copy and animations remain unchanged.
- GitHub Pages settings were inspected before editing: GitHub Actions source, custom domain `zuaros.com`, and Enforce HTTPS checked. These settings were not changed.
- `public/CNAME` was absent in the original repository. It is now added with exactly `zuaros.com` and copied into the build. The configured custom domain is preserved.
- Production base is `/`. A build guard rejects alternate origins and repository subpaths. Canonical, OpenGraph, robots and sitemap URLs use `https://zuaros.com`.
- The existing workflow still builds and deploys `dist` on pushes to `main`. No new repository or Pages site was created. DNS, nameservers, domain ownership and Search Console were not changed.
- Playwright serves `dist` through `scripts/serve-static.mjs`, which returns real 404s for missing documents and never falls back to the homepage. Direct policy requests and reloads therefore exercise actual static files.

## Verification and rollout

`tests/privacy.spec.ts` compares each rendered date, paragraph, heading and bullet against the independent source snapshots and checks every external link, contact address, app identity, canonical and page title. It checks all four legal routes at 375×812, 430×932, 768×1024, 1366×768 and 1920×1080, including horizontal overflow, images, fonts and resource failures. It also checks keyboard/mobile navigation, WCAG A/AA with axe, no-JavaScript reading, and direct requests/refreshes.

The full project regression suite includes the unchanged homepage, branding and animation checks. Build output is scanned for old-domain/subpath dependencies; `docs/VALIDATION.md` retains its historical project-subpath test reference from the earlier deployment.

Local validation on October 3, 2026: `npm install`, `npm run lint`, `npm run typecheck`, and `npm run build` completed; **68/68 Playwright tests passed** against the strict static production server. Visual inspection of the mobile MemoSpin page and desktop directory confirmed the shared graphite/gold design and readable layout. The production files contain no old GitHub Pages domain or repository base path. CNAME and all five sitemap URLs were checked. Installation reported one existing high-severity development dependency advisory in `brace-expansion`; this migration did not change dependency versions.

The old Google Sites documents are left published and unmodified. Google Play Console, store listings and app metadata are unchanged. Use the exact new URLs in the mapping table for that later update only after live deployment verification.

## Algol addition — October 3, 2026

- **Source:** the user-supplied `E:/Radionice/UnityProgrami/Algol/Docs/Release/algol-privacy-policy.html`. Only that explicitly supplied file was read from the Algol project; the application was not inspected, modified or deployed. No previous public policy URL was supplied or invented. The empty `sourceUrl` in the content/manifest records that absence.
- **Source SHA-256:** `b47a3ea14755981c7932c6c284e495a75de7c01c741a1b2047f3a5000283f9e8`.
- **Content:** `src/privacy/policies/algol.json`; source text snapshot: [`privacy-sources/algol.txt`](privacy-sources/algol.txt); URL references: [`privacy-sources/algol.links.json`](privacy-sources/algol.links.json).
- **New URL:** https://zuaros.com/privacy/algol/. **Status: Migrated / Verified.**
- **Metadata:** `Algol Privacy Policy | Zuaros`; description `Privacy Policy for Algol, developed by Zuaros.`; canonical `https://zuaros.com/privacy/algol/`.
- **Integration:** one entry in the existing privacy manifest generates the separate static page, existing index entry and sitemap URL. No shared component, style, build script, deployment workflow, CNAME, Vite base or dependency changes were needed.
- **Content comparison passed:** the rendered production HTML was compared directly with the supplied HTML, independently of the text snapshot. All 35 ordered content blocks (23 paragraphs, nine section headings and three bullets), all eight body links including both email links, and the original date match. The source's main heading is represented by the shared Privacy Policy / Algol heading. The date moves beside that heading; the app/publisher/package paragraph is retained. Inline emphasis and the contact line break adopt the existing plain paragraph styling. The original outer header/footer's repeated app/package/date information is represented by the page heading, date and retained identity paragraph, within the shared Zuaros header/footer. No legal wording or link destination was changed.
- **Provider references preserved:** Google Privacy Policy, Play Games data disclosure, Unity Privacy Policy, ironSource SDK data disclosure and Cloudflare Privacy Policy. The contact email and `https://zuaros.com/` link are retained.
- **Local validation:** lint, typecheck and production build passed; **75/75 tests passed** on the strict static server, including Algol direct navigation/refresh, content, links, metadata, accessibility, no-JavaScript reading and all five requested viewport sizes. Mobile and desktop screenshots were visually inspected. The generated homepage HTML is byte-for-byte identical to the existing live homepage. Existing policy content and routes, app-ads.txt, domain configuration, and all unrelated website files remain unchanged.
