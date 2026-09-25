"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Search, X } from "lucide-react";
import { TEAMS, priceLabel } from "@/data/catalog";
import { searchProducts } from "./cart";
import ProductVisual from "./ProductVisual";

const TEAM_NAMES = Object.fromEntries(TEAMS.map((t) => [t.id, t.name]));
const HINTS = ["Ферстаппен", "Ferrari 1:24", "реплика 1:8", "постер", "кепка", "2026"];

export default function SearchOverlay({ open, onClose, onPick }: { open: boolean; onClose: () => void; onPick: (slug: string) => void }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => searchProducts(query, TEAM_NAMES).slice(0, 12), [query]);

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open, onClose]);

  const pick = (slug: string) => {
    onPick(slug);
    setQuery("");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Поиск"
          className="fixed inset-0 z-[80] flex flex-col bg-bg/95 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 pt-20 md:pt-28">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (results[0]) pick(results[0].slug);
              }}
              className="flex items-center gap-3 border-b border-white/20 pb-3 focus-within:border-accent"
            >
              <Search className="size-6 shrink-0 text-muted" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Болид, команда, пилот, год"
                aria-label="Поиск по каталогу"
                className="min-w-0 flex-1 bg-transparent font-display text-3xl uppercase outline-none placeholder:text-white/25 md:text-5xl"
              />
              <button
                type="button"
                aria-label="Закрыть поиск"
                onClick={onClose}
                className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-white/10"
              >
                <X className="size-6" />
              </button>
            </form>

            {!query && (
              <div className="mt-6 flex flex-wrap gap-2">
                {HINTS.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setQuery(h)}
                    className="cursor-pointer rounded-full border border-white/15 px-4 py-2 text-sm text-ink/80 transition-colors hover:border-accent hover:text-accent"
                  >
                    {h}
                  </button>
                ))}
              </div>
            )}

            <ul className="mt-4 flex-1 overflow-y-auto pb-10">
              {results.map((p, i) => (
                <motion.li key={p.slug} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.025 }}>
                  <button
                    type="button"
                    onClick={() => pick(p.slug)}
                    className="group flex w-full cursor-pointer items-center gap-4 rounded-2xl px-2 py-3 text-left transition-colors hover:bg-white/[0.06]"
                  >
                    <span className="flex h-12 w-16 shrink-0 items-center justify-center">
                      <ProductVisual product={p} thumb sizes="64px" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{p.title}</span>
                      <span className="block truncate text-sm text-muted">{p.subtitle}</span>
                    </span>
                    <span className="shrink-0 font-display text-lg">{priceLabel(p)}</span>
                    <ArrowRight className="size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
                  </button>
                </motion.li>
              ))}
              {query && results.length === 0 && <li className="py-10 text-center text-muted">Ничего не нашлось. Попробуй фамилию пилота или год.</li>}
            </ul>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
