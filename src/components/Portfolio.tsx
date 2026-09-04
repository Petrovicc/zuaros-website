import type { Translation } from "../i18n/en";
import type { Language } from "../i18n/useLanguage";
import { projects } from "../data/projects";
import type { Project } from "../data/projects";
import { Arrow, Symbol } from "./Brand";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function ProjectCard({
  project,
  language,
  t,
}: {
  project: Project;
  language: Language;
  t: Translation;
}) {
  const labels = {
    website: t.projects.website,
    github: t.projects.github,
    steam: "Steam",
    playStore: "Google Play",
  };
  return (
    <article className="project-card">
      {project.image && (
        <img
          src={
            /^(https?:)?\/\//.test(project.image.src)
              ? project.image.src
              : `${import.meta.env.BASE_URL}${project.image.src.replace(/^\//, "")}`
          }
          alt={project.image.alt[language]}
          width="800"
          height="500"
          loading="lazy"
        />
      )}
      <div className="project-card-content">
        <p className="section-label">
          {project.category[language]} · {t.projects.statuses[project.status]}
        </p>
        <h3>{project.title[language]}</h3>
        <p>{project.description[language]}</p>
        {project.technologies.length > 0 && (
          <p className="project-detail">
            {t.projects.technologies}: {project.technologies.join(" · ")}
          </p>
        )}
        {project.platforms && (
          <p className="project-detail">
            {t.projects.platforms}: {project.platforms.join(" · ")}
          </p>
        )}
        <div className="project-links">
          {Object.entries(project.links ?? {})
            .filter(([, url]) => url && /^https:\/\//.test(url))
            .map(([key, url]) => (
              <a
                key={key}
                className="text-link"
                href={url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {labels[key as keyof typeof labels]}
                <Arrow diagonal />
              </a>
            ))}
        </div>
      </div>
    </article>
  );
}

export function Games({ t, language }: { t: Translation; language: Language }) {
  const games = projects.filter((project) => project.kind === "game");
  return (
    <section
      id="games"
      className="section games-section"
      aria-labelledby="games-title"
    >
      <div className="container">
        <Reveal className="games-grid">
          <div>
            <SectionHeading
              id="games-title"
              label={t.games.label}
              title={t.games.title}
              text={t.games.text}
            />
            <ul className="game-tags">
              {t.games.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          </div>
          <div className="game-teaser">
            <div className="game-particles" aria-hidden="true">
              {Array.from({ length: 16 }, (_, i) => (
                <span
                  key={i}
                  style={{ "--particle-index": i } as React.CSSProperties}
                />
              ))}
              <div className="play-symbol">
                <Symbol />
              </div>
            </div>
            <p className="section-label">{t.games.status}</p>
            <h3>{t.games.soon}</h3>
            <p>{t.games.note}</p>
          </div>
        </Reveal>
        {games.length > 0 && (
          <div className="project-grid">
            {games.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                language={language}
                t={t}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function Portfolio({
  t,
  language,
}: {
  t: Translation;
  language: Language;
}) {
  const work = projects.filter((project) => project.kind !== "game");
  return (
    <section
      id="projects"
      className="section projects-section"
      aria-labelledby="projects-title"
    >
      <div className="container">
        <Reveal className="projects-heading">
          <SectionHeading
            id="projects-title"
            label={t.projects.label}
            title={t.projects.title}
          />
          <p>{t.projects.text}</p>
        </Reveal>
        {work.length ? (
          <div className="project-grid">
            {work.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                language={language}
                t={t}
              />
            ))}
          </div>
        ) : (
          <Reveal className="project-empty">
            <span className="empty-marker" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <div>
              <h3>{t.projects.emptyTitle}</h3>
              <p>{t.projects.emptyText}</p>
            </div>
            <a className="text-link" href="#contact">
              {t.projects.cta}
              <Arrow diagonal />
            </a>
          </Reveal>
        )}
      </div>
    </section>
  );
}

export function Principles({ t }: { t: Translation }) {
  return (
    <section
      className="section principles-section"
      aria-labelledby="principles-title"
    >
      <div className="container">
        <Reveal className="principles-grid">
          <SectionHeading
            id="principles-title"
            label={t.principles.label}
            title={t.principles.title}
          />
          <div>
            {t.principles.items.map(([title, text], index) => (
              <article className="principle" key={title}>
                <span>0{index + 1}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </article>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
