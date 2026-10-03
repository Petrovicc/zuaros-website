import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync } from "node:fs";
import type { Policy } from "../src/privacy/types";

const manifest: Pick<Policy, "app" | "slug" | "sourceTitle" | "date">[] = JSON.parse(readFileSync("src/privacy/manifest.json", "utf8"));

const normalize = (text: string) => text.replace(/\s+/g, " ").trim();
const viewports = [
  { width: 375, height: 812 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1366, height: 768 },
  { width: 1920, height: 1080 },
];
const routes = ["/privacy/", ...manifest.map(({ slug }) => `/privacy/${slug}/`)];

for (const entry of manifest) {
  test(`${entry.app}: direct URL, refresh, source fidelity and metadata`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    const path = `/privacy/${entry.slug}/`;
    expect((await page.goto(path))?.status()).toBe(200);
    expect((await page.reload())?.status()).toBe(200);
    expect(new URL(page.url()).pathname).toBe(path);
    await expect(page).toHaveTitle(`${entry.app} Privacy Policy | Zuaros`);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://zuaros.com${path}`);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", `Privacy Policy for ${entry.app}, developed by Zuaros.`);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toContainText(entry.app);
    await expect(page.locator("time")).toHaveAttribute("datetime", entry.date);
    const original = readFileSync(`docs/privacy-sources/${entry.slug}.txt`, "utf8").split(/\r?\n\r?\n/).map(normalize).filter(Boolean);
    // The source may include its page title; the layout displays it separately.
    if (original[0] === entry.sourceTitle) original.shift();
    // Dates move beside the heading in the shared layout (Algol places its
    // app/publisher/package paragraph before the date in the supplied HTML).
    const dateIndex = original.findIndex((text) => /^(Last updated|Effective date):/.test(text));
    expect(dateIndex).toBeGreaterThanOrEqual(0);
    expect(normalize(await page.locator("time").innerText())).toBe(original.splice(dateIndex, 1)[0]);
    const rendered = (await page.locator(".policy-content > p, .policy-content > h2, .policy-content li").allTextContents()).map(normalize);
    expect(rendered).toEqual(original);
    const links: { text: string; href: string }[] = JSON.parse(readFileSync(`docs/privacy-sources/${entry.slug}.links.json`, "utf8"));
    for (const link of links) await expect(page.locator(".policy-content").getByRole("link", { name: link.text, exact: true })).toHaveAttribute("href", link.href);
    await expect(page.locator('.policy-content a[href^="mailto:"]').first()).toHaveAttribute("href", "mailto:zuaros.dev@gmail.com");
    for (const other of manifest.filter((item) => item.slug !== entry.slug)) await expect(page.locator("article")).not.toContainText(other.app);
    await page.getByRole("button", { name: "Srpski", exact: true }).click();
    await expect(page).toHaveTitle(`${entry.app} Privacy Policy | Zuaros`);
    await expect(page.locator("main")).toHaveAttribute("lang", "en");
    await expect(page.locator(".site-header > .header-inner > a")).toHaveAttribute("href", "/");
    expect(errors).toEqual([]);
  });
}

for (const path of routes) {
  for (const viewport of viewports) {
    test(`${path} readable at ${viewport.width}×${viewport.height}`, async ({ page }, info) => {
      const failures: string[] = [];
      page.on("requestfailed", (request) => failures.push(request.url()));
      page.on("response", (response) => { if (response.status() >= 400) failures.push(response.url()); });
      await page.setViewportSize(viewport);
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);
      for (const block of await page.locator("h1, .policy-content h2, .policy-content p, .policy-content ul, footer").all()) {
        await block.scrollIntoViewIfNeeded();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      }
      expect(await page.locator("img").evaluateAll((images) => images.every((image) => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0))).toBe(true);
      expect(await page.evaluate(() => document.fonts.check('16px "Inter Variable"') && document.fonts.check('16px "Space Grotesk Variable"'))).toBe(true);
      expect(await page.locator('a[href],script[src],link[href],img[src]').evaluateAll((nodes) => nodes.some((node) => /petrovicc\.github\.io|\/zuaros-website\//i.test(node.getAttribute("href") || node.getAttribute("src") || "")))).toBe(false);
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      await page.screenshot({ path: info.outputPath("page.png") });
      expect(failures).toEqual([]);
    });
  }
  test(`${path} accessible with and without JavaScript`, async ({ page, browser }) => {
    await page.goto(path);
    for (const viewport of [viewports[0], viewports[3]]) {
      await page.setViewportSize(viewport);
      const audit = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
      expect(audit.violations).toEqual([]);
    }
    const context = await browser.newContext({ javaScriptEnabled: false, baseURL: test.info().project.use.baseURL });
    const staticPage = await context.newPage();
    expect((await staticPage.goto(path))?.status()).toBe(200);
    await expect(staticPage.locator("h1")).toBeVisible();
    if (path !== "/privacy/") await expect(staticPage.locator(".policy-content")).toContainText("zuaros.dev@gmail.com");
    else await expect(staticPage.locator(".policy-directory li")).toHaveCount(manifest.length);
    await context.close();
  });
}

test("privacy directory, footer, keyboard and mobile navigation", async ({ page, request }) => {
  await page.goto("/");
  await page.locator("footer").getByRole("link", { name: "Privacy", exact: true }).click();
  await expect(page).toHaveURL(/\/privacy\/$/);
  await expect(page.locator(".policy-content")).toHaveCount(0);
  await expect(page.locator(".policy-directory li")).toHaveCount(manifest.length);
  await page.getByRole("link", { name: /MemoSpin/ }).click();
  await expect(page).toHaveURL(/\/privacy\/memospin\/$/);
  await page.setViewportSize(viewports[0]);
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.locator(".menu-toggle").click();
  await page.keyboard.press("Escape");
  await expect(page.locator(".menu-toggle")).toBeFocused();
  await expect(page.locator(".menu-toggle")).toHaveAttribute("aria-expanded", "false");
  await page.locator(".menu-toggle").click();
  await page.locator("#main-navigation").getByRole("link", { name: "About", exact: true }).click();
  await expect(page).toHaveURL(/\/#about$/);
  expect((await request.get("/privacy/not-a-policy/")).status()).toBe(404);
  expect((await request.get("/CNAME")).status()).toBe(200);
  expect((await (await request.get("/CNAME")).text()).trim()).toBe("zuaros.com");
});
