import { useState } from "react";
import { ZuarosStudioIntro } from "../components/ZuarosStudioIntro";
import "../brand-preview.css";

const asset = (path: string) => `${import.meta.env.BASE_URL}brand/${path}`;

function AssetCard({
  title,
  path,
  tone = "dark",
  className = "",
}: {
  title: string;
  path: string;
  tone?: "dark" | "light";
  className?: string;
}) {
  return (
    <figure className={`brand-asset-card is-${tone} ${className}`.trim()}>
      <div className="brand-asset-canvas">
        <img src={asset(path)} alt={title} />
      </div>
      <figcaption>
        <strong>{title}</strong>
        <code>{path}</code>
      </figcaption>
    </figure>
  );
}

function CompletionHarness() {
  const [completionCount, setCompletionCount] = useState(0);
  return (
    <main className="brand-preview-standalone">
      <ZuarosStudioIntro
        durationMs={1500}
        autoDismiss
        onComplete={() => setCompletionCount((count) => count + 1)}
        className="studio-intro--fullscreen"
      />
      <output data-completion-count>{completionCount}</output>
    </main>
  );
}

export function BrandPreview() {
  const params = new URLSearchParams(window.location.search);
  const standalone = params.get("intro");
  const [symbolRun, setSymbolRun] = useState(0);
  const [wordmarkRun, setWordmarkRun] = useState(0);

  if (standalone === "completion-test") return <CompletionHarness />;

  if (standalone === "symbol" || standalone === "wordmark") {
    return (
      <main className="brand-preview-standalone">
        <ZuarosStudioIntro
          showWordmark={standalone === "wordmark"}
          className="studio-intro--fullscreen"
        />
      </main>
    );
  }

  return (
    <div className="brand-preview-page">
      <header className="brand-preview-header">
        <a href={import.meta.env.BASE_URL}>← Website</a>
        <p>Zuaros identity system</p>
        <h1>Core mark, orbital emblem, and studio intro</h1>
        <p>
          A private maintenance surface for checking the production-ready brand
          assets. It is intentionally absent from the public navigation.
        </p>
      </header>

      <main className="brand-preview-main">
        <section aria-labelledby="preview-levels">
          <div className="brand-preview-section-heading">
            <p>01 / Two levels</p>
            <h2 id="preview-levels">Compact when small. Orbital when expressive.</h2>
          </div>
          <div className="brand-preview-grid two-up">
            <AssetCard title="Core mark · dark surface" path="core/zuaros-core.svg" />
            <AssetCard
              title="Full orbital emblem · dark surface"
              path="orbital/zuaros-orbital-on-dark.svg"
            />
          </div>
          <div className="brand-size-check is-dark" aria-label="Core mark size check">
            {[24, 48, 128].map((size) => (
              <figure key={size}>
                <img
                  src={asset("core/zuaros-core.svg")}
                  alt=""
                  style={{ width: size, height: size }}
                />
                <figcaption>{size} px</figcaption>
              </figure>
            ))}
          </div>
          <div
            className="brand-size-check is-dark orbital-size-check"
            aria-label="Orbital emblem size check"
          >
            {[128, 256, 512].map((size) => (
              <figure key={size}>
                <img
                  src={asset("orbital/zuaros-orbital-on-dark.svg")}
                  alt=""
                  style={{ width: size, height: size }}
                />
                <figcaption>{size} px</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section aria-labelledby="preview-variants">
          <div className="brand-preview-section-heading">
            <p>02 / Background and print variants</p>
            <h2 id="preview-variants">Legible geometry without relying on glow.</h2>
          </div>
          <div className="brand-preview-grid four-up">
            <AssetCard
              title="Dark background"
              path="orbital/zuaros-orbital-on-dark.svg"
            />
            <AssetCard
              title="Light background"
              path="orbital/zuaros-orbital-on-light.svg"
              tone="light"
            />
            <AssetCard
              title="Monochrome dark"
              path="orbital/zuaros-orbital-mono-dark.svg"
              tone="light"
            />
            <AssetCard
              title="Monochrome light"
              path="orbital/zuaros-orbital-mono-light.svg"
            />
          </div>
        </section>

        <section aria-labelledby="preview-lockups">
          <div className="brand-preview-section-heading">
            <p>03 / Lockups</p>
            <h2 id="preview-lockups">Document header and title-page arrangements.</h2>
          </div>
          <div className="brand-preview-grid lockups">
            <AssetCard
              title="Horizontal lockup"
              path="orbital/zuaros-orbital-horizontal.svg"
              className="is-horizontal"
            />
            <AssetCard
              title="Vertical lockup"
              path="orbital/zuaros-orbital-vertical.svg"
              className="is-vertical"
            />
            <AssetCard
              title="Horizontal on white"
              path="orbital/zuaros-orbital-horizontal-on-light.svg"
              tone="light"
              className="is-horizontal"
            />
          </div>
        </section>

        <section aria-labelledby="preview-motion">
          <div className="brand-preview-section-heading">
            <p>04 / Studio motion</p>
            <h2 id="preview-motion">One 1.9-second system, two finished states.</h2>
          </div>
          <div className="brand-preview-grid intro-grid">
            <article className="intro-preview-card">
              <ZuarosStudioIntro key={symbolRun} />
              <div>
                <div>
                  <strong>Variant A · Symbol only</strong>
                  <p>For the shortest handoff into a game title screen.</p>
                </div>
                <button type="button" onClick={() => setSymbolRun((run) => run + 1)}>
                  Replay
                </button>
              </div>
            </article>
            <article className="intro-preview-card is-recommended">
              <ZuarosStudioIntro key={wordmarkRun} showWordmark />
              <div>
                <div>
                  <strong>Variant B · Studio wordmark</strong>
                  <p>Recommended hybrid: recognition, then immediate handoff.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setWordmarkRun((run) => run + 1)}
                >
                  Replay
                </button>
              </div>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}
