# Zuaros profile and business-card media

This additive exporter reads the canonical `src/brand/mark.json`, existing Inter
WOFF2 subsets in `node_modules`, and the existing Inter OFL license. It writes only
`media/play-console/`, `media/business-cards/`, and the new validation report.
It never invokes the legacy media exporter or updates any website asset.

## Reproduction

Use Python 3.12+, Node with the repository's installed `sharp`, and Poppler's
`pdftoppm` on PATH. In a disposable Python environment:

```text
python -m pip install -r tools/profile-media/requirements.txt
python tools/profile-media/generate.py
python tools/profile-media/validate.py
```

The generator reports a system temporary directory containing internal icon/header
comparisons and a rendered A4 proof. These are not shipped as abandoned variants.
Review those images, the profile preview, every card on the preview sheet, and
the validator's small-size review. Generation does not delete old media.

The Codex Windows runtime used a task-specific dependency directory under the
system TEMP directory, loaded into `sys.path` explicitly; no application
dependencies or package locks were modified. The requested outputs were created
with the bundled Node/Python and Poppler tools.

## Design and print contract

- Exact master Z, spark, wordmark and orbital geometry are reused.
- Icon selection: Z + spark. Header selection: emblem + wordmark.
- The cards use three master orbits with 0.20 mm strokes and Inter 400/600.
- Production SVGs and PDFs outline text for print safety; the `source/` SVGs
  retain text and embedded fonts. Derived subset fonts have unique family names.
- PDFs remain RGB vector masters with explicit 91 x 61 mm MediaBox/BleedBox and
  85 x 55 mm TrimBox. No claim of CMYK or PDF/X conformity is made.
- Card PNGs come from independently rendered PDFs at 600 dpi. SVG geometry is in
  physical millimetres. Duplex PDFs simply pair final sides in front/back order.
- The A4 proof is not an imposed production sheet and must be printed at 100%.

## Validation

`validate.py` reopens every production image and PDF, reads actual PNG IHDR and
image metadata, checks all card boxes/orientations, confirms no PDF raster
images, validates editable text against an exact SR/EN allowlist, checks measured
glyph bounds, and decodes each QR from PDF renders at 300 and 150 dpi.

Output: `media/profile-business-validation.json`. Physical printing and press ICC
conversion remain the print shop's responsibility. See `media/README.md` for the
complete user-facing file guide and handoff instructions.
