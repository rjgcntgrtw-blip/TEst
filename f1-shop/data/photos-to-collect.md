# Задание: ссылки на фото товаров

Выполняет Claude в Chrome на компьютере владельца. Облачной сессии страницы лотов закрыты капчей.
Если появится капча — остановись и попроси пользователя пройти её вручную, потом продолжай.

## Что сделать

Для каждого лота ниже:
1. Открой ссылку.
2. Для каждой строки таблицы выбери указанный вариант (модель, пилот, дизайн).
3. Запиши ссылки на **все фото галереи этого варианта** в полном размере: открой каждое фото и возьми `src` картинки
   без суффиксов вида `_220x220.jpg` (нужен оригинал, обычно от 800 px).
4. Отдельно найди фото **коробки** — в галерее или в отзывах покупателей с фото. Лучше реальное фото из отзыва.

Результат сохрани в `f1-shop/data/photo-urls.csv` (UTF-8, разделитель — запятая):

```
slug,роль,url,откуда
redbull-rb21-verstappen-1-43,main,https://ae-pic-a1.aliexpress-media.com/kf/....jpg,галерея
redbull-rb21-verstappen-1-43,01,https://...,галерея
redbull-rb21-verstappen-1-43,box,https://...,отзыв
```

- `роль`: `main` — главное фото (3/4 спереди, если есть), `01`, `02`… — другие ракурсы, `box` — коробка.
- Не бери фото с коллажами, стрелками, надписями поверх и фото других моделей из того же лота.
- Для одежды — фото вещи спереди и сзади, крупно принт; фото на человеке тоже подходят.

Потом закоммить файл и запушь в ветку `claude/test-h284oh`. Облачная сессия скачает фото, уберёт фон,
соберёт кадры «модель + коробка» и обновит сайт.

## Лоты

### https://aliexpress.ru/item/1005010208755468.html

| slug | Вариант в лоте | Товар |
|---|---|---|
| `alpine-a525-colapinto-monaco-1-43` | 2025 A525-43MC | Alpine A525 · Колапинто — Франко Колапинто #43 · сезон 2025 · ГП Монако |
| `alpine-a525-gasly-monaco-1-43` | 2025 A525-10MC | Alpine A525 · Гасли — Пьер Гасли #10 · сезон 2025 · ГП Монако |
| `aston-amr25-alonso-1-43` | 2025 AMR25-14 | Aston Martin AMR25 · Алонсо — Фернандо Алонсо #14 · сезон 2025 |
| `aston-amr25-stroll-1-43` | 2025 AMR25-18 | Aston Martin AMR25 · Стролл — Лэнс Стролл #18 · сезон 2025 |
| `ferrari-sf-25-hamilton-1-43` | 2025 SF25-44 | Ferrari SF-25 · Хэмилтон — Льюис Хэмилтон #44 · сезон 2025 |
| `mclaren-mcl39-norris-1-43` | 2025 MCL39-4 | McLaren MCL39 · Норрис — Ландо Норрис #4 · сезон 2025 |
| `mclaren-mcl39-piastri-1-43` | 2025 MCL39-81 | McLaren MCL39 · Пиастри — Оскар Пиастри #81 · сезон 2025 |
| `mercedes-w16-antonelli-1-43` | 2025 W16 E-12 | Mercedes W16 · Антонелли — Кими Антонелли #12 · сезон 2025 |
| `mercedes-w16-russell-1-43` | 2025 W16 E-63 | Mercedes W16 · Рассел — Джордж Рассел #63 · сезон 2025 |
| `redbull-rb21-verstappen-1-43` | 2025 RB21-1BHR | Red Bull RB21 · Ферстаппен — Макс Ферстаппен #1 · сезон 2025 |

### https://aliexpress.ru/item/1005010633502926.html

| slug | Вариант в лоте | Товар |
|---|---|---|
| `aston-amr25-alonso-1-24` | 1-24 2025 AMR25-14 | Aston Martin AMR25 · Алонсо — Фернандо Алонсо #14 · сезон 2025 |
| `aston-amr25-stroll-1-24` | 1-24 2025 AMR25-18 | Aston Martin AMR25 · Стролл — Лэнс Стролл #18 · сезон 2025 |
| `ferrari-sf-24-leclerc-1-24` | 1-24 2024 SF24-16 | Ferrari SF-24 · Леклер — Шарль Леклер #16 · сезон 2024 |
| `ferrari-sf-24-sainz-1-24` | 1-24 2024 SF24-55 | Ferrari SF-24 · Сайнс — Карлос Сайнс #55 · сезон 2024 |
| `redbull-rb20-verstappen-1-24` | 1-24 2024 RB20-1 | Red Bull RB20 · Ферстаппен — Макс Ферстаппен #1 · сезон 2024 |

