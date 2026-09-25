import type { Metadata, Viewport } from "next";
import { Manrope, Oswald } from "next/font/google";
import { SITE_URL } from "@/lib/assets";
import "./globals.css";

const display = Oswald({
  variable: "--font-display",
  subsets: ["latin", "cyrillic"],
  weight: ["500", "700"],
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "TMFF — модели болидов и мерч для фанатов гонок",
    template: "%s · TMFF",
  },
  description:
    "Коллекционные модели болидов, конструкторы и одежда в стиле командной формы. Доставка по России.",
  openGraph: { siteName: "TMFF", locale: "ru_RU", type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#07070a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={`${display.variable} ${body.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
