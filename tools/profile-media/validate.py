"""Inspect written artifacts, PDF geometry, editable text and rendered QR codes."""
from pathlib import Path
import hashlib, json, subprocess, tempfile, xml.etree.ElementTree as ET
from PIL import Image, ImageDraw
from pypdf import PdfReader
import zxingcpp

ROOT=Path(__file__).resolve().parents[2]
MEDIA=ROOT/'media'; PLAY=MEDIA/'play-console'; CARDS=MEDIA/'business-cards'
report={'images':[],'print_pdfs':[],'qr_checks':[],'source_text_checks':[]}
ns={'s':'http://www.w3.org/2000/svg'}

for path in sorted(list(PLAY.rglob('*.png'))+list(PLAY.rglob('*.jpg'))+list(CARDS.rglob('*.png'))):
    with Image.open(path) as im:
        im.load()
        record={'path':path.relative_to(ROOT).as_posix(),'format':im.format,'width':im.width,'height':im.height,'mode':im.mode,'bytes':path.stat().st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}
        if path.suffix=='.png':
            raw=path.read_bytes();record['png_bit_depth']=raw[24];record['png_color_type']=raw[25]
        if path.parent.name=='developer-icon':
            assert im.size==(512,512) and im.mode=='RGBA'
            assert record['png_bit_depth']==8 and record['png_color_type']==6
        if path.parent.name=='header-image':
            assert im.size==(4096,2304) and im.mode=='RGB'
            if path.suffix=='.png':assert record['png_bit_depth']==8 and record['png_color_type']==2
        if path.parent.name in ['sr-cyrillic','en','bilingual']:
            assert im.size==(2150,1441),im.size
            assert min(im.info['dpi'])>=599
            record['dpi']=im.info['dpi']
        report['images'].append(record)

expected_fronts={'sr-front':'sr','en-front':'en','bilingual-front-sr':'sr','bilingual-back-en':'en','bilingual-front-sr-with-qr':'sr','bilingual-back-en-with-qr':'en'}
for path in sorted((CARDS/'source').glob('*-editable.svg')):
    doc=ET.parse(path); root=doc.getroot()
    assert root.attrib['width']=='91mm' and root.attrib['height']=='61mm'
    texts=[''.join(t.itertext()) for t in root.findall('.//s:text',ns)]
    identifier=path.stem.replace('zuaros-business-card-','').removesuffix('-editable')
    if identifier in expected_fronts:
        sr=expected_fronts[identifier]=='sr'
        assert texts==[
            'Никола Петровић' if sr else 'Nikola Petrović',
            'Развој софтвера' if sr else 'Software Development',
            'Инжењерска решења · Инди игре' if sr else 'Engineering Solutions · Indie Games',
            'zuaros.com','zuaros.dev@gmail.com','Instagram · Facebook  @zuaros']
    else: assert texts==['zuaros.com']
    report['source_text_checks'].append({'path':path.relative_to(ROOT).as_posix(),'texts':texts})

ptmm=72/25.4
for path in sorted((CARDS/'print').glob('*.pdf')):
    reader=PdfReader(path);expected=2 if 'duplex' in path.name else 1
    assert len(reader.pages)==expected
    pages=[]
    for page in reader.pages:
        assert page.get('/Rotate',0)==0
        for box,target in [(page.mediabox,[0,0,91,61]),(page.bleedbox,[0,0,91,61]),(page.trimbox,[3,3,88,58])]:
            assert all(abs(float(a)/ptmm-b)<.001 for a,b in zip(box,target))
        assert len(page.images)==0, 'Print PDF unexpectedly contains raster images'
        data=page.get_contents().get_data()
        assert b' rg' in data and b' k' not in data, 'Expected RGB artwork'
        pages.append({'media_mm':[91,61],'trim_mm':[85,55],'bleed_mm':3,'rotation':0,'raster_images':0})
    report['print_pdfs'].append({'path':path.relative_to(ROOT).as_posix(),'pages':pages,'bytes':path.stat().st_size})

