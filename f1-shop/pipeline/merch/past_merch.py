"""Футболки и кепки Mercedes, Ferrari, Red Bull 2020+ в стиле формы: разбор выдач и короткий список."""
from pathlib import Path as _Path

PIPE = str(_Path(__file__).resolve().parents[1]) + "/"  # f1-shop/pipeline/
REPO = str(_Path(__file__).resolve().parents[3]) + "/"  # корень репозитория
import json
import math
import re
from collections import defaultdict

SCR = PIPE + "merch/"
USD = 84.2
FILES = ["raw.json", "raw3.json", "raw5.json"]
TAKEN = {p["url"].rsplit("/", 1)[1].split(".")[0] for p in json.load(open(SCR + "picks.json"))}

KIND = [("cap", r"\bcaps?\b|\bhats?\b|snapback|trucker|baseball"),
        ("tshirt", r"t-?shirts?|\btees?\b|\bshirts?\b|jersey|polo|camiseta|\btops?\b")]
NOT = re.compile(r"custom|personali|\bdiy\b|kids?\b|child|boy'?s|girl|baby|toddler|vintage|graphic|funny|meme|anime|cartoon|"
                 r"harajuku|y2k|senna|schumacher|lauda|blanket|sticker|keychain|mug|steering|emblem|badge|shoes|sneaker|"
                 r"socks|button|wheel|car seat|model|diecast|lego|block|poster|flag\b|hockey|heated rivalry|benz|hoodie|"
                 r"sweatshirt|jacket|pants|shorts|dress|women'?s only|dog|pet\b|cycling helmet|wallet|bag\b|still we rise|"
                 r"football|soccer|basketball|baseball jersey|cotton print|oversized|tide|washed cotton", re.I)
STYLE = re.compile(r"team|jersey|uniform|racing suit|race suit|polo|oracle|petronas|scuderia|replica|official|driver|"
                   r"20(2[0-6])|special edition|quick.?dry|breathable|motorsport|racing", re.I)


def team_of(t):
    t0 = t.lower()
    year = re.search(r"20(2[0-6])", t0)
    y = int("20" + year.group(1)) if year else None
    if re.search(r"ferrari|scuderia|leclerc|charles|\bsf-?2\d", t0):
        return "ferrari", y
    if re.search(r"red ?bull|oracle|verstappen|\brb1[6-9]\b|\brb2\d\b|perez|pérez|checo", t0) and not re.search(r"cadillac", t0):
        return "redbull", y
    if re.search(r"mercedes|petronas|\bamg\b|russell?\b|bottas|antonelli|\bw1[1-7]\b", t0) and not re.search(r"benz", t0):
        return "mercedes", y
    if re.search(r"hamilton|\blh ?44\b", t0):
        return ("ferrari" if (y and y >= 2025) or re.search(r"\bred\b", t0) else "mercedes"), y
    if re.search(r"sainz|\b55\b", t0) and re.search(r"\bred\b", t0) and not re.search(r"williams|atlassian", t0):
        return "ferrari", y
    return None, y


obs = {}
for f in FILES:
    try:
        data = json.load(open(SCR + f))
    except FileNotFoundError:
        continue
    for q, lst in data.items():
        for it in lst:
            t = it["text"]
            i = t.find("$")
            if i < 0:
                continue
            title = t[:i].strip()
            pr = [float(x.replace(",", "")) for x in re.findall(r"\$(\d[\d,]*\.?\d*)", t[i:i + 60])]
            ns = re.search(r"New shoppers (?:save|-) \$([\d,]+\.?\d*)", t)
            so = re.search(r"([\d,]+)\+? sold", t)
            rt = re.search(r"(?<![\d.$])([1-5]\.\d) [\d,]+\+? sold", t)
            o = obs.setdefault(it["id"], dict(id=it["id"], title=title[:170], plain=[], upper=[], sold=0, rating=None, img=it.get("img"), q=set()))
            (o["upper"].append(pr[0] + float(ns.group(1).replace(",", ""))) if ns else o["plain"].append(pr[0]))
            o["sold"] = max(o["sold"], int(so.group(1).replace(",", "")) if so else 0)
            o["rating"] = float(rt.group(1)) if rt else o["rating"]
            o["q"].add(q)

rows = []
for o in obs.values():
    t = o["title"]
    kind = next((k for k, rx in KIND if re.search(rx, t, re.I)), None)
    team, year = team_of(t)
    if not kind or not team or NOT.search(t) or not STYLE.search(t) or o["id"] in TAKEN:
        continue
    if year and year < 2020:
        continue
    exact = bool(o["plain"])
    usd = min(o["plain"]) if exact else max(o["upper"])
    rows.append(dict(o, q=sorted(o["q"]), kind=kind, team=team, year=year, usd=round(usd, 2), price=round(usd * USD), exact=exact))


def score(r):
    return (r["sold"] + 3) * (r["rating"] or 4.5) ** 2 / math.sqrt(max(r["price"], 400))


groups = defaultdict(list)
for r in rows:
    if r["rating"] is not None and r["rating"] < 4.0:
        continue
    groups[(r["team"], r["kind"])].append(r)
short = []
for key in sorted(groups):
    lst = sorted(groups[key], key=score, reverse=True)[:14]
    print("=====", key, len(groups[key]))
    for r in lst:
        print(f"  {r['id']} {r['price']:>5}{'' if r['exact'] else '*'} ₽ {r['sold']:>5} {r['rating'] or '-':>4} {r['year'] or '----'} | {r['title'][:95]}")
        short.append(r)
json.dump(short, open(SCR + "past_short.json", "w"), ensure_ascii=False, indent=1)
print(len(short), "в коротком списке")
