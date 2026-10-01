"""Export the primary bilingual card and icon; approved header is read-only."""
from pathlib import Path
import base64, hashlib, html, io, json, subprocess, tempfile
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
from PIL import Image, ImageDraw, ImageFont, ImageCms
from svglib.svglib import svg2rlg
from reportlab.graphics import renderPDF
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from pypdf import PdfReader, PdfWriter
from pypdf.generic import RectangleObject
import qrcode

ROOT = Path(__file__).resolve().parents[2]
MEDIA = ROOT / 'media'
PLAY = MEDIA / 'play-console'
CARDS = MEDIA / 'business-cards'
MARK = json.loads((ROOT / 'src/brand/mark.json').read_text())
BG, GOLD, SPARK, WHITE, ORBIT = '#101211', '#EDB466', '#F6C580', '#F1F0E9', '#B59A70'
ICC = ImageCms.ImageCmsProfile(ImageCms.createProfile('sRGB')).tobytes()
TMP = Path(tempfile.mkdtemp(prefix='zuaros-profile-'))
FONTS = {}
TEXT_BOUNDS = []

def save(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(value, encoding='utf-8')

def svg(body, w, h, physical=False):
    unit = 'mm' if physical else ''
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}{unit}" height="{h}{unit}" viewBox="0 0 {w} {h}">{body}</svg>'

def rect(x,y,w,h,color):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{color}"/>'

def line(x1,y1,x2,y2,color=ORBIT,width=.2):
    return f'<path d="M{x1} {y1}L{x2} {y2}" fill="none" stroke="{color}" stroke-width="{width}"/>'

def core():
    return f'<path d="{MARK["body"]}" fill="{GOLD}"/><path d="{MARK["spark"]}" fill="{SPARK}"/>'

def wordmark(x,y,width,color=WHITE):
    paths = ''.join(f'<path d="{p}"/>' for p in MARK['wordmark']['paths'])
    return f'<g transform="translate({x} {y}) scale({width/178})" fill="none" stroke="{color}" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round">{paths}</g>'

def emblem(x,y,size,print_mode=False):
    parts = []
    # Three established orbits at print size, with an actual 0.20 mm stroke.
    for idx, o in enumerate(MARK['orbital']['orbits'][:3 if print_mode else 4]):
        width = .2*600/size if print_mode else [1.15,1.35,1.35,1.35][idx]
        color = '#847456' if print_mode else ORBIT
        opacity = 1 if print_mode else [.44,.58,.42,.5][idx]
        parts.append(f'<ellipse cx="300" cy="300" rx="{o["rx"]}" ry="{o["ry"]}" transform="rotate({o["rotation"]} 300 300)" fill="none" stroke="{color}" stroke-width="{width}" opacity="{opacity}"/>')
    particles = [(472.009,368.103,3.5),(162.137,470.388,2.7),(359.599,199.648,2.2)]
    for px,py,r in particles:
        radius = max(r,.28*600/size) if print_mode else r
        parts.append(f'<circle cx="{px}" cy="{py}" r="{radius}" fill="{SPARK}"/>')
    s = MARK['orbital']['symbol']
    parts.append(f'<g transform="rotate({s["rotation"]} 300 300) translate({s["x"]} {s["y"]}) scale({s["scale"]})">{core()}</g>')
    return f'<g transform="translate({x} {y}) scale({size/600})">{"".join(parts)}</g>'

def init_fonts():
    for weight in [400,600]:
        for subset in ['latin','latin-ext','cyrillic']:
            name = f'Inter-{subset}-{weight}'
            target = CARDS / 'source/fonts' / f'{name}.ttf'
            FONTS[(weight,subset)] = (TTFont(target),name,target)

def font_for(char, weight):
    for subset in ['latin','latin-ext','cyrillic']:
        f,name,path = FONTS[(weight,subset)]
        if ord(char) in f.getBestCmap():
            return f,name,path
    raise ValueError(f'Missing glyph: {char!r}')

