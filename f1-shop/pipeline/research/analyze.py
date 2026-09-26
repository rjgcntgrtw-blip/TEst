import csv
import json
import math
import re
import sys

raw = json.load(open(sys.argv[1] if len(sys.argv) > 1 else "raw.json"))

def num(s):
    return int(re.sub(r"\D", "", s)) if s else None

LEAD = re.compile(r"^(?P<p1>\d[\d ]*) ₽(?: -(?P<disc>\d+)% (?P<p2>\d[\d ]*) ₽)?")
RATING = re.compile(r"₽ (?P<r>[1-5][.,]\d) ")
SOLD = re.compile(r"(?<![\d.,])(?P<s>\d{1,3}(?: \d{3})*) купил")
DAYS = re.compile(r"до (\d+) дн")
SCALE = re.compile(r"1\s*[:/]\s*(8|10|12|14|16|18|20|24|32|36|43|64)(?!\d)")
F1 = re.compile(r"\bF1\b|Ф1|Формул|Formula|\bRB\s?\d{2}\b|\bSF[\s-]?\d{2}\b|\bMCL\s?\d{2}\b|\bW\s?1\d\b|\bAMR\s?\d{2}\b|\bFW\s?\d{2}|болид|MP4", re.I)
BRANDS = ["MiniGT", "Mini GT", "Hot Wheels", "Hotwheels", "Tamiya", "MENG", "Amalgam", "Bburago", "Burago", "Maisto", "Minichamps", "Spark", "Rastar", "LEGO", "Лего", "Solido", "Looksmart", "BBR", "Tarmac", "Mould King", "CaDA", "Sembo"]
BUILD = re.compile(r"конструктор|строител|блок|building|brick|MOC|кирпич|детал", re.I)
LEGO_WORD = re.compile(r"\bLEGO\b|\bЛего\b", re.I)
CLONE = re.compile(r"совместим|compatible|аналог|MOC|блоки|кирпич", re.I)
NOT_F1 = re.compile(r"слот|slot|Scalextric|Carrera|XP5|McLaren F1 (?:LM|GTR|XP)|Countach", re.I)
RC = re.compile(r"радиоуправ|\bRC\b|пульт|remote", re.I)

items = {}
for query, lst in raw.items():
    for it in lst:
        t = it["text"]
        m = LEAD.match(t)
        if not m:
            continue
        if m.group("disc"):
            old, price, disc = num(m.group("p1")), num(m.group("p2")), int(m.group("disc"))
        else:
            old, price, disc = None, num(m.group("p1")), 0
        r = RATING.search(t)
        s = SOLD.search(t)
        title = t
        if s:
            title = t[s.end():].strip()
            title = re.sub(r"^и\s", "", re.sub(r"^и ", "", title))
            title = re.sub(r"^и\b", "", title).strip()
        title = re.split(r" (?:Рекомендуем|до \d+ дн|бесплатно|от \d[\d ]* ₽|Доставка)", title)[0].strip()
        sc = SCALE.search(title)
        brand = next((b for b in BRANDS if b.lower() in title.lower()), "")
        if brand in ("Burago",):
            brand = "Bburago"
        if brand == "Лего":
            brand = "LEGO"
        if LEGO_WORD.search(title) and not CLONE.search(title):
            kind = "LEGO"
        elif BUILD.search(title) or LEGO_WORD.search(title):
            kind = "Конструктор"
        elif RC.search(title):
            kind = "Р/у"
        else:
            kind = "Готовая модель"
        d = DAYS.search(t)
        rec = items.get(it["id"])
        row = dict(
            id=it["id"], url=f"https://aliexpress.ru/item/{it['id']}.html", title=title[:150], price=price, old=old,
            disc=disc, rating=float(r.group("r").replace(",", ".")) if r else None, sold=num(s.group("s")) if s else 0,
            days=int(d.group(1)) if d else None, scale=f"1:{sc.group(1)}" if sc else "", brand=brand, kind=kind,
            f1=bool(F1.search(title)) and not NOT_F1.search(title), query=query, img=it.get("img"),
        )
        if not rec or row["sold"] > rec["sold"]:
            items[it["id"]] = row

