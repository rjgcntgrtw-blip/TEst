"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { Package, Ruler, ShoppingBag, Truck, X } from "lucide-react";
import { REPLICA_NOTE, formatPrice, type Product } from "@/data/catalog";

export type CartOptions = { size?: string; color?: string };

/** Выбор цвета и размера (для одежды), кнопка «В корзину» и ссылка на полное описание. */
export default function BuyBox({
  product,
  onAdd,
  compact = false,
}: {
  product: Product;
  onAdd: (product: Product, options: CartOptions) => void;
  compact?: boolean;
}) {
  const sizes = product.sizes ?? [];
  const colors = product.colors ?? [];
  const [size, setSize] = useState<string | undefined>(sizes.length === 1 ? sizes[0] : undefined);
  const [color, setColor] = useState<string | undefined>(colors[0]?.id);
  const [details, setDetails] = useState<"about" | "sizes" | null>(null);
  const needsSize = sizes.length > 1 && !size;

  return (
    <div className="flex flex-col gap-3">
      {colors.length > 1 && (
        <div className="flex items-center gap-2" role="radiogroup" aria-label="Цвет">
          {colors.map((c) => (
            <button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={color === c.id}
              aria-label={c.name}
              onClick={() => setColor(c.id)}
              className={`size-8 cursor-pointer rounded-full ring-offset-2 transition ${color === c.id ? "ring-2 ring-paper-ink" : "ring-1 ring-black/15"}`}
              style={{ background: c.hex }}
            />
          ))}
        </div>
      )}

      {sizes.length > 1 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-paper-muted">Размер</span>
            <button
              type="button"
              onClick={() => setDetails("sizes")}
              className="flex cursor-pointer items-center gap-1 font-semibold underline-offset-4 hover:underline"
            >
              <Ruler className="size-4" /> Таблица размеров
            </button>
          </div>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Размер">
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={size === s}
                onClick={() => setSize(s)}
                className={`h-10 min-w-12 cursor-pointer rounded-full border px-3 text-sm font-semibold transition-colors ${
                  size === s ? "border-paper-ink bg-paper-ink text-white" : "border-black/15 hover:border-paper-ink"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        disabled={needsSize}
        onClick={() => onAdd(product, { size, color })}
        className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-paper-ink px-6 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-default disabled:bg-black/25 disabled:hover:scale-100"
      >
        <ShoppingBag className="size-4" />
        {needsSize ? "Выбери размер" : compact ? `В корзину · ${product.delivery[0]}–${product.delivery[1]} дней` : "В корзину"}
      </button>

      <button
        type="button"
        onClick={() => setDetails("about")}
        className="cursor-pointer self-start text-sm font-semibold underline decoration-black/25 underline-offset-4 hover:decoration-paper-ink"
      >
        Описание и характеристики
      </button>

      <ProductDetails product={product} open={details} onClose={() => setDetails(null)} />
    </div>
  );
}

function ProductDetails({ product, open, onClose }: { product: Product; open: "about" | "sizes" | null; onClose: () => void }) {
  if (typeof document === "undefined") return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onKeyDown={(e) => {
            if (e.key !== "Escape") return;
            e.stopPropagation();
            onClose();
          }}
        >
          <button type="button" aria-label="Закрыть" onClick={onClose} className="absolute inset-0 cursor-default bg-black/40" />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={product.title}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 36 }}
            className="relative flex h-full w-full max-w-lg flex-col overflow-y-auto bg-paper text-paper-ink shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-black/5 bg-paper/95 px-6 py-4 backdrop-blur">
              <p className="font-display text-xl font-bold uppercase">{product.title}</p>
              <button
                type="button"
                autoFocus
                aria-label="Закрыть"
                onClick={onClose}
                className="flex size-10 cursor-pointer items-center justify-center rounded-full hover:bg-black/5"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex flex-col gap-8 px-6 py-6">
              {open === "sizes" && product.sizeChart ? (
                <SizeTable product={product} />
              ) : (
                <>
                  <section className="flex flex-col gap-3 leading-relaxed">
                    <p className="text-lg font-semibold">{product.description.lead}</p>
                    {product.description.body.map((p) => (
                      <p key={p} className="text-paper-ink/80">
                        {p}
                      </p>
                    ))}
                    <p className="font-display text-2xl">{formatPrice(product.price)}</p>
                  </section>

                  {product.description.inBox.length > 0 && (
                    <section>
                      <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-paper-muted">Что в коробке</h3>
                      <ul className="flex flex-col gap-1.5">
                        {product.description.inBox.map((i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-paper-muted">—</span> {i}
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  <section>
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-paper-muted">Характеристики</h3>
                    <dl className="divide-y divide-black/5">
                      {product.specs.map((s) => (
                        <div key={s.label} className="grid grid-cols-[42%_1fr] gap-4 py-2.5 text-sm">
                          <dt className="text-paper-muted">{s.label}</dt>
                          <dd>{s.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </section>

                  {product.sizeChart && <SizeTable product={product} />}

                  <section className="flex flex-col gap-3 rounded-2xl bg-black/[0.04] p-4 text-sm">
                    <p className="flex items-center gap-2 font-semibold">
                      <Truck className="size-4" /> Доставка {product.delivery[0]}–{product.delivery[1]} дней
                    </p>
                    {product.replica && <p className="font-semibold">{REPLICA_NOTE}</p>}
                    {product.category === "model" && (
                      <p className="flex gap-2 text-paper-ink/80">
                        <Package className="mt-0.5 size-4 shrink-0" />
                        Модель приедет в заводской коробке — её фото есть в галерее с пометкой «В этой коробке приедет».
                      </p>
                    )}
                  </section>
                </>
              )}
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function SizeTable({ product }: { product: Product }) {
  const chart = product.sizeChart!;
  return (
    <section>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-paper-muted">Таблица размеров</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-black/10">
              {chart.columns.map((c) => (
                <th key={c} className="py-2 pr-3 font-semibold">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {chart.rows.map((r) => (
              <tr key={r[0]} className="border-b border-black/5">
                {r.map((cell, i) => (
                  <td key={i} className={`py-2 pr-3 ${i === 0 ? "font-semibold" : "text-paper-ink/80"}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {chart.note && <p className="mt-3 text-sm text-paper-muted">{chart.note}</p>}
    </section>
  );
}
