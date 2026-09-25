# Задание: сгенерировать в Higgsfield видео и фоны для сайта TMFF

Выполняет сессия Claude с доступом к Higgsfield. Результат — файлы в репозитории
`rjgcntgrtw-blip/TEst`, ветка **`claude/test-h284oh`**. Сайт сам подхватывает файлы по путям ниже при сборке:
если файла нет, показывается запасной вариант, так что можно загружать частями.

## Правила для всех картинок и видео

- **Только атмосфера**: фоны, свет, трасса, абстракция. **Никогда не генерировать сами товары** — модели болидов,
  одежду, коробки. Товары на сайте — только реальные фото.
- **Без логотипов и текста**: без F1, FIA, команд, спонсоров, номеров, надписей, узнаваемых ливрей. Каждый результат
  проверить глазами — генераторы любят дорисовывать буквы и эмблемы. Такие варианты не брать.
- По каждому пункту сделать 2–3 варианта и выбрать лучший. Все варианты сохранить (см. «Как сдать»).
- Стиль сайта: почти чёрный фон `#07070A`, акцент — неоновый лайм `#D7FF3C`, стартовые огни — красный `#FF1F1F`.
  Шрифты и текст накладывает сайт.

## 1. Видео на фон главного экрана

Лежит за огромными буквами TMFF и болидом, с затемнением 45 %. Должно быть спокойным и тёмным,
без резких вспышек: это фон, а не главный герой.

| | Десктоп | Телефон |
|---|---|---|
| Формат кадра | 16:9, от 1920×1080 | 9:16, от 1080×1920 |
| Длительность | 5–8 с | 5–8 с |
| Цикл | бесшовный: конец совпадает с началом, или очень медленное движение камеры | так же |
| Композиция | центр кадра спокойный и тёмный — там буквы | так же |

Промпты (выбрать 1–2 направления):

1. *Night race track, wet asphalt reflecting red starting lights, slow forward dolly shot at ground level,
   light haze, cinematic, very dark, no cars, no people, no text, no logos, seamless loop.*
2. *Abstract red and white light streaks rushing past in a dark tunnel, heavy motion blur, subtle, cinematic,
   very dark background, no text, no logos, seamless loop.*
3. *Five red lights glowing above a dark empty pit lane at night, thin smoke drifting slowly, cinematic,
   no text, no logos, seamless loop.*

**Файлы для сайта** (если в окружении есть `ffmpeg`, сжать самому командами ниже; если нет — положить только
оригиналы, обработаю я):

| Путь | Что | Предел |
|---|---|---|
| `site/public/intro/hero-desktop.mp4` | H.264, 1920×1080, без звука | до 4 МБ |
| `site/public/intro/hero-desktop.webm` | VP9, 1920×1080, без звука | до 3 МБ |
| `site/public/intro/hero-mobile.mp4` | H.264, 1080×1920, без звука | до 3 МБ |
| `site/public/intro/hero-poster.webp` | первый кадр десктопной версии | до 200 КБ |

```bash
ffmpeg -i desktop.mp4 -an -vf "scale=1920:-2,fps=30" -c:v libx264 -crf 28 -preset slow -pix_fmt yuv420p -movflags +faststart site/public/intro/hero-desktop.mp4
ffmpeg -i desktop.mp4 -an -vf "scale=1920:-2,fps=30" -c:v libvpx-vp9 -crf 40 -b:v 0 site/public/intro/hero-desktop.webm
ffmpeg -i mobile.mp4  -an -vf "scale=1080:-2,fps=30" -c:v libx264 -crf 28 -preset slow -pix_fmt yuv420p -movflags +faststart site/public/intro/hero-mobile.mp4
ffmpeg -i desktop.mp4 -frames:v 1 -vf "scale=1920:-2" -q:v 70 site/public/intro/hero-poster.webp
```

Если файл больше предела — поднять `-crf` на 2–4 и пережать.

## 2. Болид для интро

Болид выезжает слева в момент «lights out» и встаёт перед буквами TMFF (как герой на постере).
Сейчас там 3D-заглушка. Это **не товар**, а условная машина бренда — без ливрей команд.

Промпт:

*Modern open-wheel formula race car, three-quarter front view, nose pointing to the right, whole car in frame,
matte black body with neon lime (#D7FF3C) accent lines, black wheels, no logos, no sponsor decals, no numbers,
no text, dramatic studio rim lighting, pure black background, ultra detailed, wide 21:9 framing.*

- Нос машины — **вправо**, видна вся машина, вид 3/4 спереди.
- Файл для сайта: `site/public/intro/hero-car.png` — **прозрачный фон**, 2400 px по ширине, до 1 МБ.
  Если убрать фон нечем — положить оригинал на чёрном фоне в `f1-shop/assets/higgsfield/car/`, вырежу я.

## 3. Фоны команд для витрины

Когда покупатель выбирает команду в фильтре, фон витрины меняется на фон команды. Товары стоят в центре,
поэтому **центр темнее и спокойнее**, свет и линии — по краям.

- Размер 2560×1440, формат WebP, до 350 КБ: `site/public/teams/<id>.webp`.
- Шаблон промпта: *Abstract dark background, flowing light trails and soft glow in {цвета}, cinematic, subtle film grain,
  darker calm center, light at the edges, no text, no logos, no cars, no people.*

| id | Команда | Цвета для промпта |
|---|---|---|
| `redbull` | Red Bull Racing | deep navy blue `#1B2A5C`, red `#E3263B`, touch of yellow |
| `ferrari` | Ferrari | deep red `#C80000`, golden yellow `#FFD200` |
| `mercedes` | Mercedes | black, teal `#00C8B4`, silver |
| `mclaren` | McLaren | papaya orange `#FF7A00`, anthracite |
| `aston` | Aston Martin | racing green `#00594F`, lime `#C8F000` |
| `alpine` | Alpine | blue `#0A5DA8`, pink `#F25CBA` |
| `williams` | Williams | deep blue `#0B3FAF`, cyan `#00A3E0` |
| `racingbulls` | Racing Bulls | royal blue `#1F3D99`, white |
| `haas` | Haas | graphite grey `#6E7378`, red `#C8102E` |
| `audi` | Audi | dark silver `#6F7277`, red `#BB0A30` |
| `cadillac` | Cadillac | black `#1C1C1C`, gold `#C9A45C` |

```bash
cwebp -q 72 -resize 2560 1440 original.png -o site/public/teams/ferrari.webp
```

## Как сдать

1. Ветка: `git fetch origin claude/test-h284oh && git checkout claude/test-h284oh`.
2. Файлы для сайта — по путям выше. Оригиналы и все варианты — в `f1-shop/assets/higgsfield/`
   (`video/`, `car/`, `teams/`). Файлы больше 50 МБ не коммитить — вместо них ссылка в манифесте.
3. Манифест `f1-shop/assets/higgsfield/manifest.json` — по записи на файл:
   ```json
   [{ "file": "teams/ferrari-v2.png", "prompt": "…", "model": "…", "chosen": true }]
   ```
4. Проверка, если есть Node.js: `cd site && npm install && npm run build && npm start` → http://localhost:3000.
   Видео появится за буквами, болид — в интро, фон команды — после выбора команды в фильтре.
5. Коммит «Add Higgsfield intro video, hero car and team backgrounds» и `git push -u origin claude/test-h284oh`.

Если чего-то не получилось — положить что есть и перечислить в сообщении коммита, чего не хватает.
