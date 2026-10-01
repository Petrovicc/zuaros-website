"""Validate the primary bilingual package, icon and protected approved assets."""
from pathlib import Path
import hashlib, json, math, subprocess, tempfile, xml.etree.ElementTree as ET
from PIL import Image, ImageDraw
from pypdf import PdfReader
import zxingcpp

ROOT=Path(__file__).resolve().parents[2]
MEDIA=ROOT/'media'; PLAY=MEDIA/'play-console'; CARDS=MEDIA/'business-cards'
BASELINE='cc821385ba24f1792d682d2a3e2409913c1d7ce5'
report={'images':[],'print_pdfs':[],'qr_checks':[],'source_text_checks':[]}
ns={'s':'http://www.w3.org/2000/svg'}
identifiers=['bilingual-front-sr','bilingual-back-en']
BG=(16,18,17); GOLD=(237,180,102)

images=list((PLAY/'developer-icon').glob('*.png'))+list((PLAY/'header-image').glob('*'))+list((PLAY/'preview').glob('*.png'))+list((CARDS/'bilingual').glob('*.png'))
images+=[CARDS/'previews'/f'zuaros-business-card-{i}-trim.png' for i in identifiers]
images+=[CARDS/'previews/zuaros-business-card-bilingual-preview.png']
for path in sorted(images):
    with Image.open(path) as im:
        im.load()
        r={'path':path.relative_to(ROOT).as_posix(),'format':im.format,'width':im.width,'height':im.height,'mode':im.mode,'bytes':path.stat().st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}
        if path.suffix=='.png':
            raw=path.read_bytes();r['png_bit_depth']=raw[24];r['png_color_type']=raw[25]
        if path.parent.name=='developer-icon':
            assert im.size==(512,512) and im.mode=='RGBA'
            assert r['png_bit_depth']==8 and r['png_color_type']==6
        if path.parent.name=='header-image':
            assert im.size==(4096,2304) and im.mode=='RGB'
            if path.suffix=='.png':assert r['png_bit_depth']==8 and r['png_color_type']==2
        if path.parent.name=='bilingual':
            assert im.size==(2150,1441) and min(im.info['dpi'])>=599
            r['dpi']=im.info['dpi']
        report['images'].append(r)

bounds=json.loads((CARDS/'source/text-bounds.json').read_text(encoding='utf-8'))
assert len(bounds)==12
for t in bounds:
    x1,y1,x2,y2=t['bounds_mm'];assert x1>=7.5 and y1>=7.5 and x2<=83.5 and y2<=53.5
for identifier in identifiers:
    source=CARDS/'source'/f'zuaros-business-card-{identifier}-editable.svg'
    root=ET.parse(source).getroot()
    assert root.attrib['width']=='91mm' and root.attrib['height']=='61mm'
    texts=[''.join(t.itertext()) for t in root.findall('.//s:text',ns)]
    sr=identifier.endswith('sr')
    assert texts==[
        'Никола Петровић' if sr else 'Nikola Petrović',
        'Развој софтвера' if sr else 'Software Development',
        'Инжењерска решења' if sr else 'Engineering Solutions',
        'zuaros.com','zuaros.dev@gmail.com','Instagram · Facebook   @zuaros']
    report['source_text_checks'].append({'path':source.relative_to(ROOT).as_posix(),'texts':texts})
    production=CARDS/'bilingual'/f'zuaros-business-card-{identifier}.svg'
    raw=production.read_text(encoding='utf-8');prod=ET.fromstring(raw)
    assert '<text' not in raw and '<image' not in raw
    assert 'github.io' not in raw and 'Indie Games' not in raw and 'Инди игре' not in raw
    qr=prod.find(".//s:g[@id='qr']",ns)
    assert qr.attrib['data-url']=='https://zuaros.com' and qr.attrib['data-ecc']=='Q'
    assert qr.attrib['data-quiet-zone']=='4' and qr.attrib['data-modules']=='25'
    assert {e.attrib['fill'] for e in qr}=={'#101211','#EDB466'}
    arcs=prod.findall(".//s:g[@id='background-orbits']/s:ellipse",ns)
    assert len(arcs)==3
    # Check full stroked curves stay clear of actual glyphs and the QR quiet zone.
    reserves=[(63,36,84,57),(5,5,53,22)]
    for t in bounds:
        if t['card']==identifier:
            a,b,c,d=t['bounds_mm'];reserves.append((a-1,b-1,c+1,d+1))
    for arc in arcs:
        assert float(arc.attrib['stroke-width'])>=.25
        cx,cy,rx,ry=[float(arc.attrib[k]) for k in ['cx','cy','rx','ry']]
        angle=math.radians(float(arc.attrib['transform'].split('(')[1].split()[0]))
        for k in range(2000):
            phase=k*math.tau/2000;u=rx*math.cos(phase);v=ry*math.sin(phase)
            x=cx+u*math.cos(angle)-v*math.sin(angle);y=cy+u*math.sin(angle)+v*math.cos(angle)
            assert not any(a-.125<x<c+.125 and b-.125<y<d+.125 for a,b,c,d in reserves),(identifier,x,y)

