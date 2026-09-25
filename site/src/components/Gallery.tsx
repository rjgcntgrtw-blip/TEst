"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/data/catalog";
import ProductArt, { viewCount } from "./ProductArt";

const slide = {
  enter: (dir: number) => ({ x: dir > 0 ? "55%" : "-55%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? "-55%" : "55%", opacity: 0 }),
};

/** Фото товара: листаются свайпом, стрелками или точками. */
export default function Gallery({ product, interactive }: { product: Product; interactive: boolean }) {
  const [[page, dir], setPage] = useState<[number, number]>([0, 0]);
  const count = viewCount(product.art);
  const index = ((page % count) + count) % count;
  const paginate = (d: number) => setPage([page + d, d]);

  return (
    <div
      className="relative h-full w-full select-none"
      style={{ pointerEvents: interactive ? "auto" : "none" }}
      aria-roledescription="галерея"
    >
      <div className="relative h-full w-full overflow-hidden rounded-3xl">
        <AnimatePresence initial={false} custom={dir}>
          <motion.div
            key={page}
            custom={dir}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ x: { type: "spring", stiffness: 320, damping: 34 }, opacity: { duration: 0.2 } }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragEnd={(_, { offset, velocity }) => {
              if (offset.x < -70 || velocity.x < -500) paginate(1);
              else if (offset.x > 70 || velocity.x > 500) paginate(-1);
            }}
            className="absolute inset-0 flex cursor-grab items-center justify-center active:cursor-grabbing"
            style={{ touchAction: "pan-y" }}
          >
            <ProductArt
              art={product.art}
              view={index}
              title={`${product.title}, фото ${index + 1} из ${count}`}
              className="pointer-events-none h-full w-full"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <button
        type="button"
        aria-label="Предыдущее фото"
        onClick={() => paginate(-1)}
        className="absolute top-1/2 -left-2 flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/5 text-paper-ink transition-colors hover:bg-black/10 md:-left-6"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        aria-label="Следующее фото"
        onClick={() => paginate(1)}
        className="absolute top-1/2 -right-2 flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/5 text-paper-ink transition-colors hover:bg-black/10 md:-right-6"
      >
        <ChevronRight className="size-5" />
      </button>

      <div className="absolute -bottom-7 left-0 right-0 flex justify-center gap-2">
        {Array.from({ length: count }).map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Фото ${i + 1}`}
            aria-current={i === index}
            onClick={() => setPage([page + (i - index), i > index ? 1 : -1])}
            className="flex size-6 cursor-pointer items-center justify-center"
          >
            <span className={`block h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-paper-ink" : "w-1.5 bg-black/25"}`} />
          </button>
        ))}
      </div>
    </div>
  );
}
