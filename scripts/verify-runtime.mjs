// Verificación de runtime: errores de consola, header visible,
// apertura del burger menu y cursor personalizado.
import puppeteer from 'puppeteer-core';

const SHOTS = 'C:/Users/Sergio/AppData/Local/Temp/obeach-shots';
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--window-size=1440,900'],
  defaultViewport: { width: 1440, height: 900 },
});

const page = await browser.newPage();
const errors = [];
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(`[console] ${msg.text()}`);
});
page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`));
page.on('requestfailed', (req) => {
  if (req.url().startsWith('http://localhost')) errors.push(`[request] ${req.url()} → ${req.failure()?.errorText}`);
});

await page.goto('http://localhost:4321/', { waitUntil: 'networkidle0', timeout: 30000 });
await new Promise((r) => setTimeout(r, 2500)); // animaciones de entrada

// 1. ¿Header visible?
const header = await page.evaluate(() => {
  const inner = document.querySelector('.Header__inner');
  if (!inner) return { found: false };
  const cs = getComputedStyle(inner);
  const rect = inner.getBoundingClientRect();
  return { found: true, opacity: cs.opacity, top: rect.top, height: rect.height };
});
console.log('Header:', JSON.stringify(header));

// 2. Cursor: mover el ratón y comprobar posición/visibilidad
await page.mouse.move(700, 400);
await new Promise((r) => setTimeout(r, 300));
const cursor = await page.evaluate(() => {
  const c = document.querySelector('.Cursor');
  if (!c) return { found: false };
  const cs = getComputedStyle(c);
  const rect = c.getBoundingClientRect();
  return { found: true, opacity: cs.opacity, display: cs.display, x: Math.round(rect.x + rect.width / 2), y: Math.round(rect.y + rect.height / 2) };
});
console.log('Cursor tras mover a (700,400):', JSON.stringify(cursor));

// 3. Clic en el botón Menu
await page.click('[g-ref="burger"]');
await new Promise((r) => setTimeout(r, 900));
const burger = await page.evaluate(() => {
  const inner = document.querySelector('.BurgerMenu__inner');
  const cs = inner ? getComputedStyle(inner) : null;
  return {
    bodyClass: document.body.className.includes('burger-menu-open'),
    innerOpacity: cs?.opacity,
    links: document.querySelectorAll('.BurgerMenu__main-menu__menu__item').length,
  };
});
console.log('BurgerMenu tras clic:', JSON.stringify(burger));
await page.screenshot({ path: `${SHOTS}/menu-open.png` });

// 4. Cerrar menú y screenshot general con header
await page.click('.BurgerMenu__close');
await new Promise((r) => setTimeout(r, 700));
await page.screenshot({ path: `${SHOTS}/home-header.png` });

// 5. Carruseles activos (Flickity)
const carousels = await page.evaluate(() => document.querySelectorAll('.flickity-enabled').length);
console.log('Carruseles Flickity inicializados:', carousels);

console.log(errors.length ? `\nERRORES (${errors.length}):\n` + errors.slice(0, 15).join('\n') : '\nSin errores de consola/red.');
await browser.close();
