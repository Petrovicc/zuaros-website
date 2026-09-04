# Zuaros

The official bilingual website and original vector identity for Zuaros: custom software, energy and engineering solutions, education and research tools, and independent games.

[Website](https://petrovicc.github.io/zuaros-website/) · [Repository](https://github.com/Petrovicc/zuaros-website) · [Deployments](https://github.com/Petrovicc/zuaros-website/actions/workflows/deploy.yml)

## Stack

React 19, strict TypeScript, Vite 8, plain layered CSS, and self-hosted Space Grotesk / Inter variable fonts. No backend, external runtime APIs, analytics, database, or animation library. Small SVG and CSS effects honor reduced-motion preferences.

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

The production preview is started automatically. Tests cover English/Serbian at 375×812, 430×932, 768×1024, 1366×768, and 1920×1080; internal anchors; asset loading; console errors; language persistence and blocked storage; mobile navigation; clipboard success/failure; keyboard access; reduced motion; and 200% text enlargement. See `docs/VALIDATION.md` for the launch checks.

## Deployment: GitHub Pages

The `main` branch deploys through `.github/workflows/deploy.yml`. The workflow installs dependencies, lints, typechecks, builds, runs browser checks, uploads `dist`, and deploys with the official Pages actions. Actions are SHA-pinned; Dependabot maintains updates. The deploy job alone receives `pages: write` and `id-token: write`.

In GitHub **Settings → Pages → Build and deployment → Source**, select **GitHub Actions**. The workflow also supports manual dispatch.

The exact URL returned by `actions/configure-pages` is passed as `SITE_URL`. Vite derives the base path, canonical URL, OpenGraph image URLs, and sitemap from that URL. A project repository, `USERNAME.github.io` repository, and configured custom domain are therefore handled without hardcoding a username or repository path. Local builds use `/` and deliberately omit a fictional production canonical URL.

To test a project subpath locally (PowerShell):

```powershell
$env:SITE_URL = 'https://petrovicc.github.io/zuaros-website/'
npm run build
$env:TEST_BASE_PATH = '/zuaros-website/'
npm test
```

The site uses section fragments instead of history-based routes, so refreshes and direct section links work on static hosting. Language is a local preference on the same URL; there are no misleading separate-language canonical URLs. Social crawlers see the static English metadata. The visible page title and description follow the visitor's selected language.

References: [Vite static deployment](https://vite.dev/guide/static-deploy), [GitHub custom Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Structure

```text
src/
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
.github/           Pages workflow and dependency updates
```

## Localization

`src/i18n/en.ts` defines the copy schema. `sr.ts` implements the same type in Serbian Latin. Components receive the chosen dictionary, avoiding duplicated React trees. The language buttons persist `zuaros-language` in `localStorage`. A saved preference wins; otherwise an `sr` browser locale selects Serbian and all others default to English. Blocked browser storage is handled without breaking the site.

## Adding projects and games

Add approved records to `src/data/projects.ts`. Each record has localized title, category, description, kind, technologies, status, optional artwork, platforms, and HTTPS website/GitHub/Steam/Google Play links. Local image paths are relative to `public/` (for example `projects/example.webp`); the card applies Vite's deployment base. Supply accurate alternative text in both languages.

`kind: 'game'` appears in the games section. Other kinds appear in the projects section. Empty collections display honest, deliberately designed upcoming-work messages. Do not publish private research or personal repositories as Zuaros work without approval.

## Identity and contact

Reusable assets: `public/brand/`. Practical usage rules, colors, typography, and motion: [Brand guide](docs/BRAND_GUIDE.md).

```sh
npm run brand
```

Contact is a genuine `mailto:` link and optional clipboard copy, not a fake submission form. Official contact: **Nikola Petrović — zuaros.dev@gmail.com**.

No secrets are required by the application. Do not commit credentials or `.env` files. Zuaros artwork and website content are proprietary; third-party font licenses remain with their assets.
