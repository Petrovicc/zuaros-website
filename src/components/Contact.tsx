import { useEffect, useRef, useState } from "react";
import type { Translation } from "../i18n/en";
import { Arrow, Brand, Symbol } from "./Brand";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export const EMAIL = "zuaros.dev@gmail.com";

export function Contact({ t }: { t: Translation }) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">(
    "idle",
  );
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  async function copyEmail() {
    clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
    timer.current = setTimeout(() => setCopyStatus("idle"), 5000);
  }
  return (
    <section
      id="contact"
      className="section contact-section"
      aria-labelledby="contact-title"
    >
      <div className="container">
        <Reveal className="contact-grid">
          <div>
            <SectionHeading
              id="contact-title"
              label={t.contact.label}
              title={t.contact.title}
              text={t.contact.text}
            />
            <div className="contact-actions">
              <a className="button button-primary" href={`mailto:${EMAIL}`}>
                {t.contact.send}
                <Arrow diagonal />
              </a>
              <button className="button button-outline" onClick={copyEmail}>
                {copyStatus === "copied" ? t.contact.copied : t.contact.copy}
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  {copyStatus === "copied" ? (
                    <path d="m5 12 4 4 10-10" />
                  ) : (
                    <path d="M9 8h11v12H9zM15 8V4H4v12h5" />
                  )}
                </svg>
              </button>
            </div>
            <p className="contact-note">{t.contact.note}</p>
            <p className="copy-status" role="status" aria-live="polite">
              {copyStatus === "copied"
                ? t.contact.copied
                : copyStatus === "failed"
                  ? t.contact.copyFailed
                  : ""}
            </p>
          </div>
          <div className="contact-person">
            <Symbol className="contact-symbol" />
            <dl>
              <div>
                <dt>{t.contact.person}</dt>
                <dd>Nikola Petrović</dd>
              </div>
              <div>
                <dt>{t.contact.emailLabel}</dt>
                <dd>
                  <a href={`mailto:${EMAIL}`}>
                    {EMAIL}
                    <Arrow diagonal />
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Footer({ t }: { t: Translation }) {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-main">
          <div>
            <a href="#home" aria-label={`Zuaros — ${t.nav.home}`}>
              <Brand />
            </a>
            <p>{t.footer.description}</p>
          </div>
          <nav aria-label={t.footer.navigation}>
            <a href="#about">{t.nav.about}</a>
            <a href="#services">{t.nav.services}</a>
            <a href="#games">{t.nav.games}</a>
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          </nav>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} Zuaros. {t.footer.rights}
          </span>
          <a href="#home">
            {t.footer.top}
            <span aria-hidden="true">↑</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
