import type { Metadata, Viewport } from "next";
import { Manrope, Oswald } from "next/font/google";
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
  title: "TMFF — модели болидов и мерч для фанатов гонок",
  description:
    "Коллекционные модели болидов, конструкторы и одежда для фанатов автогонок. Доставка по России.",
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
