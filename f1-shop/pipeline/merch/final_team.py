"""Финальный мерч в стиле командной формы -> merch/picks.json (таблица) и site/team_merch.json (сайт)."""
from pathlib import Path as _Path

PIPE = str(_Path(__file__).resolve().parents[1]) + "/"  # f1-shop/pipeline/
REPO = str(_Path(__file__).resolve().parents[3]) + "/"  # корень репозитория
import json
import math
import re

SCR = PIPE + ""
USD = 84.2

# (id, команда, вещь, тип для сайта, год, пилот/надпись, номер, заметка, запасные)
PICKS = [
    ("3256811662651987", "ferrari", "Футболка", "tshirt", 2026, "Хэмилтон", "44", "Стиль формы Ferrari 2026 с логотипами партнёров.", []),
    ("3256812920506215", "ferrari", "Худи", "sweatshirt", 2026, "Хэмилтон", "44", "Та же расцветка, что у футболки.", []),
    ("3256812746522986", "ferrari", "Кепка", "cap", 2026, "Хэмилтон", "44", "Мало заказов — сначала образец.", []),
    ("3256811671431441", "mclaren", "Футболка", "tshirt", 2025, "Норрис", "4", "Форма McLaren 2025, номер 4.", []),
    ("3256812246454688", "mclaren", "Поло", "tshirt", 2026, "Норрис", "1", "Командное поло 2026, номер 1.", []),
    ("3256811709065122", "mclaren", "Кепка", "cap", 2025, "Норрис", "4", "Кепка в стиле кепки пилота; мало заказов.", []),
    ("3256812911521129", "redbull", "Футболка", "tshirt", 2026, "Ферстаппен", "3", "Форма Red Bull 2026, номер 3.", ["3256812989321292"]),
    ("3256812755115298", "redbull", "Кепка", "cap", 2025, "Ферстаппен", "1", "Кепка пилота с номером 1. Мало заказов — сначала образец.", []),
    ("3256812852478104", "mercedes", "Футболка", "tshirt", 2026, "Рассел", "63", "Форма Mercedes 2026 с логотипами партнёров.", ["3256811449048467"]),
    ("3256809407682033", "mercedes", "Флисовая кофта", "sweatshirt", 2025, "", "", "Флиска на молнии с логотипом Petronas.", []),
    ("3256810563498806", "aston", "Кепка", "cap", 2025, "Алонсо", "14", "Самая продаваемая командная кепка в выдаче.", ["3256810368072176"]),
    ("3256810450913724", "aston", "Футболка", "tshirt", 2025, "Алонсо", "14", "Форма Aston Martin, номер 14.", []),
    ("3256812151916721", "williams", "Футболка", "tshirt", 2026, "Сайнс", "55", "Форма Atlassian Williams 2026.", ["3256809585305917"]),
    ("3256812143727223", "williams", "Поло", "tshirt", 2026, "Сайнс", "55", "Командное поло 2026.", []),
    ("3256810520757898", "williams", "Кепка", "cap", 2025, "Сайнс", "55", "Кепка пилота Карлоса Сайнса.", []),
    ("3256812330001421", "audi", "Поло", "tshirt", 2026, "", "", "Поло Audi Sport, первый сезон Audi в Формуле 1.", []),
    ("3256810225332254", "haas", "Худи", "sweatshirt", 2025, "", "", "Худи с логотипом Haas. Мало заказов — сначала образец.", []),
    # добор: ещё варианты Ferrari, Mercedes, Red Bull, включая прошлые сезоны
    ("3256812338009231", "ferrari", "Футболка", "tshirt", 2026, "Леклер", "16", "Та же форма Ferrari 2026, вариант Леклера.", []),
    ("3256812750242513", "ferrari", "Футболка", "tshirt", 2026, "", "", "Командная футболка без номера пилота.", []),
    ("3256812758705689", "ferrari", "Футболка «Монца»", "tshirt", 2025, "", "", "Спецвыпуск к Гран-при Италии, синяя. Год уточнить по фото.", []),
    ("3256812754900173", "ferrari", "Кепка «Монца»", "cap", 2025, "", "", "Синяя кепка спецвыпуска к Гран-при Италии. Мало заказов.", []),
    ("3256812628966029", "redbull", "Лонгслив", "tshirt", 2024, "Перес", "11", "Форма Red Bull с длинным рукавом, номер Переса — сезоны 2021–2024.", []),
    ("3256805874195736", "redbull", "Кепка", "cap", 2024, "Перес", "11", "Кепка пилота Серхио Переса.", []),
    ("3256811449048467", "mercedes", "Футболка", "tshirt", 2026, "Антонелли", "12", "Форма Mercedes 2026, номер Антонелли.", []),
    ("3256808663430353", "mercedes", "Кепка", "cap", 2024, "Хэмилтон", "44", "Кепка с номером 44 в стиле эпохи Хэмилтона в Mercedes.", []),
]
TEAM_NAME = {"ferrari": "Ferrari", "mclaren": "McLaren", "redbull": "Red Bull Racing", "mercedes": "Mercedes", "aston": "Aston Martin",
             "williams": "Williams", "audi": "Audi", "haas": "Haas"}
