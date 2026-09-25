"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { ArrowLeft, ChevronDown, ChevronLeft, ChevronRight, ShieldCheck, Truck } from "lucide-react";
import {
  EMPTY_FILTERS,
  STORIES,
  applyFilters,
  priceLabel,
  teamById,
  type Filters,
  type Product,
} from "@/data/catalog";
import FilterBar from "./FilterBar";
import Gallery from "./Gallery";
import BuyBox, { type CartOptions } from "./BuyBox";
import ProductVisual from "./ProductVisual";

/** Сколько товаров рисуем с каждой стороны от центрального — остальные не создаются. */
const VISIBLE = 4;
/**
 * Самый популярный товар — в центре, дальше по убыванию попеременно слева и справа,
 * чтобы дуга была заполнена с обеих сторон.
 */
function centerOut(list: Product[]): Product[] {
  const left = list.filter((_, i) => i % 2 === 1).reverse();
  const right = list.filter((_, i) => i > 0 && i % 2 === 0);
  return list.length ? [...left, list[0], ...right] : [];
}
const centerIndex = (list: Product[]) => Math.floor(list.length / 2);
const ALL_ORDERED = centerOut(applyFilters(EMPTY_FILTERS));

/** Где на шкале прокрутки сцены открыта карточка. */
const DETAIL_AT = 0.3;

type Phase = "browse" | "moving" | "detail";

type Geometry = {
  mobile: boolean;
  itemW: number;
  step: number;
  radius: number;
  turn: number;
  spread: number;
  grow: number;
  lift: number;
  /** Вертикальный центр витрины, % высоты экрана. */
  cy: number;
};

function subscribeViewport(cb: () => void) {
  window.addEventListener("resize", cb);
  return () => window.removeEventListener("resize", cb);
}

function useGeometry(): Geometry {
  const size = useSyncExternalStore(
    subscribeViewport,
    () => `${window.innerWidth}x${window.innerHeight}`,
    () => "1440x900",
  );
  return useMemo(() => {
    const [w, h] = size.split("x").map(Number);
    if (w < 768) {
      const itemW = w * 0.58;
      const galleryW = w * 0.86;
      return {
        mobile: true,
        itemW,
        step: 28,
        radius: itemW * 1.9,
        turn: 14,
        spread: 1.2,
        grow: galleryW / itemW,
        lift: -0.2 * h,
        cy: 50,
      };
    }
    const itemW = Math.min(w * 0.26, 380);
    const galleryW = Math.min(w * 0.36, 540);
    return { mobile: false, itemW, step: 16, radius: itemW * 3.4, turn: 10, spread: 1.4, grow: galleryW / itemW, lift: 0, cy: 56 };
  }, [size]);
}

type Props = {
  initialSlug?: string;
  onAdd: (product: Product, options: CartOptions) => void;
};