def text(value,x,y,pt=8,weight=400,color=WHITE,editable=False,card_id=None):
    out=[]; cursor=x; size=pt*25.4/72; bounds=[]; runs=[]
    for ch in value:
        f,name,_ = font_for(ch,weight)
        glyphs=f.getGlyphSet(); gn=f.getBestCmap()[ord(ch)]; scale=size/f['head'].unitsPerEm
        glyph=glyphs[gn]
        if editable:
            if runs and runs[-1][0]==name:
                runs[-1][2]+=ch
            else:
                runs.append([name,cursor,ch])
        else:
            pen=SVGPathPen(glyphs); glyph.draw(pen)
            out.append(f'<path d="{pen.getCommands()}" transform="translate({cursor:.6f} {y}) scale({scale} {-scale})" fill="{color}"/>')
        pen=BoundsPen(glyphs); glyph.draw(pen)
        if pen.bounds:
            a,b,c,d=pen.bounds
            bounds.append((cursor+a*scale,y-d*scale,cursor+c*scale,y-b*scale))
        cursor+=glyph.width*scale
    if editable:
        spans=''.join(f'<tspan x="{rx:.6f}" font-family="{name}">{html.escape(value)}</tspan>' for name,rx,value in runs)
        return f'<text y="{y}" font-size="{size}" fill="{color}" font-kerning="none" xml:space="preserve">{spans}</text>'
    if bounds and card_id and not editable:
        box=[min(b[0] for b in bounds),min(b[1] for b in bounds),max(b[2] for b in bounds),max(b[3] for b in bounds)]
        assert box[0]>=7.5 and box[1]>=7.5 and box[2]<=83.5 and box[3]<=53.5,(value,box)
        TEXT_BOUNDS.append({'card':card_id,'text':value,'point_size':pt,'bounds_mm':box})
    return ''.join(out)

def font_style():
    rules=[]
    for f,name,path in FONTS.values():
        data=base64.b64encode(path.read_bytes()).decode()
        rules.append(f'@font-face{{font-family:"{name}";src:url(data:font/ttf;base64,{data}) format("truetype");}}')
    return '<style>'+''.join(rules)+'</style>'

def qr_art(x,y,size):
    qr=qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_Q,border=4,box_size=10)
    qr.add_data('https://zuaros.com'); qr.make(fit=True)
    matrix=qr.get_matrix(); module=size/len(matrix)
    body=rect(x,y,size,size,BG)
    for row,cells in enumerate(matrix):
        for col,on in enumerate(cells):
            if on: body+=rect(x+col*module,y+row*module,module,module,GOLD)
    return f'<g id="qr" data-url="https://zuaros.com" data-ecc="Q" data-modules="{len(matrix)-8}" data-quiet-zone="4">{body}</g>'

def blended(foreground,alpha):
    # Flatten low-opacity brand linework onto the exact graphite, for print.
    rgb=lambda value:tuple(int(value[i:i+2],16) for i in (1,3,5))
    return '#'+''.join(f'{round(a*(1-alpha)+b*alpha):02X}' for a,b in zip(rgb(BG),rgb(foreground)))

def background_orbits(lang):
    # Oversized master ellipses; only partial curves enter the physical card.
    # Centres/radii keep all visible curves outside content and QR quiet zones.
    placements=[(111,-18,.314),(134,-21,.33),(70,116.5,.35)]
    parts=[]
    for idx,((cx,cy,scale),orbit) in enumerate(zip(placements,MARK['orbital']['orbits'])):
        if lang=='en': cx+=2 if idx<2 else -4
        parts.append(f'<ellipse data-master-orbit="{orbit["id"]}" cx="{cx}" cy="{cy}" rx="{orbit["rx"]*scale}" ry="{orbit["ry"]*scale}" transform="rotate({orbit["rotation"]} {cx} {cy})" fill="none" stroke="{blended(ORBIT,[.15,.12,.10][idx])}" stroke-width=".25"/>')
    return '<g id="background-orbits">'+''.join(parts)+'</g>'

def card_art(lang,editable=False,card_id=''):
    body=rect(0,0,91,61,BG)+background_orbits(lang)
    def tx(v,x,y,pt=8,weight=400,color=WHITE):
        return text(v,x,y,pt,weight,color,editable,card_id)
    body+=emblem(6.7,5.5,17.5,True)+wordmark(26,9.5,25)
    body+=tx('Никола Петровић' if lang=='sr' else 'Nikola Petrović',9,27,14,600)
    body+=tx('Развој софтвера' if lang=='sr' else 'Software Development',9,32.2,8)
    body+=tx('Инжењерска решења' if lang=='sr' else 'Engineering Solutions',9,36.3,8)
    body+=line(9,39.4,59,39.4,'#847456',.2)
    body+=tx('zuaros.com',9,44.3,10.5,600,GOLD)
    body+=tx('zuaros.dev@gmail.com',9,48.5,8)
    body+=tx('Instagram · Facebook   @zuaros',9,52.8,7.5,400,'#C3C5BE')
    body+=qr_art(64,37,19)
    clip='<defs><clipPath id="card-crop"><rect width="91" height="61"/></clipPath></defs>'
    return svg((font_style() if editable else '')+clip+'<g clip-path="url(#card-crop)">'+body+'</g>',91,61,True)

