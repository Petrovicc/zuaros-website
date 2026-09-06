import { useEffect, useRef } from "react";
import mark from "../brand/mark.json";
import {
  orbitalSymbolTransform,
  verticalWordmarkTransform,
} from "../brand/geometry";
import { animateIntro } from "../animation/animateIntro";
import { particles, sampleParticle } from "../animation/orbits";
import { DEFAULT_INTRO_DURATION_MS } from "../animation/introTimeline";
import { WordmarkPaths } from "./OrbitalEmblem";
import "../studio-intro.css";

export interface ZuarosStudioIntroProps {
  showWordmark?: boolean;
  durationMs?: number;
  autoDismiss?: boolean;
  reducedMotion?: boolean;
  exitStyle?: "fade" | "scale-fade";
  exiting?: boolean;
  className?: string;
  onComplete?: () => void;
}

export function ZuarosStudioIntro({
  showWordmark = false,
  durationMs = DEFAULT_INTRO_DURATION_MS,
  autoDismiss = false,
  reducedMotion,
  exitStyle = "scale-fade",
  exiting = false,
  className = "",
  onComplete,
}: ZuarosStudioIntroProps) {
  const viewport = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const onCompleteRef = useRef(onComplete);
  const autoDismissRef = useRef(autoDismiss);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    autoDismissRef.current = autoDismiss;
  }, [autoDismiss, onComplete]);

  useEffect(() => {
    const stage = viewport.current;
    const drawing = svg.current;
    if (!stage || !drawing) return;
    let dismissTimer: number | undefined;
    const dispose = animateIntro(drawing, stage, {
      durationMs,
      showWordmark,
      reducedMotion,
      onComplete: () => {
        onCompleteRef.current?.();
        if (autoDismissRef.current) {
          stage.dataset.exiting = "true";
          dismissTimer = window.setTimeout(() => {
            stage.hidden = true;
          }, 220);
        }
      },
    });
    return () => {
      dispose();
      if (dismissTimer !== undefined) window.clearTimeout(dismissTimer);
    };
  }, [durationMs, reducedMotion, showWordmark]);

  return (
    <div
      ref={viewport}
      className={`studio-intro studio-intro--${exitStyle} ${className}`.trim()}
      data-duration={durationMs}
      data-variant={showWordmark ? "wordmark" : "symbol"}
      data-exiting={exiting ? "true" : undefined}
    >
      <svg
        ref={svg}
        viewBox={
          showWordmark ? mark.lockups.vertical.viewBox : mark.orbital.viewBox
        }
        role="img"
        aria-label={showWordmark ? "Zuaros studio intro" : "Zuaros symbol intro"}
      >
        <circle
          data-intro-ignition
          cx={mark.orbital.center.x}
          cy={mark.orbital.center.y}
          r="9"
          fill="#F6C580"
          opacity="0"
        />
        <g fill="none" stroke="#B59A70">
          {mark.orbital.orbits.map((orbit, index) => (
            <ellipse
              key={orbit.id}
              data-intro-orbit={orbit.id}
              cx={mark.orbital.center.x}
              cy={mark.orbital.center.y}
              rx={orbit.rx}
              ry={orbit.ry}
              transform={`rotate(${orbit.rotation} ${mark.orbital.center.x} ${mark.orbital.center.y})`}
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset="1"
              strokeWidth={index === 0 ? 1.15 : 1.35}
              opacity="0"
            />
          ))}
        </g>
        <g fill="#EDB466">
          {particles.map((particle) => {
            const sample = sampleParticle(particle, 0);
            return (
              <g
                key={particle.id}
                data-intro-particle={particle.id}
                opacity="0"
              >
                <g className="intro-particle-trail">
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
                  className="intro-particle-head"
                  style={{
                    transform: `translate(${sample.head.x}px, ${sample.head.y}px)`,
                  }}
                  r={particle.radius}
                  fill="#F6C580"
                  opacity={particle.opacity}
                />
              </g>
            );
          })}
        </g>
        <g
          data-intro-body
          data-base-transform={orbitalSymbolTransform}
          data-center-x={mark.orbital.center.x}
          data-center-y={mark.orbital.center.y}
          transform={orbitalSymbolTransform}
          opacity="0"
        >
          <path d={mark.body} fill="#EDB466" />
        </g>
        <g
          data-intro-spark
          transform={orbitalSymbolTransform}
          opacity="0"
        >
          <path d={mark.spark} fill="#F6C580" />
        </g>
        {showWordmark ? (
          <g
            data-intro-wordmark
            transform={verticalWordmarkTransform}
            opacity="0"
          >
            <WordmarkPaths color="#F1F0E9" />
          </g>
        ) : null}
      </svg>
    </div>
  );
}
