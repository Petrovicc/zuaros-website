# Zuaros media export tooling

This folder is separate from the website. It turns the existing canonical brand
geometry in `src/brand/mark.json` into directly reusable files under `media/`.

Requirements:

- Node.js and the repository dependencies (`npm ci`)
- FFmpeg and FFprobe available on `PATH`

Run from the repository root:

```powershell
node tools/media-export/export.mjs
node tools/media-export/validate.mjs
```

The export command replaces only the root-level `media/` directory. It does not
write to the React application, `public/`, routing, CSS, or deployment files.
