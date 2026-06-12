// Verifica que el botón de cerrar del burger menu es visible, está arriba
// a la derecha y cierra el menú al hacer clic.
import puppeteer from 'puppeteer-core';

const BASE = process.env.BASE || 'http://localhost:4321';
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  defaultViewport: { width: 1440, height: 1000 },
});
const page = await browser.newPage();
await page.goto(`${BASE}/`, { waitUntil: 'networkidle2', timeout: 45000 });
await new Promise((r) => setTimeout(r, 2000));
await page.click('[g-ref="burger"]');
await new Promise((r) => setTimeout(r, 900));

const info = await page.evaluate(() => {
  const btn = document.querySelector('.BurgerMenu__close');
  const r = btn.getBoundingClientRect();
  const cs = getComputedStyle(btn);
  const menu = document.querySelector('.BurgerMenu').getBoundingClientRect();
  const at = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  return {
    rect: { top: Math.round(r.top), right: Math.round(window.innerWidth - r.right), w: Math.round(r.width), h: Math.round(r.height) },
    position: cs.position,
    visible: r.width > 0 && r.top >= 0 && r.top < window.innerHeight,
    enViewport: r.top >= 0 && r.left >= menu.left,
    clickeable: at === btn || btn.contains(at),
  };
});
console.log('CLOSE BTN:', JSON.stringify(info), '— esperado: position absolute, top~25-40, visible y clickeable');

await page.screenshot({ path: 'C:/Users/Sergio/AppData/Local/Temp/obeach-shots/burger-close-fixed.png' });
await page.click('.BurgerMenu__close');
await new Promise((r) => setTimeout(r, 600));
const cerrado = await page.evaluate(() => !document.body.classList.contains('burger-menu-open'));
console.log('Clic en cerrar -> menú cerrado:', cerrado);
await browser.close();
