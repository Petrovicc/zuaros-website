"""Generate additive Zuaros profile/card media; never writes website assets."""
from pathlib import Path
import base64, html, io, json, shutil, subprocess, tempfile
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
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
            target.parent.mkdir(parents=True, exist_ok=True)
            f = TTFont(ROOT / f'node_modules/@fontsource-variable/inter/files/inter-{subset}-wght-normal.woff2')
            f = instantiateVariableFont(f, {'wght':weight}, inplace=True)
            f.flavor = None
            for record in f['name'].names:
                if record.nameID in [1,4,6,16]:
                    record.string = name.encode(record.getEncoding())
                elif record.nameID in [2,17]:
                    record.string = 'Regular'.encode(record.getEncoding())
            f.save(target)
            FONTS[(weight,subset)] = (f,name,target)
    shutil.copyfile(ROOT/'public/brand/licenses/Inter-OFL.txt',CARDS/'source/fonts/Inter-OFL.txt')

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
    qr=qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M,border=4,box_size=10)
    qr.add_data('https://zuaros.com'); qr.make(fit=True)
    matrix=qr.get_matrix(); module=size/len(matrix)
    body=rect(x,y,size,size,'#FFFFFF')
    for row,cells in enumerate(matrix):
        for col,on in enumerate(cells):
            if on: body+=rect(x+col*module,y+row*module,module,module,'#000000')
    return body

