"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Search, ShoppingBag } from "lucide-react";
import type { Product } from "@/data/catalog";
import type { SiteAssets } from "@/lib/assets";
import type { CartOptions } from "./BuyBox";
import { cartStore, lineKey } from "./cart";
import CartDrawer, { TELEGRAM_URL } from "./CartDrawer";
import Hero, { INTRO_SECONDS } from "./Hero";
import SearchOverlay from "./SearchOverlay";
import Stage, { type StageApi } from "./Stage";

const INTRO_KEY = "tmff:intro-seen";
const noSubscribe = () => () => {};
const introSeen = () => {
  try {
    return window.sessionStorage.getItem(INTRO_KEY) === "1";
  } catch {
    return false;
  }
};

export default function Shop({ initialSlug, assets }: { initialSlug?: string; assets: SiteAssets }) {
  const reduce = useReducedMotion();
  const lines = useSyncExternalStore(cartStore.subscribe, cartStore.get, cartStore.server);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const stage = useRef<StageApi | null>(null);

  // Интро — один раз за визит; по ссылке на товар — сразу без интро.
  const seen = useSyncExternalStore(noSubscribe, introSeen, () => false);
  const [skipped, setSkipped] = useState(false);
  const skipIntro = Boolean(initialSlug) || seen || skipped;
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        window.sessionStorage.setItem(INTRO_KEY, "1");
      } catch {}
    }, INTRO_SECONDS * 1000);
    return () => clearTimeout(id);
  }, []);


  const count = lines.reduce((s, l) => s + l.qty, 0);

  const add = (product: Product, options: CartOptions = {}) => {
    const key = lineKey(product.slug, options.size, options.color);
    cartStore.update((ls) => {
      const found = ls.find((l) => l.key === key);
      return found
        ? ls.map((l) => (l.key === key ? { ...l, qty: l.qty + 1 } : l))
        : [...ls, { key, slug: product.slug, size: options.size, color: options.color, qty: 1 }];
    });
    setToast(`«${product.title}»${options.size && product.sizes && product.sizes.length > 1 ? `, ${options.size}` : ""} в корзине`);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  };
  const setQty = useCallback((key: string, qty: number) => {
    cartStore.update((ls) => (qty <= 0 ? ls.filter((l) => l.key !== key) : ls.map((l) => (l.key === key ? { ...l, qty } : l))));
  }, []);
  const remove = useCallback((key: string) => cartStore.update((ls) => ls.filter((l) => l.key !== key)), []);
  const closeCart = useCallback(() => setCartOpen(false), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  const enter = () => document.getElementById("showcase")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });

  return (
    <>
      {/* mix-blend-difference: шапка сама становится тёмной на белом фоне карточки */}
      <motion.header
        key={skipIntro ? "still" : "intro"}
        initial={reduce || skipIntro ? false : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.9, duration: 0.6 }}
        className="pointer-events-none fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between px-5 text-white mix-blend-difference md:px-[5vw]"
      >
        <Link href="/" className="pointer-events-auto font-display text-2xl font-bold tracking-tight">
          TMFF
        </Link>
        <nav className="pointer-events-auto flex items-center gap-1">
          <button
            type="button"
            aria-label="Поиск"
            onClick={() => setSearchOpen(true)}
            className="flex size-11 cursor-pointer items-center justify-center rounded-full transition-transform hover:scale-110"
          >
            <Search className="size-5" />
          </button>
          <button
            type="button"
            aria-label={`Корзина, товаров: ${count}`}
            onClick={() => setCartOpen(true)}
            className="relative flex size-11 cursor-pointer items-center justify-center rounded-full transition-transform hover:scale-110"
          >
            <motion.span key={count} initial={reduce || count === 0 ? false : { scale: 1.35 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 14 }}>
              <ShoppingBag className="size-5" />
            </motion.span>
            {count > 0 && (
              <span className="absolute top-1 right-0.5 flex size-5 items-center justify-center rounded-full bg-white text-[11px] font-bold text-black">
                {count}
              </span>
            )}
          </button>
        </nav>
      </motion.header>

      <main>
        <Hero
          key={skipIntro ? "still" : "intro"}
          skip={skipIntro}
          onSkip={() => setSkipped(true)}
          onEnter={enter}
          video={assets.heroVideo}
          car={assets.heroCar}
        />
        <Stage initialSlug={initialSlug} onAdd={add} apiRef={stage} teamBackgrounds={assets.teamBackgrounds} />
        <Footer />
      </main>

      <SearchOverlay
        open={searchOpen}
        onClose={closeSearch}
        onPick={(slug) => {
          setSearchOpen(false);
          stage.current?.open(slug);
        }}
      />
      <CartDrawer open={cartOpen} lines={lines} onClose={closeCart} onQty={setQty} onRemove={remove} onClear={() => cartStore.update(() => [])} />

      <AnimatePresence>
        {toast && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-3 rounded-full bg-paper-ink py-2 pr-2 pl-5 text-sm font-semibold text-white shadow-2xl"
          >
            <span className="max-w-[52vw] truncate">{toast}</span>
            <button
              type="button"
              onClick={() => {
                setToast(null);
                setCartOpen(true);
              }}
              className="cursor-pointer rounded-full bg-white px-4 py-2 text-paper-ink"
            >
              Корзина
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Footer() {
  return (
    <footer className="bg-bg px-5 pt-20 pb-10 text-ink md:px-[5vw]">
      <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-display text-[22vw] font-bold leading-[0.8] tracking-[-0.02em] md:text-[9vw]">TMFF</p>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted">
            Коллекционные модели болидов, конструкторы и одежда в стиле командной формы. Доставка по всей России.
          </p>
          <div className="mt-6 flex gap-2" aria-hidden>
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} className="size-2.5 rounded-full bg-start-red/80" />
            ))}
          </div>
        </div>
        <nav aria-label="Покупателям" className="flex flex-col gap-3 text-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted">Покупателям</p>
          <Link href="/info#delivery" className="hover:text-accent">Доставка и оплата</Link>
          <Link href="/info#returns" className="hover:text-accent">Возврат и обмен</Link>
          <Link href="/info#offer" className="hover:text-accent">Публичная оферта</Link>
          <Link href="/info#privacy" className="hover:text-accent">Политика персональных данных</Link>
        </nav>
        <nav aria-label="Связь" className="flex flex-col gap-3 text-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted">Связь</p>
          <a href={TELEGRAM_URL} target="_blank" rel="noreferrer" className="hover:text-accent">Telegram</a>
          <Link href="/info#contacts" className="hover:text-accent">Контакты</Link>
          <p className="text-muted">Оплата картой и по СБП</p>
        </nav>
      </div>
      <div className="mt-16 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs leading-relaxed text-muted md:flex-row md:justify-between">
        <p>© 2026 TMFF · ИП [ФИО], ИНН [—], ОГРНИП [—]</p>
        <p className="max-w-xl md:text-right">
          TMFF не связан с Formula 1, FIA и командами. Названия команд и пилотов указаны, чтобы описать товар. Реплики помечены на
          карточке.
        </p>
      </div>
    </footer>
  );
}
