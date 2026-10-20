"""Render bilingual Christmas invitation OG cards (1200 x 630) with Pillow.

Run a Next build first to cache the project's EB Garamond and Montserrat fonts,
then: python scripts/og/christmas-gala-sponsors.py
Guest RSVP: python scripts/og/christmas-gala-sponsors.py --audience rsvp
Requires Pillow, fonttools and brotli. No browser, remote fonts or API needed.
Artwork is authored here; logo is the existing A&J asset. Copy lives in messages.
"""
from pathlib import Path
from io import BytesIO
import json
import math
import random
import re
import argparse

from PIL import Image, ImageDraw, ImageFont
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[2]
SIZE = (1200, 630)
SCALE = 3
CREAM = '#fff7f5'
NAVY = '#102037'
GOLD = '#c7a260'
DEEP_GOLD = '#8a6a2f'
GREEN = '#143b35'
WINE = '#512832'


def cached_fonts():
    """Use the same Latin fonts Next ships, without maintaining font copies."""
    result = {}
    for path in sorted((ROOT / '.next').glob('**/static/media/*.woff2')):
        font = TTFont(path)
        family = font['name'].getDebugName(1) or ''
        if family != 'EB Garamond' and not family.startswith('Montserrat'):
            continue
        # The Latin subset must support both languages, including accented copy.
        if not set(map(ord, 'A&J Navidad invitación diciembre')).issubset(font.getBestCmap()):
            continue
        key = 'body' if family.startswith('Montserrat') else 'display'
        if key in result:
            continue
        font.flavor = None
        data = BytesIO()
        font.save(data)
        result[key] = data.getvalue()
    if set(result) != {'body', 'display'}:
        raise RuntimeError('Run next build first: cached Latin EB Garamond and Montserrat fonts are required.')
    return result


FONTS = cached_fonts()


def face(kind, size, weight=500):
    font = ImageFont.truetype(BytesIO(FONTS[kind]), round(size * SCALE))
    try:
        axes = font.get_variation_axes()
        font.set_variation_by_axes([weight if a['name'] == b'Weight' else a['default'] for a in axes])
    except (OSError, AttributeError):
        pass
    return font


def point(x, y):
    return (round(x * SCALE), round(y * SCALE))


def line(draw, coords, fill, width=1):
    draw.line([point(x, y) for x, y in coords], fill=fill, width=max(1, round(width * SCALE)))


def center(draw, text, y, font, color, tracking=0):
    widths = [draw.textlength(c, font=font) for c in text]
    width = sum(widths) + tracking * SCALE * max(0, len(text) - 1)
    x = (SIZE[0] * SCALE - width) / 2
    if not tracking:
        draw.text((SIZE[0] * SCALE / 2, y * SCALE), text, font=font, fill=color, anchor='mt')
    else:
        for char, char_width in zip(text, widths):
            draw.text((x, y * SCALE), char, font=font, fill=color, anchor='lt')
            x += char_width + tracking * SCALE


def sprig(draw, origin, angle, length, seed):
    """Evergreen needles as vector strokes, layered away from the typography."""
    rng = random.Random(seed)
    ox, oy = origin
    vx, vy = math.cos(angle), math.sin(angle)
    px, py = -vy, vx
    line(draw, [(ox, oy), (ox + length * vx, oy + length * vy)], '#8b8459', 1.1)
    for i in range(5, int(length), 6):
        bx, by = ox + i * vx, oy + i * vy
        needle = (1 - i / length) * 23 + 10
        for side in (-1, 1):
            color = rng.choice(['#143b35', '#285546', '#476451', '#6b7b59'])
            end = (bx - vx * needle * .5 + px * needle * side, by - vy * needle * .5 + py * needle * side)
            line(draw, [(bx, by), end], color, .8)


def ornament(draw, x, y, radius, color):
    line(draw, [(x, 40), (x, y - radius - 5)], GOLD, .8)
    draw.rectangle([point(x - 4, y - radius - 5), point(x + 4, y - radius)], fill=GOLD)
    draw.ellipse([point(x - radius, y - radius), point(x + radius, y + radius)], fill=color, outline=GOLD, width=SCALE)
    draw.arc([point(x - radius + 6, y - radius + 4), point(x + radius - 6, y + radius - 4)], 100, 255, fill=GOLD, width=SCALE)
    line(draw, [(x - radius + 3, y + 3), (x + radius - 3, y + 3)], GOLD, .6)


