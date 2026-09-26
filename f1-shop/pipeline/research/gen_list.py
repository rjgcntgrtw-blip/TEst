import json, re, sys
rows = [r for r in json.load(open("items.json")) if r["f1"]]
fmt = lambda n: f"{n:,}".replace(",", " ")
site = lambda r: "ru" if "aliexpress.ru" in r["url"] else "com"
ACC = re.compile(r"wall|frame|mount|stand\b|hook|poster|LED light|display (?:case|box|stand|rack|frame|board)|dustproof|wallboard|bracket|parts|tire|motor|battery|шины|подставк|витрин", re.I)
CLONE = re.compile(r"1361|1639|1915|1432|1675|42207|42206|42171|42141|7724\d|compatible|MK6\d\d\d|mould king|JKC|KAVO|совмест|speed champions|MOC", re.I)
LIC_KIT = re.compile(r"cada|rastar", re.I)

def seg(r):
    t = r["title"]
    if r["kind"] == "LEGO" and re.match(r"LEGO \d{5}", t):
        return "lego"
    if ACC.search(t) or r["kind"] == "LEGO":
        return None
    if r["kind"] == "Конструктор":
        return "kit_lic" if LIC_KIT.search(t) else "replica"
    if r["kind"] == "Р/у":
        return "rc"
    s = r["scale"]
    if s in ("1:8", "1:10", "1:12", "1:14", "1:16"):
        return "big"
    return {"1:43": "43", "1:24": "24", "1:18": "18", "1:64": "64"}.get(s, "other")

names = [("43", "Готовые модели 1:43"), ("24", "Готовые модели 1:24"), ("18", "Готовые модели 1:18"), ("64", "Готовые модели 1:64"),
         ("big", "Крупные масштабы 1:8–1:16"), ("rc", "Радиоуправляемые"), ("kit_lic", "Конструкторы с лицензией (CaDA, Rastar)"),
         ("lego", "Оригинальный LEGO"), ("replica", "Реплики LEGO и MOC-конструкторы"), ("other", "Масштаб не указан")]
groups = {}
for r in rows:
    k = seg(r)
    if k:
        groups.setdefault(k, []).append(r)
out = []
total = 0
for k, name in names:
    lst = sorted(groups.get(k, []), key=lambda r: (-r["sold"], r["price"]))
    if not lst:
        continue
    total += len(lst)
    out.append(f"## {name} — {len(lst)}\n")
    out.append("| Товар | Цена | Заказов | ★ | Лот |\n|---|---|---|---|---|")
    for r in lst:
        flag = "" if r["brand"] else " ⚠️"
        out.append(f"| {r['title'][:90].replace('|', '/')}{flag} | {fmt(r['price'])} ₽ | {fmt(r['sold'])}{'+' if site(r)=='com' and r['sold']>=1000 else ''} | {r['rating'] or '—'} | [{site(r)}]({r['url']}) |")
    out.append("")
body = "\n".join(out)
json.dump({k: len(v) for k, v in groups.items()}, sys.stdout, ensure_ascii=False); print()
open("models-list.md", "w").write(body)
print(total)
