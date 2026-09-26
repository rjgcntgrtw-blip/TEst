"""Карточки реплик конструкторов 1:8 -> site/kits.json (читает gen_products.py) и lots/kits_pick.json (для таблицы)."""
from pathlib import Path as _Path

PIPE = str(_Path(__file__).resolve().parents[1]) + "/"  # f1-shop/pipeline/
REPO = str(_Path(__file__).resolve().parents[3]) + "/"  # корень репозитория
import json
import math

SCR = PIPE + ""
allk = {r["id"]: r for r in json.load(open(SCR + "merch/kits_all.json"))}

# (id лота, машина, команда, год, деталей, номер на арте, вариант в лоте, запасные id)
PICKS = json.load(open(SCR + "site/kits_pick_ids.json"))
COLORS = {"redbull": ["#1B2A5C", "#E3263B", "#FFD200"], "ferrari": ["#C80000", "#FFD200", "#FFFFFF"],
          "mercedes": ["#C0C4C8", "#00C8B4", "#1A1A1D"], "mclaren": ["#FF7A00", "#2B2B2E", "#FFFFFF"],
          "aston": ["#00594F", "#C8F000", "#FFFFFF"]}
WHITE = {"RB21": ["#F4F4F4", "#1B2A5C", "#E3263B"]}


def retail(cost):
    k = 2.0 if cost < 1500 else 1.6 if cost <= 7000 else 1.35
    return int(math.ceil(cost * k / 100.0) * 100 - 10)


def pop(orders):
    return int(max(1, min(99, round(20 + 20 * math.log10(1 + orders)))))


def pieces(n):
    word = "деталь" if n % 10 == 1 and n % 100 != 11 else "детали" if n % 10 in (2, 3, 4) and n % 100 not in (12, 13, 14) else "деталей"
    return f"{n:,}".replace(",", " ") + " " + word


out, table = [], []
for p in PICKS:
    r = allk[p["id"]]
    team, car, year, n = p["team"], p["car"], p["year"], p["pcs"]
    white = car == "Red Bull RB21"
    slug = f"replica-{team}-{car.split()[-1].lower().replace('-', '')}-1-8"
    price = retail(r["price"])
    product = {
        "slug": slug, "status": "draft", "title": f"{car} · реплика 1:8", "subtitle": f"Конструктор, {pieces(n)}",
        "category": "model", "kind": "kit", "team": team, "year": year, "scale": "1:8", "brand": "Реплика",
        "licensed": False, "replica": True, "price": price, "oldPrice": None, "popularity": pop(r["sold"]),
        "delivery": [14, 24], "story": f"{team}-{year}",
        "art": {"type": "kit", "colors": WHITE.get(car.split()[-1], COLORS[team]), "number": p["number"]},
        "description": {
            "lead": f"Большой болид {car} длиной около 60 см, который собирается своими руками: {pieces(n)}."
                    + (" Белая ливрея — как на Гран-при Японии 2025 года." if white else ""),
            "body": ["Это реплика: конструктор не выпущен компанией LEGO и не лицензирован командой. "
                     "Зато стоит в несколько раз дешевле оригинального набора.",
                     "Приезжает в коробке с инструкцией. Сборка займёт не один вечер."],
            "inBox": [f"Детали конструктора ({n} шт.)", "Инструкция по сборке", "Наклейки", "Коробка"]},
        "specs": [{"label": "Масштаб", "value": "1:8"}, {"label": "Деталей", "value": f"{n:,}".replace(",", " ")},
                  {"label": "Длина в сборе", "value": "≈ 60 см"}, {"label": "Оригинал", "value": "нет, реплика"},
                  {"label": "Возраст", "value": "14+"}, {"label": "Упаковка", "value": "коробка"}],
        "seo": {"title": f"Конструктор-реплика {car} 1:8",
                "description": f"Конструктор-реплика болида {car} в масштабе 1:8: {pieces(n)}, длина около 60 см. "
                               "Не оригинал, не лицензия. Доставка по России."},
        "verify": ["Вариант «с коробкой» и его цена", "Фото коробки из отзывов",
                   "Фото собранной модели из отзывов", "Доставка в РФ — бесплатная или платная"],
    }
    supplier = {"lot": f"https://www.aliexpress.us/item/{p['id']}.html", "variant": p["variant"], "cost_rub": r["price"],
                "cost_usd": r["usd"], "price_note": ("цена без скидки новичка из выдачи aliexpress.com" if r["plain"] else
                               "верхняя оценка: зачёркнутая цена из выдачи aliexpress.com, реальная может быть до двух раз ниже")
                              + "; курс 84,2",
                "orders": r["sold"], "rating": r["rating"],
                "backup": [{"lot": f"https://www.aliexpress.us/item/{b}.html", "cost_rub": allk[b]["price"]} for b in p.get("backup", [])],
                "checked": "2026-09-25"}
    out.append((product, supplier))
    table.append(dict(section="Конструкторы — реплика", name=product["title"].replace(" · ", " — "), car=car, scale="1:8",
                      price=r["price"], sold=r["sold"], rating=r["rating"], year=year, url=supplier["lot"],
                      variant=p["variant"], pcs=n,
                      backup="; ".join(f"{b[-9:]} · {allk[b]['price']} ₽" for b in p.get("backup", [])),
                      note=" ".join(x for x in [p.get("note", ""), "" if r["plain"] else
                                     "Цена — верхняя оценка (зачёркнутая): в выдаче была только цена для новичков, реальная может быть до двух раз ниже."] if x),
                      plain=r["plain"]))