### https://www.aliexpress.us/item/3256811986486740.html

| slug | Вариант в лоте | Товар |
|---|---|---|
| `cada-alpine-a525-1-24` | — | BWT Alpine A525 · CaDA — Конструктор 1:24 · официальная лицензия |

### https://www.aliexpress.us/item/3256807694767657.html

| slug | Вариант в лоте | Товар |
|---|---|---|
| `cada-sauber-c44-1-24` | — | Kick Sauber C44 · CaDA — Конструктор 1:24 · официальная лицензия |

### https://aliexpress.ru/item/1005009397158416.html

| slug | Вариант в лоте | Товар |
|---|---|---|
| `ferrari-sf-24-leclerc-lettering-1-24` | 1-24 2024 SF24-161 | Ferrari SF-24 · Леклер — Шарль Леклер #16 · сезон 2024 · с надписью Leclerc |
| `redbull-rb19-verstappen-usa-1-24` | 1-24 2023 RB19-1USA | Red Bull RB19 · Ферстаппен — Макс Ферстаппен #1 · сезон 2023 · ГП США |

### https://aliexpress.ru/item/1005010208916818.html

| slug | Вариант в лоте | Товар |
|---|---|---|
| `ferrari-sf-25-hamilton-miami-1-43` | 44-HAM-Miami | Ferrari SF-25 · Хэмилтон — Льюис Хэмилтон #44 · сезон 2025 · ГП Майами |
| `ferrari-sf-25-leclerc-1-43` | 16-LEC | Ferrari SF-25 · Леклер — Шарль Леклер #16 · сезон 2025 |
| `ferrari-sf-25-leclerc-miami-1-43` | 16-LEC-Miami | Ferrari SF-25 · Леклер — Шарль Леклер #16 · сезон 2025 · ГП Майами |
| `redbull-rb21-tsunoda-1-43` | 22-TSU-Bahrain | Red Bull RB21 · Цунода — Юки Цунода #22 · сезон 2025 |
| `redbull-rb21-tsunoda-white-1-43` | 22-TSU-Japan | Red Bull RB21 · Цунода — Юки Цунода #22 · сезон 2025 · белая, ГП Японии |
| `redbull-rb21-verstappen-white-1-43` | 1-VER-Japan | Red Bull RB21 · Ферстаппен — Макс Ферстаппен #1 · сезон 2025 · белая, ГП Японии |

### https://aliexpress.ru/item/1005013123378832.html

| slug | Вариант в лоте | Товар |
|---|---|---|
| `ferrari-sf-26-hamilton-1-43` | 2026 SF26-44 | Ferrari SF-26 · Хэмилтон — Льюис Хэмилтон #44 · сезон 2026 |
| `ferrari-sf-26-leclerc-1-43` | 2026 SF26-16 | Ferrari SF-26 · Леклер — Шарль Леклер #16 · сезон 2026 |

### https://aliexpress.ru/item/1005008619594051.html

| slug | Вариант в лоте | Товар |
|---|---|---|
| `mclaren-mcl38-norris-1-24` | Норрис #4 — выбрать в лоте | McLaren MCL38 · Норрис — Ландо Норрис #4 · сезон 2024 |

### https://aliexpress.ru/item/1005009081001375.html

| slug | Вариант в лоте | Товар |
|---|---|---|
| `mclaren-mcl38-piastri-1-24` | 1-24 2024 MCL38-81 | McLaren MCL38 · Пиастри — Оскар Пиастри #81 · сезон 2024 |
| `mercedes-w15-hamilton-1-24` | 1-24 2024 W15-44 | Mercedes W15 · Хэмилтон — Льюис Хэмилтон #44 · сезон 2024 |
| `mercedes-w15-russell-1-24` | 1-24 2024 W15-63 | Mercedes W15 · Рассел — Джордж Рассел #63 · сезон 2024 |
| `redbull-rb20-perez-1-24` | 1-24 2024 RB20-11 | Red Bull RB20 · Перес — Серхио Перес #11 · сезон 2024 |

### https://aliexpress.ru/item/1005013034982313.html

| slug | Вариант в лоте | Товар |
|---|---|---|
| `mercedes-w17-antonelli-1-43` | 2026 W17-12 | Mercedes W17 · Антонелли — Кими Антонелли #12 · сезон 2026 |
| `mercedes-w17-russell-1-43` | 2026 W17-63 | Mercedes W17 · Рассел — Джордж Рассел #63 · сезон 2026 |

### https://www.aliexpress.us/item/3256810563498806.html

