import type { Translation } from "../i18n/en";
import { Arrow } from "./Brand";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function Engineering({ t }: { t: Translation }) {
  const steps = [
    t.engineering.signal,
    t.engineering.acquisition,
    t.engineering.processing,
    t.engineering.insight,
  ];
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
            <p className="diagram-label">{t.engineering.diagram}</p>
            <div
              className="signal-diagram"
              role="img"
              aria-label={`${steps.join(" → ")}. ${t.engineering.diagramNote}`}
            >
              <svg viewBox="0 0 480 190" aria-hidden="true" fill="none">
                <defs>
                  <linearGradient id="flow">
                    <stop stopColor="#9abbb4" stopOpacity=".15" />
                    <stop offset="1" stopColor="#9abbb4" />
                  </linearGradient>
                </defs>
                <g stroke="#2c403c">
                  <path d="M0 38h480M0 76h480M0 114h480M0 152h480M40 0v190M80 0v190M120 0v190M160 0v190M200 0v190M240 0v190M280 0v190M320 0v190M360 0v190M400 0v190M440 0v190" />
                </g>
                <path
                  d="M10 96h30l12-25 14 50 15-65 18 79 15-39h35"
                  stroke="#9abbb4"
                  strokeWidth="1.6"
                />
                <path
                  className="signal-flow"
                  d="M149 96h42m40 0h55m45 0h45m40 0h48"
                  stroke="url(#flow)"
                  strokeWidth="2"
                  strokeDasharray="5 7"
                />
                <g fill="#152421" stroke="#6c9790">
                  <rect x="191" y="76" width="40" height="40" rx="2" />
                  <rect x="286" y="76" width="44" height="40" rx="2" />
                  <circle cx="396" cy="96" r="20" />
                </g>
                <g stroke="#b3d4c7" strokeWidth="1.4">
                  <path d="M201 86h20v20h-20zM297 96h22m-11-10v20m78 11 7 6 11-13" />
                </g>
                <path
                  d="M307 76V44h89v32M211 116v34h96v-34"
                  stroke="#547870"
                  strokeDasharray="3 5"
                />
              </svg>
              <div className="signal-labels">
                {steps.map((step, i) => (
                  <span key={step}>
                    <small>0{i + 1}</small>
                    {step}
                  </span>
                ))}
              </div>
            </div>
            <p className="diagram-note">
              <span className="tiny-spark" />
              {t.engineering.diagramNote}
            </p>
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