COLORS = {"ferrari": ["#C80000", "#FFD200", "#FFFFFF"], "mclaren": ["#FF7A00", "#2B2B2E", "#FFFFFF"],
          "redbull": ["#1B2A5C", "#E3263B", "#FFD200"], "mercedes": ["#1A1A1D", "#00C8B4", "#C0C4C8"],
          "aston": ["#00594F", "#C8F000", "#FFFFFF"], "williams": ["#0B1F4B", "#00A3E0", "#FFFFFF"],
          "audi": ["#1A1A1D", "#BB0A30", "#C0C4C8"], "haas": ["#F4F4F4", "#C8102E", "#1A1A1D"]}
COLOR_NAME = {"ferrari": "Красный", "mclaren": "Папайя", "redbull": "Тёмно-синий", "mercedes": "Чёрный", "aston": "Зелёный",
              "williams": "Тёмно-синий", "audi": "Чёрный", "haas": "Белый"}
DRIVER_GEN = {"Хэмилтон": "Льюиса Хэмилтона", "Норрис": "Ландо Норриса", "Ферстаппен": "Макса Ферстаппена",
              "Рассел": "Джорджа Рассела", "Алонсо": "Фернандо Алонсо", "Сайнс": "Карлоса Сайнса",
              "Леклер": "Шарля Леклера", "Перес": "Серхио Переса", "Антонелли": "Кими Антонелли"}
DRIVER_NOM = {"Хэмилтон": "Льюис Хэмилтон", "Норрис": "Ландо Норрис", "Ферстаппен": "Макс Ферстаппен",
              "Рассел": "Джордж Рассел", "Алонсо": "Фернандо Алонсо", "Сайнс": "Карлос Сайнс",
              "Леклер": "Шарль Леклер", "Перес": "Серхио Перес", "Антонелли": "Кими Антонелли"}
STORY_OK = set(json.load(open(REPO + "site/src/data/stories.json")).keys()) | {"redbull-2023", "ferrari-2024", "mclaren-2024"}
import sys
sys.path.insert(0, SCR + "site")
from stories_new import S  # noqa: E402
STORY_OK |= set(S)


def retail(cost):
    k = 2.0 if cost < 1500 else 1.6 if cost <= 7000 else 1.35
    return int(math.ceil(cost * k / 100.0) * 100 - 10)


def pop(orders):
    return int(max(1, min(99, round(20 + 20 * math.log10(1 + orders)))))


# цены и заказы — по всем выдачам: без скидки новичка — точная, иначе зачёркнутая как верхняя оценка
obs = {}
for f in ["merch/raw.json", "merch/raw3.json", "merch/raw5.json"]:
    for q, lst in json.load(open(SCR + f)).items():
        for it in lst:
            t = it["text"]
            i = t.find("$")
            if i < 0:
                continue
            pr = [float(x.replace(",", "")) for x in re.findall(r"\$(\d[\d,]*\.?\d*)", t[i:i + 60])]
            ns = re.search(r"New shoppers (?:save|-) \$([\d,]+\.?\d*)", t)
            so = re.search(r"([\d,]+)\+? sold", t)
            rt = re.search(r"(?<![\d.$])([1-5]\.\d) [\d,]+\+? sold", t)
            o = obs.setdefault(it["id"], dict(plain=[], upper=[], sold=0, rating=None, img=it.get("img"), title=t[:i].strip()))
            (o["upper"].append(pr[0] + float(ns.group(1).replace(",", ""))) if ns else o["plain"].append(pr[0]))
            o["sold"] = max(o["sold"], int(so.group(1).replace(",", "")) if so else 0)
            o["rating"] = float(rt.group(1)) if rt else o["rating"]

TEE_CHART = {"columns": ["Размер", "Ширина груди, см", "Длина, см"],
             "rows": [["S", "—", "—"], ["M", "—", "—"], ["L", "—", "—"], ["XL", "—", "—"], ["XXL", "—", "—"]],
             "note": "Точные размеры добавим по таблице продавца. Азиатские размеры обычно маломерят."}
CAP_CHART = {"columns": ["Размер", "Обхват головы, см"], "rows": [["Один размер", "56–60, регулируется"]],
             "note": "Застёжка сзади регулирует обхват."}