export default function Stage({ initialSlug, onAdd }: Props) {
  const reduce = useReducedMotion() ?? false;
  const geo = useGeometry();
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const items = useMemo(() => centerOut(applyFilters(filters)), [filters]);
  const [active, setActive] = useState(() => {
    const i = initialSlug ? ALL_ORDERED.findIndex((p) => p.slug === initialSlug) : -1;
    return i >= 0 ? i : centerIndex(ALL_ORDERED);
  });
  const current: Product | undefined = items[Math.min(active, items.length - 1)];
  const team = filters.team ? teamById(filters.team) : null;

  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const t = useTransform(scrollYProgress, [0.04, 0.26], [0, 1], { clamp: true });
  const storyProgress = useTransform(scrollYProgress, [DETAIL_AT, 0.98], [0, 3]);

  const [phase, setPhase] = useState<Phase>("browse");
  const [step, setStep] = useState(0);
  useMotionValueEvent(t, "change", (v) => {
    const next: Phase = v < 0.02 ? "browse" : v > 0.97 ? "detail" : "moving";
    setPhase((p) => (p === next ? p : next));
  });
  useMotionValueEvent(storyProgress, "change", (v) => {
    const next = Math.max(0, Math.min(2, Math.floor(v)));
    setStep((s) => (s === next ? s : next));
  });

  const scrollToProgress = useCallback(
    (p: number, instant = false) => {
      const el = containerRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      const total = el.offsetHeight - window.innerHeight;
      window.scrollTo({ top: top + total * p, behavior: instant || reduce ? "auto" : "smooth" });
    },
    [reduce],
  );

  const changeFilters = (next: Filters) => {
    setFilters(next);
    setActive(centerIndex(applyFilters(next)));
  };
  const rotate = useCallback(
    (d: number) => setActive((a) => Math.max(0, Math.min(items.length - 1, a + d))),
    [items.length],
  );
  const openItem = (i: number) => {
    setActive(i);
    scrollToProgress(DETAIL_AT);
  };
  const back = useCallback(() => scrollToProgress(0), [scrollToProgress]);

  // Ссылка на товар вида ?p=slug открывает сразу карточку.
  useEffect(() => {
    if (initialSlug) scrollToProgress(DETAIL_AT, true);
  }, [initialSlug, scrollToProgress]);

  // В адресе — открытый товар, чтобы им можно было поделиться.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (phase === "detail" && current) url.searchParams.set("p", current.slug);
    else url.searchParams.delete("p");
    window.history.replaceState(window.history.state, "", url);
  }, [phase, current]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = containerRef.current;
      if (!el || e.target instanceof HTMLInputElement) return;
      const rect = el.getBoundingClientRect();
      const onStage = rect.top < window.innerHeight * 0.5 && rect.bottom > window.innerHeight * 0.5;
      if (!onStage) return;
      if (phase === "browse" && e.key === "ArrowRight") rotate(1);
      if (phase === "browse" && e.key === "ArrowLeft") rotate(-1);
      if (phase !== "browse" && e.key === "Escape") back();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, rotate, back]);

  // Свайп по витрине. Клик после свайпа не должен открывать карточку.
  const panned = useRef(false);

  const handleItemClick = (i: number) => {
    if (panned.current) return;
    if (Math.abs(i - active) <= 1) openItem(i);
    else setActive(i);
  };

  const browseOpacity = useTransform(t, [0, 0.35], [1, 0]);
  const browseY = useTransform(t, [0, 0.35], [0, -16]);
  // Белый фон карточки растекается кругом из-под выбранного товара.
  const flood = useTransform(() => {
    const v = Math.min(1, Math.max(0, (t.get() - 0.06) / 0.7));
    return `circle(${(v * v * 150).toFixed(2)}% at 50% ${geo.cy}%)`;
  });
  const detailOpacity = useTransform(t, [0.7, 1], [0, 1]);
  const detailLeftX = useTransform(t, [0.7, 1], [-28, 0]);
  const detailRightX = useTransform(t, [0.7, 1], [28, 0]);
  const stripOpacity = useTransform(t, [0.55, 0.9], [0, 1]);
  const stripY = useTransform(t, [0.55, 0.9], [-12, 0]);
  const galleryScale = useTransform(t, [0.82, 1], [0.94, 1]);

  const galleryW = geo.itemW * geo.grow;
  const story = current ? STORIES[current.story] : null;

  return (
    <section
      id="showcase"
      ref={containerRef}
      aria-label="Витрина"
      className="relative h-[400svh]"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* Фон: студия → фон команды → белый в карточке */}
        <div className="absolute inset-0 bg-bg" />
        <AnimatePresence>
          {team && (
            <motion.div
              key={team.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              className="absolute inset-0"
              style={{
                background: `radial-gradient(ellipse 75% 65% at 50% 58%, ${team.colors[0]}ee 0%, ${team.colors[0]}88 38%, #050507 82%)`,
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(112deg, transparent 60%, ${team.colors[1]}26 60%, ${team.colors[1]}26 63%, transparent 63%)`,
                }}
              />
              <span className="absolute top-[46%] left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-display text-[20vw] font-bold uppercase leading-none text-white/[0.07]">
                {team.name}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        {/* прожектор сверху */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 34% 62% at 50% -6%, rgba(255,255,255,0.16), rgba(255,255,255,0.04) 55%, transparent 72%)",
          }}
        />
        <motion.div aria-hidden className="absolute inset-0 bg-paper" style={{ clipPath: flood }} />

        {/* Фильтры */}
        <motion.div
          className="absolute top-[76px] left-0 right-0 z-30 md:top-[84px]"
          style={{ opacity: browseOpacity, y: browseY, pointerEvents: phase === "browse" ? "auto" : "none" }}
        >
          <FilterBar filters={filters} onChange={changeFilters} count={items.length} />
        </motion.div>

        {items.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center">
            <p className="font-display text-3xl uppercase">Ничего не нашлось</p>
            <button
              type="button"
              onClick={() => changeFilters(EMPTY_FILTERS)}
              className="cursor-pointer rounded-full border border-white/25 px-5 py-3 text-sm font-semibold hover:border-white"
            >
              Сбросить фильтры
            </button>
          </div>
        )}

        {/* Постамент под центральным товаром */}
        <motion.div
          aria-hidden
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            top: `calc(${geo.cy}% + ${geo.itemW * 0.3}px)`,
            width: geo.itemW * 1.25,
            height: geo.itemW * 0.2,
            opacity: browseOpacity,
            background: "radial-gradient(ellipse at center, rgba(215,255,60,0.35), rgba(215,255,60,0.08) 45%, transparent 70%)",
          }}
        />

        {/* Дуга товаров */}
        {items.length > 0 && (
          <motion.div
            className="absolute inset-0"
            style={{
              perspective: 1600,
              perspectiveOrigin: `50% ${geo.cy}%`,
              pointerEvents: phase === "browse" ? "auto" : "none",
              touchAction: "pan-y",
            }}
            onPanStart={() => {
              panned.current = true;
            }}
            onPanEnd={(_, info) => {
              if (info.offset.x < -40) rotate(1);
              else if (info.offset.x > 40) rotate(-1);
              setTimeout(() => (panned.current = false), 0);
            }}
          >
            <div
              className="absolute left-1/2"
              style={{ top: `${geo.cy}%`, transformStyle: "preserve-3d" }}
            >
              {items.map((p, i) => {
                const offset = i - active;
                if (Math.abs(offset) > VISIBLE) return null;
                return (
                  <ArcItem
                    key={p.slug}
                    product={p}
                    offset={offset}
                    geo={geo}
                    t={t}
                    reduce={reduce}
                    onClick={() => handleItemClick(i)}
                  />
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Подпись и стрелки под витриной */}
        {current && (
          <motion.div
            className="absolute left-0 right-0 z-20 flex items-center justify-center gap-4 px-4 md:gap-8"
            style={{
              top: `calc(${geo.cy}% + ${geo.itemW * 0.52}px)`,
              opacity: browseOpacity,
              pointerEvents: phase === "browse" ? "auto" : "none",
            }}
          >
            <NavButton label="Предыдущий товар" disabled={active === 0} onClick={() => rotate(-1)}>
              <ChevronLeft className="size-5" />
            </NavButton>
            <div className="min-w-0 text-center">
              <p className="truncate font-display text-xl uppercase tracking-wide md:text-2xl">{current.title}</p>
              <p className="text-sm text-ink/60">
                {current.subtitle} · {priceLabel(current)}
              </p>
            </div>
            <NavButton label="Следующий товар" disabled={active >= items.length - 1} onClick={() => rotate(1)}>
              <ChevronRight className="size-5" />
            </NavButton>
          </motion.div>
        )}

        <motion.button
          type="button"
          onClick={() => current && openItem(Math.min(active, items.length - 1))}
          className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 cursor-pointer flex-col items-center gap-1 text-xs uppercase tracking-[0.25em] text-ink/50 hover:text-ink"
          style={{ opacity: browseOpacity, pointerEvents: phase === "browse" ? "auto" : "none" }}
        >
          Листай вниз — откроется карточка
          <ChevronDown className="size-4 animate-bounce" />
        </motion.button>

        {/* Карточка товара */}
        {current && story && (
          <>
            <motion.div
              className="absolute left-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
              style={{
                top: geo.mobile ? "30%" : "56%",
                width: galleryW,
                height: galleryW * 0.75,
                opacity: detailOpacity,
                scale: galleryScale,
              }}
            >
              <Gallery key={current.slug} product={current} interactive={phase === "detail"} />
            </motion.div>

            {geo.mobile ? (
              <MobileDetail
                product={current}
                step={step}
                opacity={detailOpacity}
                interactive={phase === "detail"}
                onAdd={onAdd}
              />
            ) : (
              <>
                <motion.div
                  className="absolute top-1/2 left-[5vw] z-20 w-[23vw] max-w-sm -translate-y-1/2 text-paper-ink"
                  style={{ opacity: detailOpacity, x: detailLeftX, pointerEvents: phase === "detail" ? "auto" : "none" }}
                >
                  <ProductInfo product={current} onAdd={onAdd} />
                </motion.div>
                <motion.div
                  className="absolute top-1/2 right-[5vw] z-20 w-[22vw] max-w-xs -translate-y-1/2 text-paper-ink"
                  style={{ opacity: detailOpacity, x: detailRightX }}
                >
                  <SeasonStory product={current} step={step} />
                </motion.div>
                <motion.ol
                  aria-hidden
                  className="absolute top-1/2 right-[2vw] z-20 flex -translate-y-1/2 flex-col gap-3"
                  style={{ opacity: detailOpacity }}
                >
                  {story.steps.map((s, i) => (
                    <li
                      key={s.label}
                      className={`size-2.5 rounded-full border border-paper-ink transition-colors ${
                        i === step ? "bg-paper-ink" : "bg-transparent"
                      }`}
                    />
                  ))}
                </motion.ol>
              </>
            )}
          </>
        )}

        {/* Мини-лента: листать нельзя, вся лента — кнопка «назад к витрине» */}
        {current && (
          <motion.button
            type="button"
            onClick={back}
            aria-label="Вернуться к витрине"
            className="group absolute top-[72px] left-1/2 z-30 flex max-w-[92vw] -translate-x-1/2 cursor-pointer items-center gap-3 rounded-full bg-black/[0.04] py-1.5 pr-3 pl-4 text-paper-ink ring-1 ring-black/5 transition-colors hover:bg-black/[0.08] md:top-[80px]"
            style={{ opacity: stripOpacity, y: stripY, pointerEvents: phase === "browse" ? "none" : "auto" }}
          >
            <span className="flex shrink-0 items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
              <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
              <span className="hidden sm:inline">К витрине</span>
            </span>
            <span className="flex items-center gap-1.5 overflow-hidden">
              {items.map((p, i) =>
                Math.abs(i - active) > (geo.mobile ? 2 : VISIBLE) ? null : (
                  <span
                    key={p.slug}
                    className={`flex h-8 w-10 shrink-0 items-center justify-center rounded-lg transition-all md:h-9 md:w-12 ${
                      i === active ? "bg-white shadow ring-2 ring-paper-ink" : "opacity-40 grayscale"
                    }`}
                  >
                    <ProductVisual product={p} thumb sizes="48px" />
                  </span>
                ),
              )}
            </span>
          </motion.button>
        )}
      </div>
    </section>
  );
}

function ArcItem({
  product,
  offset,
  geo,
  t,
  reduce,
  onClick,
}: {
  product: Product;
  offset: number;
  geo: Geometry;
  t: MotionValue<number>;
  reduce: boolean;
  onClick: () => void;
}) {
  const theta = (offset * geo.step * Math.PI) / 180;
  const depth = geo.radius * (1 - Math.cos(theta));
  const target = {
    x: geo.radius * Math.sin(theta),
    y: -depth * 0.28,
    z: -depth,
    rotateY: -offset * geo.turn,
    scale: offset === 0 ? 1 : 0.8,
    opacity: Math.max(0, 1 - Math.abs(offset) * 0.2),
    center: offset === 0 ? 1 : 0,
  };
  const spring = reduce ? { stiffness: 2000, damping: 200 } : { stiffness: 170, damping: 26, mass: 0.9 };
  const x = useSpring(target.x, spring);
  const y = useSpring(target.y, spring);
  const z = useSpring(target.z, spring);
  const rotateY = useSpring(target.rotateY, spring);
  const scale = useSpring(target.scale, spring);
  const opacity = useSpring(target.opacity, spring);
  const center = useMotionValue(target.center);

  useEffect(() => {
    x.set(target.x);
    y.set(target.y);
    z.set(target.z);
    rotateY.set(target.rotateY);
    scale.set(target.scale);
    opacity.set(target.opacity);
    center.set(target.center);
  }, [target.x, target.y, target.z, target.rotateY, target.scale, target.opacity, target.center, x, y, z, rotateY, scale, opacity, center]);

  // При переходе в карточку: соседи разъезжаются и гаснут, центральный растёт до размера галереи.
  const finalX = useTransform(() => x.get() * (1 + geo.spread * t.get()));
  const finalY = useTransform(() => y.get() + center.get() * geo.lift * t.get());
  const finalScale = useTransform(() => scale.get() * (1 + center.get() * (geo.grow - 1) * t.get()));
  const finalOpacity = useTransform(() => {
    const v = t.get();
    const fade = center.get() ? 1 - Math.min(1, Math.max(0, (v - 0.82) / 0.18)) : 1 - v;
    return opacity.get() * fade;
  });

  const w = geo.itemW;
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={`${product.title}, ${priceLabel(product)}`}
      tabIndex={offset === 0 ? 0 : -1}
      className="absolute cursor-pointer outline-none"
      style={{
        left: -w / 2,
        top: -w * 0.375,
        width: w,
        height: w * 0.75,
        x: finalX,
        y: finalY,
        z,
        rotateY,
        scale: finalScale,
        opacity: finalOpacity,
        zIndex: 10 - Math.abs(offset),
      }}
    >
      <ProductVisual
        product={product}
        sizes="(max-width: 767px) 60vw, 380px"
        priority={Math.abs(offset) <= 1}
        className="pointer-events-none drop-shadow-[0_16px_14px_rgba(0,0,0,0.45)]"
      />
    </motion.button>
  );
}

function NavButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/20 transition-colors hover:border-white disabled:cursor-default disabled:opacity-30"
    >
      {children}
    </button>
  );
}

function ProductInfo({ product, onAdd }: { product: Product; onAdd: (p: Product, o: CartOptions) => void }) {
  const team = product.team ? teamById(product.team) : null;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-paper-muted">
        {team && <span className="size-2.5 rounded-full" style={{ background: team.colors[0] }} />}
        {team ? team.name : product.brand} · {product.year}
      </div>
      <div>
        <h2 className="font-display text-4xl font-bold uppercase leading-[0.95] lg:text-5xl">{product.title}</h2>
        <p className="mt-2 text-paper-muted">{product.subtitle}</p>
      </div>
      <p className="font-display text-3xl">{priceLabel(product)}</p>
      <p className="text-sm leading-relaxed text-paper-ink/80">{product.description.lead}</p>
      <ul className="flex flex-col gap-1.5 text-sm">
        {product.scale && (
          <li className="text-paper-muted">
            Масштаб <span className="text-paper-ink">{product.scale}</span> · {product.brand}
          </li>
        )}
        {product.licensed && (
          <li className="flex items-center gap-2">
            <ShieldCheck className="size-4" /> Официальная лицензия
          </li>
        )}
        {product.replica && (
          <li className="flex items-start gap-2">
            <span className="shrink-0 rounded-full bg-paper-ink px-2 py-0.5 text-xs font-semibold text-white">Реплика</span>
            <span className="text-paper-muted">{product.category === "model" ? "не LEGO и не лицензия команды" : "не лицензия команды"}</span>
          </li>
        )}
        <li className="flex items-center gap-2">
          <Truck className="size-4" /> Доставка {product.delivery[0]}–{product.delivery[1]} дней
        </li>
      </ul>
      <BuyBox key={product.slug} product={product} onAdd={onAdd} />
    </div>
  );
}

function SeasonStory({ product, step }: { product: Product; step: number }) {
  const story = STORIES[product.story];
  const s = story.steps[step];
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-paper-muted">
        {story.heading} · {step + 1}/3
      </p>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${product.slug}-${step}`}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.28 }}
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-paper-muted">{s.label}</p>
          <h3 className="mt-1 font-display text-3xl font-bold uppercase leading-none">{s.title}</h3>
          <p className="mt-3 leading-relaxed text-paper-ink/80">{s.text}</p>
        </motion.div>
      </AnimatePresence>
      {step < 2 && <p className="text-xs text-paper-muted">Листай дальше — следующий факт</p>}
    </div>
  );
}

