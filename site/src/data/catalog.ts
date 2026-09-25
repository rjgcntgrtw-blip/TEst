// Прототипные данные: цены, популярность и цвета — заглушки до реального каталога.

export type TeamId =
  | "redbull"
  | "ferrari"
  | "mercedes"
  | "mclaren"
  | "aston"
  | "alpine"
  | "williams"
  | "racingbulls"
  | "haas"
  | "audi"
  | "cadillac";

export type Team = {
  id: TeamId;
  name: string;
  /** [основной, акцентный] */
  colors: [string, string];
};

export const TEAMS: Team[] = [
  { id: "redbull", name: "Red Bull Racing", colors: ["#1B2A5C", "#E3263B"] },
  { id: "ferrari", name: "Ferrari", colors: ["#C80000", "#FFD200"] },
  { id: "mercedes", name: "Mercedes", colors: ["#1A1A1D", "#00C8B4"] },
  { id: "mclaren", name: "McLaren", colors: ["#FF7A00", "#2B2B2E"] },
  { id: "aston", name: "Aston Martin", colors: ["#00594F", "#C8F000"] },
  { id: "alpine", name: "Alpine", colors: ["#0A5DA8", "#F25CBA"] },
  { id: "williams", name: "Williams", colors: ["#0B3FAF", "#00A3E0"] },
  { id: "racingbulls", name: "Racing Bulls", colors: ["#1F3D99", "#E8E8F0"] },
  { id: "haas", name: "Haas", colors: ["#6E7378", "#C8102E"] },
  { id: "audi", name: "Audi", colors: ["#6F7277", "#BB0A30"] },
  { id: "cadillac", name: "Cadillac", colors: ["#1C1C1C", "#C9A45C"] },
];

export const teamById = (id: TeamId) => TEAMS.find((t) => t.id === id)!;

export type Category = "model" | "merch";
export type ModelKind = "ready" | "kit";
export type MerchKind = "tshirt" | "hoodie" | "cap" | "accessory";

export const SUBFILTERS: Record<Category, { id: ModelKind | MerchKind; label: string }[]> = {
  model: [
    { id: "ready", label: "Готовые" },
    { id: "kit", label: "Конструкторы" },
  ],
  merch: [
    { id: "tshirt", label: "Футболки" },
    { id: "hoodie", label: "Худи" },
    { id: "cap", label: "Кепки" },
    { id: "accessory", label: "Аксессуары" },
  ],
};

export type ArtType = "car" | "kit" | "tshirt" | "hoodie" | "cap" | "case";

export type Art = {
  type: ArtType;
  /** [основной, акцентный, детали] */
  colors: [string, string, string];
  number?: string;
  print?: string;
};

export type StoryStep = { label: string; title: string; text: string };
export type Story = { heading: string; steps: [StoryStep, StoryStep, StoryStep] };

export type Product = {
  slug: string;
  title: string;
  subtitle: string;
  category: Category;
  kind: ModelKind | MerchKind;
  team?: TeamId;
  year: number;
  scale?: string;
  brand: string;
  licensed: boolean;
  price: number;
  popularity: number;
  delivery: [number, number];
  art: Art;
  story: string;
};

