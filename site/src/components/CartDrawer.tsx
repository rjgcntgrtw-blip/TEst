"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, Check, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { formatPrice } from "@/data/catalog";
import { type CartLine, productOf, unitPrice } from "./cart";
import ProductVisual from "./ProductVisual";

type Step = "cart" | "checkout" | "done";

/** Ссылка на Telegram-канал магазина — заменить на настоящую. */
export const TELEGRAM_URL = "https://t.me/";

export default function CartDrawer({
  open,
  lines,
  onClose,
  onQty,
  onRemove,
  onClear,
}: {
  open: boolean;
  lines: CartLine[];
  onClose: () => void;
  onQty: (key: string, qty: number) => void;
  onRemove: (key: string) => void;
  onClear: () => void;
}) {
  const reduce = useReducedMotion();
  const [step, setStep] = useState<Step>("cart");
  const closeRef = useRef<HTMLButtonElement>(null);
  const total = lines.reduce((s, l) => s + unitPrice(l) * l.qty, 0);
  const count = lines.reduce((s, l) => s + l.qty, 0);
  const maxDays = Math.max(0, ...lines.map((l) => productOf(l)?.delivery[1] ?? 0));

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open, onClose]);

  const close = () => {
    onClose();
    if (step === "done") setStep("cart");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[80] flex justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button type="button" aria-label="Закрыть корзину" onClick={close} className="absolute inset-0 cursor-default bg-black/50 backdrop-blur-[2px]" />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Корзина"
            initial={reduce ? { opacity: 0 } : { x: "100%" }}
            animate={reduce ? { opacity: 1 } : { x: 0 }}
            exit={reduce ? { opacity: 0 } : { x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 36 }}
            className="relative flex h-full w-full max-w-md flex-col bg-paper text-paper-ink shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-black/5 px-6 py-4">
              <div className="flex items-center gap-2">
                {step === "checkout" && (
                  <button
                    type="button"
                    aria-label="Назад к корзине"
                    onClick={() => setStep("cart")}
                    className="-ml-2 flex size-10 cursor-pointer items-center justify-center rounded-full hover:bg-black/5"
                  >
                    <ArrowLeft className="size-5" />
                  </button>
                )}
                <p className="font-display text-2xl font-bold uppercase">
                  {step === "cart" ? "Корзина" : step === "checkout" ? "Оформление" : "Заказ"}
                </p>
                {step === "cart" && count > 0 && <span className="text-sm text-paper-muted">· {count}</span>}
              </div>
              <button
                ref={closeRef}
                type="button"
                aria-label="Закрыть"
                onClick={close}
                className="flex size-10 cursor-pointer items-center justify-center rounded-full hover:bg-black/5"
              >
                <X className="size-5" />
              </button>
            </header>

            <AnimatePresence mode="wait" initial={false}>
              {step === "cart" && (
                <Pane key="cart">
                  {lines.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                      <ShoppingBag className="size-10 text-paper-muted" />
                      <p className="font-display text-2xl uppercase">Пока пусто</p>
                      <p className="max-w-xs text-sm text-paper-muted">Выбери модель на витрине — она появится здесь.</p>
                      <button type="button" onClick={close} className="mt-2 cursor-pointer rounded-full bg-paper-ink px-6 py-3 text-sm font-semibold text-white">
                        К витрине
                      </button>
                    </div>
                  ) : (
                    <>
                      <ul className="flex-1 divide-y divide-black/5 overflow-y-auto px-6">
                        <AnimatePresence initial={false}>
                          {lines.map((l) => (
                            <CartRow key={l.key} line={l} onQty={onQty} onRemove={onRemove} />
                          ))}
                        </AnimatePresence>
                      </ul>
                      <Summary total={total} maxDays={maxDays}>
                        <button
                          type="button"
                          onClick={() => setStep("checkout")}
                          className="h-12 w-full cursor-pointer rounded-full bg-paper-ink text-sm font-semibold text-white transition-transform hover:scale-[1.01] active:scale-[0.99]"
                        >
                          Оформить заказ
                        </button>
                      </Summary>
                    </>
                  )}
                </Pane>
              )}
              {step === "checkout" && (
                <Pane key="checkout">
                  <Checkout total={total} maxDays={maxDays} lines={lines} onDone={() => setStep("done")} />
                </Pane>
              )}
              {step === "done" && (
                <Pane key="done">
                  <Done
                    lines={lines}
                    total={total}
                    onFinish={() => {
                      onClear();
                      close();
                    }}
                  />
                </Pane>
              )}
            </AnimatePresence>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Pane({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="flex min-h-0 flex-1 flex-col"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

function CartRow({ line, onQty, onRemove }: { line: CartLine; onQty: (k: string, q: number) => void; onRemove: (k: string) => void }) {
  const p = productOf(line);
  if (!p) return null;
  const color = p.colors?.find((c) => c.id === line.color);
  const options = [line.size && p.sizes && p.sizes.length > 1 ? line.size : null, color && p.colors && p.colors.length > 1 ? color.name : null]
    .filter(Boolean)
    .join(" · ");
  return (
    <motion.li
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="flex gap-4 overflow-hidden py-4"
    >
      <span className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-black/[0.04]">
        <ProductVisual product={p} thumb sizes="80px" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="truncate font-semibold">{p.title}</p>
        <p className="truncate text-sm text-paper-muted">{options || p.subtitle}</p>
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center rounded-full ring-1 ring-black/10">
            <button
              type="button"
              aria-label="Меньше"
              onClick={() => onQty(line.key, line.qty - 1)}
              className="flex size-8 cursor-pointer items-center justify-center rounded-full hover:bg-black/5"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="w-6 text-center text-sm tabular-nums">{line.qty}</span>
            <button
              type="button"
              aria-label="Больше"
              onClick={() => onQty(line.key, line.qty + 1)}
              className="flex size-8 cursor-pointer items-center justify-center rounded-full hover:bg-black/5"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
          <p className="font-display text-lg tabular-nums">{formatPrice(unitPrice(line) * line.qty)}</p>
        </div>
      </div>
      <button
        type="button"
        aria-label={`Удалить «${p.title}»`}
        onClick={() => onRemove(line.key)}
        className="flex size-8 shrink-0 cursor-pointer items-center justify-center self-start rounded-full text-paper-muted hover:bg-black/5 hover:text-paper-ink"
      >
        <Trash2 className="size-4" />
      </button>
    </motion.li>
  );
}

function Summary({ total, maxDays, children }: { total: number; maxDays: number; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-t border-black/5 px-6 py-5">
      <div className="flex items-baseline justify-between">
        <span className="text-paper-muted">Итого</span>
        <span className="font-display text-3xl tabular-nums">{formatPrice(total)}</span>
      </div>
      {maxDays > 0 && <p className="text-sm text-paper-muted">Доставка по России — до {maxDays} дней. Трек-номер пришлём после отправки.</p>}
      {children}
    </div>
  );
}

const FIELDS = [
  { name: "name", label: "Имя и фамилия", type: "text", autoComplete: "name", required: true },
  { name: "phone", label: "Телефон", type: "tel", autoComplete: "tel", required: true },
  { name: "email", label: "Email — для чека", type: "email", autoComplete: "email", required: true },
  { name: "city", label: "Город", type: "text", autoComplete: "address-level2", required: true },
  { name: "address", label: "Адрес или пункт выдачи", type: "text", autoComplete: "street-address", required: true },
  { name: "comment", label: "Комментарий", type: "text", autoComplete: "off", required: false },
] as const;

function Checkout({ total, maxDays, lines, onDone }: { total: number; maxDays: number; lines: CartLine[]; onDone: () => void }) {
  const [agree, setAgree] = useState(false);
  const [tried, setTried] = useState(false);
  return (
    <form
      noValidate
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={(e) => {
        e.preventDefault();
        setTried(true);
        if (e.currentTarget.checkValidity() && agree) onDone();
      }}
    >
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
        <p className="text-sm text-paper-muted">
          {lines.length} {lines.length === 1 ? "товар" : lines.length < 5 ? "товара" : "товаров"} на {formatPrice(total)}. Данные нужны только для доставки
          и чека.
        </p>
        {FIELDS.map((f) => (
          <label key={f.name} className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold">
              {f.label}
              {!f.required && <span className="font-normal text-paper-muted"> — по желанию</span>}
            </span>
            <input
              name={f.name}
              type={f.type}
              autoComplete={f.autoComplete}
              required={f.required}
              className={`h-12 rounded-xl bg-black/[0.04] px-4 outline-none ring-1 transition-shadow focus:ring-2 focus:ring-paper-ink ${
                tried ? "ring-black/10 [&:invalid]:ring-2 [&:invalid]:ring-red-500" : "ring-black/10"
              }`}
            />
          </label>
        ))}
        <label className="flex cursor-pointer items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="mt-0.5 size-5 shrink-0 accent-[#0c0c0f]"
          />
          <span className={tried && !agree ? "text-red-600" : "text-paper-muted"}>
            Согласен с <Link href="/info#offer" className="underline underline-offset-2">офертой</Link> и даю согласие на{" "}
            <Link href="/info#privacy" className="underline underline-offset-2">обработку персональных данных</Link>
          </span>
        </label>
      </div>
      <Summary total={total} maxDays={maxDays}>
        <button
          type="submit"
          className="h-12 w-full cursor-pointer rounded-full bg-paper-ink text-sm font-semibold text-white transition-transform hover:scale-[1.01] active:scale-[0.99]"
        >
          Перейти к оплате
        </button>
      </Summary>
    </form>
  );
}

function Done({ lines, total, onFinish }: { lines: CartLine[]; total: number; onFinish: () => void }) {
  const [copied, setCopied] = useState(false);
  const summary =
    lines
      .map((l) => {
        const p = productOf(l);
        return `${p?.title ?? l.slug}${l.size && p?.sizes && p.sizes.length > 1 ? `, ${l.size}` : ""} × ${l.qty}`;
      })
      .join("\n") + `\nИтого: ${formatPrice(total)}`;
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-paper-ink text-white">
        <Check className="size-7" />
      </span>
      <p className="font-display text-3xl font-bold uppercase">Почти готово</p>
      <p className="max-w-xs text-sm leading-relaxed text-paper-muted">
        Онлайн-оплата скоро заработает. Пока оформим заказ вручную: скопируй состав заказа и напиши нам в Telegram — пришлём
        ссылку на оплату.
      </p>
      <div className="flex w-full flex-col gap-2">
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(summary).then(() => setCopied(true), () => setCopied(false));
          }}
          className="h-12 w-full cursor-pointer rounded-full ring-1 ring-black/15 text-sm font-semibold hover:ring-paper-ink"
        >
          {copied ? "Скопировано" : "Скопировать заказ"}
        </button>
        <a
          href={TELEGRAM_URL}
          target="_blank"
          rel="noreferrer"
          className="flex h-12 w-full items-center justify-center rounded-full bg-paper-ink text-sm font-semibold text-white"
        >
          Написать в Telegram
        </a>
        <button type="button" onClick={onFinish} className="mt-2 cursor-pointer text-sm text-paper-muted underline underline-offset-4">
          Очистить корзину и вернуться
        </button>
      </div>
    </div>
  );
}
