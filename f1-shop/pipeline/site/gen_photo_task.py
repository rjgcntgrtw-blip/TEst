"""Задание для Claude в Chrome: собрать ссылки на фото вариантов для каждой карточки."""
from pathlib import Path as _Path

PIPE = str(_Path(__file__).resolve().parents[1]) + "/"  # f1-shop/pipeline/
REPO = str(_Path(__file__).resolve().parents[3]) + "/"  # корень репозитория
import json
import os
from collections import OrderedDict

CONTENT = REPO + "site/content/products/"
OUT = REPO + "f1-shop/data/photos-to-collect.md"

lots = OrderedDict()
for slug in sorted(os.listdir(CONTENT)):
    pf, sf = CONTENT + slug + "/product.json", CONTENT + slug + "/supplier.json"
    if not (os.path.exists(pf) and os.path.exists(sf)):
        continue
    p = json.load(open(pf, encoding="utf-8"))
    if p["status"] in ("placeholder", "hidden"):
        continue
    s = json.load(open(sf, encoding="utf-8"))
    lots.setdefault(s["lot"], []).append((slug, s.get("variant") or "—", p["title"], p.get("subtitle", "")))

order = {"model": 0, "merch": 1}
lines = [
    "# Задание: ссылки на фото товаров",
    "",
    "Выполняет Claude в Chrome на компьютере владельца. Облачной сессии страницы лотов закрыты капчей.",
    "Если появится капча — остановись и попроси пользователя пройти её вручную, потом продолжай.",
    "",
    "## Что сделать",
    "",
    "Для каждого лота ниже:",
    "1. Открой ссылку.",
    "2. Для каждой строки таблицы выбери указанный вариант (модель, пилот, дизайн).",
    "3. Запиши ссылки на **все фото галереи этого варианта** в полном размере: открой каждое фото и возьми `src` картинки",
    "   без суффиксов вида `_220x220.jpg` (нужен оригинал, обычно от 800 px).",
    "4. Отдельно найди фото **коробки** — в галерее или в отзывах покупателей с фото. Лучше реальное фото из отзыва.",
    "",
    "Результат сохрани в `f1-shop/data/photo-urls.csv` (UTF-8, разделитель — запятая):",
    "",
    "```",
    "slug,роль,url,откуда",
    "redbull-rb21-verstappen-1-43,main,https://ae-pic-a1.aliexpress-media.com/kf/....jpg,галерея",
    "redbull-rb21-verstappen-1-43,01,https://...,галерея",
    "redbull-rb21-verstappen-1-43,box,https://...,отзыв",
    "```",
    "",
    "- `роль`: `main` — главное фото (3/4 спереди, если есть), `01`, `02`… — другие ракурсы, `box` — коробка.",
    "- Не бери фото с коллажами, стрелками, надписями поверх и фото других моделей из того же лота.",
    "- Для одежды — фото вещи спереди и сзади, крупно принт; фото на человеке тоже подходят.",
    "",
    "Потом закоммить файл и запушь в ветку `claude/test-h284oh`. Облачная сессия скачает фото, уберёт фон,",
    "соберёт кадры «модель + коробка» и обновит сайт.",
    "",
    "## Лоты",
    "",
]
for lot, items in lots.items():
    lines.append(f"### {lot}")
    lines.append("")
    lines.append("| slug | Вариант в лоте | Товар |")
    lines.append("|---|---|---|")
    for slug, variant, title, sub in items:
        lines.append(f"| `{slug}` | {variant} | {title} — {sub} |")
    lines.append("")
open(OUT, "w", encoding="utf-8").write("\n".join(lines))
print(len(lots), "лотов,", sum(len(v) for v in lots.values()), "товаров ->", OUT)
