// Verifica: selector de idioma con banderas (footer + burger), regresiones
// tras el reorden de CSS (hero, overflow) y errores JS en todas las páginas.
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

// ---- HOME: hero + overflow + switcher footer ----
await page.goto(`${BASE}/`, { waitUntil: 'networkidle2', timeout: 45000 });
await new Promise((r) => setTimeout(r, 2500));

const hero = await page.evaluate(() => {
  const c = (el) => el ? Math.round(el.getBoundingClientRect().left + el.getBoundingClientRect().width / 2) : null;
  return {
    vc: Math.round(window.innerWidth / 2),
    title: c(document.querySelector('.HeroCTA__title')),
    btn: c(document.querySelector('.HeroCTA__banner_logo .button')),
    playBtn: !!document.querySelector('.VideoPlayBtn'),
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
});
console.log('HERO/OVERFLOW:', JSON.stringify(hero));

// switcher en footer
await page.evaluate(() => document.querySelector('.Footer__info')?.scrollIntoView({ block: 'center' }));
await new Promise((r) => setTimeout(r, 600));
const switcherClosed = await page.evaluate(() => {
  const sw = document.querySelector('.Footer .LanguageSwitcher');
  if (!sw) return null;
  const pill = sw.querySelector('.choices');
  const r = pill.getBoundingClientRect();
  const flag = sw.querySelector('.LanguageSwitcher__toggle .LanguageSwitcher__flag');
  return {
    pill: { w: Math.round(r.width), h: Math.round(r.height) },
    border: getComputedStyle(pill).borderTopWidth + ' ' + getComputedStyle(pill).borderTopColor,
    flagVisible: flag && flag.getBoundingClientRect().width > 0,
    label: sw.querySelector('.choices__list--single .choices__item')?.textContent,
  };
});
console.log('SWITCHER FOOTER (cerrado):', JSON.stringify(switcherClosed), '— esperado pill 116x38');
await page.screenshot({ path: `${SHOTS}/r3-footer-switcher.png` });

// abrir dropdown
await page.click('.Footer .LanguageSwitcher [g-ref="toggle"]');
await new Promise((r) => setTimeout(r, 400));
const switcherOpen = await page.evaluate(() => {
  const sw = document.querySelector('.Footer .LanguageSwitcher');
  const dd = sw.querySelector('[g-ref="dropdown"]');
  const opts = [...dd.querySelectorAll('.LanguageSwitcher__option')];
  return {
    visible: !dd.hidden,
    opensUp: sw.classList.contains('opens-up'),
    inViewport: dd.getBoundingClientRect().top >= 0 && dd.getBoundingClientRect().bottom <= window.innerHeight,
    options: opts.map((o) => `${o.textContent.trim()}→${o.getAttribute('href')}`),
    flags: opts.filter((o) => o.querySelector('img')?.getBoundingClientRect().width > 0).length,
  };
});
console.log('SWITCHER FOOTER (abierto):', JSON.stringify(switcherOpen, null, 1));
await page.screenshot({ path: `${SHOTS}/r3-footer-switcher-open.png` });

// navegar a ES desde el dropdown
await page.click('.Footer .LanguageSwitcher .LanguageSwitcher__option[hreflang="es"]');
await new Promise((r) => setTimeout(r, 1500));
console.log('Tras clic ES:', page.url());

// ---- Burger menu: switcher visible ----
await page.goto(`${BASE}/`, { waitUntil: 'networkidle2', timeout: 45000 });
await new Promise((r) => setTimeout(r, 2000));
await page.click('[g-ref="burger"]');
await new Promise((r) => setTimeout(r, 900));
const burgerSwitcher = await page.evaluate(() => {
  const sw = document.querySelector('.BurgerMenu .LanguageSwitcher');
  if (!sw) return null;
  const r = sw.querySelector('.choices').getBoundingClientRect();
  return {
    visible: r.width > 0 && r.top >= 0 && r.left < window.innerWidth,
    rect: { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top), left: Math.round(r.left) },
    borderColor: getComputedStyle(sw.querySelector('.choices')).borderTopColor,
  };
});
console.log('SWITCHER BURGER:', JSON.stringify(burgerSwitcher));
await page.screenshot({ path: `${SHOTS}/r3-burger-switcher.png` });
// abrir su dropdown
await page.click('.BurgerMenu .LanguageSwitcher [g-ref="toggle"]');
await new Promise((r) => setTimeout(r, 400));
await page.screenshot({ path: `${SHOTS}/r3-burger-switcher-open.png` });

// ---- Regresiones: todas las páginas, errores y overflow ----
const pages = ['/', '/day-club/', '/bed-menus/', '/celebration-packages/', '/drinks-packages/', '/restaurant-calendar/', '/events-calendar/', '/bonito-hotel/', '/contact-us/', '/faqs/', '/inner-circle/', '/open-positions/', '/partners/', '/press/', '/privacy-policy/', '/terms-conditions/', '/blog/', '/es/'];
for (const url of pages) {
  errors.length = 0;
  await page.goto(`${BASE}${url}`, { waitUntil: 'networkidle2', timeout: 45000 });
  await new Promise((r) => setTimeout(r, 1200));
  const info = await page.evaluate(() => ({
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    h1: document.querySelector('h1')?.textContent?.trim().slice(0, 40) ?? null,
    sections: document.querySelectorAll('section').length,
  }));
  const flag = info.overflowX > 0 || errors.length ? '  ⚠' : '';
  console.log(`${url}: overflowX=${info.overflowX} sections=${info.sections} errs=${errors.length}${flag} ${errors.slice(0, 2).join(' | ')}`);
}

await page.goto(`${BASE}/`, { waitUntil: 'networkidle2', timeout: 45000 });
await new Promise((r) => setTimeout(r, 2000));
await page.screenshot({ path: `${SHOTS}/r3-home-full.png`, fullPage: true });

await browser.close();
console.log('OK — capturas en', SHOTS);
