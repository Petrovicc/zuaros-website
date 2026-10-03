import { useState, type ReactNode } from "react";
import { Header } from "../components/Header";
import { Footer } from "../components/Contact";
import { Arrow } from "../components/Brand";
import { en } from "../i18n/en";
import { sr } from "../i18n/sr";
import type { Language } from "../i18n/useLanguage";
import type { Policy } from "./types";
import manifest from "./manifest.json";

// Link the existing source wording without changing its visible text.
function linkedText(text: string, policy: Policy): ReactNode {
  const links = [...policy.links, { text: policy.contact, href: `mailto:${policy.contact}` }];
  const result: ReactNode[] = [];
  let remaining = text;
  while (remaining) {
    const next = links
      .map((link) => ({ ...link, index: remaining.indexOf(link.text) }))
      .filter((link) => link.index >= 0)
      .sort((a, b) => a.index - b.index)[0];
    if (!next) { result.push(remaining); break; }
    result.push(remaining.slice(0, next.index));
    result.push(<a key={result.length} href={next.href}>{next.text}</a>);
    remaining = remaining.slice(next.index + next.text.length);
  }
  return result;
}

function PolicyContent({ policy }: { policy: Policy }) {
  const content: ReactNode[] = [];
  for (let i = 0; i < policy.blocks.length; i++) {
    const block = policy.blocks[i];
    if (block.type === "li") {
      const items: ReactNode[] = [];
      while (policy.blocks[i]?.type === "li") {
        items.push(<li key={i}>{linkedText(policy.blocks[i].text, policy)}</li>);
        i++;
      }
      i--;
      content.push(<ul key={i}>{items}</ul>);
    } else if (block.type === "h2") {
      content.push(<h2 key={i}>{block.text}</h2>);
    } else {
      content.push(<p key={i}>{linkedText(block.text, policy)}</p>);
    }
  }
  return <div className="policy-content">{content}</div>;
}

export function PrivacyPage({ policy }: { policy: Policy | null }) {
  // Match the static HTML during hydration. Only shared navigation is localized;
  // the original English legal document and its metadata remain unchanged.
  const [language, setLanguage] = useState<Language>("en");
  const t = language === "sr" ? sr : en;
  function changeLanguage(value: Language) {
    setLanguage(value);
    try { localStorage.setItem("zuaros-language", value); } catch { /* Optional preference. */ }
  }
  return (
    <div id="top" className="privacy-page">
      <a className="skip-link" href="#main">Skip to content</a>
      <div lang={language === "sr" ? "sr-Latn" : "en"}>
        <Header t={t} language={language} setLanguage={changeLanguage} homePrefix="/" />
      </div>
      <main id="main" className="legal-main container" lang="en">
        {policy ? (
          <>
            <a className="text-link legal-back" href="/privacy/">← All privacy policies</a>
            <article className="legal-article" aria-labelledby="policy-title">
              <header className="legal-heading">
                <p className="eyebrow accent">PRIVACY POLICY</p>
                <h1 id="policy-title"><span className="sr-only">Privacy Policy — </span>{policy.app}</h1>
                <p className="legal-date"><time dateTime={policy.date}>{policy.dateLabel}</time></p>
              </header>
              <PolicyContent policy={policy} />
            </article>
          </>
        ) : (
          <section className="legal-directory" aria-labelledby="privacy-title">
            <header className="legal-heading">
              <p className="eyebrow accent">ZUAROS / LEGAL</p>
              <h1 id="privacy-title">Privacy Policies</h1>
              <p className="legal-intro">Choose an application to read its privacy policy.</p>
            </header>
            <ul className="policy-directory">
              {manifest.map((entry) => (
                <li key={entry.slug}>
                  <a href={`/privacy/${entry.slug}/`}>
                    <div><h2>{entry.app}</h2><p>{entry.dateLabel}</p></div>
                    <span>View policy <Arrow /></span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
      <div lang={language === "sr" ? "sr-Latn" : "en"}><Footer t={t} homePrefix="/" /></div>
    </div>
  );
}
