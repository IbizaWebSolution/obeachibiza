// Vuelca las propiedades computadas del subárbol SlideOut/EventPullout
// para comparar estado purgado vs original. Uso: node ... <etiqueta>
import puppeteer from 'puppeteer-core';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const LABEL = process.argv[2] || 'a';
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  defaultViewport: { width: 1440, height: 1000 },
});
const page = await browser.newPage();
await page.goto('http://localhost:4321/', { waitUntil: 'networkidle2', timeout: 60000 });
await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important}' });
await new Promise((r) => setTimeout(r, 1000));

const out = await page.evaluate(() => {
  const sels = ['.SlideOut.js-event-panel', '.SlideOut.js-event-panel .SlideOut__close', '.EventPullout', '.EventPullout__info', '.EventPullout__info__item--ticket', '.EventPullout__info__item__title'];
  const res = {};
  for (const s of sels) {
    const el = document.querySelector(s);
    if (!el) { res[s] = null; continue; }
    const cs = getComputedStyle(el);
    const obj = {};
    for (let i = 0; i < cs.length; i++) obj[cs[i]] = cs.getPropertyValue(cs[i]);
    res[s] = obj;
  }
  return res;
});
writeFileSync(join(process.env.TEMP, `slideout-${LABEL}.json`), JSON.stringify(out));
console.log('guardado', LABEL);
await browser.close();
