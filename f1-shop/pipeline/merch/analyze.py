"""Разбор выдачи aliexpress.com по мерчу: тип вещи, команда, риск логотипа, цена/заказы."""
import json
import math
import re

USD = 84.2  # курс ЦБ РФ на 20.09.2026
raw = json.load(open("raw.json"))

PRICE = re.compile(r"\$(\d[\d,]*\.?\d*)")
SOLD = re.compile(r"([\d,]+)\+? sold")
RATING = re.compile(r"(?<![\d.$])([1-5]\.\d) [\d,]+\+? sold")

TYPES = [
    ("cap", re.compile(r"\bcaps?\b|\bhats?\b|snapback|trucker|baseball", re.I)),
    ("hoodie", re.compile(r"hoodie|hoody|sweatshirt|pullover|crewneck|zip[- ]?up|fleece", re.I)),
    ("polo", re.compile(r"\bpolo\b", re.I)),
    ("jacket", re.compile(r"jacket|windbreaker|coat|vest", re.I)),
    ("tshirt", re.compile(r"t-?shirts?|\btees?\b|\bshirts?\b|top\b", re.I)),
]
TEAMS = [
    ("ferrari", re.compile(r"ferrari|scuderia|leclerc", re.I)),
    ("redbull", re.compile(r"red ?bull|verstappen|perez|oracle", re.I)),
    ("mclaren", re.compile(r"mclaren|norris|piastri|papaya", re.I)),
    ("mercedes", re.compile(r"mercedes|\bamg\b|petronas|russell?\b|antonelli", re.I)),
    ("aston", re.compile(r"aston ?martin|alonso|aramco", re.I)),
    ("alpine", re.compile(r"alpine|gasly|ocon|colapinto", re.I)),
    ("williams", re.compile(r"williams|albon|sainz", re.I)),
    ("haas", re.compile(r"\bhaas\b", re.I)),
    ("racingbulls", re.compile(r"alpha ?tauri|racing bulls|visa cash|tsunoda", re.I)),
    ("audi", re.compile(r"\baudi\b|sauber|kick", re.I)),
    ("cadillac", re.compile(r"cadillac", re.I)),
]
HAMILTON = re.compile(r"hamilton|\blh ?44\b", re.I)
LEGEND = re.compile(r"senna|schumacher|lauda|prost|hunt\b", re.I)
F1 = re.compile(r"\bf1\b|formula ?(1|one)|grand prix|motorsport|\bgp\b", re.I)
CUSTOM = re.compile(r"custom|\bdiy\b|your (own )?(logo|design|text)|\bblank\b", re.I)
BRAND_TM = re.compile(r"\bfia\b|world championship|martini|\bjps\b|john player|benetton|\bgulf\b|marlboro|\blotus\b|puma|tommy|castore|new era", re.I)
OFFICIAL = re.compile(r"official|licensed|licence|license|genuine|original", re.I)
KIDS = re.compile(r"\bkids?\b|child|children|boys?\b|girls?\b|baby|toddler", re.I)
WOMEN = re.compile(r"women|woman|ladies|female", re.I)
NOT_WEAR = re.compile(r"sticker|keychain|mug|poster|model|diecast|lego|block|toy|decal|patch|figure|wallet|bag|mouse ?pad|phone case|socks|shoes|sneaker", re.I)

items = {}
for query, lst in raw.items():
    for it in lst:
        t = it["text"]
        i = t.find("$")
        if i < 0:
            continue
        title = t[:i].strip()
        prices = [float(x.replace(",", "")) for x in PRICE.findall(t[i:i + 60])]
        if not prices:
            continue
        disc = re.search(r"-(\d+)%", t[i:i + 60])
        # «New shoppers save $X»: показана цена для новых покупателей, обычная = показанная + X
        ns = re.search(r"New shoppers save \$([\d,]+\.?\d*)", t)
        promo = prices[0]
        regular = round(prices[0] + float(ns.group(1).replace(",", "")), 2) if ns else prices[0]
        so = SOLD.search(t)
        rt = RATING.search(t)
        kind = next((k for k, rx in TYPES if rx.search(title)), "other")
        if NOT_WEAR.search(title) and kind == "other":
            kind = "not_wear"
        teams = [k for k, rx in TEAMS if rx.search(title)]
        # Хэмилтон с 2025 в Ferrari: если в названии есть Mercedes — считаем Mercedes, иначе Ferrari
        if HAMILTON.search(title) and not teams:
            teams = ["mercedes"] if re.search(r"mercedes|amg|petronas", title, re.I) else ["ferrari"]
        team = teams[0] if len(teams) == 1 else ("multi" if teams else "")
        if not team and LEGEND.search(title):
            team = "legend"
        custom = bool(CUSTOM.search(title))
        if team and team not in ("legend",):
            risk = "логотип команды"
        elif team == "legend":
            risk = "имя/образ пилота"
        elif BRAND_TM.search(title):
            risk = "логотип F1/FIA или спонсора"
        elif custom:
            risk = "своя печать"
        elif F1.search(title):
            risk = "тема F1 без команды"
        else:
            risk = "нет F1 в названии"
        row = dict(
            id=it["id"], url=f"https://www.aliexpress.com/item/{it['id']}.html", title=title[:180],
            usd=regular, promo_usd=promo if ns else None, price=round(regular * USD), disc=int(disc.group(1)) if disc else 0,
            rating=float(rt.group(1)) if rt else None, sold=int(so.group(1).replace(",", "")) if so else 0,
            kind=kind, team=team, risk=risk, custom=custom, official=bool(OFFICIAL.search(title)),
            kids=bool(KIDS.search(title)), women=bool(WOMEN.search(title)), query=query, img=it.get("img"),
        )
        if it["id"] not in items or row["sold"] > items[it["id"]]["sold"]:
            items[it["id"]] = row

RES_WEAR = 0.10  # резерв на возвраты по одежде — 10 % (f1-shop/10-content.md)


def retail(cost):
    k = 2.0 if cost < 1500 else 1.6 if cost <= 7000 else 1.35
    return int(math.ceil(cost * k / 100.0) * 100 - 10)


for r in items.values():
    r["retail"] = retail(r["price"])
    r["profit"] = round(r["retail"] * (1 - 0.035 - 0.06 - RES_WEAR) - r["price"])

rows = sorted(items.values(), key=lambda r: -r["sold"])
json.dump(rows, open("items.json", "w"), ensure_ascii=False, indent=1)
print(len(rows), "уникальных лотов")
from collections import Counter
print(Counter(r["kind"] for r in rows))
print(Counter(r["risk"] for r in rows))
print(Counter(r["team"] for r in rows if r["kind"] in ("cap", "tshirt", "hoodie", "polo")))
