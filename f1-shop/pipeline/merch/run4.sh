#!/bin/bash
# Сначала Норрис 1:24 и реплики 1:8 (queries4), потом оставшийся мерч (queries3). При блокировке — пауза 10 минут.
cd "$(dirname "$0")"
export NODE_PATH=$(npm root -g) GAP=150000
left() { python3 -c "import json,sys;q=json.load(open(sys.argv[1]));r=json.load(open(sys.argv[2]));print(sum(1 for x in q if not r.get(x)))" "$1" "$2"; }
[ -f raw4.json ] || echo '{}' > raw4.json
for pair in "queries4.json raw4.json" "queries3.json raw3.json"; do
  set -- $pair
  for attempt in 1 2 3 4; do
    node scrape_com.js "$1" "$2" >> scrape3.log 2>&1
    l=$(left "$1" "$2")
    echo "$1 attempt $attempt, left $l" >> scrape3.log
    [ "$l" = "0" ] && break
    sleep 600
  done
done
echo FINISHED >> scrape3.log
