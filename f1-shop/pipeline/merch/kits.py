"""Реплики конструкторов 1:8: обычная цена, заказы, рейтинг — по машинам."""
from pathlib import Path as _Path

PIPE = str(_Path(__file__).resolve().parents[1]) + "/"  # f1-shop/pipeline/
REPO = str(_Path(__file__).resolve().parents[3]) + "/"  # корень репозитория
import json
import re

USD = 84.2
SCR = PIPE + ""
raw = {}
for f in (SCR + "research/raw_com.json", SCR + "merch/raw4.json"):
    raw.update({f + "|" + k: v for k, v in json.load(open(f)).items()})

CARS = [
    ("SF-25", r"sf-?25"), ("SF-24", r"sf-?24|42207"), ("RB21", r"rb21|mk6025"), ("RB20", r"rb20|42206"),
    ("MCL39", r"mcl39"), ("MCL38", r"mcl38"), ("W14", r"w14|42171"), ("W15", r"w15"), ("W16", r"w16"),
    ("AMR25", r"amr25|mk6022"), ("A525", r"a525"), ("McLaren 42141", r"42141"),
]
BAD = re.compile(r"wall|mount|display|stand\b|light|led\b|tyre|tire|wheel|bracket|frame|parts|sticker|case|box only|"
                 r"showcase|acrylic|engine|motor|mini\b|small|speed champions|76919|7724|1:24|1/24|1:43|diecast|alloy", re.I)
KIT = re.compile(r"building block|bricks|blocks|moc|technic|technical|assembl|kit", re.I)

items = {}
for q, lst in raw.items():
    for it in lst:
        t = it["text"]
        i = t.find("$")
        if i < 0:
            continue
        title = t[:i].strip()
        if not KIT.search(title) or BAD.search(title):
            continue
        cars = [name for name, rx in CARS if re.search(rx, title, re.I)]
        if not cars:
            continue
        pr = [float(x.replace(",", "")) for x in re.findall(r"\$(\d[\d,]*\.?\d*)", t[i:i + 60])]
        ns = re.search(r"New shoppers (?:save|-) \$([\d,]+\.?\d*)", t)
        nd = None
        # цена для новичков: обычная = показанная + скидка, или число после «New shoppers -»
        usd = float(nd.group(1).replace(",", "")) if nd else pr[0] + (float(ns.group(1).replace(",", "")) if ns else 0)
        ns = ns or nd
        so = re.search(r"([\d,]+)\+? sold", t)
        rt = re.search(r"(?<![\d.$])([1-5]\.\d) [\d,]+\+? sold", t)
        m = re.search(r"/item/(\d+)", it["href"])
        pid = m.group(1) if m else it["id"]
        row = dict(id=pid, title=title[:150], cars=cars, price=round(usd * USD), usd=round(usd, 2),
                   promo=pr[0] if ns else None, sold=int(so.group(1).replace(",", "")) if so else 0,
                   rating=float(rt.group(1)) if rt else None, img=it.get("img"),
                   pcs=re.findall(r"(\d{3,4}) ?pcs|(\d{4})/(\d{4})", title, re.I))
        row["plain"] = not ns  # цена без скидки новичка — настоящая
        cur = items.get(pid)
        if cur is None:
            items[pid] = row
        else:
            # приоритет: наблюдение без скидки новичка (минимальная цена), иначе — большее число заказов
            if row["plain"] and (not cur["plain"] or row["price"] < cur["price"]):
                row["sold"] = max(row["sold"], cur["sold"]); items[pid] = row
            elif not cur["plain"] and row["sold"] > cur["sold"]:
                items[pid] = row
            else:
                cur["sold"] = max(row["sold"], cur["sold"])

rows = sorted(items.values(), key=lambda r: r["price"])
json.dump(rows, open(SCR + "merch/kits_all.json", "w"), ensure_ascii=False, indent=1)
for name, _ in CARS:
    sel = [r for r in rows if name in r["cars"] and r["sold"] >= 20 and (r["rating"] is None or r["rating"] >= 4.4)]
    print("=====", name, len(sel))
    for r in sel[:8]:
        print(f"  {r['id']} {r['price']:>6}{'' if r['plain'] else '*'} ₽ {r['sold']:>5} {r['rating'] or '-':>4} {'+'.join(r['cars'])} | {r['title'][:95]}")
