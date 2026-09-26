"""Карточки товаров для сайта из ассортимента (lots/assortment.json, merch/team_picks.json, kits.json).

Пишет site/content/products/<slug>/product.json и supplier.json. Старые примеры (status placeholder) прячет.
"""
from pathlib import Path as _Path

PIPE = str(_Path(__file__).resolve().parents[1]) + "/"  # f1-shop/pipeline/
REPO = str(_Path(__file__).resolve().parents[3]) + "/"  # корень репозитория
import json
import math
import os
import re
import sys

SCR = PIPE + ""
SITE = REPO + "site/"
CONTENT = SITE + "content/products/"
sys.path.insert(0, SCR + "site")
from stories_new import S as NEW_STORIES  # noqa: E402

rows = json.load(open(SCR + "lots/assortment.json", encoding="utf-8"))
CHECKED = "2026-09-25"
DELIVERY = [12, 22]

TEAM = {"Red Bull": "redbull", "Ferrari": "ferrari", "Mercedes": "mercedes", "McLaren": "mclaren",
        "Aston Martin": "aston", "Alpine": "alpine"}
TEAM_NAME = {"redbull": "Red Bull", "ferrari": "Ferrari", "mercedes": "Mercedes", "mclaren": "McLaren",
             "aston": "Aston Martin", "alpine": "Alpine"}
COLORS = {
    "redbull": ["#1B2A5C", "#E3263B", "#FFD200"], "ferrari": ["#C80000", "#FFD200", "#FFFFFF"],
    "mercedes": ["#1A1A1D", "#00C8B4", "#C0C4C8"], "mclaren": ["#FF7A00", "#2B2B2E", "#FFFFFF"],
    "aston": ["#00594F", "#C8F000", "#FFFFFF"], "alpine": ["#0A5DA8", "#F25CBA", "#FFFFFF"],
}
DRIVER = {  # (именительный, родительный)
    "Verstappen": ("Макс Ферстаппен", "Макса Ферстаппена"), "Tsunoda": ("Юки Цунода", "Юки Цуноды"),
    "Leclerc": ("Шарль Леклер", "Шарля Леклера"), "Hamilton": ("Льюис Хэмилтон", "Льюиса Хэмилтона"),
    "Piastri": ("Оскар Пиастри", "Оскара Пиастри"), "Norris": ("Ландо Норрис", "Ландо Норриса"),
    "Russell": ("Джордж Рассел", "Джорджа Рассела"), "Antonelli": ("Кими Антонелли", "Кими Антонелли"),
    "Alonso": ("Фернандо Алонсо", "Фернандо Алонсо"), "Stroll": ("Лэнс Стролл", "Лэнса Стролла"),
    "Gasly": ("Пьер Гасли", "Пьера Гасли"), "Colapinto": ("Франко Колапинто", "Франко Колапинто"),
    "Perez": ("Серхио Перес", "Серхио Переса"), "Sainz": ("Карлос Сайнс", "Карлоса Сайнса"),
}
LIVERY = {  # ливрея -> (slug, строка для описания, цвета или None)
    "стандартная": ("", None, None),
    "белая, ГП Японии": ("white", "Белая ливрея, в которой Red Bull выступила на Гран-при Японии 2025 года — в честь 60 лет первой победы Honda в Формуле 1.",
                         ["#F4F4F4", "#1B2A5C", "#E3263B"]),
    "ГП Майами": ("miami", "Специальная ливрея, в которой Ferrari выступила на Гран-при Майами.", None),
    "ГП Монако": ("monaco", "Версия Гран-при Монако.", None),
    "ГП США": ("usa", "Специальная ливрея Гран-при США в Остине, которую придумали болельщики.", None),
    "с надписью Leclerc": ("lettering", "Версия с надписью Leclerc.", None),
}
LENGTH = {"1:43": "≈ 13 см", "1:24": "≈ 23 см", "1:8": "≈ 60–70 см"}


