import { useEffect, useState } from "react";
import { en } from "./en";
import { sr } from "./sr";

export type Language = "en" | "sr";

function initialLanguage(): Language {
  try {
    const saved = localStorage.getItem("zuaros-language");
    if (saved === "en" || saved === "sr") return saved;
  } catch {
    /* Preferences remain usable when storage is blocked. */
  }
  return /^sr(?:-|$)/i.test(navigator.language) ? "sr" : "en";
}

export function useLanguage() {
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const t = language === "en" ? en : sr;
  useEffect(() => {
    document.documentElement.lang = language === "sr" ? "sr-Latn" : "en";
    document.title = t.seo.title;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", t.seo.description);
    try {
      localStorage.setItem("zuaros-language", language);
    } catch {
      /* Storage is optional. */
    }
  }, [language, t]);
  return { language, setLanguage, t };
}
