"""Контактный лист кандидатов: превью с номером, ценой и заказами."""
import io
import json
import sys
import urllib.request

from PIL import Image, ImageDraw, ImageFont

picks = json.load(open("picks.json"))
W, H, COLS = 300, 380, 6
font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 15)
bold = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 18)
rows = (len(picks) + COLS - 1) // COLS
sheet = Image.new("RGB", (W * COLS, H * rows), "white")
d = ImageDraw.Draw(sheet)
for i, r in enumerate(picks):
    x, y = (i % COLS) * W, (i // COLS) * H
    url = r.get("img") or ""
    if url.startswith("//"):
        url = "https:" + url
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        im = Image.open(io.BytesIO(urllib.request.urlopen(req, timeout=20).read())).convert("RGB")
        im.thumbnail((W - 20, W - 20))
        sheet.paste(im, (x + (W - im.width) // 2, y + 10))
    except Exception as e:
        d.text((x + 20, y + 120), "нет фото", fill="gray", font=font)
        print(i + 1, "img err", str(e)[:60], file=sys.stderr)
    d.text((x + 10, y + W - 4), f"#{i + 1}", fill="black", font=bold)
    d.text((x + 60, y + W - 2), f"{r['price']} ₽ · {r['sold']} зак.", fill="black", font=font)
    d.text((x + 10, y + W + 22), r["title"][:34], fill="#555", font=font)
    d.text((x + 10, y + W + 42), r["title"][34:68], fill="#555", font=font)
sheet.save(sys.argv[1] if len(sys.argv) > 1 else "sheet.jpg", quality=82)
print("saved", len(picks))
