"""Отбор кандидатов в мерч: лучшие по заказам при нормальном рейтинге, по типу вещи и команде."""
import json
import re
from collections import defaultdict

rows = json.load(open("items.json"))
WEAR = {"cap", "tshirt", "hoodie", "polo"}
TEAM_ORDER = ["ferrari", "redbull", "mclaren", "mercedes", "aston", "alpine", "williams", "racingbulls", "haas", "audi",
              "cadillac", "multi", "legend", ""]
MIN_SOLD = 10


def ok(r):
    return (r["kind"] in WEAR and not r["kids"] and r["sold"] >= MIN_SOLD
            and (r["rating"] is None or r["rating"] >= 4.5) and r["risk"] != "нет F1 в названии")


def score(r):
    return r["sold"] * (r["rating"] or 4.6) / max(r["price"], 300) ** 0.5


groups = defaultdict(list)
for r in rows:
    if ok(r):
        groups[(r["kind"], r["team"], r["risk"])].append(r)

picks = []
for (kind, team, risk), lst in groups.items():
    lst.sort(key=score, reverse=True)
    n = 2 if team in ("", "legend") else 1
    if kind == "hoodie":
        n = 1
    if risk == "своя печать":
        n = 3
    for r in lst[:n]:
        picks.append(r)

# свои заготовки под печать TMFF — из запросов custom, даже если F1 в названии нет
blanks = [r for r in rows if r["query"].startswith("custom") and r["kind"] in WEAR and r["sold"] >= 50
          and (r["rating"] or 0) >= 4.6]
blanks.sort(key=score, reverse=True)
seen = {p["id"] for p in picks}
bk = defaultdict(int)
for r in blanks:
    if r["id"] in seen or bk[r["kind"]] >= 3:
        continue
    r = dict(r, risk="своя печать")
    bk[r["kind"]] += 1
    picks.append(r)

KORDER = ["tshirt", "hoodie", "polo", "cap"]
picks.sort(key=lambda r: (KORDER.index(r["kind"]), TEAM_ORDER.index(r["team"]) if r["team"] in TEAM_ORDER else 99,
                          r["risk"], -r["sold"]))
json.dump(picks, open("picks.json", "w"), ensure_ascii=False, indent=1)
print(len(picks), "кандидатов")
for r in picks:
    print(f"{r['kind']:6} {r['team'] or '-':10} {r['risk'][:18]:18} {r['price']:>5} {r['sold']:>6} {r['rating'] or '-':>4} {r['title'][:80]}")
