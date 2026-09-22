"""Turns Codex's logos (painted on cream) into transparent web assets.
Run: python scripts/logo.py
"""
from PIL import Image
import numpy as np

def key(path):
    a = np.asarray(Image.open(path).convert("RGB")).astype(float)
    bg = np.median(np.concatenate([a[:8].reshape(-1, 3), a[-8:].reshape(-1, 3)]), 0)
    dist = np.abs(a - bg).sum(-1)
    alpha = np.clip((dist - 14) / (44 - 14), 0, 1)
    # pull the cream back out of anti-aliased edges so they don't glow on other backgrounds
    safe = np.maximum(alpha, 1e-3)[..., None]
    rgb = np.clip((a - bg * (1 - safe)) / safe, 0, 255)
    img = Image.fromarray(np.dstack([rgb, alpha * 255]).astype(np.uint8), "RGBA")
    return img.crop(img.getbbox())

wide = key("assets/_src/logo-wide-codex.png")
wide.thumbnail((720, 720), Image.LANCZOS)
wide.save("assets/logo-wide.webp", quality=90)

stacked = key("assets/_src/logo-stacked-codex.png")
big = stacked.copy()
big.thumbnail((640, 640), Image.LANCZOS)
big.save("assets/logo-stacked.webp", quality=90)
print("stacked", big.size)

# favicon: just the flamingo, sun and palm from the stacked mark
mark = stacked
w, h = mark.size
mark = mark.crop((int(w * 0.18), 0, int(w * 0.82), int(h * 0.6)))
side = max(mark.size)
square = Image.new("RGBA", (side, side))
square.paste(mark, ((side - mark.size[0]) // 2, (side - mark.size[1]) // 2))
square.resize((180, 180), Image.LANCZOS).save("assets/icon-180.png")
square.resize((64, 64), Image.LANCZOS).save("assets/favicon.png")
print("wide", wide.size, "mark crop", mark.size)