| slug | Вариант в лоте | Товар |
|---|---|---|
| `merch-aston-cap-14-2025` | цвет и размер покупателя | Кепка Aston Martin · Алонсо 14 — Реплика командной формы · 2025 |

### https://www.aliexpress.us/item/3256810450913724.html

| slug | Вариант в лоте | Товар |
|---|---|---|
| `merch-aston-tee-14-2025` | цвет и размер покупателя | Футболка Aston Martin · Алонсо 14 — Реплика командной формы · 2025 |

### https://www.aliexpress.us/item/3256812330001421.html

| slug | Вариант в лоте | Товар |
|---|---|---|
| `merch-audi-polo-2026` | цвет и размер покупателя | Поло Audi — Реплика командной формы · 2026 |

### https://www.aliexpress.us/item/3256812746522986.html

| slug | Вариант в лоте | Товар |
|---|---|---|
| `merch-ferrari-cap-44-2026` | цвет и размер покупателя | Кепка Ferrari · Хэмилтон 44 — Реплика командной формы · 2026 |

### https://www.aliexpress.us/item/3256812920506215.html

| slug | Вариант в лоте | Товар |
|---|---|---|
| `merch-ferrari-hoodie-44-2026` | цвет и размер покупателя | Худи Ferrari · Хэмилтон 44 — Реплика командной формы · 2026 |

### https://www.aliexpress.us/item/3256811662651987.html

| slug | Вариант в лоте | Товар |
|---|---|---|
| `merch-ferrari-tee-44-2026` | цвет и размер покупателя | Футболка Ferrari · Хэмилтон 44 — Реплика командной формы · 2026 |

### https://www.aliexpress.us/item/3256810225332254.html

| slug | Вариант в лоте | Товар |
|---|---|---|
| `merch-haas-hoodie-2025` | цвет и размер покупателя | Худи Haas — Реплика командной формы · 2025 |

### https://www.aliexpress.us/item/3256811709065122.html

| slug | Вариант в лоте | Товар |
|---|---|---|
| `merch-mclaren-cap-4-2025` | цвет и размер покупателя | Кепка McLaren · Норрис 4 — Реплика командной формы · 2025 |

### https://www.aliexpress.us/item/3256812246454688.html

| slug | Вариант в лоте | Товар |
|---|---|---|
| `merch-mclaren-polo-1-2026` | цвет и размер покупателя | Поло McLaren · Норрис 1 — Реплика командной формы · 2026 |

### https://www.aliexpress.us/item/3256811671431441.html

| slug | Вариант в лоте | Товар |
|---|---|---|
| `merch-mclaren-tee-4-2025` | цвет и размер покупателя | Футболка McLaren · Норрис 4 — Реплика командной формы · 2025 |

### https://www.aliexpress.us/item/3256809407682033.html

| slug | Вариант в лоте | Товар |
|---|---|---|
| `merch-mercedes-fleece-2025` | цвет и размер покупателя | Флисовая кофта Mercedes — Реплика командной формы · 2025 |

### https://www.aliexpress.us/item/3256812852478104.html

| slug | Вариант в лоте | Товар |
|---|---|---|
| `merch-mercedes-tee-63-2026` | цвет и размер покупателя | Футболка Mercedes · Рассел 63 — Реплика командной формы · 2026 |

### https://www.aliexpress.us/item/3256812755115298.html

| slug | Вариант в лоте | Товар |
|---|---|---|
| `merch-redbull-cap-1-2025` | цвет и размер покупателя | Кепка Red Bull Racing · Ферстаппен 1 — Реплика командной формы · 2025 |

### https://www.aliexpress.us/item/3256812911521129.html

| slug | Вариант в лоте | Товар |
|---|---|---|
| `merch-redbull-tee-3-2026` | цвет и размер покупателя | Футболка Red Bull Racing · Ферстаппен 3 — Реплика командной формы · 2026 |

### https://www.aliexpress.us/item/3256810520757898.html

| slug | Вариант в лоте | Товар |
|---|---|---|
| `merch-williams-cap-55-2025` | цвет и размер покупателя | Кепка Williams · Сайнс 55 — Реплика командной формы · 2025 |

### https://www.aliexpress.us/item/3256812143727223.html

| slug | Вариант в лоте | Товар |
|---|---|---|
| `merch-williams-polo-55-2026` | цвет и размер покупателя | Поло Williams · Сайнс 55 — Реплика командной формы · 2026 |

### https://www.aliexpress.us/item/3256812151916721.html

| slug | Вариант в лоте | Товар |
|---|---|---|
| `merch-williams-tee-55-2026` | цвет и размер покупателя | Футболка Williams · Сайнс 55 — Реплика командной формы · 2026 |

### https://aliexpress.ru/item/1005005851892159.html

