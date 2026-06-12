// Verifica: header al hacer scroll (headroom) e iframe del calendario.
import puppeteer from 'puppeteer-core';

const SHOTS = 'C:/Users/Sergio/AppData/Local/Temp/obeach-shots';
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  defaultViewport: { width: 1440, height: 900 },
});

const page = await browser.newPage();
const errors = [];
page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`));

// 1. Header al hacer scroll en home
await page.goto('http://localhost:4321/', { waitUntil: 'networkidle0', timeout: 30000 });
await new Promise((r) => setTimeout(r, 2200));
const atTop = await page.evaluate(() => document.querySelector('.Header').className.trim());
await page.evaluate(() => window.scrollTo({ top: 900, behavior: 'instant' }));
await new Promise((r) => setTimeout(r, 1400));
const scrolled = await page.evaluate(() => {
  const h = document.querySelector('.Header');
  const cs = getComputedStyle(h);
  return { cls: h.className.trim(), bg: cs.backgroundColor, height: cs.height };
});
console.log('Header arriba :', atTop);
console.log('Header scroll :', JSON.stringify(scrolled));
await page.screenshot({ path: `${SHOTS}/header-scrolled.png` });

// 2. Iframe del calendario de eventos
await page.goto('http://localhost:4321/events-calendar/', { waitUntil: 'networkidle2', timeout: 45000 });
await new Promise((r) => setTimeout(r, 5000)); // handshake iframeResizer
const iframe = await page.evaluate(() => {
  const f = document.querySelector('#pgevents');
  const r = f.getBoundingClientRect();
  return { height: Math.round(r.height), width: Math.round(r.width), resizerAttached: !!f.iFrameResizer };
});
console.log('Iframe eventos:', JSON.stringify(iframe));
await page.evaluate(() => document.querySelector('#pgevents').scrollIntoView({ block: 'start' }));
await new Promise((r) => setTimeout(r, 800));
await page.screenshot({ path: `${SHOTS}/events-iframe.png` });

console.log(errors.length ? `\nERRORES:\n${errors.join('\n')}` : '\nSin errores JS.');
await browser.close();
