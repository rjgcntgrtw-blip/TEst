#!/bin/bash
# Поиск футболок и кепок Mercedes, Ferrari, Red Bull 2020+ через пилотов и спонсоров. При блокировке — пауза 10 минут.
cd "$(dirname "$0")"
export NODE_PATH=$(npm root -g) GAP=180000
[ -f raw5.json ] || echo '{}' > raw5.json
for attempt in 1 2 3 4 5 6; do
  [ "$attempt" = "1" ] && sleep 1200
  node scrape_com.js queries5.json raw5.json >> scrape5.log 2>&1
  l=$(python3 -c "import json;q=json.load(open('queries5.json'));r=json.load(open('raw5.json'));print(sum(1 for x in q if not r.get(x)))")
  echo "attempt $attempt, left $l" >> scrape5.log
  [ "$l" = "0" ] && break
  sleep 1800
done
echo FINISHED >> scrape5.log
