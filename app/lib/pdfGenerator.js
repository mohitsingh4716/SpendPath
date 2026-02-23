import { chromium } from "playwright-core";

export async function generatePDF(htmlContent) {
  let browser;

  try {
    // Try serverless chromium first (works on Vercel & locally if installed)
    const chromiumPkg = (await import("@sparticuz/chromium")).default;

    browser = await chromium.launch({
      args: chromiumPkg.args,
      executablePath: await chromiumPkg.executablePath(),
      headless: chromiumPkg.headless,
    });

  } catch (err) {
    console.log("Sparticuz chromium failed, falling back to local browser");

    // fallback for local dev machine
    browser = await chromium.launch({
      headless: true,
    });
  }

  const page = await browser.newPage();

  await page.setContent(htmlContent, {
    waitUntil: "networkidle",
  });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
  });

  await browser.close();

  return pdfBuffer;
}