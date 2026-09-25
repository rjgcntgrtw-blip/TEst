"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, X } from "lucide-react";
import {
  SUBFILTERS,
  TEAMS,
  applyFilters,
  type Category,
  type Filters,
  type TeamId,
} from "@/data/catalog";

type Props = {
  filters: Filters;
  onChange: (next: Filters) => void;
  count: number;
};

type Menu = "team" | "year" | null;

export default function FilterBar({ filters, onChange, count }: Props) {
  const [open, setOpen] = useState<Menu>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) {
        setOpen(null);
      }
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  const pick = (patch: Partial<Filters>) => {
    onChange({ ...filters, ...patch });
    setOpen(null);
  };

  const toggleCategory = (category: Category) =>
    onChange({ ...filters, category: filters.category === category ? null : category, sub: null });

  // В списках показываем только то, что есть при остальных выбранных фильтрах.
  const teamOptions = TEAMS.filter((t) => applyFilters(filters, "team").some((p) => p.team === t.id));
  const yearOptions = [...new Set(applyFilters(filters, "year").map((p) => p.year))].sort((a, b) => b - a);
  const teamName = filters.team ? TEAMS.find((t) => t.id === filters.team)?.name : null;
  const active = filters.category || filters.team || filters.year;

  return (
    <div ref={ref} className="flex flex-col items-center gap-3">
      <div className="no-scrollbar flex max-w-full items-center gap-1.5 overflow-x-auto px-3 md:gap-3">
        <Pill active={filters.category === "merch"} onClick={() => toggleCategory("merch")}>
          Мерч
        </Pill>
        <Pill active={filters.category === "model"} onClick={() => toggleCategory("model")}>
          Модели
        </Pill>
        <MenuButton
          label={teamName ?? "Команда"}
          active={!!filters.team}
          open={open === "team"}
          onToggle={() => setOpen(open === "team" ? null : "team")}
        />
        <MenuButton
          label={filters.year ? String(filters.year) : "Год"}
          active={!!filters.year}
          open={open === "year"}
          onToggle={() => setOpen(open === "year" ? null : "year")}
        />
      </div>

      {/* Выпадающий список — панелью под строкой: так он не обрезается на телефоне */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key={open}
            role="listbox"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="flex max-w-3xl flex-wrap justify-center gap-2 rounded-3xl border border-white/10 bg-surface/90 p-2 shadow-2xl backdrop-blur"
          >
            {open === "team" ? (
              <>
                <Option selected={!filters.team} onClick={() => pick({ team: null })}>
                  Все команды
                </Option>
                {teamOptions.map((t) => (
                  <Option key={t.id} selected={filters.team === t.id} onClick={() => pick({ team: t.id as TeamId })}>
                    <span
                      className="size-3 rounded-full"
                      style={{ background: t.colors[0], boxShadow: `inset 0 0 0 2px ${t.colors[1]}` }}
                    />
                    {t.name}
                  </Option>
                ))}
              </>
            ) : (
              <>
                <Option selected={!filters.year} onClick={() => pick({ year: null })}>
                  Все годы
                </Option>
                {yearOptions.map((y) => (
                  <Option key={y} selected={filters.year === y} onClick={() => pick({ year: y })}>
                    {y}
                  </Option>
                ))}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex min-h-8 flex-wrap items-center justify-center gap-2 px-4 text-xs md:text-sm">
        <AnimatePresence mode="popLayout" initial={false}>
          {filters.category ? (
            SUBFILTERS[filters.category].map((s) => (
              <motion.button
                key={s.id}
                type="button"
                layout
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                onClick={() => onChange({ ...filters, sub: filters.sub === s.id ? null : s.id })}
                className={`cursor-pointer rounded-full px-3 py-1.5 transition-colors ${
                  filters.sub === s.id ? "bg-white text-black" : "bg-white/8 text-ink/80 hover:bg-white/15"
                }`}
              >
                {s.label}
              </motion.button>
            ))
          ) : active ? null : (
            <motion.span
              key="popular"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="uppercase tracking-[0.25em] text-ink/60"
            >
              Популярное сейчас
            </motion.span>
          )}
          {active && (
            <motion.button
              key="reset"
              type="button"
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => onChange({ category: null, sub: null, team: null, year: null })}
              className="flex cursor-pointer items-center gap-1 rounded-full px-3 py-1.5 text-ink/60 hover:text-ink"
            >
              <X className="size-3.5" /> Сбросить · {count}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`h-10 shrink-0 cursor-pointer rounded-full border px-4 text-[13px] font-semibold transition-colors md:h-11 md:px-6 md:text-sm ${
        active ? "border-white bg-white text-black" : "border-white/20 bg-black/20 backdrop-blur hover:border-white/60"
      }`}
    >
      {children}
    </button>
  );
}

function MenuButton({
  label,
  active,
  open,
  onToggle,
}: {
  label: string;
  active: boolean;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-expanded={open}
      onClick={onToggle}
      className={`flex h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-4 text-[13px] font-semibold transition-colors md:h-11 md:gap-2 md:px-6 md:text-sm ${
        active ? "border-white bg-white text-black" : "border-white/20 bg-black/20 backdrop-blur hover:border-white/60"
      }`}
    >
      {label}
      <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
    </button>
  );
}

function Option({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onClick}
      className={`flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors ${
        selected ? "bg-white text-black" : "text-ink/80 hover:bg-white/10 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
