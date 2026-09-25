// Команды, истории сезонов и фильтры. Сами товары лежат в content/products/.
import productsData from "./products.json";

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
export type MerchKind = "tshirt" | "sweatshirt" | "cap";

export const SUBFILTERS: Record<Category, { id: ModelKind | MerchKind; label: string }[]> = {
  model: [
    { id: "ready", label: "Готовые" },
    { id: "kit", label: "Конструкторы" },
  ],
  merch: [
    { id: "tshirt", label: "Футболки" },
    { id: "sweatshirt", label: "Кофты" },
    { id: "cap", label: "Кепки" },
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

export type ProductImages = {
  /** Главное фото для витрины: модель 3/4 спереди, без фона. */
  main: string | null;
  thumb: string | null;
  gallery: string[];
  /** Коробка, в которой товар приедет, и кадр «модель + коробка». */
  box: string | null;
  withBox: string | null;
};

export type ColorOption = { id: string; name: string; hex: string };
export type SizeChart = { columns: string[]; rows: string[][]; note?: string };

export type Product = {
  slug: string;
  status: "placeholder" | "draft" | "published" | "hidden";
  title: string;
  subtitle: string;
  category: Category;
  kind: ModelKind | MerchKind;
  team?: TeamId | null;
  year: number;
  driver?: string;
  scale?: string;
  brand: string;
  licensed: boolean;
  /** Реплика: не оригинал и не лицензия. На сайте всегда показываем пометку «Реплика». */
  replica?: boolean;
  price: number;
  oldPrice?: number | null;
  popularity: number;
  delivery: [number, number];
  art: Art;
  story: string;
  description: { lead: string; body: string[]; inBox: string[] };
  specs: { label: string; value: string }[];
  seo: { title: string; description: string };
  /** Только для одежды */
  colors?: ColorOption[];
  sizes?: string[];
  sizeChart?: SizeChart;
  images?: ProductImages;
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
};

// Товары собираются из content/products/*/product.json командой `npm run catalog`.
export const PRODUCTS = productsData as unknown as Product[];

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

const REPLICA_NOTES: Record<Category, string> = {
  model:
    "Реплика. Конструктор не выпущен компанией LEGO и не лицензирован командой. Совместимость с деталями других производителей не гарантируется.",
  merch: "Реплика в стиле командной формы. Вещь не выпущена командой и не лицензирована ею.",
};

export const replicaNote = (product: Product) => REPLICA_NOTES[product.category];

export const formatPrice = (value: number) =>
  new Intl.NumberFormat("ru-RU").format(value) + " ₽";
