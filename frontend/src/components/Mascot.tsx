import { useI18n } from "../i18n/I18nContext";

/** Rounded 5-point star centred on (cx, cy). */
function starPoints(cx: number, cy: number, outer: number, inner: number) {
  return Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 === 0 ? outer : inner;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
}
const SPARKLE = "M0,-10 L2.6,-2.6 L10,0 L2.6,2.6 L0,10 L-2.6,2.6 L-10,0 L-2.6,-2.6 Z";

/** "Sparky" - the friendly star mascot. Pure SVG, animated with CSS (disabled for reduced motion). */
export default function Mascot() {
  const { t } = useI18n();
  return (
    <svg className="mascot" viewBox="0 0 420 340" role="img" aria-label="Sparky, the Spark English Kids star mascot waving hello">
      <defs>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7aa2ff" stopOpacity=".45" />
          <stop offset="100%" stopColor="#7aa2ff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffe08a" />
          <stop offset="100%" stopColor="#ffbf3f" />
        </linearGradient>
      </defs>

      <circle cx="210" cy="175" r="165" fill="url(#glow)" />
      <ellipse className="mascot-shadow" cx="210" cy="316" rx="82" ry="10" fill="#000" opacity=".25" />

      <g className="mascot-bob">
        {/* waving arm (behind body) */}
        <g className="mascot-wave">
          <path d="M296 198 Q336 176 344 138" stroke="#ffbf3f" strokeWidth="20" strokeLinecap="round" fill="none" />
          <circle cx="345" cy="132" r="14" fill="#ffd36e" />
        </g>
        <path d="M124 200 Q92 214 84 244" stroke="#ffbf3f" strokeWidth="20" strokeLinecap="round" fill="none" />
        <circle cx="83" cy="249" r="13" fill="#ffd36e" />
        {/* feet */}
        <ellipse cx="180" cy="294" rx="24" ry="13" fill="#ff7bd3" />
        <ellipse cx="240" cy="294" rx="24" ry="13" fill="#ff7bd3" />
        {/* body */}
        <polygon points={starPoints(210, 176, 128, 70)} fill="url(#body)" stroke="url(#body)" strokeWidth="26" strokeLinejoin="round" />
        {/* face */}
        <g className="mascot-eyes">
          <ellipse cx="180" cy="170" rx="14" ry="17" fill="#fff" />
          <ellipse cx="240" cy="170" rx="14" ry="17" fill="#fff" />
          <circle cx="183" cy="173" r="8" fill="#1b2147" />
          <circle cx="243" cy="173" r="8" fill="#1b2147" />
          <circle cx="186" cy="169" r="2.8" fill="#fff" />
          <circle cx="246" cy="169" r="2.8" fill="#fff" />
        </g>
        <ellipse cx="156" cy="200" rx="13" ry="8" fill="#ff7bd3" opacity=".55" />
        <ellipse cx="264" cy="200" rx="13" ry="8" fill="#ff7bd3" opacity=".55" />
        <path d="M190 204 Q210 228 230 204 Z" fill="#7a2a4a" stroke="#1b2147" strokeWidth="4" strokeLinejoin="round" />
        <path d="M198 214 Q210 224 222 214 Q210 210 198 214 Z" fill="#ff7bd3" />
      </g>

      {/* speech bubble */}
      <g className="mascot-bubble">
        <rect x="262" y="30" width="124" height="52" rx="26" fill="#fff" />
        <path d="M290 80 L282 102 L310 82 Z" fill="#fff" />
        <text x="324" y="64" textAnchor="middle" fontFamily="Baloo 2, cursive" fontWeight="700" fontSize="26" fill="#1b2147">{t("hero_bubble")}</text>
      </g>

      {/* floating sparkles */}
      <path className="float-star s1" d={SPARKLE} transform="translate(70 90)" />
      <path className="float-star s2" d={SPARKLE} transform="translate(46 190) scale(.7)" />
      <path className="float-star s3" d={SPARKLE} transform="translate(372 230) scale(.85)" />
      <circle className="doodle" cx="110" cy="296" r="8" />
      <circle className="doodle d2" cx="338" cy="290" r="6" />
    </svg>
  );
}