def pdf_from_svg(value,path):
    path.parent.mkdir(parents=True,exist_ok=True)
    drawing=svg2rlg(io.BytesIO(value.encode()))
    buf=io.BytesIO(); renderPDF.drawToFile(drawing,buf)
    reader=PdfReader(buf); writer=PdfWriter(); page=reader.pages[0]
    page.mediabox=RectangleObject([0,0,91*mm,61*mm])
    page.bleedbox=RectangleObject([0,0,91*mm,61*mm])
    page.trimbox=RectangleObject([3*mm,3*mm,88*mm,58*mm])
    page.cropbox=page.mediabox
    writer.add_page(page)
    writer.add_metadata({'/Title':path.stem,'/Author':'Zuaros','/Subject':'85 x 55 mm trim; 3 mm bleed; RGB vector master; outlined Inter text'})
    with path.open('wb') as output: writer.write(output)

def render_pdf(pdf,output,dpi=600):
    subprocess.run(['pdftoppm','-singlefile','-r',str(dpi),'-png',str(pdf),str(output.with_suffix(''))],check=True,capture_output=True)

def raster_svg(value,w,h,output,mode='RGB'):
    inp=TMP/'render.svg'; inp.write_text(value,encoding='utf-8')
    script="const sharp=require('sharp'); sharp(process.argv[1]).resize(+process.argv[3],+process.argv[4]).png().toFile(process.argv[2]);"
    subprocess.run(['node','-e',script,str(inp),str(output),str(w),str(h)],cwd=ROOT,check=True,capture_output=True)
    im=Image.open(output).convert(mode)
    im.save(output,icc_profile=ICC)
    return im

def play_assets():
    # Reuse all master ellipse parameters; enlarge only the inner Z+spark group
    # around its own centre to make the compact profile icon readable.
    b=rect(0,0,600,600,BG)
    for o in MARK['orbital']['orbits'][:3]:
        b+=f'<ellipse data-master-orbit="{o["id"]}" cx="300" cy="300" rx="{o["rx"]}" ry="{o["ry"]}" transform="rotate({o["rotation"]} 300 300)" fill="none" stroke="{ORBIT}" stroke-width="2.3" opacity=".72"/>'
    for x,y in [(472.009,368.103),(162.137,470.388)]:
        b+=f'<circle cx="{x}" cy="{y}" r="3.2" fill="{SPARK}"/>'
    b+=f'<g transform="rotate(-7 300 300) translate(145.9 166.6) scale(4.6)">{core()}</g>'
    value=svg(b,600,600)
    save(PLAY/'source/zuaros-developer-icon.svg',value)
    icon=raster_svg(value,512,512,PLAY/'developer-icon/zuaros-developer-icon-512.png','RGBA')
    sheet=Image.new('RGB',(1050,600),'#E7E8E4');draw=ImageDraw.Draw(sheet)
    font=ImageFont.truetype(str(FONTS[(400,'latin')][2]),18)
    x=25
    for size in [512,128,64,48,32]:
        draw.text((x,25),str(size)+' px',font=font,fill=BG)
        sheet.paste(icon.resize((size,size),Image.Resampling.LANCZOS),(x,65))
        x+=size+40
    sheet.save(PLAY/'preview/zuaros-developer-icon-sizes.png',icc_profile=ICC)
    # Approved header is only read, never regenerated or re-saved.
    header=Image.open(PLAY/'header-image/zuaros-developer-header-4096x2304.png')
    preview=Image.new('RGB',(1600,1160),'#F4F5F2');preview.paste(header.resize((1536,864)),(32,32))
    preview.paste(icon.resize((136,136)),(80,936));d=ImageDraw.Draw(preview)
    regular=ImageFont.truetype(str(FONTS[(400,'latin')][2]),22);bold=ImageFont.truetype(str(FONTS[(600,'latin')][2]),34)
    d.text((250,946),'Zuaros',font=bold,fill=BG)
    d.text((250,1000),'Custom software, engineering applications,',font=regular,fill='#50564F')
    d.text((250,1032),'digital products, and independent games.',font=regular,fill='#50564F')
    d.text((80,1110),'STATIC COMPOSITION PREVIEW / Platform layout and cropping may vary',font=regular,fill='#666C63')
    preview.save(PLAY/'preview/play-console-profile-preview.png',icc_profile=ICC)


