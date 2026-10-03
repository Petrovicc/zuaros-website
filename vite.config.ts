import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const siteUrl = new URL(env.SITE_URL || "https://zuaros.com/");
  if (siteUrl.origin !== "https://zuaros.com" || !/^\/?$/.test(siteUrl.pathname) || siteUrl.search || siteUrl.hash) {
    throw new Error("Zuaros production must use https://zuaros.com/ with a root base path.");
  }
  siteUrl.pathname = "/";
  const base = "/";
  return {
    base,
    plugins: [
      react(),
      {
        name: "zuaros-static-metadata",
        transformIndexHtml(html) {
          const metadata = siteUrl
            ? `<link rel="canonical" href="${siteUrl.href}" />
          <meta property="og:url" content="${siteUrl.href}" />
          <meta property="og:image" content="${new URL("brand/social-preview.png", siteUrl).href}" />
          <meta name="twitter:image" content="${new URL("brand/social-preview.png", siteUrl).href}" />`
            : "";
          return html.replace("<!-- deployment-metadata -->", metadata);
        },
        generateBundle() {
          this.emitFile({
            type: "asset",
            fileName: "robots.txt",
            source: `User-agent: *\nAllow: /\n${siteUrl ? `Sitemap: ${new URL("sitemap.xml", siteUrl).href}\n` : ""}`,
          });
          if (siteUrl)
            this.emitFile({
              type: "asset",
              fileName: "sitemap.xml",
              source: `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${siteUrl.href}</loc></url></urlset>`,
            });
        },
      },
    ],
    build: {
      target: "es2022",
      rollupOptions: { input: ["index.html", "privacy/index.html"] },
    },
  };
});