table, site = [], []
for pid, team, item, kind, year, driver, num, note, backup in PICKS:
    o = obs[pid]
    exact = bool(o["plain"])
    usd = min(o["plain"]) if exact else max(o["upper"])
    cost = round(usd * USD)
    who = f" · {driver} {num}" if driver else ""
    base, _, tag = item.partition(" «")
    title = f"{base} {TEAM_NAME[team]}{who}" + (f" «{tag}" if tag else "")
    story = f"{team}-{year}" if f"{team}-{year}" in STORY_OK else f"{team}-2025"
    gen = DRIVER_GEN.get(driver)
    art_type = {"tshirt": "tshirt", "sweatshirt": "hoodie", "cap": "cap"}[kind]
    lead = (f"{base} в стиле командной формы {TEAM_NAME[team]} сезона {year}"
            + (f" с номером {gen}." if gen else "."))
    product = {
        "slug": "merch-" + team + "-" + re.sub(r"[^a-z]+", "-", {"Футболка": "tee", "Поло": "polo", "Худи": "hoodie", "Кепка": "cap",
                                                                    "Флисовая кофта": "fleece", "Лонгслив": "longsleeve",
                                                                    "Футболка «Монца»": "tee-monza", "Кепка «Монца»": "cap-monza"}[item]) + (f"-{num}" if num else "") + f"-{year}",
        "status": "draft", "title": title, "subtitle": f"Реплика командной формы · {year}",
        "category": "merch", "kind": kind, "team": team, "year": year, **({"driver": DRIVER_NOM[driver]} if driver else {}),
        "brand": "Реплика", "licensed": False, "replica": True, "price": retail(cost), "oldPrice": None,
        "popularity": pop(o["sold"]), "delivery": [12, 22], "story": story,
        "art": {"type": art_type, "colors": COLORS[team], **({"print": num} if num and art_type != "cap" else {})},
        "colors": [{"id": "main", "name": COLOR_NAME[team], "hex": COLORS[team][0]}],
        "sizes": ["Один размер"] if kind == "cap" else ["S", "M", "L", "XL", "XXL"],
        "sizeChart": CAP_CHART if kind == "cap" else TEE_CHART,
        "description": {"lead": lead,
                        "body": ["Цвета и логотипы — как на форме команды.",
                                 "Это реплика: вещь не выпущена командой и не лицензирована ею."],
                        "inBox": []},
        "specs": [{"label": "Состав", "value": "уточнить у продавца"}, {"label": "Оригинал", "value": "нет, реплика"},
                  {"label": "Уход", "value": "стирка 30°, наизнанку, не гладить по принту"}
                  if kind != "cap" else {"label": "Размер", "value": "один, регулируется"}],
        "seo": {"title": f"{title} — реплика командной формы",
                "description": f"{lead} Реплика, не лицензия. Доставка по России."},
        "verify": ["Таблица размеров продавца в сантиметрах" if kind != "cap" else "Обхват головы",
                   "Состав ткани", "Фото из отзывов: качество печати и вышивки логотипов", "Цена нужного размера и цвета"],
    }
    supplier = {"lot": f"https://www.aliexpress.us/item/{pid}.html", "variant": "цвет и размер покупателя",
                "cost_rub": cost, "cost_usd": round(usd, 2),
                "price_note": ("цена без скидки новичка" if exact else "верхняя оценка: зачёркнутая цена, реальная может быть до двух раз ниже")
                              + "; aliexpress.com, курс 84,2",
                "orders": o["sold"], "rating": o["rating"], "sizeMap": {},
                "backup": [{"lot": f"https://www.aliexpress.us/item/{b}.html"} for b in backup], "checked": "2026-09-25"}
    site.append((product, supplier))
    table.append(dict(section=TEAM_NAME[team], name=title, kind={"tshirt": "футболка", "sweatshirt": "кофта", "cap": "кепка"}[kind],
                      team=team, price=cost, usd=round(usd, 2), promo_usd=None if exact else "есть", sold=o["sold"], rating=o["rating"],
                      title=o["title"], img=o["img"], url=supplier["lot"], exact=exact,
                      note=note + ("" if exact else " Цена — верхняя оценка.") + (f" Запасной: {', '.join(backup)}." if backup else "")))
json.dump(site, open(SCR + "site/team_merch.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
json.dump(table, open(SCR + "merch/picks.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
for (p, s), t in zip(site, table):
    print(f"{p['slug']:32} {t['price']:>5}{'' if t['exact'] else '*'} → {p['price']:>5}  {t['sold']:>5} {t['rating'] or '-'}  {p['story']}")
