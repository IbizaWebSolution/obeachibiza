// Verifica los 7 puntos: source map, hero centrado sin play btn, TextAndLink,
// overflow EventsRow, imágenes CardsRow, dots del slider fade, i18n.
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE || 'http://localhost:4322';
const SHOTS = 'C:/Users/Sergio/AppData/Local/Temp/obeach-shots';
mkdirSync(SHOTS, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  defaultViewport: { width: 1440, height: 1000 },
});
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));

// ---- HOME (hero, overflow, slider dots) ----
await page.goto(`${BASE}/`, { waitUntil: 'networkidle2', timeout: 45000 });
await new Promise((r) => setTimeout(r, 2500));

const hero = await page.evaluate(() => {
  const title = document.querySelector('.HeroCTA__title');
  const btn = document.querySelector('.HeroCTA__banner_logo .button');
  const rect = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return Math.round(r.left + r.width / 2);
  };
  return {
    viewportCenter: Math.round(window.innerWidth / 2),
    titleCenterX: rect(title),
    buttonCenterX: rect(btn),
    playBtn: !!document.querySelector('.VideoPlayBtn'),
  };
});
console.log('2) HERO:', JSON.stringify(hero), '— centros deben ~coincidir, playBtn=false');
await page.screenshot({ path: `${SHOTS}/fix-hero.png` });

const overflow = await page.evaluate(() => ({
  docClientW: document.documentElement.clientWidth,
  docScrollW: document.documentElement.scrollWidth,
}));
console.log('4) OVERFLOW home:', JSON.stringify(overflow), '— scrollW debe ser <= clientW');

// dots del slider del pie
await page.evaluate(() => document.querySelector('.Slider--footer')?.scrollIntoView({ block: 'center' }));
await new Promise((r) => setTimeout(r, 800));
const slider = await page.evaluate(() => {
  const s = document.querySelector('.Slider--footer .Carousel');
  const dots = s?.querySelectorAll('.flickity-page-dots .flickity-page-dot, .flickity-page-dots .dot');
  return {
    dots: dots ? dots.length : 0,
    selected: s?.querySelector('.flickity-page-dots .is-selected') ? true : false,
    fade: !!s?.querySelector('.flickity-slider') && getComputedStyle(s.querySelectorAll('.Slide')[0]).position === 'absolute',
  };
});
console.log('6) FOOTER SLIDER:', JSON.stringify(slider), '— dots=3, selected=true');
await page.screenshot({ path: `${SHOTS}/fix-footerslider.png` });

// cambio automático de slide (fade autoplay 5s)
const slideBefore = await page.evaluate(() => document.querySelector('.Slider--footer .Slide.is-selected .Slide__title')?.textContent);
await new Promise((r) => setTimeout(r, 5600));
const slideAfter = await page.evaluate(() => document.querySelector('.Slider--footer .Slide.is-selected .Slide__title')?.textContent);
console.log('6) AUTOPLAY fade:', JSON.stringify({ slideBefore, slideAfter }), '— deben diferir');

// ---- CardsRow: forzar carga lazy y comprobar imágenes en cada página ----
const pagesWithCards = ['/', '/day-club/', '/bed-menus/', '/celebration-packages/', '/drinks-packages/', '/restaurant-calendar/', '/events-calendar/'];
for (const url of pagesWithCards) {
  await page.goto(`${BASE}${url}`, { waitUntil: 'networkidle2', timeout: 45000 });
  await page.evaluate(() => {
    document.querySelectorAll('.CardsRow img, .EventsCalendarPage .CardsRow img').forEach((i) => (i.loading = 'eager'));
    document.querySelector('.CardsRow')?.scrollIntoView({ block: 'center' });
  });
  await new Promise((r) => setTimeout(r, 1800));
  const cards = await page.evaluate(async () => {
    const imgs = [...document.querySelectorAll('.CardsRow .SimpleCard img')];
    await Promise.all(imgs.map((i) => (i.complete ? null : new Promise((res) => { i.onload = res; i.onerror = res; setTimeout(res, 3000); }))));
    return {
      cards: document.querySelectorAll('.CardsRow .SimpleCard').length,
      imgs: imgs.length,
      rotas: imgs.filter((i) => i.naturalWidth === 0).map((i) => i.getAttribute('src')),
      sinImagen: [...document.querySelectorAll('.CardsRow .SimpleCard')].filter((c) => !c.querySelector('img')).length,
    };
  });
  console.log(`5) CARDSROW ${url}:`, JSON.stringify(cards));
}

// ---- i18n: /es/ con chrome traducido y selector ----
for (const [path, expect] of [['/es/', 'Reserva una cama'], ['/it/', 'Prenota un lettino'], ['/fr/', 'Réservez un lit'], ['/de/', 'Bett buchen']]) {
  await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await new Promise((r) => setTimeout(r, 1200));
  const i18n = await page.evaluate(() => ({
    lang: document.documentElement.lang,
    headerBtn: document.querySelector('.Header__btns__btn')?.textContent?.trim(),
    options: [...document.querySelectorAll('.LanguageSwitcher option')].map((o) => `${o.textContent}:${o.value}${o.selected ? '*' : ''}`),
    footerCta: document.querySelector('.Footer__cta__text')?.textContent?.trim().slice(0, 60),
  }));
  console.log(`7) I18N ${path}:`, JSON.stringify(i18n), `— headerBtn esperado: ${expect}`);
}

// selector funciona: cambiar de / a /es/
await page.goto(`${BASE}/day-club/`, { waitUntil: 'domcontentloaded', timeout: 45000 });
await new Promise((r) => setTimeout(r, 1000));
await page.select('.LanguageSwitcher select', '/es/day-club/');
await new Promise((r) => setTimeout(r, 1500));
console.log('7) Tras seleccionar ES en /day-club/:', page.url(), '— debe ser /es/day-club/');

// enlaces internos del contenido en /es/ conservan prefijo
await page.goto(`${BASE}/es/`, { waitUntil: 'networkidle2', timeout: 45000 });
await new Promise((r) => setTimeout(r, 1500));
const linkSample = await page.evaluate(() =>
  [...document.querySelectorAll('main a[href^="/"]')].slice(0, 8).map((a) => a.getAttribute('href'))
);
console.log('7) ENLACES en /es/:', JSON.stringify(linkSample));
await page.screenshot({ path: `${SHOTS}/fix-es-home.png` });

console.log(errors.length ? `\nERRORES JS: ${errors.join(' | ')}` : '\nSin errores JS.');
await browser.close();
