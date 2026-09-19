#!/usr/bin/env python3
"""Generate website/static/og.png — the default Open Graph social image.

Deterministic (no network / image model), matches the site brand:
dark #0b0f14 background, signal-green #3ddc97 accent, terminal motif.
Rendered at 2x then downscaled for crisp anti-aliased edges.

Requires Pillow (`pip install pillow`). Run from anywhere:
    python3 website/scripts/gen-og.py
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageFilter

STATIC = Path(__file__).resolve().parent.parent / "static"

SS = 2                      # supersample factor
W, H = 1200 * SS, 630 * SS  # canvas (supersampled)

BG      = (11, 15, 20)      # #0b0f14
CARD    = (13, 21, 29)      # terminal card fill
BORDER  = (30, 43, 54)      # card / grid border
ACCENT  = (61, 220, 151)    # #3ddc97 signal green
FG      = (233, 240, 245)   # near-white text
MUTED   = (140, 158, 172)   # muted grey-blue
DIM     = (96, 114, 128)    # dimmer


def font(path, size, index=0):
    try:
        return ImageFont.truetype(path, size * SS, index=index)
    except Exception:
        return ImageFont.truetype(path, size * SS)


MENLO = "/System/Library/Fonts/Menlo.ttc"
# Menlo.ttc face order: 0 Regular, 1 Bold, 2 Italic, 3 Bold Italic.
f_bold_lg = font(MENLO, 62, 1)   # wordmark
f_bold_sm = font(MENLO, 25, 1)   # card title
f_mono    = font(MENLO, 24, 0)   # terminal lines
f_tag     = font(MENLO, 26, 0)   # tagline
f_foot    = font(MENLO, 22, 0)   # footer


def rounded(draw, box, radius, **kw):
    draw.rounded_rectangle(box, radius=radius * SS, **kw)


img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img, "RGBA")

# --- subtle dot grid ---------------------------------------------------
step = 40 * SS
for x in range(0, W, step):
    d.line([(x, 0), (x, H)], fill=(255, 255, 255, 5), width=1)
for y in range(0, H, step):
    d.line([(0, y), (W, y)], fill=(255, 255, 255, 5), width=1)

# --- green radial glow, bottom-right ----------------------------------
glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
gd = ImageDraw.Draw(glow)
cx, cy = int(W * 0.86), int(H * 0.92)
r = int(420 * SS)
gd.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(61, 220, 151, 70))
glow = glow.filter(ImageFilter.GaussianBlur(radius=160 * SS))
img.paste(glow, (0, 0), glow)
d = ImageDraw.Draw(img, "RGBA")

PAD = 80 * SS

# --- logo mark (matches favicon: rounded rect + chevron + cursor dot) --
mx, my, ms = PAD, 66 * SS, 52 * SS   # mark origin + size
rounded(d, [mx, my, mx + ms, my + ms], 12, outline=ACCENT, width=int(3.2 * SS))
# chevron ">"
cx0, cy0 = mx + ms * 0.30, my + ms * 0.32
d.line([(cx0, cy0), (cx0 + ms * 0.20, cy0 + ms * 0.18), (cx0, cy0 + ms * 0.36)],
       fill=ACCENT, width=int(3.4 * SS), joint="curve")
# cursor dot
d.ellipse([mx + ms * 0.60, my + ms * 0.60, mx + ms * 0.72, my + ms * 0.72], fill=ACCENT)

# --- wordmark ----------------------------------------------------------
d.text((mx + ms + 22 * SS, my - 4 * SS), "servd", font=f_bold_lg, fill=FG)

# --- terminal card -----------------------------------------------------
card_x0, card_y0 = PAD, 150 * SS
card_x1, card_y1 = W - PAD, 462 * SS
rounded(d, [card_x0, card_y0, card_x1, card_y1], 16, fill=CARD, outline=BORDER, width=int(2 * SS))
# title bar dots
bar_y = card_y0 + 28 * SS
for i, c in enumerate([(255, 95, 86), (255, 189, 46), (39, 201, 63)]):
    dx = card_x0 + 30 * SS + i * 26 * SS
    d.ellipse([dx, bar_y, dx + 15 * SS, bar_y + 15 * SS], fill=(*c, 210))
d.text((card_x0 + 130 * SS, bar_y - 6 * SS), "servd — zsh", font=f_bold_sm, fill=DIM)
d.line([(card_x0, card_y0 + 56 * SS), (card_x1, card_y0 + 56 * SS)], fill=BORDER, width=int(2 * SS))

lines = [
    ("$ ", ACCENT, "servd --spa=./frontend --proxy=/api/=http://localhost:9000/api/", FG),
    ("", None, "servd 0.1.0 listening on 0.0.0.0:8080 (all IPv4 interfaces)", MUTED),
    ("", None, "  spa    /      -> /app/frontend", MUTED),
    ("", None, "  proxy  /api/  -> http://localhost:9000/api/", ACCENT),
]
ty = card_y0 + 82 * SS
lh = 45 * SS
for prompt, pc, text, tc in lines:
    x = card_x0 + 34 * SS
    if prompt:
        d.text((x, ty), prompt, font=f_mono, fill=pc)
        x += d.textlength(prompt, font=f_mono)
    d.text((x, ty), text, font=f_mono, fill=tc)
    ty += lh
# blinking block cursor on a fresh prompt line
d.text((card_x0 + 34 * SS, ty), "$", font=f_mono, fill=ACCENT)
cur_x = card_x0 + 34 * SS + d.textlength("$ ", font=f_mono)
d.rectangle([cur_x, ty + 6 * SS, cur_x + 14 * SS, ty + 32 * SS], fill=ACCENT)

# --- tagline + footer --------------------------------------------------
d.text((PAD, 492 * SS), "A tiny static, SPA, HTTP & WebSocket server in one binary.",
       font=f_tag, fill=MUTED)
d.text((PAD, 548 * SS), "npx @qingyu31/servd", font=f_foot, fill=ACCENT)
foot_r = "no runtime · single binary · github.com/qingyu31/servd"
d.text((W - PAD - d.textlength(foot_r, font=f_foot), 548 * SS), foot_r, font=f_foot, fill=DIM)

# --- downscale (supersampling AA) and save ----------------------------
out = img.resize((1200, 630), Image.LANCZOS)
STATIC.mkdir(parents=True, exist_ok=True)
out.save(STATIC / "og.png", "PNG", optimize=True)
print("wrote", STATIC / "og.png", out.size)
