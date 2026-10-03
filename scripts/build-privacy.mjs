import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createServer } from "vite";
import { createElement } from "react";
import { renderToString } from "react-dom/server";

const origin = "https://zuaros.com";
const manifest = JSON.parse(await readFile("src/privacy/manifest.json", "utf8"));
const template = await readFile("dist/privacy/index.html", "utf8");
const escape = (text) => text.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
if (!template.includes("<!-- privacy-content -->") || !template.includes("<!-- privacy-metadata -->")) {
  throw new Error("Missing privacy template markers; refusing to emit incomplete legal pages.");
}
const server = await createServer({ server: { middlewareMode: true }, appType: "custom" });
try {
  const { PrivacyPage } = await server.ssrLoadModule("/src/privacy/PrivacyPage.tsx");
  for (const entry of [null, ...manifest]) {
    const policy = entry ? JSON.parse(await readFile(`src/privacy/policies/${entry.slug}.json`, "utf8")) : null;
    const path = entry ? `/privacy/${entry.slug}/` : "/privacy/";
    const title = entry ? `${entry.app} Privacy Policy | Zuaros` : "Privacy Policies | Zuaros";
    const description = entry ? `Privacy Policy for ${entry.app}, developed by Zuaros.` : "Privacy policies for Zuaros applications and games.";
    const metadata = `<title>${escape(title)}</title>
    <meta name="description" content="${escape(description)}" />
    <link rel="canonical" href="${origin}${path}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Zuaros" />
    <meta property="og:title" content="${escape(title)}" />
    <meta property="og:description" content="${escape(description)}" />
    <meta property="og:url" content="${origin}${path}" />
    <meta property="og:image" content="${origin}/brand/social-preview.png" />
    <meta name="twitter:card" content="summary_large_image" />`;
    const data = JSON.stringify(policy).replaceAll("<", "\\u003c");
    const html = template
      .replace("<!-- privacy-metadata -->", () => metadata)
      .replace("<!-- privacy-content -->", () => renderToString(createElement(PrivacyPage, { policy })))
      .replace('<script id="privacy-data" type="application/json">null</script>', () => `<script id="privacy-data" type="application/json">${data}</script>`);
    await mkdir(`dist${path}`, { recursive: true });
    await writeFile(`dist${path}index.html`, html);
    console.log(`Generated ${path}index.html`);
  }
  const paths = ["/", "/memospin/", "/privacy/", ...manifest.map(({ slug }) => `/privacy/${slug}/`)];
  await writeFile("dist/sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((path) => `<url><loc>${origin}${path}</loc></url>`).join("")}</urlset>\n`);
  if ((await readFile("dist/CNAME", "utf8")).trim() !== "zuaros.com") throw new Error("Missing custom-domain CNAME.");
} finally {
  await server.close();
}
