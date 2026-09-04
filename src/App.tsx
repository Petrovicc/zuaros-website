import { useLanguage } from "./i18n/useLanguage";
import { Header } from "./components/Header";
import { Arrow } from "./components/Brand";
import { SolarCore } from "./components/SolarCore";
import { About, Services } from "./components/Services";
import { Engineering, Research, Software } from "./components/Engineering";
import { Games, Portfolio, Principles } from "./components/Portfolio";
import { Contact, Footer } from "./components/Contact";

export function App() {
  const { language, setLanguage, t } = useLanguage();
  return (
    <>
      <a className="skip-link" href="#main">
        {t.skip}
      </a>
      <Header t={t} language={language} setLanguage={setLanguage} />
      <main id="main">
        <section
          id="home"
          className="hero container"
          aria-labelledby="hero-title"
        >
          <div className="hero-content">
            <p className="eyebrow">
              <span className="status-dot" />
              {t.hero.eyebrow}
            </p>
            <h1 id="hero-title">
              <span>{t.hero.line1}</span>
              <span className="accent">
                {t.hero.line2}
                <br />
                {t.hero.line3}
              </span>
            </h1>
            <p className="hero-description">{t.hero.description}</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#contact">
                {t.hero.primary}
                <Arrow diagonal />
              </a>
              <a className="text-link" href="#services">
                {t.hero.secondary}
                <Arrow />
              </a>
            </div>
          </div>
          <SolarCore t={t} />
          <div className="hero-baseline">
            <span>{t.hero.foot}</span>
            <a href="#services">
              {t.hero.scroll}
              <span aria-hidden="true">↓</span>
            </a>
          </div>
        </section>
        <Services t={t} />
        <About t={t} />
        <Engineering t={t} />
        <Software t={t} />
        <Research t={t} />
        <Games t={t} language={language} />
        <Portfolio t={t} language={language} />
        <Principles t={t} />
        <Contact t={t} />
      </main>
      <Footer t={t} />
    </>
  );
}