def card_assets():
    entries=[('bilingual-front-sr','sr'),('bilingual-back-en','en')]
    flats={}
    for identifier,lang in entries:
        name='zuaros-business-card-'+identifier
        art=card_art(lang,card_id=identifier)
        save(CARDS/'bilingual'/(name+'.svg'),art)
        save(CARDS/'source'/(name+'-editable.svg'),card_art(lang,editable=True))
        pdf=CARDS/'print'/('zuaros-card-'+identifier+'.pdf');pdf_from_svg(art,pdf)
        png=CARDS/'bilingual'/(name+'.png');render_pdf(pdf,png)
        im=Image.open(png).convert('RGB');im.save(png,dpi=(600,600),icc_profile=ICC)
        box=(round(im.width*3/91),round(im.height*3/61),round(im.width*88/91),round(im.height*58/61))
        flat=im.crop(box);flats[identifier]=flat
        flat.save(CARDS/'previews'/(name+'-trim.png'),dpi=(600,600),icc_profile=ICC)
    writer=PdfWriter()
    for identifier,_ in entries:writer.append(CARDS/'print'/f'zuaros-card-{identifier}.pdf')
    writer.add_metadata({'/Title':'Zuaros primary bilingual card - Serbian front, English back','/Subject':'Two landscape pages, head-to-head; printer to impose'})
    writer.write(CARDS/'print/zuaros-card-bilingual-duplex.pdf')
    font=ImageFont.truetype(str(FONTS[(400,'latin')][2]),26)
    title=ImageFont.truetype(str(FONTS[(600,'latin')][2]),42)
    sheet=Image.new('RGB',(1920,870),'#E6E7E3');d=ImageDraw.Draw(sheet)
    d.text((80,55),'ZUAROS / PRIMARY BILINGUAL CARD',font=title,fill=BG)
    d.text((80,120),'85 x 55 mm / 3 mm bleed / gold QR on graphite',font=font,fill='#62685F')
    for col,(identifier,_) in enumerate(entries):
        x=80+col*920
        d.text((x,210),'SERBIAN / FRONT' if col==0 else 'ENGLISH / BACK',font=font,fill=BG)
        sheet.paste(flats[identifier].resize((840,544),Image.Resampling.LANCZOS),(x,260))
    sheet.save(CARDS/'previews/zuaros-business-card-bilingual-preview.png',icc_profile=ICC)
    # A4 proof at exact physical size; vector cards, trim guides and 50 mm ruler.
    proof=CARDS/'previews/zuaros-business-cards-actual-size.pdf'
    c=canvas.Canvas(str(proof),pagesize=(210*mm,297*mm))
    c.setTitle('Zuaros primary bilingual card - actual-size proof')
    c.setFont('Helvetica',12);c.drawString(15*mm,282*mm,'ZUAROS / PRIMARY BILINGUAL CARD / ACTUAL SIZE')
    c.setFont('Helvetica',8);c.drawString(15*mm,275*mm,'Print at 100% / Actual size. Trim guides are 85 x 55 mm. Do not fit to page.')
    for idx,(identifier,_) in enumerate(entries):
        x=(12+idx*96)*mm;y=198*mm
        drawing=svg2rlg(str(CARDS/'bilingual'/f'zuaros-business-card-{identifier}.svg'))
        c.saveState()
        crop=c.beginPath();crop.rect(x,y,91*mm,61*mm);c.clipPath(crop,stroke=0,fill=0)
        renderPDF.draw(drawing,c,x,y)
        c.restoreState()
        c.setStrokeColorRGB(.45,.45,.45);c.setLineWidth(.3)
        for xx in [x+3*mm,x+88*mm]:
            for yy in [y+3*mm,y+58*mm]:
                c.line(xx-2*mm,yy,xx+2*mm,yy);c.line(xx,yy-2*mm,xx,yy+2*mm)
        c.setFillColorRGB(0,0,0);c.setFont('Helvetica',7);c.drawString(x,y-4*mm,identifier)
    c.line(15*mm,170*mm,65*mm,170*mm);c.line(15*mm,168*mm,15*mm,172*mm);c.line(65*mm,168*mm,65*mm,172*mm)
    c.drawString(15*mm,164*mm,'50 mm calibration ruler');c.showPage();c.save()
    render_pdf(proof,TMP/'actual-size-proof.png',150)
    save(CARDS/'source/text-bounds.json',json.dumps(TEXT_BOUNDS,ensure_ascii=False,indent=2)+'\n')


if __name__=='__main__':
    protected=list((PLAY/'header-image').glob('*'))+[PLAY/'source/zuaros-developer-header.svg']
    hashes={p:hashlib.sha256(p.read_bytes()).hexdigest() for p in protected}
    init_fonts();play_assets();card_assets()
    assert hashes=={p:hashlib.sha256(p.read_bytes()).hexdigest() for p in protected}
    print(json.dumps({'temporary_review_directory':str(TMP),'text_bounds_checked':len(TEXT_BOUNDS),'header_unchanged':True},ensure_ascii=False))