def retail(cost):
    k = 2.0 if cost < 1500 else 1.6 if cost <= 7000 else 1.35
    return int(math.ceil(cost * k / 100.0) * 100 - 10)


def popularity(orders, bonus=0):
    return int(max(1, min(99, round(20 + 20 * math.log10(1 + orders) + bonus))))


def slugify(s):
    s = s.lower().replace("/", "-").replace("+", "")
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")


products = []


def add(product, supplier):
    products.append((product, supplier))


# ---------- модели ----------
for d in rows:
    if not d["section"].startswith("Модели"):
        continue
    car = d["car"]
    team = next(v for k, v in TEAM.items() if car.startswith(k))
    code = car.split(" ", 1)[1] if not car.startswith("Aston Martin") and not car.startswith("Red Bull") else car.split(" ")[-1]
    last, num = d["driver_en"].split(" #")
    nom, gen = DRIVER[last]
    lv_slug, lv_text, lv_colors = LIVERY[d["livery"]]
    scale = d["scale"]
    slug = "-".join(x for x in [team, slugify(code), slugify(last), lv_slug, scale.replace(":", "-")] if x)
    year = d["year"]
    special = d["livery"] != "стандартная"
    surname = nom.split()[-1]
    title = f"{car} · {surname}"
    subtitle = f"{nom} #{num} · сезон {year}"
    if special:
        subtitle += f" · {d['livery']}"
    bonus = (10 if year == 2026 else 0) + (3 if last == "Norris" and year >= 2024 else 0) + (2 if lv_slug == "white" else 0)
    lead = f"{car} {gen} в масштабе {scale} — модель длиной {LENGTH[scale].replace('≈ ', 'около ')}."
    body = []
    if lv_text:
        body.append(lv_text)
    body.append("Литая модель: металлический корпус и пластиковые аэродинамические детали. "
                + ("Удобный размер, чтобы собрать на одной полке весь пелотон сезона." if scale == "1:43"
                   else "Крупный масштаб: хорошо видны детали ливреи и аэродинамики."))
    if year == 2026:
        body.append("Новинка сезона 2026 — первого года нового технического регламента.")
    specs = [
        {"label": "Масштаб", "value": scale},
        {"label": "Длина", "value": LENGTH[scale]},
        {"label": "Пилот", "value": f"{nom}, #{num}"},
        {"label": "Сезон", "value": str(year)},
        {"label": "Ливрея", "value": d["livery"] if special else "основная ливрея сезона"},
        {"label": "Материал", "value": "металл (diecast) и пластик"},
        {"label": "Возраст", "value": "14+, коллекционная модель"},
        {"label": "Упаковка", "value": "заводская коробка"},
    ]
    price = retail(d["price"])
    product = {
        "slug": slug, "status": "draft", "title": title, "subtitle": subtitle,
        "category": "model", "kind": "ready", "team": team, "year": year, "driver": nom, "scale": scale,
        "brand": "литая модель", "licensed": False, "price": price, "oldPrice": None,
        "popularity": popularity(d["sold"], bonus), "delivery": DELIVERY, "story": f"{team}-{year}",
        "art": {"type": "car", "colors": lv_colors or COLORS[team], "number": num},
        "description": {"lead": lead, "body": body, "inBox": [f"Модель {car}, масштаб {scale}", "Заводская коробка"]},
        "specs": specs,
        "seo": {"title": f"Модель {car} {nom.split()[-1]} {scale}" + (f" — {d['livery']}" if special else ""),
                "description": f"Литая модель {car} {gen}, сезон {year}, масштаб {scale}"
                               + (f", {d['livery']}" if special else "") + ". Доставка по России."},
        "verify": ["Фото варианта из лота: главное 3/4 спереди, ракурсы, коробка",
                   "Что в коробке (подставка, прозрачный бокс)", "Доставка в РФ — бесплатная или платная"],
    }
    if d.get("check_livery"):
        product["verify"].insert(0, "Ливрея обычная, а не «Майами» — по фото варианта")
    supplier = {"lot": d["url"], "variant": d["variant"], "cost_rub": d["price"], "orders": d["sold"],
                "rating": d["rating"], "backup": [{"lot": f"https://aliexpress.ru/item/{b[0]}.html", "cost_rub": b[1]}
                                                   for b in d.get("backups", [])],
                "checked": CHECKED}
    add(product, supplier)

