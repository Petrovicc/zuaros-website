import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // Pages provides the exact URL, including a project subpath or custom domain.
  const siteUrl = env.SITE_URL ? new URL(env.SITE_URL) : undefined;
  if (siteUrl) {
    siteUrl.pathname = siteUrl.pathname.replace(/\/?$/, "/");
    siteUrl.search = "";
    siteUrl.hash = "";
  }
  const base = siteUrl?.pathname ?? "/";
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
    build: { target: "es2022" },
  };
});
