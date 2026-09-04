import type { Translation } from "../i18n/en";
import { Arrow, Icon, Symbol } from "./Brand";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";

export function Services({ t }: { t: Translation }) {
  return (
    <section id="services" className="section" aria-labelledby="services-title">
      <div className="container">
        <Reveal className="services-heading">
          <SectionHeading
            id="services-title"
            label={t.services.label}
            title={t.services.title}
          />
          <p>{t.services.intro}</p>
        </Reveal>
        <div className="service-grid">
          {t.services.items.map((item) => (
            <Reveal key={item.number}>
              <a
                className={`service-card service-${item.icon}`}
                href={item.href}
              >
                <div className="service-top">
                  <Icon name={item.icon} />
                  <span>{item.number}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <ul className="service-tags">
                  {item.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
                <div className="service-bottom">
                  <span>{t.services.explore}</span>
                  <Arrow diagonal />
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function About({ t }: { t: Translation }) {
  return (
    <section
      id="about"
      className="section about-section"
      aria-labelledby="about-title"
    >
      <div className="container">
        <Reveal className="about-grid">
          <div className="about-sign" aria-hidden="true">
            <div className="about-symbol">
              <Symbol />
            </div>
            <span>{t.about.caption}</span>
          </div>
          <div>
            <SectionHeading
              id="about-title"
              label={t.about.label}
              title={t.about.title}
            />
            <p className="about-lead">{t.about.text}</p>
            <p className="about-origin">{t.about.origin}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
