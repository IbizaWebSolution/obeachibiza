// Comprobación final: alias del selector en /es/terminos-y-condiciones,
// estilo del CTA del footer (p.h1) y noopener runtime.
import puppeteer from 'puppeteer-core';

const BASE = process.env.BASE || 'http://localhost:4322';
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  defaultViewport: { width: 1440, height: 1000 },
});
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));

await page.goto(`${BASE}/es/terminos-y-condiciones/`, { waitUntil: 'networkidle2', timeout: 45000 });
await new Promise((r) => setTimeout(r, 1500));
const opts = await page.evaluate(() =>
  [...document.querySelectorAll('.Footer .LanguageSwitcher__option')].map((o) => `${o.textContent.trim()}→${o.getAttribute('href')}`)
);
console.log('Switcher en /es/terminos-y-condiciones/:', JSON.stringify(opts));

await page.goto(`${BASE}/`, { waitUntil: 'networkidle2', timeout: 45000 });
await new Promise((r) => setTimeout(r, 2000));
const footer = await page.evaluate(() => {
  const cta = document.querySelector('.Footer__cta__text');
  const cs = getComputedStyle(cta);
  return {
    tag: cta.tagName,
    fontSize: cs.fontSize,
    fontFamily: cs.fontFamily.slice(0, 24),
    noopenerPending: [...document.querySelectorAll('a[target="_blank"]')].filter((a) => !(a.getAttribute('rel') || '').includes('noopener')).length,
    canonical: document.querySelector('link[rel="canonical"]')?.href,
    hreflangs: document.querySelectorAll('link[rel="alternate"][hreflang]').length,
    og: document.querySelectorAll('meta[property^="og:"]').length,
  };
});
console.log('Footer/SEO home:', JSON.stringify(footer, null, 1));
console.log(errors.length ? `ERRORES JS: ${errors.join(' | ')}` : 'Sin errores JS.');
await browser.close();