def card_art(lang,back=False,qr=False,editable=False,card_id=''):
    body=rect(0,0,91,61,BG)
    # Quiet technical detail; intentionally solid strokes >= 0.20 mm.
    body+=line(86,10,86,25,'#34382F',.2)+line(84.8,10,87.2,10,'#847456',.2)
    def tx(v,x,y,pt=8,weight=400,color=WHITE):
        return text(v,x,y,pt,weight,color,editable,card_id)
    if back:
        body+=emblem(29.5,5,32,True)
        body+=wordmark(31,38,29)
        body+=tx('zuaros.com',35.6,51,10,600,GOLD)
    else:
        body+=emblem(6.7,5.5,17.5,True)+wordmark(26,9.5,25)
        body+=tx('Никола Петровић' if lang=='sr' else 'Nikola Petrović',9,27,14,600)
        body+=tx('Развој софтвера' if lang=='sr' else 'Software Development',9,32,8)
        body+=tx('Инжењерска решења · Инди игре' if lang=='sr' else 'Engineering Solutions · Indie Games',9,36,8)
        body+=line(9,39,60 if qr else 82,39,'#847456',.2)
        body+=tx('zuaros.com',9,44.3,10.5,600,GOLD)
        body+=tx('zuaros.dev@gmail.com',9,48.5,8)
        body+=tx('Instagram · Facebook  @zuaros',9,52.8,7.5,400,'#C3C5BE')
        if qr: body+=qr_art(65,38,17)
    return svg((font_style() if editable else '')+body,91,61,True)

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
    for p in ['developer-icon','header-image','promotional-text','preview','source']:(PLAY/p).mkdir(parents=True,exist_ok=True)
    icons=[]
    for variant in range(3):
        b=rect(0,0,512,512,BG)
        for idx in range(variant):
            b+=f'<ellipse cx="256" cy="256" rx="204" ry="{204 if idx==0 else 120}" transform="rotate(-38 256 256)" fill="none" stroke="{ORBIT}" stroke-width="1.5" opacity=".5"/>'
        b+=f'<g transform="translate(74 98) scale(5.45)">{core()}</g>'
        value=svg(b,512,512)
        im=raster_svg(value,512,512,TMP/f'icon-{variant}.png','RGBA'); icons.append(im)
        if variant==0:
            save(PLAY/'source/zuaros-developer-icon.svg',value)
            im.save(PLAY/'developer-icon/zuaros-developer-icon-512.png',icc_profile=ICC)
    sheet=Image.new('RGB',(720,420),'#E7E8E4'); draw=ImageDraw.Draw(sheet)
    for v,im in enumerate(icons):
        x=40+v*235; draw.text((x,20),['A: Z + spark','B: one orbit','C: two orbits'][v],fill=BG)
        sheet.paste(im.resize((160,160),Image.Resampling.LANCZOS),(x,55))
        for size,y in [(64,240),(32,330)]:sheet.paste(im.resize((size,size),Image.Resampling.LANCZOS),(x,y))
    sheet.save(TMP/'icon-comparison.png')
    headers=[]
    for with_wordmark in [False,True]:
        defs=f'<defs><radialGradient id="glow"><stop offset="0" stop-color="#806035" stop-opacity=".18"/><stop offset="1" stop-color="{BG}" stop-opacity="0"/></radialGradient></defs>'
        b=defs+rect(0,0,4096,2304,BG)+rect(780,50,2536,2204,'url(#glow)')
        b+=emblem(1228,240 if with_wordmark else 332,1640)
        if with_wordmark:b+=wordmark(1648,1740,800)
        for x in [890,3206]:
            b+=line(x,1104,x,1200,'#34382F',2)+line(x-12,1152,x+12,1152,ORBIT,2)
        value=svg(b,4096,2304)
        im=raster_svg(value,4096,2304,TMP/f'header-{with_wordmark}.png'); headers.append(im)
        if with_wordmark:
            save(PLAY/'source/zuaros-developer-header.svg',value)
            im.save(PLAY/'header-image/zuaros-developer-header-4096x2304.png',icc_profile=ICC)
            im.save(PLAY/'header-image/zuaros-developer-header-4096x2304.jpg',quality=96,subsampling=0,icc_profile=ICC)
    hs=Image.new('RGB',(1600,500),'#E7E8E4')
    for idx,im in enumerate(headers):hs.paste(im.resize((780,439)),(10+idx*800,40))
    hd=ImageDraw.Draw(hs);hd.text((10,12),'A: emblem only',fill=BG);hd.text((810,12),'B: emblem + master wordmark',fill=BG)
    hs.save(TMP/'header-comparison.png')
    en='Zuaros develops custom software, engineering applications, digital products, and independent games.'
    sr='Zuaros развија софтвер по мери, инжењерске апликације, дигиталне производе и независне игре.'
    assert len(en)<=140 and len(sr)<=140
    save(PLAY/'promotional-text/promotional-text.txt',f'English ({len(en)} characters, including spaces and punctuation)\n{en}\n\nСрпски — ћирилица ({len(sr)} знакова, укључујући размаке и интерпункцију)\n{sr}\n')
    preview=Image.new('RGB',(1600,1160),'#F4F5F2');preview.paste(headers[1].resize((1536,864)),(32,32))
    preview.paste(icons[0].resize((136,136)),(80,936));d=ImageDraw.Draw(preview)
    regular=ImageFont.truetype(str(FONTS[(400,'latin')][2]),22);bold=ImageFont.truetype(str(FONTS[(600,'latin')][2]),34)
    d.text((250,946),'Zuaros',font=bold,fill=BG)
    d.text((250,1000),'Custom software, engineering applications,',font=regular,fill='#50564F')
    d.text((250,1032),'digital products, and independent games.',font=regular,fill='#50564F')
    d.text((80,1110),'STATIC COMPOSITION PREVIEW / Platform layout and cropping may vary',font=regular,fill='#666C63')
    preview.save(PLAY/'preview/play-console-profile-preview.png',icc_profile=ICC)

