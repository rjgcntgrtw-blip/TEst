import type { Art } from "@/data/catalog";

// Заглушки вместо фото товаров. Когда появятся реальные фото на прозрачном фоне,
// этот компонент заменится на <Image>.

type Props = {
  art: Art;
  /** Номер «фото» в галерее: 0 — общий вид, дальше — крупные планы. */
  view?: number;
  className?: string;
  title?: string;
};

const VIEWS: Record<Art["type"], string[]> = {
  car: ["0 20 640 190", "210 30 280 150", "0 20 300 170", "400 60 240 140"],
  kit: ["0 0 400 300", "40 60 320 200", "0 0 400 300"],
  tshirt: ["0 0 400 400", "110 110 180 180", "0 0 400 400"],
  hoodie: ["0 0 400 400", "110 130 180 180", "0 0 400 400"],
  cap: ["0 0 400 300", "60 40 220 170", "0 0 400 300"],
  case: ["0 0 400 300", "60 90 280 170", "0 0 400 300"],
};

export const viewCount = (art: Art) => VIEWS[art.type].length;

export default function ProductArt({ art, view = 0, className, title }: Props) {
  const views = VIEWS[art.type];
  const viewBox = views[view % views.length];
  const [c1, c2, c3] = art.colors;
  const back = art.type !== "car" && view === views.length - 1;

  return (
    <svg
      viewBox={viewBox}
      className={className}
      role="img"
      aria-label={title}
      preserveAspectRatio="xMidYMid meet"
    >
      {art.type === "car" && <Car c1={c1} c2={c2} c3={c3} number={art.number} />}
      {art.type === "kit" && <KitBox c1={c1} c2={c2} c3={c3} number={art.number} />}
      {art.type === "tshirt" && <Tee c1={c1} c2={c2} c3={c3} print={art.print} back={back} />}
      {art.type === "hoodie" && <Hoodie c1={c1} c2={c2} c3={c3} print={art.print} back={back} />}
      {art.type === "cap" && <Cap c1={c1} c2={c2} c3={c3} />}
      {art.type === "case" && <Case c1={c1} c2={c2} />}
    </svg>
  );
}

type C = { c1: string; c2: string; c3: string };

export function Car({ c1, c2, c3, number }: C & { number?: string }) {
  return (
    <g>
      <ellipse cx="330" cy="190" rx="300" ry="9" fill="#000" opacity="0.28" />
      {/* заднее антикрыло */}
      <rect x="20" y="44" width="16" height="92" rx="3" fill={c2} />
      <rect x="14" y="42" width="84" height="15" rx="4" fill={c1} />
      <rect x="22" y="64" width="70" height="7" rx="3" fill={c1} opacity="0.85" />
      {/* корпус */}
      <path
        d="M52 132 L70 112 L128 104 C160 90 196 80 236 74 L256 58 C264 52 276 52 283 59 L296 82
           L336 88 C388 94 438 104 486 114 L566 126 C590 130 606 134 616 139 L616 148
           L520 152 L210 154 L66 151 Z"
        fill={c1}
      />
      {/* боковой понтон */}
      <path d="M176 112 C226 100 306 98 368 106 L392 132 C330 138 250 140 184 138 Z" fill={c2} opacity="0.9" />
      <path d="M300 120 L560 132" stroke={c3} strokeWidth="5" strokeLinecap="round" />
      {/* воздухозаборник и гало */}
      <ellipse cx="266" cy="66" rx="9" ry="7" fill="#0b0b0d" />
      <circle cx="304" cy="86" r="12" fill={c3} />
      <path d="M272 86 C292 64 334 66 352 92" stroke="#1d1d21" strokeWidth="6" fill="none" strokeLinecap="round" />
      {number && (
        <text x="430" y="126" fontSize="24" fontWeight="800" fill={c3} fontFamily="Arial, sans-serif">
          {number}
        </text>
      )}
      {/* переднее антикрыло */}
      <rect x="532" y="150" width="100" height="9" rx="3" fill={c2} />
      <rect x="624" y="130" width="9" height="30" rx="3" fill={c1} />
      {/* колёса */}
      <Wheel cx={152} cy={146} r={46} />
      <Wheel cx={500} cy={150} r={40} />
    </g>
  );
}

function Wheel({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#0d0d10" />
      <circle cx={cx} cy={cy} r={r * 0.62} fill="#26262b" />
      <circle cx={cx} cy={cy} r={r * 0.62} fill="none" stroke="#e5e5e5" strokeWidth="2" opacity="0.35" />
      <circle cx={cx} cy={cy} r={r * 0.14} fill="#9a9aa2" />
    </g>
  );
}

function KitBox({ c1, c2, c3, number }: C & { number?: string }) {
  return (
    <g>
      <ellipse cx="200" cy="286" rx="170" ry="8" fill="#000" opacity="0.25" />
      <rect x="30" y="40" width="340" height="240" rx="10" fill="#141418" />
      <rect x="30" y="40" width="340" height="240" rx="10" fill="none" stroke={c2} strokeWidth="4" />
      <rect x="30" y="40" width="340" height="42" rx="10" fill={c1} />
      <text x="48" y="68" fontSize="18" fontWeight="800" fill="#fff" fontFamily="Arial, sans-serif">
        КОНСТРУКТОР
      </text>
      <svg x="40" y="110" width="320" height="110" viewBox="0 20 640 190">
        <Car c1={c1} c2={c2} c3={c3} number={number} />
      </svg>
      <g fill={c2} opacity="0.9">
        {Array.from({ length: 6 }).map((_, i) => (
          <rect key={i} x={52 + i * 20} y={240} width="14" height="14" rx="2" />
        ))}
      </g>
    </g>
  );
}