| slug | Вариант в лоте | Товар |
|---|---|---|
| `poster-brawn-bgp001` | SKU-12 / <размер> no frame | Постер Brawn BGP001 — Холст, без рамки |
| `poster-ferrari-312t` | SKU-18 / <размер> no frame | Постер Ferrari 312T — Холст, без рамки |
| `poster-ferrari-643` | SKU-13 / <размер> no frame | Постер Ferrari 643 — Холст, без рамки |
| `poster-ferrari-f2007` | SKU-15 / <размер> no frame | Постер Ferrari F2007 — Холст, без рамки |
| `poster-jordan-191` | SKU-7 / <размер> no frame | Постер Jordan 191 — Холст, без рамки |
| `poster-lotus-98t` | SKU-4 / <размер> no frame | Постер Lotus 98T — Холст, без рамки |
| `poster-lotus-99t` | SKU-6 / <размер> no frame | Постер Lotus 99T — Холст, без рамки |
| `poster-mclaren-m23` | SKU-1 / <размер> no frame | Постер McLaren M23 — Холст, без рамки |
| `poster-mclaren-mcl34` | SKU-3 / <размер> no frame | Постер McLaren MCL34 — Холст, без рамки |
| `poster-mclaren-mp4-23` | SKU-2 / <размер> no frame | Постер McLaren MP4-23 — Холст, без рамки |
| `poster-mclaren-mp4-4` | SKU-10 / <размер> no frame | Постер McLaren MP4/4 — Холст, без рамки |
| `poster-mclaren-mp4-5b` | SKU-9 / <размер> no frame | Постер McLaren MP4/5B — Холст, без рамки |
| `poster-mclaren-mp4-6` | SKU-11 / <размер> no frame | Постер McLaren MP4/6 — Холст, без рамки |
| `poster-mercedes-w10` | SKU-8 / <размер> no frame | Постер Mercedes W10 — Холст, без рамки |
| `poster-red-bull-rb16` | SKU-5 / <размер> no frame | Постер Red Bull RB16 — Холст, без рамки |
| `poster-red-bull-rb7` | SKU-20 / <размер> no frame | Постер Red Bull RB7 — Холст, без рамки |
| `poster-renault-r25` | SKU-14 / <размер> no frame | Постер Renault R25 — Холст, без рамки |
| `poster-schumacher-ferrari-japan` | SKU-21 / <размер> no frame | Постер Шумахер, Ferrari — японский стиль — Холст, без рамки |
| `poster-toleman-tg184` | SKU-19 / <размер> no frame | Постер Toleman TG184 — Холст, без рамки |
| `poster-toro-rosso-str14` | SKU-17 / <размер> no frame | Постер Toro Rosso STR14 — Холст, без рамки |
| `poster-toro-rosso-str3` | SKU-16 / <размер> no frame | Постер Toro Rosso STR3 — Холст, без рамки |

### https://www.aliexpress.us/item/3256812956829803.html

| slug | Вариант в лоте | Товар |
|---|---|---|
| `replica-aston-amr25-1-8` | Mould King MK6022, 1912 деталей | Aston Martin AMR25 · реплика 1:8 — Конструктор, 1 912 деталей |

### https://www.aliexpress.us/item/3256811400880844.html

| slug | Вариант в лоте | Товар |
|---|---|---|
| `replica-ferrari-sf24-1-8` | SF-24, 1361 деталь | Ferrari SF-24 · реплика 1:8 — Конструктор, 1 361 деталь |
| `replica-mclaren-mcl39-1-8` | MCL39, 1675 деталей | McLaren MCL39 · реплика 1:8 — Конструктор, 1 675 деталей |
| `replica-redbull-rb20-1-8` | RB20, 1639 деталей | Red Bull RB20 · реплика 1:8 — Конструктор, 1 639 деталей |

### https://www.aliexpress.us/item/3256812722545307.html

| slug | Вариант в лоте | Товар |
|---|---|---|
| `replica-ferrari-sf25-1-8` | SF-25, 1915 деталей | Ferrari SF-25 · реплика 1:8 — Конструктор, 1 915 деталей |

### https://www.aliexpress.us/item/3256812982547966.html

| slug | Вариант в лоте | Товар |
|---|---|---|
| `replica-mercedes-w14-1-8` | W14 E, 1642 детали | Mercedes W14 · реплика 1:8 — Конструктор, 1 642 детали |

### https://www.aliexpress.us/item/3256812495260677.html

| slug | Вариант в лоте | Товар |
|---|---|---|
| `replica-redbull-rb21-1-8` | RB21 White, 1900+ деталей | Red Bull RB21 · реплика 1:8 — Конструктор, 1 900 деталей |
