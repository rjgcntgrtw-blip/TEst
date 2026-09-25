import { PRODUCTS, type Product } from "@/data/catalog";

export type CartLine = { key: string; slug: string; size?: string; color?: string; qty: number };

const STORAGE_KEY = "tmff:cart";
const bySlug = new Map(PRODUCTS.map((p) => [p.slug, p]));

export const productOf = (line: CartLine): Product | undefined => bySlug.get(line.slug);

/** Цена строки: у постеров — по выбранному размеру. */
export const unitPrice = (line: CartLine) => {
  const p = productOf(line);
  if (!p) return 0;
  return (line.size && p.sizePrices?.[line.size]) || p.price;
};

export const lineKey = (slug: string, size?: string, color?: string) => [slug, size ?? "", color ?? ""].join("|");

export function loadCart(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const lines = raw ? (JSON.parse(raw) as CartLine[]) : [];
    return lines.filter((l) => bySlug.has(l.slug) && l.qty > 0);
  } catch {
    return [];
  }
}

export function saveCart(lines: CartLine[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // приватный режим или запрет хранилища — корзина живёт до перезагрузки
  }
}

// Корзина — внешнее хранилище (localStorage) для useSyncExternalStore: одна копия на вкладку,
// синхронизация между вкладками через событие storage.
const EMPTY: CartLine[] = [];
let current: CartLine[] | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const cartStore = {
  subscribe(cb: () => void) {
    listeners.add(cb);
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      current = loadCart();
      emit();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(cb);
      window.removeEventListener("storage", onStorage);
    };
  },
  get(): CartLine[] {
    if (current === null) current = loadCart();
    return current;
  },
  server: (): CartLine[] => EMPTY,
  update(fn: (lines: CartLine[]) => CartLine[]) {
    current = fn(cartStore.get());
    saveCart(current);
    emit();
  },
};

/** Поиск по каталогу: название, подзаголовок, команда, пилот, год. Регистр и «ё» не важны. */
const norm = (s: string) => s.toLowerCase().replace(/ё/g, "е");
export function searchProducts(query: string, teamNames: Record<string, string>): Product[] {
  const words = norm(query).split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  return PRODUCTS.filter((p) => {
    const hay = norm([p.title, p.subtitle, p.driver ?? "", p.team ? teamNames[p.team] : "", String(p.year), p.scale ?? ""].join(" "));
    return words.every((w) => hay.includes(w));
  }).sort((a, b) => b.popularity - a.popularity);
}
