import { useEffect, useRef, useState } from "react";
import type { Translation } from "../i18n/en";
import type { Language } from "../i18n/useLanguage";
import { Arrow, Brand } from "./Brand";

export function Header({
  t,
  language,
  setLanguage,
}: {
  t: Translation;
  language: Language;
  setLanguage: (value: Language) => void;
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLElement>(null);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    const desktop = window.matchMedia("(min-width: 1024px)");
    const resize = () => {
      if (desktop.matches) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", escape);
    desktop.addEventListener("change", resize);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", escape);
      desktop.removeEventListener("change", resize);
    };
  }, [open]);
  return (
    <header
      ref={header}
      className={`site-header ${scrolled ? "is-scrolled" : ""}`}
    >
      <div className="container header-inner">
        <a
          href="#home"
          aria-label={`Zuaros — ${t.nav.home}`}
          onClick={() => setOpen(false)}
        >
          <Brand />
        </a>
        <nav
          id="main-navigation"
          className={open ? "navigation is-open" : "navigation"}
          aria-label={t.menu}
        >
          {(
            ["about", "services", "engineering", "games", "projects"] as const
          ).map((id) => (
            <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>
              {t.nav[id]}
            </a>
          ))}
          <a
            className="mobile-contact"
            href="#contact"
            onClick={() => setOpen(false)}
          >
            {t.nav.contact} <Arrow diagonal />
          </a>
        </nav>
        <div className="header-actions">
          <div className="language-switch" role="group" aria-label={t.language}>
            <button
              lang="en"
              aria-label="English"
              aria-pressed={language === "en"}
              onClick={() => setLanguage("en")}
            >
              EN
            </button>
            <span aria-hidden="true">/</span>
            <button
              lang="sr-Latn"
              aria-label="Srpski"
              aria-pressed={language === "sr"}
              onClick={() => setLanguage("sr")}
            >
              SR
            </button>
          </div>
          <a className="header-contact" href="#contact">
            {t.nav.contact}
            <Arrow diagonal />
          </a>
          <button
            ref={menuButton}
            className="menu-toggle"
            aria-label={open ? t.close : t.menu}
            aria-expanded={open}
            aria-controls="main-navigation"
            onClick={() => setOpen(!open)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}
