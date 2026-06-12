// Busca qué ancestro crea el contexto de apilamiento que tapa el dropdown.
import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  defaultViewport: { width: 1440, height: 1000 },
});
const page = await browser.newPage();
await page.goto('http://localhost:4322/', { waitUntil: 'networkidle2', timeout: 45000 });
await new Promise((r) => setTimeout(r, 2000));
await page.evaluate(() => document.querySelector('.Footer__info').scrollIntoView({ block: 'center' }));
await page.click('.Footer .LanguageSwitcher [g-ref="toggle"]');
await new Promise((r) => setTimeout(r, 300));

const out = await page.evaluate(() => {
  const mk = (el) => {
    const cs = getComputedStyle(el);
    const reasons = [];
    if (cs.zIndex !== 'auto' && cs.position !== 'static') reasons.push(`z:${cs.zIndex}`);
    if (parseFloat(cs.opacity) < 1) reasons.push(`opacity:${cs.opacity}`);
    if (cs.transform !== 'none') reasons.push('transform');
    if (cs.filter !== 'none') reasons.push('filter');
    if (cs.isolation === 'isolate') reasons.push('isolation');
    if (cs.willChange !== 'auto') reasons.push(`willChange:${cs.willChange}`);
    if (cs.contain.includes('paint') || cs.contain.includes('layout')) reasons.push(`contain:${cs.contain}`);
    if (cs.mixBlendMode !== 'normal') reasons.push('blend');
    return reasons;
  };
  const lines = [];
  let el = document.querySelector('.Footer .LanguageSwitcher [g-ref="dropdown"]');
  while (el && el !== document.documentElement) {
    const r = mk(el);
    lines.push(`${el.tagName}.${[...el.classList].slice(0, 3).join('.')} ${r.length ? '⟵ STACKING: ' + r.join(',') : ''}`);
    el = el.parentElement;
  }
  // y para Footer__col
  const col = [...document.querySelectorAll('.Footer__col')].map((c) => mk(c).join(',')).join(' | ');
  return { chain: lines, colReasons: col || '(ninguno)' };
});
console.log(out.chain.join('\n'));
console.log('Footer__col stacking:', out.colReasons);
await browser.close();
