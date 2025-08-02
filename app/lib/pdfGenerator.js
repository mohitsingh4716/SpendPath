
import { chromium } from 'playwright-core';

export async function generatePDF(htmlContent) {
  // Configure browser options based on environment
  const isDev = process.env.NODE_ENV === 'development';
  
  let browserOptions;
  
  if (isDev) {
    // For development, use system Chrome/Chromium
    browserOptions = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ],
    };
  } else {
    // For production (Vercel), use Sparticuz Chromium
    const chromiumPkg = await import('@sparticuz/chromium');
    browserOptions = {
      args: chromiumPkg.default.args,
      executablePath: await chromiumPkg.default.executablePath(),
      headless: chromiumPkg.default.headless,
    };
  }
  
  const browser = await chromium.launch(browserOptions);
  const page = await browser.newPage();
  await page.setContent(htmlContent);
  const pdfBuffer = await page.pdf({ format: 'A4' });
  
  await browser.close();
  
  return pdfBuffer;
}
