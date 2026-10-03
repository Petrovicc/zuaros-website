# Zuaros

The official bilingual website and reusable vector identity for Zuaros: custom software, energy and engineering solutions, education and research tools, and independent games. The brand package includes the compact Z/spark mark, full orbital emblem, document lockups, transparent raster exports, a short studio intro, and a .NET MAUI reference implementation.

[Website](https://zuaros.com/) · [Repository](https://github.com/Petrovicc/zuaros-website) · [Deployments](https://github.com/Petrovicc/zuaros-website/actions/workflows/deploy.yml)

## Stack

React 19, strict TypeScript, Vite 8, plain layered CSS, and self-hosted Space Grotesk / Inter variable fonts. No backend, external runtime APIs, analytics, database, or animation library. A ref-based requestAnimationFrame controller moves four SVG particles (three on mobile), with historical-position tails, offscreen/hidden-page pausing, and reduced-motion support.

## Local development

Use Node.js 24 (minimum 22.12).

```sh
npm install
npm run dev
```

```sh
npm run lint
npm run typecheck
npm run build
npm run preview
```

Production files are written to `dist/`, which is intentionally not committed.

## Tests

```sh
npx playwright install chromium
npm run build
npm test
```

The strict production-artifact server is started automatically. The 68 tests cover English/Serbian website layouts; navigation, storage, clipboard, accessibility, and reduced motion; every particle direction and historical trail; lifecycle and bounded SVG work; the complete SVG/PNG asset inventory; transparent raster dimensions; intro timing; and the separate privacy pages' content, static routing, metadata and responsive layouts. See `docs/VALIDATION.md` and `docs/PRIVACY_POLICY_MIGRATION.md` for details.

## Deployment: GitHub Pages

The `main` branch deploys through `.github/workflows/deploy.yml`. The workflow installs dependencies, lints, typechecks, builds, runs browser checks, uploads `dist`, and deploys with the official Pages actions. Actions are SHA-pinned; Dependabot maintains updates. The deploy job alone receives `pages: write` and `id-token: write`.

In GitHub **Settings → Pages → Build and deployment → Source**, select **GitHub Actions**. The workflow also supports manual dispatch.

The official production URL is **https://zuaros.com/**. The URL returned by `actions/configure-pages` is passed as `SITE_URL`; the build rejects any domain or path other than this custom-domain root. Vite uses `/` for assets. `public/CNAME` is copied to `dist/CNAME` and contains `zuaros.com`. Local production builds use the same canonical URLs as deployment.

To test the production artifact on a strict static server (PowerShell):

```powershell
$env:SITE_URL = 'https://zuaros.com/'
npm run build
npm test
```

The homepage uses section fragments. Legal pages are independent, prerendered `index.html` documents at `/privacy/` and `/privacy/<app>/`, so direct requests and refreshes work on GitHub Pages without a SPA fallback. `scripts/build-privacy.mjs` renders the shared React header/footer and each policy into static HTML, with its own metadata and sitemap entry. Each policy's hydration data contains only that policy. The directory contains links, not policy bodies. Legal text and metadata remain in their original English; the shared navigation can switch language. Homepage language behavior remains unchanged.

Policy sources, URL mapping, and migration verification: [Privacy policy migration](docs/PRIVACY_POLICY_MIGRATION.md). Edit each legal document independently in `src/privacy/policies/`; source snapshots in `docs/privacy-sources/` are the migration baseline, not text to overwrite casually. `npm run build` is required to generate legal routes; use the production build for route testing.

References: [Vite static deployment](https://vite.dev/guide/static-deploy), [GitHub custom Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Structure

```text
src/
  animation/        Shared orbit geometry, historical trails, RAF lifecycle
  brand/zuaros-master.svg  Editable vector master for the whole identity
  brand/mark.json          Generated geometry manifest consumed by React
  components/       Semantic sections, diagrams, shared UI, ProjectCard
  data/projects.ts  Typed, intentionally empty portfolio collection
  i18n/             English and Serbian dictionaries, preference hook
  fonts.css         Self-hosted normal-weight Latin subsets
  styles.css        Layout, design tokens, responsive rules, motion
  polish.css        Shared readability and intrinsic-size constraints
public/brand/       SVG logos, symbols, favicons, avatar, social artwork
scripts/           Reproducible brand generation
tests/             Browser regression suite
docs/              Brand guide and validation notes
extras/maui/        Reusable GraphicsView/IDrawable studio intro and splash
.github/           Pages workflow and dependency updates
```

## Localization

`src/i18n/en.ts` defines the copy schema. `sr.ts` implements the same type in Serbian Latin. Components receive the chosen dictionary, avoiding duplicated React trees. The language buttons persist `zuaros-language` in `localStorage`. A saved preference wins; otherwise an `sr` browser locale selects Serbian and all others default to English. Blocked browser storage is handled without breaking the site.

## Adding projects and games

Add approved records to `src/data/projects.ts`. Each record has localized title, category, description, kind, technologies, status, optional artwork, platforms, and HTTPS website/GitHub/Steam/Google Play links. Local image paths are relative to `public/` (for example `projects/example.webp`); the card applies Vite's deployment base. Supply accurate alternative text in both languages.

`kind: 'game'` appears in the games section. Other kinds appear in the projects section. Empty collections display honest, deliberately designed upcoming-work messages. Do not publish private research or personal repositories as Zuaros work without approval.

## Identity and contact

Reusable assets: `public/brand/core/`, `public/brand/orbital/`, and `public/brand/raster/`. Practical usage rules, variants, minimum sizes, studio timing, and MAUI integration: [Brand guide](docs/BRAND_GUIDE.md).

```sh
npm run brand
```

The generator reads `src/brand/zuaros-master.svg`, refreshes `src/brand/mark.json`, and keeps `extras/maui/ZuarosIntro/ZuarosGeometry.Generated.cs` plus its native splash synchronized. Standalone contact sheets, final frames, logos, splash graphics, and videos are available under `media/`; the production website intentionally has no Brand Preview mode.

Contact is a genuine `mailto:` link and optional clipboard copy, not a fake submission form. Official contact: **Nikola Petrović — zuaros.dev@gmail.com**.

No secrets are required by the application. Do not commit credentials or `.env` files. Zuaros artwork and website content are proprietary; third-party font licenses remain with their assets.