export const STORIES: Record<string, Story> = {
  "redbull-2023": {
    heading: "Сезон 2023",
    steps: [
      {
        label: "Команда",
        title: "21 победа из 22",
        text: "Red Bull выиграла 21 гонку из 22 — самая высокая доля побед за сезон в истории Формулы 1.",
      },
      {
        label: "Пилот",
        title: "Ферстаппен: 19 побед",
        text: "Макс Ферстаппен установил рекорд побед за сезон, выиграл 10 гонок подряд и взял третий титул подряд.",
      },
      {
        label: "Момент",
        title: "Единственное поражение",
        text: "Серию прервал только Сингапур: там победил Карлос Сайнс на Ferrari.",
      },
    ],
  },
  "ferrari-2024": {
    heading: "Сезон 2024",
    steps: [
      {
        label: "Команда",
        title: "В 14 очках от Кубка",
        text: "Ferrari до последней гонки боролась за Кубок конструкторов и заняла второе место, уступив McLaren.",
      },
      {
        label: "Пилот",
        title: "Леклер дома",
        text: "Шарль Леклер выиграл Гран-при Монако — первым из пилотов-монегасков с 1931 года.",
      },
      {
        label: "Момент",
        title: "Монца, одна остановка",
        text: "На Гран-при Италии Леклер рискнул с одним пит-стопом и победил на глазах у тифози.",
      },
    ],
  },
  "mclaren-2024": {
    heading: "Сезон 2024",
    steps: [
      {
        label: "Команда",
        title: "Кубок спустя 26 лет",
        text: "McLaren впервые с 1998 года выиграла Кубок конструкторов.",
      },
      {
        label: "Пилот",
        title: "Первая победа Норриса",
        text: "Ландо Норрис одержал первую победу в карьере на Гран-при Майами.",
      },
      {
        label: "Итог",
        title: "Вице-чемпион",
        text: "Норрис закончил сезон вторым в личном зачёте с четырьмя победами.",
      },
    ],
  },
  "mercedes-2020": {
    heading: "Сезон 2020",
    steps: [
      {
        label: "Команда",
        title: "Седьмой Кубок подряд",
        text: "Mercedes выиграла седьмой Кубок конструкторов подряд, болид выступал в чёрной ливрее.",
      },
      {
        label: "Пилот",
        title: "Седьмой титул",
        text: "Льюис Хэмилтон взял седьмой титул и повторил рекорд Михаэля Шумахера.",
      },
      {
        label: "Момент",
        title: "92-я победа",
        text: "На Гран-при Португалии Хэмилтон одержал 92-ю победу и обошёл Шумахера по числу побед.",
      },
    ],
  },
  "mclaren-1988": {
    heading: "Сезон 1988",
    steps: [
      {
        label: "Команда",
        title: "15 из 16",
        text: "McLaren MP4/4 выиграл 15 гонок из 16 — один из самых доминирующих болидов в истории.",
      },
      {
        label: "Пилот",
        title: "Первый титул Сенны",
        text: "Айртон Сенна одержал 8 побед и стал чемпионом мира впервые.",
      },
      {
        label: "Момент",
        title: "Монца",
        text: "Единственную гонку сезона забрала Ferrari: Герхард Бергер победил в Монце вскоре после смерти Энцо Феррари.",
      },
    ],
  },
  "ferrari-2004": {
    heading: "Сезон 2004",
    steps: [
      {
        label: "Команда",
        title: "15 побед из 18",
        text: "Ferrari F2004 выиграла 15 гонок из 18 и принесла команде шестой Кубок конструкторов подряд.",
      },
      {
        label: "Пилот",
        title: "13 побед Шумахера",
        text: "Михаэль Шумахер одержал 13 побед — рекорд на тот момент — и взял седьмой титул.",
      },
      {
        label: "Момент",
        title: "12 из 13",
        text: "Шумахер выиграл 12 из первых 13 гонок сезона.",
      },
    ],
  },
  "tmff-lights": {
    heading: "TMFF Original",
    steps: [
      {
        label: "Идея",
        title: "Lights out",
        text: "Пять красных огней загораются по одному и гаснут вместе — так стартует каждая гонка Формулы 1.",
      },
      {
        label: "Фраза",
        title: "And away we go",
        text: "«It's lights out and away we go!» — фраза комментаторов, которую знает каждый фанат.",
      },
      {
        label: "Вещь",
        title: "Своя коллекция",
        text: "Собственный дизайн TMFF: без чужих логотипов, плотный хлопок, печать, которая не трескается.",
      },
    ],
  },
  "tmff-boxbox": {
    heading: "TMFF Original",
    steps: [
      {
        label: "Идея",
        title: "Box, box",
        text: "Команда по радио, которая зовёт пилота на пит-стоп. Самые нервные две секунды гонки.",
      },
      {
        label: "Дизайн",
        title: "Для своих",
        text: "Поймут только те, кто смотрит гонки. Остальные спросят — и тоже начнут смотреть.",
      },
      {
        label: "Вещь",
        title: "Тёплое худи",
        text: "Худи оверсайз с капюшоном, принт на груди и спине.",
      },
    ],
  },
  "tmff-case": {
    heading: "Для коллекции",
    steps: [
      {
        label: "Зачем",
        title: "Без пыли",
        text: "Пыль — главный враг моделей. В боксе модель остаётся как новая годами.",
      },
      {
        label: "Как",
        title: "Масштаб 1:43",
        text: "Прозрачный акрил и чёрное основание — модель видно со всех сторон.",
      },
      {
        label: "Совет",
        title: "Витрина сезона",
        text: "Соберите весь пелотон одного сезона в одинаковых боксах — смотрится как музей.",
      },
    ],
  },
};

