#!/usr/bin/env python3
"""Generate Foster Insights favicon assets from the official horizontal logo."""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
LOGO_PATH = ROOT / "public" / "brand" / "foster-insights-logo.webp"
APP_DIR = ROOT / "src" / "app"
SYMBOL_CROP_WIDTH = 365
PADDING_RATIO = 0.12


def make_square_icon(symbol_img: Image.Image, size: int) -> Image.Image:
    sw, sh = symbol_img.size
    inner = int(size * (1 - 2 * PADDING_RATIO))
    scale = min(inner / sw, inner / sh)
    nw, nh = max(1, int(sw * scale)), max(1, int(sh * scale))
    resized = symbol_img.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    canvas.paste(resized, ((size - nw) // 2, (size - nh) // 2), resized)
    return canvas


def main() -> None:
    source = Image.open(LOGO_PATH).convert("RGBA")
    symbol = source.crop((0, 0, SYMBOL_CROP_WIDTH, source.size[1]))
    symbol = symbol.crop(symbol.getbbox())

    APP_DIR.mkdir(parents=True, exist_ok=True)
    make_square_icon(symbol, 512).save(APP_DIR / "icon.png")
    make_square_icon(symbol, 180).save(APP_DIR / "apple-icon.png")
    make_square_icon(symbol, 512).save(
        APP_DIR / "favicon.ico",
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)],
    )
    print(f"Generated favicon assets in {APP_DIR}")


if __name__ == "__main__":
    main()
