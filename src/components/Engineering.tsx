import type { Translation } from "../i18n/en";
import { Arrow } from "./Brand";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function Engineering({ t }: { t: Translation }) {
  return (
    <section
      id="engineering"
      className="section engineering-section"
      aria-labelledby="engineering-title"
    >
      <div className="container">
        <Reveal className="engineering-grid">
          <div>
            <SectionHeading
              id="engineering-title"
              label={t.engineering.label}
              title={t.engineering.title}
              text={t.engineering.text}
            />
            <a className="text-link" href="#contact">
              {t.engineering.cta}
              <Arrow diagonal />
            </a>
          </div>
          <div className="engineering-panel">
            <div className="engineering-art" aria-hidden="true">
              <svg viewBox="0 0 480 240" fill="none" focusable="false">
                <defs>
                  <radialGradient id="engineering-glow">
                    <stop stopColor="#edb466" stopOpacity=".09" />
                    <stop offset="1" stopColor="#edb466" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <ellipse cx="288" cy="120" rx="180" ry="120" fill="url(#engineering-glow)" />
                <g className="engineering-orbits">
                  <ellipse cx="288" cy="120" rx="132" ry="65" transform="rotate(-24 288 120)" />
                  <ellipse cx="288" cy="120" rx="72" ry="102" transform="rotate(36 288 120)" />
                  <path d="M205 45a112 112 0 0 1 183 103M359 207a112 112 0 0 1-164-47" />
                </g>
                <g className="engineering-paths">
                  <path d="M24 120h29c12 0 14-27 26-27s14 54 26 54 14-27 26-27h61l96-52 96 52-96 52-96-52" />
                  <path d="M104 183h53l35-63M288 68v104M384 120h66" />
                  <path d="m192 120 96 0 45 77" />
                </g>
                <g className="engineering-nodes">
                  <circle cx="192" cy="120" r="4" />
                  <circle cx="288" cy="68" r="4" />
                  <circle cx="288" cy="172" r="4" />
                  <circle cx="384" cy="120" r="4" />
                  <circle cx="333" cy="197" r="3" />
                </g>
                <circle className="engineering-core-ring" cx="288" cy="120" r="15" />
                <circle className="engineering-core" cx="288" cy="120" r="5" />
              </svg>
            </div>
            <div className="engineering-points">
              {t.engineering.points.map(([title, text]) => (
                <div key={title}>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Software({ t }: { t: Translation }) {
  return (
    <section id="software" className="section" aria-labelledby="software-title">
      <div className="container">
        <Reveal className="software-grid">
          <SectionHeading
            id="software-title"
            label={t.software.label}
            title={t.software.title}
            text={t.software.text}
          />
          <div className="software-detail">
            <ul className="software-list">
              {t.software.items.map((item, index) => (
                <li key={item}>
                  <span>0{index + 1}</span>
                  {item}
                  <span aria-hidden="true">+</span>
                </li>
              ))}
            </ul>
            <p>{t.software.note}</p>
          </div>
        </Reveal>
        <Reveal>
          <ol className="process-track">
            {t.software.steps.map((step, index) => (
              <li key={step}>
                <span
                  className={
                    index === 2 ? "process-node final-node" : "process-node"
                  }
                >
                  {index === 2 ? (
                    <span className="tiny-spark" />
                  ) : (
                    `0${index + 1}`
                  )}
                </span>
                <span>{step}</span>
                {index < 2 && <Arrow />}
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}

export function Research({ t }: { t: Translation }) {
  return (
    <section
      id="research"
      className="section research-section"
      aria-labelledby="research-title"
    >
      <div className="container">
        <Reveal className="research-grid">
          <div className="research-diagram" aria-hidden="true">
            <div className="research-orbits">
              <div />
              <div />
              <div />
              <span className="research-dot dot-a" />
              <span className="research-dot dot-b" />
              <span className="research-dot dot-c" />
              <span className="research-center">?</span>
              {t.research.diagram.map((label, index) => (
                <span className={`research-label label-${index}`} key={label}>
                  {label}
                </span>
              ))}
            </div>
            <p>{t.research.caption}</p>
          </div>
          <div>
            <SectionHeading
              id="research-title"
              label={t.research.label}
              title={t.research.title}
              text={t.research.text}
            />
            <ul className="research-tags">
              {t.research.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
