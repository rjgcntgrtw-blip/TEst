import csv, json, re, statistics
rows = [r for r in json.load(open("items.json")) if r["f1"]]
fmt = lambda n: f"{n:,}".replace(",", " ")
site = lambda r: "ru" if "aliexpress.ru" in r["url"] else "com"
ACCESSORY = re.compile(r"display|wall|frame|mount|stand|hook|poster|LED|case|box for|wallboard|bracket|parts|tire|шины", re.I)
CLONE = re.compile(r"1361|1639|1915|1432|42207|42206|compatible|MK60\d\d|JKC|KAVO|совмест", re.I)

def table(lst, limit=10):
    if not lst:
        return "_Ничего подходящего не нашлось._\n"
    med_p = statistics.median(r["price"] for r in lst)
    med_s = statistics.median(r["sold"] for r in lst)
    out = ["| | Товар | Цена на Ali | Заказов | Рейтинг | Цена у нас | Прибыль с шт. | Лот |", "|---|---|---|---|---|---|---|---|"]
    for r in sorted(lst, key=lambda r: (-r["sold"], r["price"]))[:limit]:
        branded = bool(r["brand"])
        star = "✅" if branded and r["sold"] >= med_s and r["price"] <= med_p and r["sold"] >= 50 else "" if branded else "⚠️"
        out.append(f"| {star} | {r['title'][:75]} | {fmt(r['price'])} ₽ | {fmt(r['sold'])}{'+' if site(r)=='com' and r['sold']>=1000 else ''} | {r['rating'] or '—'} | {fmt(r['retail'])} ₽ | {fmt(r['profit'])} ₽ | [{site(r)}]({r['url']}) |")
    return "\n".join(out) + "\n"

ready = lambda r: r["kind"] == "Готовая модель"
seg = {
    "43": [r for r in rows if ready(r) and r["scale"] == "1:43"],
    "24": [r for r in rows if ready(r) and r["scale"] == "1:24"],
    "18": [r for r in rows if ready(r) and r["scale"] == "1:18" and r["price"] > 1000],
    "64": [r for r in rows if ready(r) and r["scale"] == "1:64"],
    "big": [r for r in rows if r["scale"] in ("1:8", "1:10", "1:12") and r["kind"] in ("Готовая модель", "Р/у") and not CLONE.search(r["title"])],
    "lego": [r for r in rows if r["kind"] == "LEGO" and re.match(r"LEGO \d{5}", r["title"])],
    "lic": [r for r in rows if r["kind"] == "Конструктор" and re.search(r"cada|rastar", r["title"], re.I) and not ACCESSORY.search(r["title"])],
    "clone": [r for r in rows if r["kind"] == "Конструктор" and CLONE.search(r["title"]) and not re.search(r"cada|rastar", r["title"], re.I)],
    "acc": [r for r in rows if ACCESSORY.search(r["title"]) and re.search(r"lego|technic", r["title"], re.I)],
}
out = {k: table(v) for k, v in seg.items()}
json.dump(out, open("tables.json", "w"), ensure_ascii=False)
for k, v in seg.items():
    print(k, len(v))
with open("f1-items.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["Тип", "Масштаб", "Бренд", "Товар", "Цена на Ali, ₽", "Старая цена, ₽", "Скидка, %", "Заказов", "Рейтинг", "Цена у нас, ₽", "Прибыль с шт., ₽", "Сайт", "Ссылка", "Запрос"])
    for r in sorted(rows, key=lambda r: (r["kind"], r["scale"], -r["sold"])):
        w.writerow([r["kind"], r["scale"], r["brand"], r["title"], r["price"], r["old"] or "", r["disc"] or "", r["sold"], r["rating"] or "", r["retail"], r["profit"], site(r), r["url"], r["query"]])
print(len(rows), "rows in csv")
