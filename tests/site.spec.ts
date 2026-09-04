import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const viewports = [
  { width: 375, height: 812 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1366, height: 768 },
  { width: 1920, height: 1080 },
];
for (const viewport of viewports) {
  for (const lang of ["en", "sr"] as const) {
    test(`${lang} layout at ${viewport.width}×${viewport.height}`, async ({
      page,
    }) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("response", (response) => {
        if (response.status() >= 400)
          errors.push(`${response.status()} ${response.url()}`);
      });
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("./");
      await page
        .getByRole("button", {
          name: lang === "sr" ? "Srpski" : "English",
          exact: true,
        })
        .click();
      await expect(page.locator("html")).toHaveAttribute(
        "lang",
        lang === "sr" ? "sr-Latn" : "en",
      );
      await expect(page.locator("h1")).toContainText(
        lang === "sr" ? "Softver za" : "Software for",
      );
      await expect(page.locator("main section")).toHaveCount(10);
      for (const section of await page.locator("main section").all()) {
        await section.scrollIntoViewIfNeeded();
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        );
        expect(overflow).toBeFalsy();
      }
      const brokenAnchors = await page
        .locator('a[href^="#"]')
        .evaluateAll((anchors) =>
          anchors
            .filter(
              (a) => !document.getElementById(a.getAttribute("href")!.slice(1)),
            )
            .map((a) => a.getAttribute("href")),
        );
      expect(brokenAnchors).toEqual([]);
      expect(
        await page
          .locator("img")
          .evaluateAll((images) =>
            images.every(
              (image) =>
                image instanceof HTMLImageElement &&
                image.complete &&
                image.naturalWidth > 0,
            ),
          ),
      ).toBeTruthy();
      expect(errors).toEqual([]);
    });
  }
}

test("language persists, browser Serbian defaults, and metadata updates", async ({
  page,
}) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Srpski", exact: true }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "sr-Latn");
  await expect(page).toHaveTitle(/Namenski softver/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    /Razvoj namenskog softvera/,
  );
  await page.getByRole("button", { name: "English", exact: true }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("Serbian browser locale selects Serbian, blocked storage remains usable", async ({
  browser,
}) => {
  const context = await browser.newContext({ locale: "sr-RS" });
  const page = await context.newPage();
  await page.goto(test.info().project.use.baseURL as string);
  await expect(page.locator("html")).toHaveAttribute("lang", "sr-Latn");
  await context.close();
  const blocked = await browser.newContext({ locale: "en-US" });
  await blocked.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("Storage blocked");
      },
    });
  });
  const blockedPage = await blocked.newPage();
  await blockedPage.goto(test.info().project.use.baseURL as string);
  await blockedPage
    .getByRole("button", { name: "Srpski", exact: true })
    .click();
  await expect(blockedPage.locator("h1")).toContainText("Softver za");
  await blocked.close();
});

test("mobile navigation closes on selection, escape, outside click, and desktop resize", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("./");
  const menu = page.locator(".menu-toggle");
  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await page
    .locator("#main-navigation")
    .getByRole("link", { name: "Engineering", exact: true })
    .click();
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await expect(page).toHaveURL(/#engineering$/);
  await menu.click();
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await menu.click();
  await page.locator("h2#engineering-title").click();
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await menu.click();
  await page.setViewportSize({ width: 1366, height: 768 });
  // Allow the browser to deliver the desktop media-query change before resizing again.
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await expect(menu).toBeHidden();
  await page.setViewportSize({ width: 375, height: 812 });
  await expect(menu).toBeVisible();
  await expect(menu).toHaveAttribute("aria-expanded", "false");
});

test("email and clipboard work, denial is announced", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("./");
  await expect(
    page.getByRole("link", { name: "Send an email", exact: true }),
  ).toHaveAttribute("href", "mailto:zuaros.dev@gmail.com");
  await page.getByRole("button", { name: "Copy email", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("Email copied");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "zuaros.dev@gmail.com",
  );
  await page.evaluate(() => {
    navigator.clipboard.writeText = async () => {
      throw new Error("denied");
    };
  });
  await page.getByRole("button", { name: "Email copied", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Couldn’t copy");
});

test("reduced motion, keyboard skip link, and root font enlargement", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await expect(page.locator(".orbit-particles")).toHaveAttribute(
    "data-motion",
    "reduced",
  );
  await expect(page.locator(".orbit-trail").first()).toBeHidden();
  expect(
    await page
      .locator("html")
      .evaluate((node) => getComputedStyle(node).scrollBehavior),
  ).toBe("auto");
  await page.addStyleTag({ content: "html { font-size: 200%; }" });
  await page.setViewportSize({ width: 375, height: 812 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBeFalsy();
});

for (const lang of ["English", "Srpski"]) {
  test(`accessibility audit: ${lang}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("./");
    await page.getByRole("button", { name: lang, exact: true }).click();
    for (const viewport of [
      { width: 375, height: 812 },
      { width: 1366, height: 768 },
    ]) {
      await page.setViewportSize(viewport);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    }
  });
}