# ---------- постеры ----------
POSTER = {  # машина -> (id команды или None, цвета, история, год)
    "McLaren M23": ("mclaren", ["#F4F4F4", "#D40000", "#111111"], "mclaren-m23", 1974),
    "McLaren-Mercedes MP4-23": ("mclaren", ["#C0C4C8", "#D40000", "#111111"], "mclaren-2008", 2008),
    "McLaren MCL34": ("mclaren", ["#FF7A00", "#1E6FD9", "#111111"], "mclaren-2019", 2019),
    "Lotus 98T": (None, ["#111111", "#C9A45C", "#C9A45C"], "lotus-1986", 1986),
    "Red Bull Racing RB16": ("redbull", ["#1B2A5C", "#E3263B", "#FFD200"], "redbull-2020", 2020),
    "Lotus 99T": (None, ["#F2C200", "#1E4FA0", "#111111"], "lotus-1987", 1987),
    "Jordan 191": (None, ["#0F7A3C", "#1E6FD9", "#FFFFFF"], "jordan-1991", 1991),
    "Mercedes AMG W10": ("mercedes", ["#C0C4C8", "#00C8B4", "#111111"], "mercedes-2019", 2019),
    "McLaren MP4/5B": ("mclaren", ["#F4F4F4", "#D40000", "#111111"], "mclaren-1990", 1990),
    "McLaren MP4/4": ("mclaren", ["#F4F4F4", "#D40000", "#111111"], "mclaren-1988", 1988),
    "McLaren MP4/6": ("mclaren", ["#F4F4F4", "#D40000", "#111111"], "mclaren-1991", 1991),
    "Brawn BGP001": (None, ["#F4F4F4", "#D7FF3C", "#111111"], "brawn-2009", 2009),
    "Ferrari 643": ("ferrari", ["#C80000", "#FFFFFF", "#111111"], "ferrari-1991", 1991),
    "Renault R25": (None, ["#1E4FA0", "#FFD200", "#FFFFFF"], "renault-2005", 2005),
    "Ferrari F2007": ("ferrari", ["#C80000", "#FFFFFF", "#111111"], "ferrari-2007", 2007),
    "Toro Rosso STR3": (None, ["#1B2A5C", "#E3263B", "#FFD200"], "tororosso-2008", 2008),
    "Toro Rosso STR14": (None, ["#1B2A5C", "#E3263B", "#FFFFFF"], "tororosso-2019", 2019),
    "Ferrari 312T": ("ferrari", ["#C80000", "#FFFFFF", "#111111"], "ferrari-1975", 1975),
    "Toleman TG184": (None, ["#F4F4F4", "#1E4FA0", "#D40000"], "toleman-1984", 1984),
    "Red Bull Racing RB7": ("redbull", ["#1B2A5C", "#E3263B", "#FFD200"], "redbull-2011", 2011),
    "Шумахер, Ferrari — японский стиль": ("ferrari", ["#C80000", "#FFFFFF", "#111111"], "ferrari-2004", 2004),
}
SIZES = {"20×30 см": 519, "30×40 см": 629, "40×60 см": 931, "50×70 см": 1052}
WHERE = {"20×30 см": "на стол или полку", "30×40 см": "над рабочим столом", "40×60 см": "на стену в комнате",
         "50×70 см": "главная стена, крупно"}
BASE = {"mclaren-1988": "15 побед из 16: McLaren MP4/4 — один из самых доминирующих болидов в истории.",
        "ferrari-2004": "Михаэль Шумахер и Ferrari: пять титулов подряд, 2000–2004."}
