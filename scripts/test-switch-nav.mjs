// Test puntual: clic en la opción ES del selector del footer navega a /es/.
import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  defaultViewport: { width: 1440, height: 1000 },
});
const page = await browser.newPage();
await page.goto('http://localhost:4322/', { waitUntil: 'networkidle2', timeout: 45000 });
await new Promise((r) => setTimeout(r, 2000));
await page.evaluate(() => document.querySelector('.Footer__info').scrollIntoView({ block: 'center' }));
await new Promise((r) => setTimeout(r, 500));
await page.click('.Footer .LanguageSwitcher [g-ref="toggle"]');
await new Promise((r) => setTimeout(r, 300));
await Promise.all([
  page.waitForNavigation({ timeout: 30000 }),
  page.click('.Footer .LanguageSwitcher .LanguageSwitcher__option[hreflang="es"]'),
]);
console.log('URL final:', page.url());
await new Promise((r) => setTimeout(r, 800));
console.log('Header btn:', await page.evaluate(() => document.querySelector('.Header__btns__btn')?.textContent?.trim()));
await browser.close();
