"""Мерч в стиле командной формы: разбор всех выдач, короткий список по команде и вещи."""
from pathlib import Path as _Path

PIPE = str(_Path(__file__).resolve().parents[1]) + "/"  # f1-shop/pipeline/
REPO = str(_Path(__file__).resolve().parents[3]) + "/"  # корень репозитория
import json
import math
import re
from collections import defaultdict

SCR = PIPE + "merch/"
USD = 84.2
FILES = ["raw.json", "raw3.json"]

KIND = [("cap", r"\bcaps?\b|\bhats?\b|snapback|trucker|baseball|beanie"),
        ("sweatshirt", r"hoodie|hoody|sweatshirt|pullover|zip[- ]?up|softshell|soft shell|jacket|fleece|windbreaker"),
        ("tshirt", r"t-?shirts?|\btees?\b|\bshirts?\b|jersey|polo|\btops?\b")]
TEAM = [("ferrari", r"ferrari|scuderia|leclerc|hamilton|\blh ?44\b"), ("redbull", r"red ?bull|verstappen|oracle|hadjar"),
        ("mclaren", r"mclaren|norris|piastri|papaya|\bln ?[14]\b"), ("mercedes", r"mercedes|\bamg\b|petronas|russell?\b|antonelli"),
        ("aston", r"aston ?martin|alonso|aramco|stroll"), ("williams", r"williams|albon|sainz"),
        ("alpine", r"alpine|gasly|colapinto"), ("audi", r"\baudi\b|sauber|hulkenberg|bortoleto"),
        ("racingbulls", r"racing bulls|visa cash|\brb f1\b|lawson"), ("haas", r"\bhaas\b|ocon|bearman"),
        ("cadillac", r"cadillac")]
NOT = re.compile(r"custom|personali|\bdiy\b|kids?\b|child|boy'?s|girl|baby|toddler|vintage|graphic|funny|meme|anime|cartoon|"
                 r"harajuku|y2k|senna|schumacher|lauda|blanket|sticker|keychain|mug|steering|emblem|badge|shoes|sneaker|"
                 r"socks|button|wheel|car seat|model|diecast|lego|block|poster|flag\b|women'?s only|hockey|heated rivalry|benz|perez|checo", re.I)
OFFICIAL = re.compile(r"team|jersey|uniform|racing suit|race suit|polo|oracle|petronas|aramco|replica|official|softshell|"
                      r"driver|2025|2026|special edition|fans?\b|racing", re.I)
MERC_OLD = re.compile(r"mercedes|petronas|amg", re.I)

obs = {}
for f in FILES:
    for q, lst in json.load(open(SCR + f)).items():
        for it in lst:
            t = it["text"]
            i = t.find("$")
            if i < 0:
                continue
            title = t[:i].strip()
            m = re.search(r"/item/(\d+)", it.get("href", ""))
            pid = m.group(1) if m else it["id"]
            pr = [float(x.replace(",", "")) for x in re.findall(r"\$(\d[\d,]*\.?\d*)", t[i:i + 60])]
            ns = re.search(r"New shoppers (?:save|-) \$([\d,]+\.?\d*)", t)
            so = re.search(r"([\d,]+)\+? sold", t)
            rt = re.search(r"(?<![\d.$])([1-5]\.\d) [\d,]+\+? sold", t)
            o = obs.setdefault(pid, dict(id=pid, title=title[:160], plain=[], upper=[], sold=0, rating=None, img=it.get("img"), q=set()))
            if ns:
                o["upper"].append(pr[0] + float(ns.group(1).replace(",", "")))
            else:
                o["plain"].append(pr[0])
            o["sold"] = max(o["sold"], int(so.group(1).replace(",", "")) if so else 0)
            if rt:
                o["rating"] = float(rt.group(1))
            o["q"].add(q)

rows = []
for o in obs.values():
    title = o["title"]
    kind = next((k for k, rx in KIND if re.search(rx, title, re.I)), None)
    teams = [k for k, rx in TEAM if re.search(rx, title, re.I)]
    if not kind or not teams or NOT.search(title) or not OFFICIAL.search(title):
        continue
    if "ferrari" in teams and "mercedes" in teams and re.search(r"hamilton", title, re.I):
        teams = ["mercedes"] if MERC_OLD.search(title) else ["ferrari"]
    if len(teams) > 1:
        continue
    usd = min(o["plain"]) if o["plain"] else max(o["upper"])
    rows.append(dict(o, q=sorted(o["q"]), kind=kind, team=teams[0], usd=round(usd, 2), price=round(usd * USD),
                     exact=bool(o["plain"])))


def score(r):
    return (r["sold"] + 5) * (r["rating"] or 4.5) ** 2 / math.sqrt(max(r["price"], 400))


short = defaultdict(list)
for r in rows:
    if r["rating"] is not None and r["rating"] < 4.0:
        continue
    short[(r["team"], r["kind"])].append(r)
out = []
for key in sorted(short):
    lst = sorted(short[key], key=score, reverse=True)[:4]
    print("=====", key)
    for r in lst:
        print(f"  {r['id']} {r['price']:>5}{'' if r['exact'] else '*'} ₽ {r['sold']:>5} {r['rating'] or '-':>4} | {r['title'][:100]}")
        out.append(r)
json.dump(out, open(SCR + "team_short.json", "w"), ensure_ascii=False, indent=1)
print(len(out), "в коротком списке")
