// Captura ampliada del pill del selector en footer (cerrado y abierto).
import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  defaultViewport: { width: 1440, height: 1000, deviceScaleFactor: 2 },
});
const page = await browser.newPage();
await page.goto('http://localhost:4322/', { waitUntil: 'networkidle2', timeout: 45000 });
await new Promise((r) => setTimeout(r, 2000));
await page.evaluate(() => document.querySelector('.Footer__info').scrollIntoView({ block: 'center' }));
await new Promise((r) => setTimeout(r, 500));
const el = await page.$('.Footer .LanguageSwitcher');
await el.screenshot({ path: 'C:/Users/Sergio/AppData/Local/Temp/obeach-shots/pill-closed.png' });
const txt = await page.evaluate(() => {
  const single = document.querySelector('.Footer .LanguageSwitcher .choices__list--single .choices__item');
  const r = single.getBoundingClientRect();
  const pill = document.querySelector('.Footer .LanguageSwitcher .choices').getBoundingClientRect();
  return { text: single.textContent, textRight: Math.round(r.right), pillRight: Math.round(pill.right), textLeft: Math.round(r.left), pillLeft: Math.round(pill.left) };
});
console.log(JSON.stringify(txt));
await browser.close();
