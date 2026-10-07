import { test, expect } from "@playwright/test";

test("sitemap and rendered internal links resolve directly to canonical, indexable pages", async ({ page, request, baseURL }) => {
  const origin = "https://zuaros.com";
  const sitemap = await request.get("/sitemap.xml", { maxRedirects: 0 });
  expect(sitemap.status()).toBe(200);
  const urls = [...(await sitemap.text()).matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  expect(urls.length).toBeGreaterThan(0);
  expect(new Set(urls).size).toBe(urls.length);
  const links = new Set<string>();

  for (const url of urls) {
    const canonical = new URL(url);
    expect(canonical.origin).toBe(origin);
    expect(canonical.search + canonical.hash).toBe("");
    expect(canonical.pathname).not.toContain("/zuaros-website/");
    expect(canonical.pathname).not.toBe("/app-ads.txt");
    const response = await request.get(canonical.pathname, { maxRedirects: 0 });
    expect(response.status(), url).toBe(200);
    expect(response.headers()["x-robots-tag"] || "").not.toMatch(/noindex|none/i);
    expect(response.headers().refresh).toBeUndefined();
    await page.goto(canonical.pathname);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", url);
    const robots = await page.locator('meta[name="robots"], meta[name="googlebot"]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute("content")).join(" "));
    expect(robots).not.toMatch(/noindex|none/i);
    await expect(page.locator('meta[http-equiv="refresh" i]')).toHaveCount(0);
    const og = page.locator('meta[property="og:url"]');
    if (await og.count()) await expect(og).toHaveAttribute("content", url);
    for (const href of await page.locator("a[href]").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href")!))) {
      expect(href).not.toMatch(/petrovicc\.github\.io|\/zuaros-website\//i);
      const target = new URL(href, page.url());
      if ([origin, new URL(baseURL!).origin].includes(target.origin) || target.hostname.endsWith(".zuaros.com")) {
        expect(target.hostname).not.toBe("www.zuaros.com");
        if (target.hostname === "zuaros.com") expect(target.protocol).toBe("https:");
        links.add(target.pathname + target.search);
      }
    }
  }
  for (const path of links) expect((await request.get(path, { maxRedirects: 0 })).status(), path).toBe(200);
  const robots = await request.get("/robots.txt", { maxRedirects: 0 });
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain(`Sitemap: ${origin}/sitemap.xml`);
  expect(await robots.text()).not.toMatch(/^Disallow:\s*\/\s*$/m);
});
