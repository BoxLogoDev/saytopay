#!/usr/bin/env python3
"""Render the Devpost submission images for SayToPay (deterministic, offline).

Devpost requires at least one project image. This script draws both gallery
images with Pillow from fixed, measured facts only (the $45.50 example draft
from the demo catalog) — no screenshots of accounts, no credentials, no
personal data. Re-run it to regenerate the PNGs:

    python3 assets/make_images.py [output-dir]

The PNGs are written outside the repository tree on purpose: the snapshot
sync used for the public repo transfers UTF-8 text files only, so binaries
must not live in the project tree. See assets/README.md.
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

FONT_DIR = Path("/usr/share/fonts/truetype/dejavu")
BOLD = str(FONT_DIR / "DejaVuSans-Bold.ttf")
REG = str(FONT_DIR / "DejaVuSans.ttf")
MONO = str(FONT_DIR / "DejaVuSansMono.ttf")

BG = (15, 28, 43)        # matches the app result box (#0f1c2b)
PANEL = (27, 44, 63)
ACCENT = (0, 112, 224)   # app button blue (#0070e0)
WHITE = (255, 255, 255)
MUTED = (168, 188, 208)
GREEN = (64, 199, 132)
W, H = 1600, 900


def font(path, size):
    return ImageFont.truetype(path, size)


def rounded(draw, box, radius, fill):
    draw.rounded_rectangle(box, radius=radius, fill=fill)


def cover(out: Path):
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, 14], fill=ACCENT)
    d.text((110, 96), "SayToPay", font=font(BOLD, 118), fill=WHITE)
    d.text((112, 248), "Say it. Review it. Pay with PayPal.",
           font=font(BOLD, 56), fill=(126, 199, 255))
    d.text((112, 348),
           "Type what you want to buy in one sentence. SayToPay builds\n"
           "the order draft and completes a real PayPal sandbox payment.",
           font=font(REG, 37), fill=MUTED, spacing=12)
    # Example sentence pill
    rounded(d, [110, 512, 1490, 622], 18, PANEL)
    d.text((148, 532), '"2 coffee beans and a notebook"',
           font=font(MONO, 40), fill=WHITE)
    d.text((1180, 532), "->  $45.50", font=font(BOLD, 40), fill=GREEN)
    # Flow line
    d.text((112, 678),
           "create order   ->   approve   ->   capture   ->   COMPLETED",
           font=font(BOLD, 42), fill=WHITE)
    d.text((112, 792),
           "PayPal AI Hackathon 2026  -  Sandbox demo - no real money moves",
           font=font(REG, 30), fill=MUTED)
    img.save(out / "saytopay-cover.png")


def flow(out: Path):
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, 14], fill=ACCENT)
    d.text((90, 64), "How SayToPay works", font=font(BOLD, 64), fill=WHITE)
    steps = [
        ("1  SAY IT",
         '"2 coffee beans and a notebook"\n'
         "One natural-language sentence is\n"
         "the whole input - no manual cart."),
        ("2  REVIEW THE DRAFT",
         "Coffee beans 1kg x2   $36.00\n"
         "Paper notebook x1       $9.50\n"
         "Total                     $45.50\n"
         "Editable; the server reprices\n"
         "every edit from the catalog."),
        ("3  PAY WITH PAYPAL",
         "PayPal Orders v2 (sandbox):\n"
         "create order -> buyer approval\n"
         "-> capture. One real flow,\n"
         "sandbox money only."),
        ("4  PROOF",
         "The result screen shows the\n"
         "order ID, capture ID and\n"
         "COMPLETED status - the same\n"
         "transaction is in the sandbox\n"
         "dashboard."),
    ]
    x0, y0, bw, bh, gap = 90, 185, 690, 280, 30
    for i, (title, body) in enumerate(steps):
        x = x0 + (i % 2) * (bw + gap)
        y = y0 + (i // 2) * (bh + gap)
        rounded(d, [x, y, x + bw, y + bh], 16, PANEL)
        d.text((x + 32, y + 24), title, font=font(BOLD, 36), fill=(126, 199, 255))
        d.text((x + 32, y + 84), body, font=font(REG, 28), fill=WHITE, spacing=7)
    d.text((90, 810),
           "PayPal AI Hackathon 2026  -  Sandbox demo - no real money moves",
           font=font(REG, 30), fill=MUTED)
    img.save(out / "saytopay-flow.png")


def main():
    out = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("submission-assets")
    out.mkdir(parents=True, exist_ok=True)
    cover(out)
    flow(out)
    print(f"wrote {out / 'saytopay-cover.png'} and {out / 'saytopay-flow.png'}")


if __name__ == "__main__":
    main()
