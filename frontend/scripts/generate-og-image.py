#!/usr/bin/env python3
"""
Generate the static Open Graph / Twitter social card: public/assets/og-image.png (1200x630).

We render a static PNG rather than using next/og at runtime because this site is
self-hosted behind nginx (`next start`), and @vercel/og's font loader breaks on Windows
builds and needs the edge-eval sandbox that self-hosting disables. A static card is
identical in result, faster to serve, and builds on every platform.

Re-run after editing copy:  python scripts/generate-og-image.py
"""
import os
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
FONT_DIR = os.path.join(HERE, "og-assets")
OUT = os.path.join(HERE, "..", "public", "assets", "og-image.png")

W, H = 1200, 630
BG_TOP = (29, 29, 51)      # #1d1d33
BG_BOTTOM = (11, 11, 15)   # #0b0b0f
ACCENT = (154, 160, 255)   # #9aa0ff
WHITE = (255, 255, 255)
SUB = (184, 188, 208)      # #b8bcd0
MUTED = (122, 127, 153)    # #7a7f99

regular = lambda s: ImageFont.truetype(os.path.join(FONT_DIR, "Roboto-Regular.ttf"), s)
bold = lambda s: ImageFont.truetype(os.path.join(FONT_DIR, "Roboto-Bold.ttf"), s)


def background():
    """Diagonal dark gradient with a soft radial glow toward the top-right."""
    base = Image.new("RGB", (W, H), BG_BOTTOM)
    px = base.load()
    for y in range(H):
        for x in range(0, W, 1):
            # distance from top-right corner, normalised
            dx = (W - x) / W
            dy = y / H
            t = max(0.0, 1.0 - (dx * 0.55 + dy * 0.75))
            px[x, y] = (
                int(BG_BOTTOM[0] + (BG_TOP[0] - BG_BOTTOM[0]) * t),
                int(BG_BOTTOM[1] + (BG_TOP[1] - BG_BOTTOM[1]) * t),
                int(BG_BOTTOM[2] + (BG_TOP[2] - BG_BOTTOM[2]) * t),
            )
    return base


def wrap(draw, text, font, max_w):
    words, lines, cur = text.split(), [], ""
    for w in words:
        trial = (cur + " " + w).strip()
        if draw.textlength(trial, font=font) <= max_w:
            cur = trial
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def main():
    img = background()
    d = ImageDraw.Draw(img)
    PAD = 80

    # Eyebrow / brand
    eyebrow = bold(30)
    d.text((PAD, 72), "T E C H S A R A", font=eyebrow, fill=ACCENT)

    # Headline
    head_font = bold(72)
    headline = "Enterprise-Grade AI, Engineered for Your Business"
    lines = wrap(d, headline, head_font, W - PAD * 2)
    line_h = 82
    block_h = line_h * len(lines)
    y = 300 - block_h // 2
    for ln in lines:
        d.text((PAD, y), ln, font=head_font, fill=WHITE)
        y += line_h

    # Subhead
    sub_font = regular(30)
    sub = "End-to-end AI development, cloud & on-premise deployment, and strategic consulting."
    sy = y + 18
    for ln in wrap(d, sub, sub_font, W - PAD * 2):
        d.text((PAD, sy), ln, font=sub_font, fill=SUB)
        sy += 42

    # Footer domain
    d.text((PAD, H - 72), "techsarasolutions.com", font=regular(26), fill=MUTED)

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    img.save(OUT, "PNG", optimize=True)
    print("Wrote", os.path.normpath(OUT), os.path.getsize(OUT), "bytes")


if __name__ == "__main__":
    main()
