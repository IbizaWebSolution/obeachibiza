// Huella de estilos computados por elemento, página a página.
// Uso: node scripts/style-fingerprint.mjs <etiqueta>  (p. ej. baseline | purged)
// Guarda JSON en %TEMP%/obeach-fp/<etiqueta>/<página>.json
import puppeteer from 'puppeteer-core';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const LABEL = process.argv[2] || 'baseline';
const BASE = process.env.BASE || 'http://localhost:4322';
const OUT = join(process.env.TEMP || '/tmp', 'obeach-fp', LABEL);
mkdirSync(OUT, { recursive: true });

const PAGES = ['/', '/day-club/', '/bed-menus/', '/celebration-packages/', '/drinks-packages/', '/restaurant-calendar/', '/events-calendar/', '/bonito-hotel/', '/contact-us/', '/faqs/', '/inner-circle/', '/open-positions/', '/partners/', '/press/', '/privacy-policy/', '/terms-conditions/', '/blog/', '/es/'];

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  defaultViewport: { width: 1440, height: 1000 },
});
const page = await browser.newPage();

for (const url of PAGES) {
  await page.goto(`${BASE}${url}`, { waitUntil: 'networkidle2', timeout: 60000 });
  // congelar animaciones/transiciones y autoplay para una huella determinista
  await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important}' });
  await page.evaluate(() => document.querySelectorAll('video').forEach((v) => v.pause()));
  await new Promise((r) => setTimeout(r, 1200));

  const fps = await page.evaluate(() => {
    const PROPS = [
      'display', 'position', 'float', 'visibility', 'opacity', 'z-index', 'overflow-x', 'overflow-y',
      'width', 'height', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
      'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
      'font-family', 'font-size', 'font-weight', 'font-style', 'line-height', 'letter-spacing',
      'text-transform', 'text-align', 'text-decoration-line', 'white-space',
      'color', 'background-color', 'background-image', 'background-position', 'background-size',
      'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
      'border-top-color', 'border-top-style', 'border-radius',
      'flex-direction', 'justify-content', 'align-items', 'gap', 'grid-template-columns', 'grid-column-start', 'grid-column-end',
      'transform', 'box-shadow', 'cursor', 'pointer-events', 'object-fit', 'inset',
    ];
    // ruta CSS estable del elemento
    const pathOf = (el) => {
      const parts = [];
      let e = el;
      while (e && e !== document.documentElement && parts.length < 12) {
        const idx = e.parentElement ? [...e.parentElement.children].indexOf(e) : 0;
        parts.unshift(`${e.tagName}:${idx}`);
        e = e.parentElement;
      }
      return parts.join('>');
    };
    const out = [];
    const all = [...document.querySelectorAll('body *')].slice(0, 6000);
    for (const el of all) {
      // los slides de carruseles cambian de posición con autoplay: excluir transform/left de cells
      const insideCarousel = !!el.closest('.flickity-slider');
      const cs = getComputedStyle(el);
      let s = '';
      for (const p of PROPS) {
        if (insideCarousel && (p === 'transform' || p === 'opacity' || p === 'inset' || p === 'z-index' || p === 'visibility' || p === 'pointer-events')) continue;
        s += p + ':' + cs.getPropertyValue(p) + ';';
      }
      // hash djb2
      let h = 5381;
      for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
      out.push([pathOf(el) + '|' + el.className.toString().slice(0, 80), h]);
    }
    return out;
  });

  const safe = url.replace(/\//g, '_') || '_';
  writeFileSync(join(OUT, `${safe}.json`), JSON.stringify(fps));
  console.log(`${url}: ${fps.length} elementos`);
}
await browser.close();
console.log('Huellas guardadas en', OUT);