poster_rows = [d for d in rows if d["section"] == "Постеры"]
for d in poster_rows:
    car = d["car"]
    team, colors, story, year = POSTER[car]
    name = car.replace("Red Bull Racing", "Red Bull").replace("Mercedes AMG", "Mercedes").replace("McLaren-Mercedes", "McLaren")
    short = name.split(" ")[-1] if not name.startswith("Шумахер") else "SCHUMI"
    sp = {s: retail(c) for s, c in SIZES.items()}
    first_fact = BASE.get(story) or NEW_STORIES[story][1][0][2]
    product = {
        "slug": "poster-" + slugify(name if not name.startswith("Шумахер") else "schumacher-ferrari-japan"),
        "status": "draft", "title": f"Постер {name}", "subtitle": "Холст, без рамки",
        "category": "merch", "kind": "poster", "team": team, "year": year, "brand": "Постер", "licensed": False,
        "price": min(sp.values()), "oldPrice": None, "popularity": popularity(d["sold"]), "delivery": DELIVERY,
        "story": story, "art": {"type": "poster", "colors": colors, "print": short.upper()},
        "sizes": list(SIZES), "sizePrices": sp,
        "sizeChart": {"columns": ["Размер", "Цена", "Куда подойдёт"],
                      "rows": [[s, f"{sp[s]:,}".replace(",", " ") + " ₽", WHERE[s]] for s in SIZES],
                      "note": "Постер без рамки: его можно оформить в любую раму нужного размера."},
        "description": {"lead": f"{name} на холсте. {first_fact}",
                        "body": ["Печать на холсте, без рамки.", "Четыре размера — от небольшого на полку до крупного на всю стену."],
                        "inBox": []},
        "specs": [{"label": "Материал", "value": "холст"}, {"label": "Рамка", "value": "нет"},
                  {"label": "Размеры", "value": ", ".join(SIZES)}],
        "seo": {"title": f"Постер {name} — холст, 20×30–50×70 см",
                "description": f"Постер с болидом {name} на холсте. Размеры от 20×30 до 50×70 см. Доставка по России."},
        "verify": ["Фото дизайна из лота (вариант " + d["variant"].split(" / ")[0] + ")", "Качество печати по фото из отзывов",
                   "Как упакован: тубус или конверт"],
    }
    supplier = {"lot": d["url"], "variant": d["variant"].split(" / ")[0] + " / <размер> no frame",
                "cost_rub_by_size": SIZES, "orders": d["sold"], "rating": d["rating"], "checked": CHECKED}
    add(product, supplier)

# ---------- конструкторы и мерч — из отдельных файлов, когда готовы ----------
for extra in ("kits.json", "team_merch.json"):
    path = SCR + "site/" + extra
    if os.path.exists(path):
        for product, supplier in json.load(open(path, encoding="utf-8")):
            add(product, supplier)

# ---------- запись ----------
slugs = [p["slug"] for p, _ in products]
dups = {s for s in slugs if slugs.count(s) > 1}
assert not dups, dups
for folder in sorted(os.listdir(CONTENT)):
    f = CONTENT + folder + "/product.json"
    if os.path.exists(f):
        cur = json.load(open(f, encoding="utf-8"))
        if cur.get("status") == "placeholder":
            cur["status"] = "hidden"
            json.dump(cur, open(f, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
            open(f, "a").write("\n")
for product, supplier in products:
    folder = CONTENT + product["slug"] + "/"
    os.makedirs(folder + "raw", exist_ok=True)
    keep = folder + "raw/.gitkeep"
    if not os.listdir(folder + "raw"):
        open(keep, "w").close()
    json.dump(product, open(folder + "product.json", "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    open(folder + "product.json", "a").write("\n")
    json.dump(supplier, open(folder + "supplier.json", "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    open(folder + "supplier.json", "a").write("\n")
json.dump([p for p, _ in products], open(SCR + "site/generated.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
from collections import Counter
print(len(products), "товаров:", Counter((p["category"], p["kind"]) for p, _ in products))