function MobileDetail({
  product,
  step,
  opacity,
  interactive,
  onAdd,
}: {
  product: Product;
  step: number;
  opacity: MotionValue<number>;
  interactive: boolean;
  onAdd: (p: Product, o: CartOptions) => void;
}) {
  const story = STORIES[product.story];
  const s = story.steps[step];
  // У одежды внизу ещё выбор размера — историю сезона показываем одной строкой, чтобы не наезжать на фото.
  const compactStory = (product.sizes?.length ?? 0) > 1;
  return (
    <motion.div
      className="absolute bottom-0 left-0 right-0 z-20 flex flex-col gap-3 px-5 pb-5 text-paper-ink"
      style={{ opacity, pointerEvents: interactive ? "auto" : "none" }}
    >
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h2
            className={`font-display font-bold uppercase leading-none ${product.title.length > 16 ? "text-2xl" : "text-3xl"}`}
          >
            {product.title}
          </h2>
          <p className="mt-1 truncate text-sm text-paper-muted">
            {product.replica ? "Реплика · " : ""}
            {product.subtitle}
            {product.scale ? ` · ${product.scale}` : ""}
          </p>
        </div>
        <p className="shrink-0 font-display text-2xl">{priceLabel(product)}</p>
      </div>
      <div className={`rounded-2xl bg-black/[0.04] ${compactStory ? "px-4 py-3" : "p-4"}`}>
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-paper-muted">
          <span>
            {story.heading} · {s.label}
          </span>
          <span className="flex gap-1.5">
            {story.steps.map((x, i) => (
              <span key={x.label} className={`size-1.5 rounded-full ${i === step ? "bg-paper-ink" : "bg-black/20"}`} />
            ))}
          </span>
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${product.slug}-${step}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.24 }}
          >
            <h3 className={`font-display font-bold uppercase ${compactStory ? "mt-1 text-base" : "mt-2 text-xl"}`}>{s.title}</h3>
            {!compactStory && <p className="mt-1 text-sm leading-relaxed text-paper-ink/80">{s.text}</p>}
          </motion.div>
        </AnimatePresence>
      </div>
      <BuyBox key={product.slug} product={product} onAdd={onAdd} compact />
    </motion.div>
  );
}
