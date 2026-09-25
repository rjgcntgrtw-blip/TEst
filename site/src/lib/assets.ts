import { existsSync } from "node:fs";
import { join } from "node:path";
import { TEAMS, type TeamId } from "@/data/catalog";

// Файлы из Higgsfield необязательны: если их ещё нет в public/, сайт показывает запасной вариант.
const PUBLIC = join(process.cwd(), "public");
const has = (path: string) => existsSync(join(PUBLIC, path));
const first = (...paths: string[]) => paths.find(has) ?? null;

export type HeroVideo = { desktop: string | null; desktopWebm: string | null; mobile: string | null; poster: string | null };

export type SiteAssets = {
  heroVideo: HeroVideo | null;
  heroCar: { src: string; generated: boolean };
  teamBackgrounds: Partial<Record<TeamId, string>>;
};

export function getAssets(): SiteAssets {
  const video: HeroVideo = {
    desktop: first("intro/hero-desktop.mp4"),
    desktopWebm: first("intro/hero-desktop.webm"),
    mobile: first("intro/hero-mobile.mp4"),
    poster: first("intro/hero-poster.webp", "intro/hero-poster.jpg"),
  };
  const car = first("intro/hero-car.webp", "intro/hero-car.png");
  const teamBackgrounds: Partial<Record<TeamId, string>> = {};
  for (const team of TEAMS) {
    const bg = first(`teams/${team.id}.webp`, `teams/${team.id}.jpg`);
    if (bg) teamBackgrounds[team.id] = `/${bg}`;
  }
  return {
    heroVideo: video.desktop || video.mobile ? {
      desktop: video.desktop && `/${video.desktop}`,
      desktopWebm: video.desktopWebm && `/${video.desktopWebm}`,
      mobile: video.mobile && `/${video.mobile}`,
      poster: video.poster && `/${video.poster}`,
    } : null,
    heroCar: car ? { src: `/${car}`, generated: true } : { src: "/hero-car.webp", generated: false },
    teamBackgrounds,
  };
}

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://tmff.ru").replace(/\/$/, "");
