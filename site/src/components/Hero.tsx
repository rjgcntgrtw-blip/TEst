"use client";

import { useEffect } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowDown } from "lucide-react";
import Image from "next/image";
import type { HeroVideo } from "@/lib/assets";

const LETTERS = ["T", "M", "F", "F"];
const DRIVERS = ["Verstappen", "Leclerc", "Norris", "Hamilton", "Piastri", "Russell"];

// Тайминг сцены (секунды): огни загораются по одному, гаснут — и болид выезжает.
const LIGHT_ON = [0.35, 0.55, 0.75, 0.95, 1.15];
const LIGHTS_OUT = 1.6;
/** Когда интро закончилось и его можно не показывать до конца визита. */
export const INTRO_SECONDS = LIGHTS_OUT + 1.2;

type Props = {
  onEnter: () => void;
  /** Показать сразу финальный кадр: интро уже видели или его пропустили. */
  skip: boolean;
  onSkip: () => void;
  video: HeroVideo | null;
  car: { src: string; generated: boolean };
};

export default function Hero({ onEnter, skip, onSkip, video, car }: Props) {
  const reduce = useReducedMotion();
  const still = Boolean(reduce) || skip;
  const at = (s: number) => (still ? 0 : s);

  // Клик, прокрутка или клавиша во время интро — сразу финальный кадр.
  useEffect(() => {
    if (still) return;
    const stop = () => onSkip();
    const events = ["pointerdown", "wheel", "touchmove", "keydown"] as const;
    events.forEach((e) => window.addEventListener(e, stop, { once: true, passive: true }));
    const id = setTimeout(() => events.forEach((e) => window.removeEventListener(e, stop)), INTRO_SECONDS * 1000);
    return () => {
      clearTimeout(id);
      events.forEach((e) => window.removeEventListener(e, stop));
    };
  }, [still, onSkip]);

  return (
    <section aria-label="TMFF" className="relative flex h-[100svh] min-h-[560px] w-full items-center justify-center overflow-hidden bg-bg">
      {/* видео из Higgsfield на фоне — появляется после «lights out» */}
      {video && (
        <motion.div
          aria-hidden
          className="absolute inset-0"
          initial={still ? false : { opacity: 0 }}
          animate={{ opacity: 0.55 }}
          transition={{ delay: at(LIGHTS_OUT), duration: 1.2 }}
        >
          {reduce ? (
            video.poster && <Image src={video.poster} alt="" fill priority sizes="100vw" className="object-cover" />
          ) : (
            <video className="h-full w-full object-cover" autoPlay muted loop playsInline preload="metadata" poster={video.poster ?? undefined}>
              {video.mobile && <source src={video.mobile} media="(max-width: 767px)" type="video/mp4" />}
              {video.desktopWebm && <source src={video.desktopWebm} type="video/webm" />}
              {video.desktop && <source src={video.desktop} type="video/mp4" />}
            </video>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/30 to-bg/80" />
        </motion.div>
      )}

      {/* строка пилотов, как имена актёров на постере */}
      <motion.ul
        initial={still ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: at(LIGHTS_OUT + 0.35), duration: 0.8 }}
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
            initial={still ? false : { backgroundColor: "#1a0606", boxShadow: "0 0 0px rgba(255,31,31,0)" }}
            animate={
              still
                ? { backgroundColor: "#2a0808" }
                : {
                    backgroundColor: ["#1a0606", "#ff1f1f", "#ff1f1f", "#2a0808"],
                    boxShadow: ["0 0 0px rgba(255,31,31,0)", "0 0 28px rgba(255,31,31,0.9)", "0 0 28px rgba(255,31,31,0.9)", "0 0 0px rgba(255,31,31,0)"],
                  }
            }
            transition={{ duration: LIGHTS_OUT + 0.15 - delay, delay, times: [0, 0.08, 0.92, 1], ease: "linear" }}
            className="block size-3 rounded-full md:size-5"
          />
        ))}
      </div>

      {/* большой «стартовый огонь» за буквами */}
      <motion.div
        aria-hidden
        initial={still ? false : { scale: 0.6, opacity: 0 }}
        animate={still ? { scale: 1, opacity: video ? 0.2 : 0.35 } : { scale: [0.6, 1, 1, 1], opacity: [0, 0.95, 0.95, video ? 0.2 : 0.35] }}
        transition={{ duration: LIGHTS_OUT + 0.4, times: [0, 0.4, 0.8, 1], ease: "easeOut" }}
        className="absolute top-1/2 left-1/2 size-[min(62vw,560px)] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(circle at 50% 45%, #ff3b3b 0%, #c40000 45%, #5a0000 75%, transparent 76%)", filter: "blur(0.5px)" }}
      />

      {/* огромные буквы */}
      <h1 className="relative z-10 flex select-none font-display font-bold leading-[0.8] tracking-[-0.02em] text-[34vw] md:text-[27vw]">
        {LETTERS.map((l, i) => (
          <motion.span
            key={i}
            initial={still ? false : { color: "#141417", y: 30, filter: "blur(10px)" }}
            animate={{ color: "#f4f4f5", y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.15 + i * 0.14, duration: 1.1, ease: [0.2, 0.7, 0.2, 1] }}
            className="inline-block"
          >
            {l}
          </motion.span>
        ))}
        <span className="sr-only"> — модели болидов и мерч</span>
      </h1>

      {/* болид перед буквами: выезжает в момент «lights out» со скоростными полосами */}
      <motion.div
        aria-hidden
        initial={still ? false : { x: "-18vw", opacity: 0, filter: "blur(14px)" }}
        animate={{ x: 0, opacity: 1, filter: "blur(0px)" }}
        transition={{ delay: at(LIGHTS_OUT), duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-[52%] left-1/2 z-20 w-[min(96vw,900px)] -translate-x-1/2 md:top-[50%]"
      >
        {!still && (
          <motion.span
            className="absolute top-1/2 right-[70%] h-px w-[60vw] bg-gradient-to-l from-white/60 to-transparent"
            initial={{ opacity: 0, scaleX: 0.2 }}
            animate={{ opacity: [0, 0.9, 0], scaleX: [0.2, 1, 1.2] }}
            transition={{ delay: LIGHTS_OUT, duration: 0.9, ease: "easeOut" }}
            style={{ transformOrigin: "right" }}
          />
        )}
        <div className="relative aspect-[1193/444] w-full">
          <Image
            src={car.src}
            alt=""
            fill
            priority
            sizes="(max-width: 767px) 96vw, 900px"
            className="object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,0.6)]"
          />
        </div>
      </motion.div>

      {/* низ экрана */}
      <motion.div
        initial={still ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: at(LIGHTS_OUT + 0.5), duration: 0.7 }}
        className="absolute bottom-6 left-0 right-0 z-30 flex items-end justify-between gap-6 px-5 md:bottom-10 md:px-[5vw]"
      >
        <p className="max-w-[18rem] text-sm leading-relaxed text-muted md:text-base">
          Коллекционные модели болидов, конструкторы и одежда в стиле командной формы.
        </p>
        <button
          type="button"
          onClick={onEnter}
          className="group flex shrink-0 cursor-pointer items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-black transition-transform hover:scale-[1.03] active:scale-[0.98]"
        >
          Смотреть витрину
          <ArrowDown className="size-4 transition-transform group-hover:translate-y-0.5" />
        </button>
      </motion.div>

      <motion.span
        aria-hidden
        initial={still ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: at(LIGHTS_OUT + 0.5) }}
        className="absolute top-1/2 right-3 hidden -translate-y-1/2 rotate-90 font-display text-sm tracking-[0.4em] text-muted md:block"
      >
        [ 2026 ]
      </motion.span>
    </section>
  );
}
