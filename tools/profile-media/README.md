# Zuaros primary bilingual card and developer icon

This focused exporter updates only the primary bilingual business card, developer
icon and related previews/sources. It reads `src/brand/mark.json`, the existing
static Inter subset fonts, and the approved header PNG. It never writes the
header, promotional text, website assets, monolingual cards or other media.

## Reproduction

Use Python 3.12+, Node with the repository's installed `sharp`, and Poppler's
`pdftoppm` on PATH. In a disposable Python environment:

```text
python -m pip install -r tools/profile-media/requirements.txt
python tools/profile-media/generate.py
python tools/profile-media/validate.py
```

The Codex Windows runtime uses the existing task-specific library directory
under system TEMP, added to `sys.path` explicitly. No application dependencies
or package locks are modified.

Review the primary bilingual preview, actual-size A4 proof, validator's 96 dpi
review and icon sizes sheet. The generator prints its temporary review directory.

## Design contract

- Bilingual is PRIMARY / RECOMMENDED: Serbian Cyrillic front, English back.
- Two service fields only. Name, logo/wordmark and contacts retain their hierarchy.
- QR is part of the primary design: exact #EDB466 gold on #101211 graphite,
  19 mm including four-module dark quiet zone, 25 modules, Q error correction.
- Three oversized master ellipses produce clipped partial background arcs with
  0.25 mm strokes; master orbit gold is flattened at 15%, 12%, 10% onto graphite.
- The logo geometry remains unchanged; icon uses three master orbits and two
  particles, with a larger compact Z+spark group for small-size readability.
- Production SVG/PDF text is outlined; editable SVGs retain live text and fonts.
- 91 x 61 mm MediaBox/BleedBox, 85 x 55 mm TrimBox, 3 mm bleed, RGB vector masters.
- Approved header PNG/JPG/SVG hashes are checked. Header generation is removed
  from this exporter, as is monolingual generation.
- Superseded separate bilingual `-with-qr` files were removed in the refinement.
  Existing monolingual files and original overview remain historical references.

## Validation

`validate.py` reopens all current production images and PDFs, checks PNG IHDR,
PDF geometry and upright orientation, confirms no PDF raster artwork, checks an
exact SR/EN text allowlist and glyph safe margins, and verifies no background arc
crosses text or the QR region. It decodes both final PDFs at 600/300/150/120 dpi
and the full exported PNGs, and inspects rendered quiet-zone pixels.

It also verifies the icon's master Z/spark/ellipse geometry, checks approved
header hashes and scope against the pre-refinement commit, and writes
`media/profile-business-validation.json`. Physical printing and final ICC
conversion remain with the print shop; the A4 proof must be printed at 100%.
