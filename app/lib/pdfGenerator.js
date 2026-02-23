import { chromium } from "playwright-core";

export async function generatePDF(htmlContent) {
  let browser;

  try {
    // Try Sparticuz Chromium (works on Vercel)
    const chromiumPkg = (await import("@sparticuz/chromium")).default;
    const executablePath = await chromiumPkg.executablePath();

    browser = await chromium.launch({
      args: chromiumPkg.args,
      executablePath,
      headless: true,
    });

    console.log("Using Sparticuz Chromium");

  } catch (err) {
    // Fallback to local browser automatically
    console.log("Using local Playwright browser");

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