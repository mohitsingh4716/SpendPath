import { chromium } from "playwright-core";
import chromiumPkg from "@sparticuz/chromium";

export async function generatePDF(htmlContent) {
  let browser;

  try {
    browser = await chromium.launch({
      args: [...chromiumPkg.args, "--disable-dev-shm-usage", "--no-sandbox"],
      executablePath: await chromiumPkg.executablePath(),
      headless: true,
    });

    const page = await browser.newPage();
    page.setDefaultTimeout(15000);

    await page.route("**/*", (route) => {
      const request = route.request();
      if (request.resourceType() === "document") return route.continue();
      return route.abort();
    });

    await page.setContent(htmlContent, {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });

    await page.emulateMedia({ media: "print" });

    return await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: "12mm",
        right: "10mm",
        bottom: "12mm",
        left: "10mm",
      },
      timeout: 25000,
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