USD = 84.2  # курс ЦБ РФ на 20.09.2026
COM_PRICE = re.compile(r"\$(\d[\d,]*\.?\d*)")
COM_SOLD = re.compile(r"([\d,]+)\+? sold")
COM_RATING = re.compile(r"(?<![\d.$])([1-5]\.\d) [\d,]+\+? sold")
try:
    raw_com = json.load(open("raw_com.json"))
except FileNotFoundError:
    raw_com = {}
for query, lst in raw_com.items():
    for it in lst:
        t = it["text"]
        i = t.find("$")
        if i < 0:
            continue
        title = t[:i].strip()
        prices = [float(x.replace(",", "")) for x in COM_PRICE.findall(t[i:i + 60])]
        disc = re.search(r"-(\d+)%", t[i:i + 60])
        price_usd = prices[0]
        old_usd = prices[1] if len(prices) > 1 and disc else None
        # «New shoppers save $X» — это цена для новых покупателей; обычная = показанная + X
        ns = re.search(r"New shoppers save \$([\d,]+\.?\d*)", t)
        if ns:
            price_usd = round(price_usd + float(ns.group(1).replace(",", "")), 2)
            old_usd, disc = None, None
        so = COM_SOLD.search(t)
        rt = COM_RATING.search(t)
        sc = SCALE.search(title)
        brand = next((b for b in BRANDS if b.lower() in title.lower()), "")
        if brand == "Burago":
            brand = "Bburago"
        if LEGO_WORD.search(title) and not CLONE.search(title) and not re.search(r"compatible|blocks|bricks|MOC|technical|technic.*compatible", title, re.I):
            kind = "LEGO"
        elif BUILD.search(title) or LEGO_WORD.search(title) or re.search(r"assembl|kit\b|blocks|bricks", title, re.I):
            kind = "Конструктор"
        elif RC.search(title):
            kind = "Р/у"
        else:
            kind = "Готовая модель"
        row = dict(
            id=it["id"], url=it.get("href") or f"https://www.aliexpress.com/item/{it['id']}.html", title=title[:150],
            price=round(price_usd * USD), old=round(old_usd * USD) if old_usd else None, disc=int(disc.group(1)) if disc else 0,
            rating=float(rt.group(1)) if rt else None, sold=int(so.group(1).replace(",", "")) if so else 0, days=None,
            scale=f"1:{sc.group(1)}" if sc else "", brand=brand, kind=kind,
            f1=bool(F1.search(title)) and not NOT_F1.search(title), query="com: " + query, img=it.get("img"), usd=price_usd,
        )
        key = "com" + it["id"]
        if key not in items or row["sold"] > items[key]["sold"]:
            items[key] = row

def retail(cost):
    k = 2.0 if cost < 1500 else 1.6 if cost <= 7000 else 1.35
    return int(math.ceil(cost * k / 100.0) * 100 - 10)

for r in items.values():
    r["retail"] = retail(r["price"])
    # эквайринг 3,5 % + УСН 6 % + резерв 5 % = 14,5 % от цены продажи
    r["profit"] = round(r["retail"] * (1 - 0.145) - r["price"])
    r["value"] = round(r["sold"] / r["price"] * 1000, 1) if r["price"] else 0

rows = sorted(items.values(), key=lambda r: -r["sold"])
json.dump(rows, open("items.json", "w"), ensure_ascii=False, indent=1)
with open("items.csv", "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=["kind", "scale", "brand", "title", "price", "old", "disc", "sold", "rating", "days", "retail", "profit", "value", "url", "query", "f1"])
    w.writeheader()
    for r in rows:
        w.writerow({k: r[k] for k in w.fieldnames})
print(len(rows), "items;", sum(r["f1"] for r in rows), "F1")
for r in rows[:40]:
    print(f"{r['kind'][:6]:6} {r['scale']:5} {r['price']:>6} {r['sold']:>6} {r['rating'] or '-':>4} {'F1' if r['f1'] else '  '} {r['title'][:90]}")