# CaDA 1:24 — официальная лицензия команд (цены — верхняя оценка по выдаче aliexpress.com)
CADA = [
    dict(id="3256811986486740", car="BWT Alpine A525", team="alpine", year=2025, price=4524, usd=53.73, sold=268, rating=4.9,
         colors=["#0A5DA8", "#F25CBA", "#FFFFFF"], number="43", lic="BWT Alpine F1 Team"),
    dict(id="3256807694767657", car="Kick Sauber C44", team="audi", year=2024, price=6648, usd=78.96, sold=340, rating=4.7,
         colors=["#52E252", "#111111", "#FFFFFF"], number="24", lic="Stake F1 Team Kick Sauber"),
]
for c in CADA:
    slug = "cada-" + c["car"].split()[-2].lower() + "-" + c["car"].split()[-1].lower() + "-1-24"
    product = {
        "slug": slug, "status": "draft", "title": f"{c['car']} · CaDA", "subtitle": "Конструктор 1:24 · официальная лицензия",
        "category": "model", "kind": "kit", "team": c["team"], "year": c["year"], "scale": "1:24", "brand": "CaDA",
        "licensed": True, "price": retail(c["price"]), "oldPrice": None, "popularity": pop(c["sold"]),
        "delivery": [14, 24], "story": f"{c['team']}-{c['year']}",
        "art": {"type": "kit", "colors": c["colors"], "number": c["number"]},
        "description": {
            "lead": f"Конструктор {c['car']} в масштабе 1:24 от CaDA — по официальной лицензии команды.",
            "body": ["Собирается за вечер: хороший подарок фанату и первый шаг к большим моделям 1:8.",
                     "Приезжает в фирменной коробке CaDA с инструкцией."],
            "inBox": ["Детали конструктора", "Инструкция по сборке", "Наклейки", "Коробка CaDA"]},
        "specs": [{"label": "Масштаб", "value": "1:24"}, {"label": "Производитель", "value": "CaDA"},
                  {"label": "Лицензия", "value": c["lic"]}, {"label": "Возраст", "value": "уточнить по коробке"}],
        "seo": {"title": f"Конструктор CaDA {c['car']} 1:24 — официальная лицензия",
                "description": f"Конструктор CaDA {c['car']} в масштабе 1:24 по официальной лицензии команды. Доставка по России."},
        "verify": ["Официальный магазин CaDA и логотип лицензии на коробке", "Число деталей и возраст на коробке",
                   "Цена нужного варианта (в таблице — верхняя оценка)", "Доставка в РФ — бесплатная или платная"],
    }
    supplier = {"lot": f"https://www.aliexpress.us/item/{c['id']}.html", "variant": "—", "cost_rub": c["price"], "cost_usd": c["usd"],
                "price_note": "верхняя оценка: зачёркнутая цена из выдачи aliexpress.com, реальная может быть до двух раз ниже; курс 84,2",
                "orders": c["sold"], "rating": c["rating"], "checked": "2026-09-25"}
    out.append((product, supplier))
json.dump(out, open(SCR + "site/kits.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
json.dump(table, open(SCR + "lots/kits_pick.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
for (pr, sp), t in zip(out, table):
    print(pr["slug"], pr["price"], t["price"], t["sold"], t["rating"])