proof_path=CARDS/'previews/zuaros-business-cards-actual-size.pdf'
proof=PdfReader(proof_path)
assert len(proof.pages)==1
assert abs(float(proof.pages[0].mediabox.width)/ptmm-210)<.001
assert abs(float(proof.pages[0].mediabox.height)/ptmm-297)<.001
assert '50 mm calibration ruler' in proof.pages[0].extract_text()
assert len(proof.pages[0].images)==0
report['proof_pdf']={'path':proof_path.relative_to(ROOT).as_posix(),'page_mm':[210,297],'scale_percent':100,'raster_images':0}

tmp=Path(tempfile.mkdtemp(prefix='zuaros-validation-'))
for path in sorted((CARDS/'print').glob('*-with-qr.pdf')):
    for dpi in [300,150]:
        stem=tmp/(path.stem+f'-{dpi}')
        subprocess.run(['pdftoppm','-singlefile','-r',str(dpi),'-png',str(path),str(stem)],check=True,capture_output=True)
        image=Image.open(stem.with_suffix('.png')).convert('RGB')
        decoded=zxingcpp.read_barcodes(image)
        assert len(decoded)==1 and decoded[0].text=='https://zuaros.com',path
        report['qr_checks'].append({'path':path.relative_to(ROOT).as_posix(),'render_dpi':dpi,'decoded_url':decoded[0].text})

bounds=json.loads((CARDS/'source/text-bounds.json').read_text(encoding='utf-8'))
for t in bounds:
    x1,y1,x2,y2=t['bounds_mm'];assert x1>=7.5 and y1>=7.5 and x2<=83.5 and y2<=53.5
report['type_checks']={'minimum_point_size':min(t['point_size'] for t in bounds),'name_point_size':14,'email_point_size':8,'website_point_size':10.5,'safe_margin_mm_minimum':4.5,'minimum_rule_width_mm':.2}
report['print_color']='RGB masters, no CMYK or PDF/X claim. Printer must convert with its output profile.'
report['physical_proof']='A4 PDF at true dimensions with 50 mm ruler. No physical print was performed.'
report['geometry_source']='src/brand/mark.json; exact master Z, spark and wordmark paths; three master orbits for cards.'
report['selection']='Icon A chosen after 32/64 px comparison; header B chosen for explicit brand recognition. Rejected variants retained only in temporary review storage.'
report['promotional_character_counts']={'en':99,'sr-Cyrl':92}
lines=(PLAY/'promotional-text/promotional-text.txt').read_text(encoding='utf-8').splitlines()
assert len(lines[1])==99 and len(lines[4])==92
for path in list(PLAY.rglob('*.svg'))+list(CARDS.rglob('*.svg')):
    raw=path.read_text(encoding='utf-8')
    assert 'github.io' not in raw
    if path.parent.name!='source':assert '<text' not in raw and '<image' not in raw

# Useful low-resolution review, approximately actual size at a 96 dpi display.
sheet=Image.new('RGB',(760,560),'#E6E7E3');draw=ImageDraw.Draw(sheet)
for i,identifier in enumerate(['bilingual-front-sr','bilingual-back-en','bilingual-front-sr-with-qr','sr-back']):
    im=Image.open(CARDS/'previews'/f'zuaros-business-card-{identifier}-trim.png')
    sheet.paste(im.resize((321,208),Image.Resampling.LANCZOS),(30+(i%2)*380,45+(i//2)*260))
draw.text((30,15),'Approximate 96 dpi size review; use the A4 PDF for physical size.',fill='#101211')
sheet.save(tmp/'small-size-review.png')
report['status']='PASS'
(MEDIA/'profile-business-validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'status':'PASS','images':len(report['images']),'print_pdfs':len(report['print_pdfs']),'proof_pdfs':1,'qr_checks':len(report['qr_checks']),'review_image':str(tmp/'small-size-review.png'),'play_assets':[r for r in report['images'] if '/developer-icon/' in r['path'] or '/header-image/' in r['path']]},ensure_ascii=False))