def render(locale, audience='sponsors'):
    all_messages = json.loads((ROOT / 'messages' / f'{locale}.json').read_text(encoding='utf-8'))
    messages = all_messages['christmasGala']
    c = messages['meta']['invitation']
    if audience == 'rsvp':
        c = {**c, **all_messages['galaRsvp']['share']}
    canvas = Image.new('RGB', (SIZE[0] * SCALE, SIZE[1] * SCALE), '#0b2826')
    draw = ImageDraw.Draw(canvas)
    # A wide matte evergreen edge around an ivory invitation with fine foil rules.
    draw.rectangle([point(34, 26), point(1166, 604)], fill=CREAM)
    draw.rectangle([point(23, 16), point(1177, 614)], outline=GOLD, width=SCALE)
    draw.rectangle([point(46, 38), point(1154, 592)], outline=GOLD, width=SCALE)
    draw.rectangle([point(53, 45), point(1147, 585)], outline='#e9d8d0', width=SCALE)

    # Delicate symmetric boughs, rendered at 3x for sharp edges in small previews.
    for mirror in (False, True):
        layer = Image.new('RGBA', canvas.size)
        d = ImageDraw.Draw(layer)
        for x, y, angle, length, seed in [(58, 29, .18, 238, 3), (49, 35, .83, 172, 7), (43, 39, 1.35, 189, 11), (150, 46, .7, 83, 17)]:
            sprig(d, (x, y), angle, length, seed)
        ornament(d, 126, 128, 26, WINE)
        ornament(d, 205, 96, 17, GREEN)
        if mirror:
            layer = layer.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
        canvas.paste(layer, (0, 0), layer)
    # Smaller evergreen flourishes at the bottom corners.
    for x, y, a in [(54, 586, -.18), (54, 586, -.95), (1146, 586, math.pi + .18), (1146, 586, math.pi + .95)]:
        sprig(draw, (x, y), a, 134, int(x + y))

    # Existing transparent logo, recolored using its alpha (no invented logo).
    logo = Image.open(ROOT / 'public/images/logo-white_2.webp').convert('RGBA')
    logo.thumbnail((146 * SCALE, 88 * SCALE), Image.Resampling.LANCZOS)
    ink = Image.new('RGBA', logo.size, NAVY)
    ink.putalpha(logo.getchannel('A'))
    canvas.paste(ink, (round((SIZE[0] * SCALE - ink.width) / 2), 65 * SCALE), ink)

    center(draw, c['eyebrow'], 167, face('body', 15, 600), DEEP_GOLD, 2.4)
    title_size = 100
    while draw.textlength(c['title'], font=face('display', title_size, 500)) > 960 * SCALE:
        title_size -= 1
    center(draw, c['title'], 201, face('display', title_size, 500), NAVY)
    center(draw, c['theme'], 309, face('display', 25), DEEP_GOLD)
    line(draw, [(445, 353), (576, 353)], GOLD, .8)
    line(draw, [(624, 353), (755, 353)], GOLD, .8)
    draw.polygon([point(600, 347), point(606, 353), point(600, 359), point(594, 353)], fill=GOLD)
    center(draw, c['date'], 377, face('body', 22, 600), NAVY, 1)
    time_text = all_messages['galaRsvp']['time'] if audience == 'rsvp' else messages['hero']['time']
    center(draw, time_text, 413, face('display', 27), NAVY)
    event_source = (ROOT / 'src/data/christmasGala.ts').read_text(encoding='utf-8')
    venue = re.search(r'venueName: "([^"]+)"', event_source).group(1)
    center(draw, venue, 455, face('body', 17, 500), NAVY)
    center(draw, c['city'], 484, face('body', 14, 500), DEEP_GOLD, 2)
    line(draw, [(357, 525), (843, 525)], '#e9d8d0', .8)
    center(draw, c['footer'], 543, face('body', 16, 500), NAVY)

    result = canvas.resize(SIZE, Image.Resampling.LANCZOS)
    out = ROOT / 'public/images/events' / f'christmas-gala-{audience}-og-{locale}.jpg'
    result.save(out, quality=93, subsampling=0, optimize=True)
    print(f'{locale}: {out.relative_to(ROOT)} ({out.stat().st_size:,} bytes)')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--audience', choices=('sponsors', 'rsvp'), default='sponsors')
    args = parser.parse_args()
    for locale in ('es', 'en'):
        render(locale, args.audience)
