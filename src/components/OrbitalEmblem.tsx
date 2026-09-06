import mark from "../brand/mark.json";
import { orbitalSymbolTransform } from "../brand/geometry";
import { orbits, particles, particleAt } from "../animation/orbits";

export type EmblemVariant =
  | "on-dark"
  | "on-light"
  | "mono-dark"
  | "mono-light";

const palettes: Record<
  EmblemVariant,
  { symbol: string; spark: string; orbit: string; particle: string }
> = {
  "on-dark": {
    symbol: "#EDB466",
    spark: "#F6C580",
    orbit: "#B59A70",
    particle: "#F6C580",
  },
  "on-light": {
    symbol: "#976018",
    spark: "#A86D1D",
    orbit: "#34382F",
    particle: "#976018",
  },
  "mono-dark": {
    symbol: "#101211",
    spark: "#101211",
    orbit: "#101211",
    particle: "#101211",
  },
  "mono-light": {
    symbol: "#F1F0E9",
    spark: "#F1F0E9",
    orbit: "#F1F0E9",
    particle: "#F1F0E9",
  },
};

export function WordmarkPaths({ color = "currentColor" }: { color?: string }) {
  return (
    <g
      fill="none"
      stroke={color}
      strokeWidth={mark.wordmark.strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {mark.wordmark.paths.map((path) => (
        <path key={path} d={path} />
      ))}
    </g>
  );
}

export function OrbitalEmblem({
  className = "",
  variant = "on-dark",
  label = "Zuaros orbital emblem",
}: {
  className?: string;
  variant?: EmblemVariant;
  label?: string;
}) {
  const palette = palettes[variant];
  return (
    <svg
      className={className}
      viewBox={mark.orbital.viewBox}
      role="img"
      aria-label={label}
    >
      <g fill="none" stroke={palette.orbit}>
        {orbits.map((orbit, index) => (
          <ellipse
            key={orbit.id}
            cx={mark.orbital.center.x}
            cy={mark.orbital.center.y}
            rx={orbit.rx}
            ry={orbit.ry}
            transform={`rotate(${orbit.rotation} ${mark.orbital.center.x} ${mark.orbital.center.y})`}
            strokeWidth={index === 0 ? 1.15 : 1.35}
            opacity={[0.44, 0.58, 0.42, 0.5][index]}
          />
        ))}
      </g>
      <g fill={palette.particle}>
        {particles.map((particle) => {
          const point = particleAt(particle, 0);
          return (
            <circle
              key={particle.id}
              cx={point.x}
              cy={point.y}
              r={particle.radius}
              opacity={Math.max(0.58, particle.opacity)}
            />
          );
        })}
      </g>
      <g transform={orbitalSymbolTransform}>
        <path d={mark.body} fill={palette.symbol} />
        <path d={mark.spark} fill={palette.spark} />
      </g>
    </svg>
  );
}
