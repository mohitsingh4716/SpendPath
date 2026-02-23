import { chromium } from "playwright-core";
import chromiumPkg from "@sparticuz/chromium";

export async function generatePDF(htmlContent) {
  // Launch Chromium from Sparticuz (Vercel-compatible)
  const browser = await chromium.launch({
    args: chromiumPkg.args,
    executablePath: await chromiumPkg.executablePath(),
    headless: true,
  });

  const page = await browser.newPage();


  await page.setContent(htmlContent, {
    waitUntil: "networkidle",
  });

  await page.evaluate(async () => {
    const imgs = Array.from(document.images);
    await Promise.all(
      imgs.map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise((res) => {
              img.onload = img.onerror = res;
            })
      )
    );
  });

  // Force print layout
  await page.emulateMedia({ media: "print" });

  // Generate PDF
  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
  });

  await browser.close();

  return pdfBuffer;
}