from pathlib import Path
import random

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "posts" / "exemplo-mes-doar.png"
FONT_BOLD = "/usr/share/fonts/truetype/lato/Lato-Heavy.ttf"
FONT_REGULAR = "/usr/share/fonts/truetype/lato/Lato-Regular.ttf"
ADP_LOGO = ROOT / "logo_para_colocar_nas_imagens_geradas/logo_adp/logo-adp-branco.png"
POLISAT_LOGO = ROOT / "logo_para_colocar_nas_imagens_geradas/logo_polisat/logo_branco_transparente.png"


def font(size, bold=False):
    path = FONT_BOLD if bold else FONT_REGULAR
    return ImageFont.truetype(path, size)


def centered_text(draw, text, y, text_font, fill, stroke_width=0, stroke_fill=None):
    bounds = draw.textbbox((0, 0), text, font=text_font, stroke_width=stroke_width)
    x = (1080 - (bounds[2] - bounds[0])) / 2
    draw.text((x, y), text, font=text_font, fill=fill, stroke_width=stroke_width, stroke_fill=stroke_fill)


def prepare_logo(path, size):
    logo = Image.open(path).convert("RGBA")
    bounds = logo.getchannel("A").getbbox()
    if bounds:
        logo = logo.crop(bounds)
    logo.thumbnail(size, Image.Resampling.LANCZOS)
    return logo


def create_background(seed):
    random.seed(seed)
    w, h = 1080, 1350
    img = Image.new("RGBA", (w, h), (8, 10, 22, 255))
    pix = img.load()
    for y in range(h):
        t = y / h
        c = (int(8 + t * 5), int(10 + t * 4), int(23 + t * 11))
        for x in range(w):
            pix[x, y] = (*c, 255)
    glow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse((120, 80, 1040, 870), fill=(62, 38, 180, 68))
    gd.ellipse((350, 240, 1010, 850), fill=(16, 105, 220, 54))
    gd.ellipse((-100, 520, 670, 1190), fill=(126, 35, 198, 46))
    img = Image.alpha_composite(img, glow.filter(ImageFilter.GaussianBlur(110)))
    d = ImageDraw.Draw(img)
    for _ in range(420):
        x, y = random.randrange(w), random.randrange(h)
        radius = random.choice((1, 1, 1, 2, 2, 3))
        color = random.choice(((216, 231, 255, 190), (177, 139, 255, 190), (91, 194, 255, 185)))
        d.ellipse((x-radius, y-radius, x+radius, y+radius), fill=color)
    for x, y, radius, color in ((150, 175, 4, (92, 190, 255, 255)), (906, 235, 4, (190, 122, 255, 255)), (846, 698, 3, (131, 173, 255, 255)), (215, 827, 3, (207, 151, 255, 255))):
        d.ellipse((x-radius, y-radius, x+radius, y+radius), fill=color)
    return img


def draw_campaign_footer(img):
    d = ImageDraw.Draw(img)
    d.text((84, 866), "LINK PARA DOAÇÃO", font=font(18, True), fill=(190, 194, 218, 255))
    d.rounded_rectangle((84, 899, 996, 1044), radius=14, fill=(248, 248, 255, 255), outline=(174, 104, 255, 255), width=3)
    d.line((84, 1090, 996, 1090), fill=(92, 101, 145, 210), width=2)

    polisat = prepare_logo(POLISAT_LOGO, (245, 105))
    adp = prepare_logo(ADP_LOGO, (245, 105))
    img.alpha_composite(polisat, (84, 1120 + (105 - polisat.height) // 2))
    img.alpha_composite(adp, (996 - adp.width, 1120 + (105 - adp.height) // 2))
    centered_text(d, "MÊS DO DOAR 2026", 1159, font(17, True), (155, 162, 193, 255))


def main():
    img = create_background(19)
    d = ImageDraw.Draw(img)

    centered_text(d, "CAMPANHA DE DOAÇÃO", 93, font(22, True), (186, 190, 222, 255))
    centered_text(d, "MÊS DO", 177, font(83, True), (248, 248, 255, 255))
    centered_text(d, "DOAR", 264, font(154, True), (76, 158, 255, 255), 3, (185, 102, 255, 255))
    d.line((160, 446, 920, 446), fill=(130, 105, 255, 190), width=2)
    centered_text(d, "INVISTA NO FUTURO DA POLI", 485, font(39, True), (248, 248, 255, 255))
    centered_text(d, "E DA ENGENHARIA BRASILEIRA", 540, font(30, True), (188, 126, 255, 255))
    centered_text(d, "Sua doação apoia projetos, ideias e a formação", 648, font(27), (225, 228, 245, 255))
    centered_text(d, "de quem transforma o Brasil.", 687, font(27), (225, 228, 245, 255))
    d.rounded_rectangle((238, 771, 842, 829), radius=16, fill=(20, 39, 82, 245), outline=(85, 133, 255, 255), width=2)
    centered_text(d, "APOIE A COMUNIDADE POLITÉCNICA", 788, font(19, True), (208, 222, 255, 255))

    draw_campaign_footer(img)
    img.convert("RGB").save(OUT, quality=95)


def generate_project_impact():
    output = ROOT / "posts" / "exemplo-impacto-projetos.png"
    img = create_background(27)
    d = ImageDraw.Draw(img)

    centered_text(d, "O QUE UMA DOAÇÃO PODE FAZER?", 89, font(22, True), (186, 190, 222, 255))
    centered_text(d, "IDEIAS QUE", 157, font(86, True), (248, 248, 255, 255))
    centered_text(d, "VIRAM PROJETOS.", 245, font(83, True), (76, 158, 255, 255), 3, (185, 102, 255, 255))
    d.line((160, 370, 920, 370), fill=(130, 105, 255, 190), width=2)
    centered_text(d, "O Edital de Projetos apoia iniciativas", 405, font(29, True), (248, 248, 255, 255))
    centered_text(d, "da comunidade politécnica.", 445, font(29, True), (188, 126, 255, 255))
    centered_text(d, "Sua contribuição ajuda a tirar ideias do papel.", 506, font(23), (225, 228, 245, 255))

    cards = (
        (84, "01", "IDEIA", "Alunos e docentes", (77, 156, 255, 255)),
        (401, "02", "APOIO", "Edital de Projetos", (157, 111, 255, 255)),
        (718, "03", "IMPACTO", "Engenharia que transforma", (87, 190, 255, 255)),
    )
    for x, number, title, description, color in cards:
        d.rounded_rectangle((x, 599, x + 278, 784), radius=17, fill=(11, 14, 34, 235), outline=color, width=3)
        d.ellipse((x + 22, 621, x + 80, 679), fill=(23, 33, 75, 255), outline=color, width=2)
        d.text((x + 35, 633), number, font=font(21, True), fill=(238, 239, 255, 255))
        d.text((x + 20, 696), title, font=font(22, True), fill=color)
        d.text((x + 20, 738), description, font=font(16, True), fill=(222, 225, 242, 255))

    draw_campaign_footer(img)
    img.convert("RGB").save(output, quality=95)


if __name__ == "__main__":
    main()
    generate_project_impact()
