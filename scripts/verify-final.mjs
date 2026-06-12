// Verificación final: calendario de eventos (captura estática) y
// calendario del restaurante (iframe CoverManager con auto-altura).
import puppeteer from 'puppeteer-core';

const SHOTS = 'C:/Users/Sergio/AppData/Local/Temp/obeach-shots';
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  defaultViewport: { width: 1440, height: 1100 },
});
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (err) => errors.push(err.message));

// 1. Events calendar: imagen estática visible
await page.goto('http://localhost:4321/events-calendar/', { waitUntil: 'networkidle2', timeout: 45000 });
await new Promise((r) => setTimeout(r, 2500));
const events = await page.evaluate(() => {
  const img = document.querySelector('.demo-embed-fallback img');
  const r = img?.getBoundingClientRect();
  return { imgOk: !!img && img.naturalWidth > 0, width: Math.round(r?.width || 0), note: !!document.querySelector('.demo-embed-note') };
});
console.log('Events (captura estática):', JSON.stringify(events));
await page.evaluate(() => document.querySelector('.demo-embed-fallback').scrollIntoView());
await new Promise((r) => setTimeout(r, 600));
await page.screenshot({ path: `${SHOTS}/events-final.png` });

// 2. Restaurant: iframe CoverManager con resizer
await page.goto('http://localhost:4321/restaurant-calendar/', { waitUntil: 'networkidle2', timeout: 45000 });
await new Promise((r) => setTimeout(r, 6000));
const rest = await page.evaluate(() => {
  const f = document.querySelector('iframe[src*="covermanager"]');
  const r = f?.getBoundingClientRect();
  return { found: !!f, height: Math.round(r?.height || 0), resizer: !!f?.iFrameResizer };
});
console.log('Restaurant (CoverManager):', JSON.stringify(rest));
await page.evaluate(() => document.querySelector('iframe[src*="covermanager"]')?.scrollIntoView());
await new Promise((r) => setTimeout(r, 600));
await page.screenshot({ path: `${SHOTS}/restaurant-final.png` });

console.log(errors.length ? `ERRORES JS: ${errors.join(' | ')}` : 'Sin errores JS.');
await browser.close();