export const PRODUCTS: Product[] = [
  {
    slug: "red-bull-rb19-verstappen-1-43",
    title: "Red Bull RB19",
    subtitle: "Макс Ферстаппен · 2023",
    category: "model",
    kind: "ready",
    team: "redbull",
    year: 2023,
    scale: "1:43",
    brand: "Bburago",
    licensed: true,
    price: 2490,
    popularity: 98,
    delivery: [12, 20],
    art: { type: "car", colors: ["#1B2A5C", "#E3263B", "#F2C200"], number: "1" },
    story: "redbull-2023",
  },
  {
    slug: "mclaren-mcl38-norris-1-43",
    title: "McLaren MCL38",
    subtitle: "Ландо Норрис · 2024",
    category: "model",
    kind: "ready",
    team: "mclaren",
    year: 2024,
    scale: "1:43",
    brand: "Bburago",
    licensed: true,
    price: 2490,
    popularity: 97,
    delivery: [12, 20],
    art: { type: "car", colors: ["#FF7A00", "#2B2B2E", "#4FC3F7"], number: "4" },
    story: "mclaren-2024",
  },
  {
    slug: "ferrari-sf-24-leclerc-1-18",
    title: "Ferrari SF-24",
    subtitle: "Шарль Леклер · 2024",
    category: "model",
    kind: "ready",
    team: "ferrari",
    year: 2024,
    scale: "1:18",
    brand: "Bburago",
    licensed: true,
    price: 7990,
    popularity: 95,
    delivery: [14, 22],
    art: { type: "car", colors: ["#C80000", "#FFD200", "#111111"], number: "16" },
    story: "ferrari-2024",
  },
  {
    slug: "rastar-red-bull-rb19-1-8",
    title: "Red Bull RB19 · 1:8",
    subtitle: "Конструктор, ~2 500 деталей",
    category: "model",
    kind: "kit",
    team: "redbull",
    year: 2023,
    scale: "1:8",
    brand: "Rastar",
    licensed: true,
    price: 14990,
    popularity: 92,
    delivery: [14, 24],
    art: { type: "kit", colors: ["#1B2A5C", "#E3263B", "#F2C200"], number: "1" },
    story: "redbull-2023",
  },
  {
    slug: "mercedes-w11-hamilton-1-43",
    title: "Mercedes W11",
    subtitle: "Льюис Хэмилтон · 2020",
    category: "model",
    kind: "ready",
    team: "mercedes",
    year: 2020,
    scale: "1:43",
    brand: "Bburago",
    licensed: true,
    price: 2290,
    popularity: 90,
    delivery: [12, 20],
    art: { type: "car", colors: ["#1A1A1D", "#00C8B4", "#C9CDD2"], number: "44" },
    story: "mercedes-2020",
  },
  {
    slug: "lego-technic-ferrari-sf-24",
    title: "Ferrari SF-24 Technic",
    subtitle: "Конструктор · 2024",
    category: "model",
    kind: "kit",
    team: "ferrari",
    year: 2024,
    brand: "LEGO",
    licensed: true,
    price: 19990,
    popularity: 89,
    delivery: [14, 24],
    art: { type: "kit", colors: ["#C80000", "#FFD200", "#111111"], number: "16" },
    story: "ferrari-2024",
  },
  {
    slug: "mclaren-mp4-4-senna-1-43",
    title: "McLaren MP4/4",
    subtitle: "Айртон Сенна · 1988",
    category: "model",
    kind: "ready",
    team: "mclaren",
    year: 1988,
    scale: "1:43",
    brand: "Minichamps",
    licensed: true,
    price: 8990,
    popularity: 88,
    delivery: [14, 24],
    art: { type: "car", colors: ["#F4F4F4", "#E4002B", "#F2C200"], number: "12" },
    story: "mclaren-1988",
  },
  {
    slug: "ferrari-f2004-schumacher-1-18",
    title: "Ferrari F2004",
    subtitle: "Михаэль Шумахер · 2004",
    category: "model",
    kind: "ready",
    team: "ferrari",
    year: 2004,
    scale: "1:18",
    brand: "Bburago",
    licensed: true,
    price: 8490,
    popularity: 85,
    delivery: [14, 22],
    art: { type: "car", colors: ["#C80000", "#FFFFFF", "#111111"], number: "1" },
    story: "ferrari-2004",
  },
  {
    slug: "tmff-tee-lights-out",
    title: "Футболка «Lights Out»",
    subtitle: "TMFF Original",
    category: "merch",
    kind: "tshirt",
    year: 2026,
    brand: "TMFF",
    licensed: false,
    price: 2990,
    popularity: 80,
    delivery: [10, 18],
    art: { type: "tshirt", colors: ["#111114", "#E3263B", "#F4F4F4"], print: "LIGHTS OUT" },
    story: "tmff-lights",
  },
  {
    slug: "mclaren-cap-2024",
    title: "Кепка McLaren 2024",
    subtitle: "Официальная лицензия",
    category: "merch",
    kind: "cap",
    team: "mclaren",
    year: 2024,
    brand: "McLaren",
    licensed: true,
    price: 3990,
    popularity: 75,
    delivery: [12, 20],
    art: { type: "cap", colors: ["#FF7A00", "#2B2B2E", "#FFFFFF"] },
    story: "mclaren-2024",
  },
  {
    slug: "tmff-hoodie-box-box",
    title: "Худи «Box Box»",
    subtitle: "TMFF Original",
    category: "merch",
    kind: "hoodie",
    year: 2026,
    brand: "TMFF",
    licensed: false,
    price: 5490,
    popularity: 70,
    delivery: [10, 18],
    art: { type: "hoodie", colors: ["#2A2D34", "#D7FF3C", "#F4F4F4"], print: "BOX BOX" },
    story: "tmff-boxbox",
  },
  {
    slug: "acrylic-case-1-43",
    title: "Акриловый бокс 1:43",
    subtitle: "Для моделей 1:43",
    category: "merch",
    kind: "accessory",
    year: 2026,
    brand: "TMFF",
    licensed: false,
    price: 990,
    popularity: 60,
    delivery: [10, 18],
    art: { type: "case", colors: ["#1B2A5C", "#E3263B", "#111111"] },
    story: "tmff-case",
  },
];

export type Filters = {
  category: Category | null;
  sub: ModelKind | MerchKind | null;
  team: TeamId | null;
  year: number | null;
};

export const EMPTY_FILTERS: Filters = { category: null, sub: null, team: null, year: null };

export function applyFilters(filters: Filters, skip?: keyof Filters): Product[] {
  return PRODUCTS.filter(
    (p) =>
      (skip === "category" || !filters.category || p.category === filters.category) &&
      (skip === "sub" || !filters.sub || p.kind === filters.sub) &&
      (skip === "team" || !filters.team || p.team === filters.team) &&
      (skip === "year" || !filters.year || p.year === filters.year),
  ).sort((a, b) => b.popularity - a.popularity);
}

export const formatPrice = (value: number) =>
  new Intl.NumberFormat("ru-RU").format(value) + " ₽";
