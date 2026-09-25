# TMFF — сайт

Прототип главной страницы: интро → витрина с фильтрами → карточка товара.
Сценарий и анимации описаны в [`../f1-shop/09-ux-flow.md`](../f1-shop/09-ux-flow.md).

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production-сборка
npm run lint
```

## Где что лежит

| Файл | Что внутри |
|---|---|
| `src/data/catalog.ts` | команды, товары, истории сезонов, фильтрация (сейчас заглушки) |
| `src/components/Hero.tsx` | открывающая анимация: стартовые огни, буквы TMFF, болид |
| `src/components/FilterBar.tsx` | фильтры: Одежда · Модели · Команда · Год |
| `src/components/Stage.tsx` | витрина дугой → переход → карточка на белом фоне, мини-лента |
| `src/components/Gallery.tsx` | фото товара со свайпом |
| `src/components/ProductArt.tsx` | нарисованные заглушки вместо фото |
| `src/components/Shop.tsx` | шапка, корзина, подвал |

Карточку товара можно открыть ссылкой: `/?p=<slug товара>`.
