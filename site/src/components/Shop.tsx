"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Search, ShoppingBag } from "lucide-react";
import type { Product } from "@/data/catalog";
import Hero from "./Hero";
import Stage from "./Stage";

export default function Shop({ initialSlug }: { initialSlug?: string }) {
  const reduce = useReducedMotion();
  const [cart, setCart] = useState<Product[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const add = (product: Product) => {
    setCart((c) => [...c, product]);
    setToast(`«${product.title}» в корзине`);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  };

  const enter = () =>
    document.getElementById("showcase")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });

  return (
    <>
      {/* mix-blend-difference: шапка сама становится тёмной на белом фоне карточки */}
      <motion.header
        initial={reduce || initialSlug ? false : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.9, duration: 0.6 }}
        className="pointer-events-none fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between px-5 text-white mix-blend-difference md:px-[5vw]"
      >
        <Link href="/" className="pointer-events-auto font-display text-2xl font-bold tracking-tight">
          TMFF
        </Link>
        <nav className="pointer-events-auto flex items-center gap-2">
          <button type="button" aria-label="Поиск" className="flex size-11 cursor-pointer items-center justify-center rounded-full">
            <Search className="size-5" />
          </button>
          <button
            type="button"
            aria-label={`Корзина, товаров: ${cart.length}`}
            className="relative flex size-11 cursor-pointer items-center justify-center rounded-full"
          >
            <ShoppingBag className="size-5" />
            {cart.length > 0 && (
              <span className="absolute top-1 right-0.5 flex size-5 items-center justify-center rounded-full bg-white text-[11px] font-bold text-black">
                {cart.length}
              </span>
            )}
          </button>
        </nav>
      </motion.header>

      <main>
        <Hero onEnter={enter} />
        <Stage initialSlug={initialSlug} onAdd={add} />
        <footer className="bg-paper px-5 py-16 text-paper-ink md:px-[5vw]">
          <div className="flex flex-col justify-between gap-8 md:flex-row">
            <div>
              <p className="font-display text-4xl font-bold">TMFF</p>
              <p className="mt-2 max-w-sm text-sm text-paper-muted">
                Прототип главной страницы. Товары, цены и фото — заглушки.
              </p>
            </div>
            <ul className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm text-paper-muted">
              <li>Доставка и оплата</li>
              <li>Возврат</li>
              <li>Оферта</li>
              <li>Политика ПДн</li>
              <li>Контакты</li>
              <li>Telegram</li>
            </ul>
          </div>
        </footer>
      </main>

      <AnimatePresence>
        {toast && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-paper-ink px-5 py-3 text-sm font-semibold text-white shadow-2xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
