#!/bin/bash
# Сбор с паузами: если поиск заблокирован, ждём 10 минут и продолжаем (до 3 раз). Капчу не обходим.
cd "$(dirname "$0")"
export NODE_PATH=$(npm root -g) GAP=150000
for attempt in 1 2 3 4; do
  node scrape_com.js queries3.json raw3.json >> scrape3.log 2>&1
  left=$(python3 -c "import json;q=json.load(open('queries3.json'));r=json.load(open('raw3.json'));print(sum(1 for x in q if not r.get(x)))")
  echo "attempt $attempt done, left $left" >> scrape3.log
  [ "$left" = "0" ] && break
  sleep 600
done
echo FINISHED >> scrape3.log
