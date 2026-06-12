// Captura el calendario real de PremiumGuest (no embebible fuera de
// obeachibiza.com) para usarlo como imagen estática en la demo.
import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--disable-blink-features=AutomationControlled'],
  defaultViewport: { width: 1352, height: 1400 },
});
const page = await browser.newPage();
await page.setUserAgent(
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
);
await page.goto('https://sales.premiumguest.com/obeachibiza/en/?mode=list', {
  waitUntil: 'networkidle2',
  timeout: 60000,
});
await new Promise((r) => setTimeout(r, 8000));
// aceptar el banner/modal de cookies (puede aparecer con retardo)
for (let i = 0; i < 10; i++) {
  const clicked = await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button, a')].find((b) =>
      /^\s*(accept|aceptar|agree|ok)\s*$/i.test(b.textContent || '')
    );
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  if (clicked) break;
  await new Promise((r) => setTimeout(r, 1000));
}
await new Promise((r) => setTimeout(r, 2000));
// eliminar el modal de cookies propio de PremiumGuest (widget "pdcc")
await page.evaluate(() => {
  document
    .querySelectorAll('[id^="pdcc"], [id*="cookie" i], [class*="cookie" i], [class*="consent" i], [id*="consent" i], [role="dialog"]')
    .forEach((e) => e.remove());
});
await new Promise((r) => setTimeout(r, 500));
const cookieGone = await page.evaluate(() => !/cookie consent/i.test(document.body.innerText));
console.log('modal de cookies cerrado:', cookieGone);
const title = await page.title();
const bodyLen = await page.evaluate(() => document.body.innerText.length);
console.log(`title: "${title}", texto: ${bodyLen} chars`);
await page.screenshot({
  path: 'C:/Users/Sergio/Documents/MEGA/DESARROLLO WEB/DESARROLLO/oceanBeach/obeachibiza/scripts/pgevents-capture.png',
  fullPage: true,
});
await browser.close();
console.log('captura guardada');