function Tee({ c1, c2, c3, print, back }: C & { print?: string; back?: boolean }) {
  // Заглушка в стиле командной формы: кокетка и боковые полосы цвета команды, номер и абстрактные плашки спонсоров.
  return (
    <g>
      <ellipse cx="200" cy="378" rx="130" ry="8" fill="#000" opacity="0.2" />
      <path
        d="M140 40 C160 58 240 58 260 40 L350 82 L322 150 L292 138 L292 364 L108 364 L108 138 L78 150 L50 82 Z"
        fill={c1}
      />
      <path d="M140 40 C160 58 240 58 260 40 L350 82 L338 112 L262 84 L138 84 L62 112 L50 82 Z" fill={c2} />
      <rect x="108" y="150" width="12" height="214" fill={c2} />
      <rect x="280" y="150" width="12" height="214" fill={c2} />
      <path d="M140 40 C160 62 240 62 260 40" fill="none" stroke={c3} strokeWidth="5" opacity="0.6" />
      {!back ? (
        <g fill={c3}>
          <rect x="136" y="118" width="34" height="22" rx="4" />
          <text x="252" y="140" textAnchor="middle" fontSize="28" fontWeight="900" fontFamily="Arial Narrow, Arial, sans-serif">
            {print}
          </text>
          <rect x="140" y="182" width="120" height="16" rx="3" opacity="0.9" />
          <rect x="160" y="210" width="80" height="10" rx="3" opacity="0.6" />
          <rect x="170" y="230" width="60" height="10" rx="3" opacity="0.6" />
        </g>
      ) : (
        <g fill={c3}>
          <rect x="150" y="104" width="100" height="14" rx="3" opacity="0.8" />
          <text x="200" y="230" textAnchor="middle" fontSize="96" fontWeight="900" fontFamily="Arial Narrow, Arial, sans-serif">
            {print}
          </text>
        </g>
      )}
    </g>
  );
}

function Hoodie({ c1, c2, c3, print, back }: C & { print?: string; back?: boolean }) {
  return (
    <g>
      <ellipse cx="200" cy="382" rx="140" ry="8" fill="#000" opacity="0.2" />
      <path
        d="M150 60 C150 22 250 22 250 60 L346 104 L330 330 L296 330 L292 370 L108 370 L104 330 L70 330 L54 104 Z"
        fill={c1}
      />
      <path d="M346 104 L330 330 L312 330 L326 100 Z M54 104 L70 330 L88 330 L74 100 Z" fill={c2} />
      <path d="M156 64 C170 100 230 100 244 64" fill="none" stroke="#000" strokeWidth="6" opacity="0.35" />
      {!back && (
        <g>
          <line x1="186" y1="96" x2="182" y2="150" stroke={c3} strokeWidth="3" />
          <line x1="214" y1="96" x2="218" y2="150" stroke={c3} strokeWidth="3" />
          <rect x="140" y="270" width="120" height="50" rx="10" fill="#000" opacity="0.18" />
          <rect x="124" y="160" width="34" height="22" rx="4" fill={c3} />
          <text x="256" y="182" textAnchor="middle" fontSize="28" fontWeight="900" fill={c2} fontFamily="Arial Narrow, Arial, sans-serif">
            {print}
          </text>
          <rect x="146" y="206" width="108" height="14" rx="3" fill={c3} opacity="0.85" />
        </g>
      )}
      {back && (
        <text x="200" y="250" textAnchor="middle" fontSize="96" fontWeight="900" fill={c2} fontFamily="Arial Narrow, Arial, sans-serif">
          {print}
        </text>
      )}
    </g>
  );
}

function Cap({ c1, c2, c3 }: C) {
  return (
    <g>
      <ellipse cx="200" cy="262" rx="150" ry="8" fill="#000" opacity="0.2" />
      <path d="M86 196 C86 110 150 70 214 70 C282 70 318 120 318 196 Z" fill={c1} />
      <path d="M300 190 C340 190 378 200 392 214 C360 226 318 222 290 212 Z" fill={c2} />
      <path d="M92 196 L318 196" stroke={c2} strokeWidth="10" />
      <circle cx="214" cy="72" r="7" fill={c2} />
      <path d="M150 150 L250 150" stroke={c3} strokeWidth="6" strokeLinecap="round" opacity="0.9" />
    </g>
  );
}

function Case({ c1, c2 }: { c1: string; c2: string }) {
  return (
    <g>
      <ellipse cx="200" cy="270" rx="160" ry="8" fill="#000" opacity="0.2" />
      <rect x="50" y="230" width="300" height="30" rx="4" fill="#0f0f12" />
      <rect x="56" y="70" width="288" height="160" rx="6" fill="#dfe8f5" opacity="0.18" stroke="#c7d3e6" strokeWidth="3" />
      <path d="M70 80 L110 80 L70 150 Z" fill="#fff" opacity="0.25" />
      <svg x="80" y="150" width="240" height="72" viewBox="0 20 640 190">
        <Car c1={c1} c2={c2} c3="#F2C200" />
      </svg>
    </g>
  );
}
