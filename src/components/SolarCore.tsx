import { Symbol } from "./Brand";
import type { Translation } from "../i18n/en";

export function SolarCore({ t }: { t: Translation }) {
  return (
    <div className="solar-visual" aria-hidden="true">
      <div className="core-coordinate coordinate-top">
        Z / 001 <span>{t.hero.core}</span>
      </div>
      <div className="core-field">
        <svg className="orbital-grid" viewBox="0 0 600 600" fill="none">
          <defs>
            <radialGradient id="coreGlow">
              <stop stopColor="#efa84b" stopOpacity=".13" />
              <stop offset="1" stopColor="#efa84b" stopOpacity="0" />
            </radialGradient>
            <linearGradient
              id="orbitStroke"
              x1="90"
              y1="500"
              x2="500"
              y2="80"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#efa84b" stopOpacity=".04" />
              <stop offset=".55" stopColor="#efa84b" stopOpacity=".55" />
              <stop offset="1" stopColor="#efa84b" stopOpacity=".07" />
            </linearGradient>
          </defs>
          <circle cx="300" cy="300" r="275" fill="url(#coreGlow)" />
          <g stroke="#4a4940" strokeWidth=".6">
            <path d="M0 300h600M300 0v600M90 90l420 420M90 510 510 90" />
            <circle cx="300" cy="300" r="275" strokeDasharray="2 8" />
            <circle cx="300" cy="300" r="238" />
            <circle cx="300" cy="300" r="185" />
            <circle cx="300" cy="300" r="104" strokeDasharray="2 6" />
          </g>
          <g stroke="url(#orbitStroke)">
            <ellipse
              cx="300"
              cy="300"
              rx="236"
              ry="116"
              transform="rotate(-38 300 300)"
            />
            <ellipse
              cx="300"
              cy="300"
              rx="236"
              ry="116"
              transform="rotate(38 300 300)"
            />
            <ellipse
              cx="300"
              cy="300"
              rx="90"
              ry="235"
              transform="rotate(38 300 300)"
            />
          </g>
          <g className="orbit-motion">
            <circle
              cx="300"
              cy="300"
              r="185"
              stroke="#edb466"
              strokeDasharray="85 1080"
            />
            <circle cx="485" cy="300" r="4" fill="#f5bc69" />
          </g>
          <g fill="#dfa454">
            <circle cx="151" cy="114" r="3" />
            <circle cx="105" cy="438" r="2" />
            <circle cx="409" cy="511" r="2.5" />
            <circle cx="342" cy="67" r="2" />
          </g>
          <path
            d="M505 176h10m-5-5v10M91 385h10m-5-5v10M390 60h10m-5-5v10"
            stroke="#7b7663"
          />
        </svg>
        <div className="solar-halo" />
        <div className="core-symbol">
          <Symbol />
        </div>
        <div className="spark spark-one" />
        <div className="spark spark-two" />
        <div className="spark spark-three" />
      </div>
      <div className="core-coordinate coordinate-bottom">
        <span className="tiny-spark" />
        {t.hero.coreNote}
        <span>01 — ∞</span>
      </div>
    </div>
  );
}
