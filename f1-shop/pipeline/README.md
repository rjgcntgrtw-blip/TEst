# Рабочие скрипты и сырые данные

Всё, чем собирались исследование AliExpress, таблица ассортимента и карточки сайта. Готовые результаты лежат
в `f1-shop/data/` и `site/content/products/`; здесь — как их пересобрать.

Скрипты сами находят корень репозитория, запускать можно из любой копии. Нужны Python 3 (`openpyxl`, `Pillow`)
и Node.js с Playwright (`npm i -g playwright`, запускать с `NODE_PATH=$(npm root -g)`).

## Папки

| Папка | Что внутри |
|---|---|
| `research/` | Первое исследование моделей: скрейперы выдачи (`scrape.js` — aliexpress.ru, `scrape_com.js` — aliexpress.com), запросы `queries*.json`, сырые выдачи `raw*.json`, разбор `analyze.py` → `items.json`, отчёты `report2.py`, `gen_list.py` |
| `merch/` | Мерч и реплики 1:8: запросы `queries*.json` и выдачи `raw*.json` (1 — общий мерч, 3 — команды, 4 — Норрис 1:24 и реплики, 5 — пилоты и спонсоры прошлых сезонов), разборы `analyze.py`, `team_merch.py`, `past_merch.py`, `kits.py`, финальный выбор `final_team.py`, превью `sheet*.py` |
| `lots/` | Сборка таблицы `tmff-assortment.xlsx`: `build_xlsx2.py`, промежуточные `assortment.json`, `kits_pick.json`, `dedup.json` |
| `site/` | Карточки сайта: `gen_products.py` (модели, постеры, реплики, CaDA, мерч), `make_kits.py`, `stories_new.py` (истории сезонов), `gen_photo_task.py` (задание на фото) |
| `r3d/` | 3D-заглушки болидов для проверки обработки фото (three.js + Playwright) |
| `checks/` | Прогон сайта в браузере: `flow.js` (интро, поиск, корзина, оформление, адреса товаров), `team.js` (фильтр команд) |

## Как пересобрать

```bash
# 1. Выдача AliExpress (медленно: пауза 2–3 мин между запросами; при капче скрипт останавливается — не обходить)
cd f1-shop/pipeline/merch && GAP=150000 NODE_PATH=$(npm root -g) node scrape_com.js queries3.json raw3.json

# 2. Разбор и выбор
python3 f1-shop/pipeline/merch/kits.py          # реплики 1:8 -> kits_all.json
python3 f1-shop/pipeline/site/make_kits.py      # выбранные реплики и CaDA -> site/kits.json, lots/kits_pick.json
python3 f1-shop/pipeline/merch/final_team.py    # мерч -> merch/picks.json, site/team_merch.json

# 3. Таблица (после сборки пересчитать формулы в LibreOffice или Excel)
python3 f1-shop/pipeline/lots/build_xlsx2.py

# 4. Карточки сайта и задание на фото
python3 f1-shop/pipeline/site/gen_products.py
python3 f1-shop/pipeline/site/gen_photo_task.py
cd site && npm run catalog && npm run build
```

## Что важно помнить

- **Цены aliexpress.com.** Если в выдаче написано «New shoppers save $X» или «New shoppers − $X», показанная цена —
  только для первого заказа. Скрипты берут зачёркнутую цену (показанная + X) как верхнюю оценку и помечают её.
  По 49 лотам, где видны обе цены, обычная цена в половине случаев равна зачёркнутой, в другой половине — примерно вдвое ниже.
- **Капча.** Страницы лотов aliexpress.ru и .com закрыты капчей для облачной сессии. Её не обходим: данные вариантов
  собирает Claude в Chrome по заданиям `f1-shop/data/*-to-check.md` и `photos-to-collect.md`.
- **Ливреи и выбор моделей** — решения владельца зашиты в `lots/build_xlsx2.py` (`livery_of`, `removed_reason`).