ptmm=72/25.4
for path in sorted((CARDS/'print').glob('*bilingual*.pdf')):
    reader=PdfReader(path);expected=2 if 'duplex' in path.name else 1
    assert len(reader.pages)==expected
    pages=[]
    for page in reader.pages:
        assert page.get('/Rotate',0)==0
        for box,target in [(page.mediabox,[0,0,91,61]),(page.bleedbox,[0,0,91,61]),(page.trimbox,[3,3,88,58])]:
            assert all(abs(float(a)/ptmm-b)<.001 for a,b in zip(box,target))
        assert len(page.images)==0
        data=page.get_contents().get_data();assert b' rg' in data and b' k' not in data
        pages.append({'media_mm':[91,61],'trim_mm':[85,55],'bleed_mm':3,'rotation':0,'raster_images':0})
    report['print_pdfs'].append({'path':path.relative_to(ROOT).as_posix(),'pages':pages,'bytes':path.stat().st_size})
assert len(report['print_pdfs'])==3
proof_path=CARDS/'previews/zuaros-business-cards-actual-size.pdf';proof=PdfReader(proof_path)
assert len(proof.pages)==1 and len(proof.pages[0].images)==0
assert abs(float(proof.pages[0].mediabox.width)/ptmm-210)<.001
assert abs(float(proof.pages[0].mediabox.height)/ptmm-297)<.001
assert '50 mm calibration ruler' in proof.pages[0].extract_text()
report['proof_pdf']={'path':proof_path.relative_to(ROOT).as_posix(),'page_mm':[210,297],'scale_percent':100}

tmp=Path(tempfile.mkdtemp(prefix='zuaros-validation-'))
for identifier in identifiers:
    path=CARDS/'print'/f'zuaros-card-{identifier}.pdf'
    for dpi in [600,300,150,120]:
        stem=tmp/(path.stem+f'-{dpi}')
        subprocess.run(['pdftoppm','-singlefile','-r',str(dpi),'-png',str(path),str(stem)],check=True,capture_output=True)
        image=Image.open(stem.with_suffix('.png')).convert('RGB')
        decoded=zxingcpp.read_barcodes(image)
        assert len(decoded)==1 and decoded[0].text=='https://zuaros.com',path
        report['qr_checks'].append({'path':path.relative_to(ROOT).as_posix(),'render_dpi':dpi,'decoded_url':decoded[0].text})
        if dpi==600:
            # Inspect all four rendered quiet-zone strips, with 0.15 mm raster tolerance.
            quiet=19*4/33
            zones=[(64.15,37.15,64+quiet-.15,55.85),(83-quiet+.15,37.15,82.85,55.85),
                   (64.15,37.15,82.85,37+quiet-.15),(64.15,56-quiet+.15,82.85,55.85)]
            for box in zones:
                crop=image.crop(tuple(round(v*dpi/25.4) for v in box))
                assert crop.getextrema()==((16,16),(18,18),(17,17)),'Quiet zone is not pure graphite'
            qrbox=image.crop(tuple(round(v*dpi/25.4) for v in [64,37,83,56]))
            assert all(max(channel)<=limit for channel,limit in zip(qrbox.getextrema(),GOLD)), 'Unexpected white QR background'
    png=CARDS/'bilingual'/f'zuaros-business-card-{identifier}.png'
    assert zxingcpp.read_barcode(Image.open(png)).text=='https://zuaros.com'

