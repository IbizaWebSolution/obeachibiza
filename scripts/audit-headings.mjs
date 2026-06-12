// Lista los saltos de nivel en encabezados (a11y heading-order) por página.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as cheerio from 'cheerio';

const pages = ['index.html', 'day-club/index.html', 'bed-menus/index.html', 'celebration-packages/index.html', 'drinks-packages/index.html', 'restaurant-calendar/index.html', 'events-calendar/index.html', 'bonito-hotel/index.html', 'contact-us/index.html', 'faqs/index.html', 'inner-circle/index.html', 'open-positions/index.html', 'partners/index.html', 'press/index.html', 'privacy-policy/index.html', 'terms-conditions/index.html', 'blog/index.html'];

for (const p of pages) {
  const $ = cheerio.load(readFileSync(join('dist', p), 'utf8'));
  let prev = 0;
  const errs = [];
  $('h1,h2,h3,h4,h5,h6').each((_, el) => {
    const role = $(el).attr('role');
    if (role === 'presentation' || role === 'none') return; // fuera del outline
    const lvl = +($(el).attr('aria-level') || el.tagName[1]); // axe respeta aria-level
    const txt = $(el).text().trim().slice(0, 35).replace(/\s+/g, ' ');
    if (prev && lvl > prev + 1) errs.push(`h${prev}->h${lvl} "${txt}"`);
    prev = lvl;
  });
  if (errs.length) console.log(`${p.replace('/index.html', '') || 'home'}: ${errs.join(' | ')}`);
}
