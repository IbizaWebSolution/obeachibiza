// Inspección de los puntos 2-6: hero, TextAndLink, EventsRow overflow,
// imágenes CardsRow por página y slider fade del pie.
import puppeteer from 'puppeteer-core';

const BASE = process.env.BASE || 'http://localhost:4322';
const SHOTS = 'C:/Users/Sergio/AppData/Local/Temp/obeach-shots';
import { mkdirSync } from 'node:fs';
mkdirSync(SHOTS, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  defaultViewport: { width: 1440, height: 1000 },
});
const page = await browser.newPage();

// ---- HOME ----
await page.goto(`${BASE}/`, { waitUntil: 'networkidle2', timeout: 45000 });
await new Promise((r) => setTimeout(r, 2500));

const hero = await page.evaluate(() => {
  const content = document.querySelector('.HeroCTA .HeroCTA__content');
  const title = document.querySelector('.HeroCTA__title');
  const btn = document.querySelector('.HeroCTA__banner_logo .button');
  const playBtn = document.querySelector('.VideoPlayBtn');
  const rect = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width), centerX: Math.round(r.left + r.width / 2) };
  };
  return {
    viewportCenter: Math.round(window.innerWidth / 2),
    contentStyles: content ? { textAlign: getComputedStyle(content).textAlign, alignItems: getComputedStyle(content).alignItems, display: getComputedStyle(content).display } : null,
    title: rect(title),
    button: rect(btn),
    playBtnVisible: playBtn ? getComputedStyle(playBtn).opacity !== '0' && getComputedStyle(playBtn).display !== 'none' : false,
    playBtnExists: !!playBtn,
  };
});
console.log('HERO:', JSON.stringify(hero, null, 1));
await page.screenshot({ path: `${SHOTS}/insp-hero.png` });

// TextAndLink render
const tal = await page.evaluate(() => {
  const el = document.querySelector('.TextAndLink__text');
  return el ? { text: el.innerText.trim().slice(0, 200), html: el.innerHTML.trim().slice(0, 300) } : null;
});
console.log('TEXTANDLINK:', JSON.stringify(tal, null, 1));
await page.evaluate(() => document.querySelector('.TextAndLink')?.scrollIntoView({ block: 'center' }));
await new Promise((r) => setTimeout(r, 500));
await page.screenshot({ path: `${SHOTS}/insp-textandlink.png` });

// EventsRow overflow
const overflow = await page.evaluate(() => {
  const doc = document.documentElement;
  const rows = [...document.querySelectorAll('.EventsRow')].map((el) => {
    const r = el.getBoundingClientRect();
    return { width: Math.round(r.width), scrollW: el.scrollWidth, right: Math.round(r.right) };
  });
  return { docClientW: doc.clientWidth, docScrollW: doc.scrollWidth, bodyScrollW: document.body.scrollWidth, eventsRows: rows };
});
console.log('OVERFLOW HOME:', JSON.stringify(overflow));
// qué elemento sobresale
const wide = await page.evaluate(() => {
  const cw = document.documentElement.clientWidth;
  return [...document.querySelectorAll('body *')]
    .filter((el) => el.getBoundingClientRect().right > cw + 2)
    .slice(0, 12)
    .map((el) => `${el.tagName}.${[...el.classList].join('.')} right=${Math.round(el.getBoundingClientRect().right)}`);
});
console.log('ELEMENTOS QUE SOBRESALEN:', JSON.stringify(wide, null, 1));

await page.evaluate(() => document.querySelector('.EventsRow')?.scrollIntoView({ block: 'center' }));
await new Promise((r) => setTimeout(r, 500));
await page.screenshot({ path: `${SHOTS}/insp-eventsrow.png` });

// Footer slider (fade + dots)
const slider = await page.evaluate(() => {
  const s = document.querySelector('.Slider--footer .Carousel');
  if (!s) return null;
  return {
    isFlickity: s.classList.contains('flickity-enabled'),
    dots: s.querySelectorAll('.flickity-page-dots .dot').length,
    dotsVisible: s.querySelector('.flickity-page-dots') ? getComputedStyle(s.querySelector('.flickity-page-dots')).display : 'none',
    slides: s.querySelectorAll('.Slide').length,
  };
});
console.log('FOOTER SLIDER:', JSON.stringify(slider));
await page.evaluate(() => document.querySelector('.Slider--footer')?.scrollIntoView({ block: 'center' }));
await new Promise((r) => setTimeout(r, 600));
await page.screenshot({ path: `${SHOTS}/insp-footerslider.png` });

// Language switcher en footer
const lang = await page.evaluate(() => {
  const el = document.querySelector('.LanguageSwitcher, [class*="Language"]');
  return el ? { html: el.outerHTML.slice(0, 600) } : null;
});
console.log('LANG SWITCHER:', JSON.stringify(lang, null, 1));

// ---- CardsRow en todas las páginas ----
const pagesWithCards = ['/', '/day-club/', '/bed-menus/', '/celebration-packages/', '/drinks-packages/', '/restaurant-calendar/', '/events-calendar/'];
for (const url of pagesWithCards) {
  await page.goto(`${BASE}${url}`, { waitUntil: 'networkidle2', timeout: 45000 });
  await new Promise((r) => setTimeout(r, 1500));
  const cards = await page.evaluate(() => {
    return [...document.querySelectorAll('.CardsRow')].map((row) => {
      const imgs = [...row.querySelectorAll('img')];
      return {
        cells: row.querySelectorAll('.CardsRow__cell').length,
        imgs: imgs.length,
        broken: imgs.filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.getAttribute('src')),
        missingImg: [...row.querySelectorAll('.SimpleCard')].filter((c) => !c.querySelector('img')).length,
      };
    });
  });
  console.log(`CARDSROW ${url}:`, JSON.stringify(cards));
}

await browser.close();
console.log('OK — capturas en', SHOTS);