icon=ET.parse(PLAY/'source/zuaros-developer-icon.svg').getroot()
orbits=icon.findall('s:ellipse',ns);assert len(orbits)==3
master=json.loads((ROOT/'src/brand/mark.json').read_text())
for ellipse,original in zip(orbits,master['orbital']['orbits'][:3]):
    assert float(ellipse.attrib['rx'])==original['rx'] and float(ellipse.attrib['ry'])==original['ry']
    assert ellipse.attrib['transform']==f'rotate({original["rotation"]} 300 300)'
assert icon.find('.//s:text',ns) is None
paths={p.attrib['d'] for p in icon.findall('.//s:path',ns)}
assert master['body'] in paths and master['spark'] in paths
report['icon']={'orbit_count':3,'particle_count':2,'master_paths_reused':True,'visual_review_sizes_px':[512,128,64,48,32]}

protected={
'header-image/zuaros-developer-header-4096x2304.png':'f9d8dadf030f03a22f6500e49fca773e193f3a852f340905f5109454afd118a7',
'header-image/zuaros-developer-header-4096x2304.jpg':'748d2cdd1b43d8f9e88ffede43b0f077ccd9d735d227e09ddd83c86e12f99f2d',
'source/zuaros-developer-header.svg':'7c5ae13b926ca0e5e24782c1957408d15cc37f3eeedd3ca6b0c2c82c97334d21'}
for rel,expected in protected.items():assert hashlib.sha256((PLAY/rel).read_bytes()).hexdigest()==expected
report['approved_header']={'unchanged':True,'sha256':protected}
changed=subprocess.check_output(['git','diff',BASELINE,'--name-only'],cwd=ROOT,text=True).splitlines()
assert all(p.startswith(('media/','tools/profile-media/')) for p in changed)
assert not any(p.startswith(('media/business-cards/en/','media/business-cards/sr-cyrillic/','media/business-cards/source/fonts/','media/play-console/header-image/')) for p in changed)
report['scope']={'website_unchanged':True,'monolingual_artwork_unchanged':True,'baseline_commit':BASELINE}
report['type_checks']={'minimum_point_size':7.5,'name_point_size':14,'email_point_size':8,'website_point_size':10.5,'safe_margin_mm_minimum':4.5,'background_arc_width_mm':.25}
report['qr']={'modules_color':'#EDB466','background_and_quiet_zone':'#101211','total_size_mm':19,'pattern_modules':25,'quiet_zone_modules':4,'module_mm':19/33,'ecc':'Q','url':'https://zuaros.com'}
report['print_color']='RGB vector masters; printer performs final ICC conversion. No physical print was performed.'
report['background']='Three oversized master ellipses, clipped by card edges; brand orbit color blended at 15%, 12%, 10% onto graphite.'
report['historical_assets']='Existing monolingual cards and original overview sheet are reference only; primary bilingual package has no game category.'

sheet=Image.new('RGB',(760,310),'#E6E7E3');draw=ImageDraw.Draw(sheet)
for i,identifier in enumerate(identifiers):
    im=Image.open(CARDS/'previews'/f'zuaros-business-card-{identifier}-trim.png')
    sheet.paste(im.resize((321,208),Image.Resampling.LANCZOS),(30+i*380,55))
draw.text((30,20),'Approximate 96 dpi size; use the A4 proof for physical size.',fill='#101211')
sheet.save(tmp/'small-size-review.png')
report['status']='PASS'
(MEDIA/'profile-business-validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'status':'PASS','images':len(report['images']),'print_pdfs':3,'proof_pdfs':1,'qr_checks':len(report['qr_checks']),'review_image':str(tmp/'small-size-review.png'),'header_unchanged':True},ensure_ascii=False))