def card_assets():
    entries=[('sr-cyrillic','sr-front','sr',False,False),('sr-cyrillic','sr-back','sr',True,False),
             ('en','en-front','en',False,False),('en','en-back','en',True,False),
             ('bilingual','bilingual-front-sr','sr',False,False),('bilingual','bilingual-back-en','en',False,False),
             ('bilingual','bilingual-front-sr-with-qr','sr',False,True),('bilingual','bilingual-back-en-with-qr','en',False,True)]
    flats={}
    for folder,identifier,lang,back,qr in entries:
        name='zuaros-business-card-'+identifier
        art=card_art(lang,back,qr,card_id=identifier)
        save(CARDS/folder/(name+'.svg'),art)
        save(CARDS/'source'/(name+'-editable.svg'),card_art(lang,back,qr,True))
        pdf=CARDS/'print'/('zuaros-card-'+identifier+'.pdf');pdf_from_svg(art,pdf)
        png=CARDS/folder/(name+'.png');render_pdf(pdf,png)
        im=Image.open(png).convert('RGB');im.save(png,dpi=(600,600),icc_profile=ICC)
        # Final trim preview at 600 dpi: crop according to PDF physical geometry.
        box=(round(im.width*3/91),round(im.height*3/61),round(im.width*88/91),round(im.height*58/61))
        flat=im.crop(box);flats[identifier]=flat
        (CARDS/'previews').mkdir(exist_ok=True)
        flat.save(CARDS/'previews'/(name+'-trim.png'),dpi=(600,600),icc_profile=ICC)
    pairs=[('sr','sr-front','sr-back'),('en','en-front','en-back'),('bilingual','bilingual-front-sr','bilingual-back-en'),('bilingual-with-qr','bilingual-front-sr-with-qr','bilingual-back-en-with-qr')]
    for name,a,b in pairs:
        writer=PdfWriter()
        for entry in [a,b]:writer.append(CARDS/'print'/f'zuaros-card-{entry}.pdf')
        writer.add_metadata({'/Title':f'Zuaros {name} - front, back','/Subject':'Two landscape pages, head-to-head; printer to impose'})
        writer.write(CARDS/'print'/f'zuaros-card-{name}-duplex.pdf')
    font=ImageFont.truetype(str(FONTS[(400,'latin')][2]),26)
    title=ImageFont.truetype(str(FONTS[(600,'latin')][2]),42)
    sheet=Image.new('RGB',(1920,2810),'#E6E7E3');d=ImageDraw.Draw(sheet)
    d.text((80,55),'ZUAROS / BUSINESS CARDS',font=title,fill=BG)
    d.text((80,115),'85 x 55 mm / graphite + solar gold / front and back',font=font,fill='#62685F')
    for row,(name,a,b) in enumerate(pairs):
        y=205+row*650;d.text((80,y),{'sr':'SERBIAN CYRILLIC','en':'ENGLISH','bilingual':'BILINGUAL / SR + EN','bilingual-with-qr':'BILINGUAL / OPTIONAL QR'}[name],font=font,fill=BG)
        for col,ident in enumerate([a,b]):sheet.paste(flats[ident].resize((840,544),Image.Resampling.LANCZOS),(80+col*920,y+50))
    sheet.save(CARDS/'previews/zuaros-business-cards-preview.png',icc_profile=ICC)
    # A4 proof at exact physical size; vector cards, trim guides and 50 mm ruler.
    proof=CARDS/'previews/zuaros-business-cards-actual-size.pdf'
    c=canvas.Canvas(str(proof),pagesize=(210*mm,297*mm))
    c.setTitle('Zuaros actual-size proof - print at 100%, do not fit')
    c.setFont('Helvetica',12);c.drawString(15*mm,282*mm,'ZUAROS / ACTUAL-SIZE PROOF')
    c.setFont('Helvetica',8);c.drawString(15*mm,275*mm,'Print at 100% / Actual size. Trim guides are 85 x 55 mm. Do not fit to page.')
    for idx,ident in enumerate(['bilingual-front-sr','bilingual-back-en','sr-back','en-front','bilingual-front-sr-with-qr','bilingual-back-en-with-qr']):
        row,col=divmod(idx,2); x=(12+col*96)*mm;y=(198-row*78)*mm
        folder='en' if ident=='en-front' else 'sr-cyrillic' if ident=='sr-back' else 'bilingual'
        drawing=svg2rlg(str(CARDS/folder/f'zuaros-business-card-{ident}.svg'))
        renderPDF.draw(drawing,c,x,y)
        c.setStrokeColorRGB(.45,.45,.45);c.setLineWidth(.3)
        for xx in [x+3*mm,x+88*mm]:
            for yy in [y+3*mm,y+58*mm]:
                c.line(xx-2*mm,yy,xx+2*mm,yy);c.line(xx,yy-2*mm,xx,yy+2*mm)
        c.setFillColorRGB(0,0,0);c.setFont('Helvetica',7);c.drawString(x,y-4*mm,ident)
    c.line(15*mm,20*mm,65*mm,20*mm);c.line(15*mm,18*mm,15*mm,22*mm);c.line(65*mm,18*mm,65*mm,22*mm)
    c.drawString(15*mm,14*mm,'50 mm calibration ruler');c.showPage();c.save()
    render_pdf(proof,TMP/'actual-size-proof.png',150)
    save(CARDS/'source/text-bounds.json',json.dumps(TEXT_BOUNDS,ensure_ascii=False,indent=2)+'\n')

if __name__=='__main__':
    init_fonts();play_assets();card_assets()
    print(json.dumps({'temporary_review_directory':str(TMP),'text_bounds_checked':len(TEXT_BOUNDS)},ensure_ascii=False))
