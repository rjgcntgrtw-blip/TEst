import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Превью ссылки на сайт в Telegram и соцсетях. Рисуется при сборке, без картинок из сети.
export const alt = "TMFF — модели болидов и мерч";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const font = (file: string) => readFile(join(process.cwd(), "assets/fonts", file));

export default async function Image() {
  const [oswaldLat, oswaldCyr, manropeLat, manropeCyr] = await Promise.all([
    font("oswald-latin-700.woff"),
    font("oswald-cyrillic-700.woff"),
    font("manrope-latin-500.woff"),
    font("manrope-cyrillic-500.woff"),
  ]);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "radial-gradient(circle at 70% 45%, #5a0000 0%, #1a0404 34%, #07070a 62%)",
          color: "#f4f4f5",
          fontFamily: "Manrope",
        }}
      >
        <div style={{ display: "flex", gap: 18 }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} style={{ width: 34, height: 34, borderRadius: 34, background: "#ff1f1f", boxShadow: "0 0 30px #ff1f1f" }} />
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontFamily: "Oswald", fontSize: 260, lineHeight: 0.85, letterSpacing: -6 }}>TMFF</div>
          <div style={{ fontSize: 40, marginTop: 28, color: "#d7ff3c" }}>Модели болидов и командный мерч</div>
        </div>
        <div style={{ fontSize: 26, color: "#8b8b95" }}>Коллекционные модели 1:43, 1:24 и 1:8 · доставка по России</div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Oswald", data: oswaldLat, weight: 700, style: "normal" },
        { name: "Oswald", data: oswaldCyr, weight: 700, style: "normal" },
        { name: "Manrope", data: manropeLat, weight: 500, style: "normal" },
        { name: "Manrope", data: manropeCyr, weight: 500, style: "normal" },
      ],
    },
  );
}
