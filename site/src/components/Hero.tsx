"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowDown } from "lucide-react";
import Image from "next/image";

const LETTERS = ["T", "M", "F", "F"];
const DRIVERS = ["Verstappen", "Leclerc", "Norris", "Hamilton", "Piastri", "Russell"];

// Тайминг сцены (секунды): огни загораются по одному, гаснут — и болид выезжает.
const LIGHT_ON = [0.35, 0.55, 0.75, 0.95, 1.15];
const LIGHTS_OUT = 1.6;

export default function Hero({ onEnter }: { onEnter: () => void }) {
  const reduce = useReducedMotion();

  return (
    <section
      aria-label="TMFF"
      className="relative flex h-[100svh] min-h-[560px] w-full items-center justify-center overflow-hidden bg-bg"
    >
      {/* строка пилотов, как имена актёров на постере */}
      <motion.ul
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: LIGHTS_OUT + 0.35, duration: 0.8 }}
        className="absolute top-[88px] left-0 right-0 hidden justify-between px-[5vw] font-display text-sm uppercase tracking-[0.35em] text-muted md:flex"
      >
        {DRIVERS.map((d) => (
          <li key={d}>{d}</li>
        ))}
      </motion.ul>

      {/* пять стартовых огней */}
      <div className="absolute top-[16%] left-1/2 flex -translate-x-1/2 gap-3 md:top-[20%] md:gap-5">
        {LIGHT_ON.map((delay, i) => (
          <motion.span
            key={i}
            initial={reduce ? false : { backgroundColor: "#1a0606", boxShadow: "0 0 0px rgba(255,31,31,0)" }}
            animate={
              reduce
                ? { backgroundColor: "#2a0808" }
                : {
                    backgroundColor: ["#1a0606", "#ff1f1f", "#ff1f1f", "#2a0808"],
                    boxShadow: [
                      "0 0 0px rgba(255,31,31,0)",
                      "0 0 28px rgba(255,31,31,0.9)",
                      "0 0 28px rgba(255,31,31,0.9)",
                      "0 0 0px rgba(255,31,31,0)",
                    ],
                  }
            }
            transition={{
              duration: LIGHTS_OUT + 0.15 - delay,
              delay,
              times: [0, 0.08, 0.92, 1],
              ease: "linear",
            }}
            className="block size-3 rounded-full md:size-5"
          />
        ))}
      </div>

      {/* большой «стартовый огонь» за буквами */}
      <motion.div
        aria-hidden
        initial={reduce ? false : { scale: 0.6, opacity: 0 }}
        animate={
          reduce
            ? { scale: 1, opacity: 0.35 }
            : { scale: [0.6, 1, 1, 1], opacity: [0, 0.95, 0.95, 0.35] }
        }
        transition={{ duration: LIGHTS_OUT + 0.4, times: [0, 0.4, 0.8, 1], ease: "easeOut" }}
        className="absolute top-1/2 left-1/2 size-[min(62vw,560px)] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: "radial-gradient(circle at 50% 45%, #ff3b3b 0%, #c40000 45%, #5a0000 75%, transparent 76%)",
          filter: "blur(0.5px)",
        }}
      />

      {/* огромные буквы */}
      <h1 className="relative z-10 flex select-none font-display font-bold leading-[0.8] tracking-[-0.02em] text-[34vw] md:text-[27vw]">
        {LETTERS.map((l, i) => (
          <motion.span
            key={i}
            initial={reduce ? false : { color: "#141417", y: 30, filter: "blur(10px)" }}
            animate={{ color: "#f4f4f5", y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.15 + i * 0.14, duration: 1.1, ease: [0.2, 0.7, 0.2, 1] }}
            className="inline-block"
          >
            {l}
          </motion.span>
        ))}
        <span className="sr-only"> — модели болидов и мерч</span>
      </h1>

      {/* болид перед буквами: выезжает в момент «lights out» */}
      <motion.div
        aria-hidden
        initial={reduce ? false : { x: "-18vw", opacity: 0, filter: "blur(14px)" }}
        animate={{ x: 0, opacity: 1, filter: "blur(0px)" }}
        transition={{ delay: LIGHTS_OUT, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-[52%] left-1/2 z-20 w-[min(96vw,900px)] -translate-x-1/2 md:top-[50%]"
      >
        {/* Заглушка: 3D-рендер. Заменить на картинку болида из Higgsfield (3/4 спереди, без фона). */}
        <Image
          src="/hero-car.webp"
          alt=""
          width={1193}
          height={444}
          priority
          sizes="(max-width: 767px) 96vw, 900px"
          className="h-auto w-full drop-shadow-[0_30px_40px_rgba(0,0,0,0.6)]"
        />
      </motion.div>

      {/* низ экрана */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: LIGHTS_OUT + 0.5, duration: 0.7 }}
        className="absolute bottom-6 left-0 right-0 z-30 flex items-end justify-between gap-6 px-5 md:bottom-10 md:px-[5vw]"
      >
        <p className="max-w-[18rem] text-sm leading-relaxed text-muted md:text-base">
          Коллекционные модели болидов, конструкторы и одежда для тех, кто не пропускает ни одного старта.
        </p>
        <button
          type="button"
          onClick={onEnter}
          className="group flex shrink-0 cursor-pointer items-center gap-2 rounded-full border border-white/25 px-5 py-3 text-sm font-semibold transition-colors hover:border-accent hover:text-accent"
        >
          Смотреть витрину
          <ArrowDown className="size-4 transition-transform group-hover:translate-y-0.5" />
        </button>
      </motion.div>

      <motion.span
        aria-hidden
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: LIGHTS_OUT + 0.5 }}
        className="absolute top-1/2 right-3 hidden -translate-y-1/2 rotate-90 font-display text-sm tracking-[0.4em] text-muted md:block"
      >
        [ 2026 ]
      </motion.span>
    </section>
  );
}
