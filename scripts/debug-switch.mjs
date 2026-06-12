// Depura el clic en las opciones del selector: ¿qué elemento está en el punto?
import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  defaultViewport: { width: 1440, height: 1000 },
});
const page = await browser.newPage();
page.on('console', (m) => console.log('[console]', m.text()));
await page.goto('http://localhost:4322/', { waitUntil: 'networkidle2', timeout: 45000 });
await new Promise((r) => setTimeout(r, 2000));
await page.evaluate(() => document.querySelector('.Footer__info').scrollIntoView({ block: 'center' }));
await new Promise((r) => setTimeout(r, 500));
await page.click('.Footer .LanguageSwitcher [g-ref="toggle"]');
await new Promise((r) => setTimeout(r, 400));

const info = await page.evaluate(() => {
  const opt = document.querySelector('.Footer .LanguageSwitcher .LanguageSwitcher__option[hreflang="es"]');
  const r = opt.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  const at = document.elementFromPoint(cx, cy);
  // listener de prueba: ¿llega el click y se cancela el default?
  document.addEventListener('click', (e) => {
    console.log('click target:', e.target.tagName, e.target.className, 'defaultPrevented:', e.defaultPrevented);
  }, true);
  opt.addEventListener('click', (e) => {
    setTimeout(() => console.log('tras dispatch, defaultPrevented:', e.defaultPrevented), 0);
  });
  return {
    rect: { x: Math.round(cx), y: Math.round(cy), w: Math.round(r.width), h: Math.round(r.height) },
    elementAtPoint: at ? `${at.tagName}.${[...at.classList].join('.')}` : null,
    optHref: opt.getAttribute('href'),
    pointerEvents: getComputedStyle(opt).pointerEvents,
    dropdownHidden: document.querySelector('.Footer .LanguageSwitcher [g-ref="dropdown"]').hidden,
  };
});
console.log(JSON.stringify(info, null, 1));

await page.mouse.click(info.rect.x, info.rect.y);
await new Promise((r) => setTimeout(r, 3000));
console.log('URL tras click:', page.url());
await browser.close();
