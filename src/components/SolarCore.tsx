import { useEffect, useRef } from "react";
import { Symbol } from "./Brand";
import type { Translation } from "../i18n/en";
import { orbits, particles, sampleParticle } from "../animation/orbits";
import { animateOrbits } from "../animation/animateOrbits";

export function SolarCore({ t }: { t: Translation }) {
  const field = useRef<HTMLDivElement>(null);
  const layer = useRef<SVGGElement>(null);
  useEffect(() => {
    if (field.current && layer.current)
      return animateOrbits(layer.current, field.current);
  }, []);

  return (
    <div className="solar-visual" aria-hidden="true">
      <div ref={field} className="core-field">
        <svg className="orbital-grid" viewBox="0 0 600 600" fill="none">
          <defs>
            <radialGradient id="coreGlow">
              <stop stopColor="var(--accent)" stopOpacity=".11" />
              <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
            </radialGradient>
            <linearGradient
              id="orbitStroke"
              x1="90"
              y1="500"
              x2="500"
              y2="80"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="var(--accent)" stopOpacity=".04" />
              <stop offset=".55" stopColor="var(--accent)" stopOpacity=".4" />
              <stop offset="1" stopColor="var(--accent)" stopOpacity=".07" />
            </linearGradient>
          </defs>
          <circle cx="300" cy="300" r="275" fill="url(#coreGlow)" />
          <g stroke="var(--orbit-line)" strokeWidth=".6">
            <path d="M0 300h600M300 0v600M90 90l420 420M90 510 510 90" />
            <circle cx="300" cy="300" r="275" strokeDasharray="2 8" />
            <circle cx="300" cy="300" r="238" />
            <circle cx="300" cy="300" r="104" strokeDasharray="2 6" />
          </g>
          {orbits.map((orbit) => (
            <ellipse
              key={orbit.id}
              data-orbit={orbit.id}
              cx="300"
              cy="300"
              rx={orbit.rx}
              ry={orbit.ry}
              transform={`rotate(${orbit.rotation} 300 300)`}
              stroke={
                orbit.id === "inner" ? "var(--orbit-line)" : "url(#orbitStroke)"
              }
            />
          ))}
          <g ref={layer} className="orbit-particles" data-motion="paused">
            {particles.map((particle) => {
              const sample = sampleParticle(particle, 0);
              return (
                <g
                  key={particle.id}
                  data-particle={particle.id}
                  className={particle.mobile ? "" : "desktop-particle"}
                >
                  <g className="orbit-trail" fill="var(--accent)">
                    {sample.trail.map((point, index) => (
                      <circle
                        key={index}
                        style={{
                          transform: `translate(${point.x}px, ${point.y}px)`,
                        }}
                        r={point.radius}
                        opacity={point.opacity}
                      />
                    ))}
                  </g>
                  <circle
                    className="orbit-head"
                    style={{
                      transform: `translate(${sample.head.x}px, ${sample.head.y}px)`,
                    }}
                    r={particle.radius}
                    fill="var(--accent-bright)"
                    opacity={particle.opacity}
                  />
                </g>
              );
            })}
          </g>
          <path
            d="M505 176h10m-5-5v10M91 385h10m-5-5v10M390 60h10m-5-5v10"
            stroke="var(--accent-muted)"
            opacity=".7"
          />
        </svg>
        <div className="solar-halo" />
        <div className="core-symbol">
          <Symbol />
        </div>
      </div>
      <div className="core-coordinate coordinate-bottom">{t.hero.coreNote}</div>
    </div>
  );
}
