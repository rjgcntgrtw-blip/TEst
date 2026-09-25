# TMFF — сайт

Прототип главной страницы: интро → витрина с фильтрами → карточка товара.
Сценарий и анимации описаны в [`../f1-shop/09-ux-flow.md`](../f1-shop/09-ux-flow.md).

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # production-сборка
npm run lint
npm run catalog   # собрать каталог из content/products (запускается сам перед dev и build)
npm run images -- <slug>   # обработать фото товара (нужен Python: pip install -r tools/images/requirements.txt)
```

## Где что лежит

| Файл | Что внутри |
|---|---|
| `content/products/<slug>/` | товар: `product.json`, `supplier.json` (не на сайт), `raw/` — исходные фото |
| `public/products/<slug>/` | готовые фото после обработки |
| `tools/images/process.py` | обработка фото: удаление фона, общий кадр, тень, «модель + коробка» |
| `tools/build-catalog.mjs` | собирает `src/data/products.json` из `content/products` |
| `src/data/catalog.ts` | команды, истории сезонов, фильтрация, типы товара |
| `src/components/Hero.tsx` | открывающая анимация: стартовые огни, буквы TMFF, болид |
| `src/components/FilterBar.tsx` | фильтры: Одежда · Модели · Команда · Год |
| `src/components/Stage.tsx` | витрина дугой → переход → карточка на белом фоне, мини-лента |
| `src/components/Gallery.tsx` | фото товара со свайпом, фото коробки с пометкой |
| `src/components/BuyBox.tsx` | цвет и размер, «В корзину», панель с описанием и таблицей размеров |
| `src/components/ProductVisual.tsx` | главное фото товара или заглушка |
| `src/components/ProductArt.tsx` | рисованные заглушки для товаров без фото (одежда) |
| `src/components/Shop.tsx` | шапка, корзина, подвал |

Карточку товара можно открыть ссылкой: `/?p=<slug товара>`.

Подробно о фото и описаниях — [`../f1-shop/10-content.md`](../f1-shop/10-content.md).
