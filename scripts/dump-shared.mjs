import { load } from 'cheerio';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const SCRAPE = 'C:/Users/Sergio/Documents/MEGA/DESARROLLO WEB/DESARROLLO/oceanBeach/_scrape';
const html = readFileSync(`${SCRAPE}/home.html`, 'utf8');
const $ = load(html);
const out = `${SCRAPE}/sections/_shared/`;
mkdirSync(out, { recursive: true });

let i = 0;
for (const el of $('body').children().toArray()) {
  const $el = $(el);
  const cls = ($el.attr('class') || '').trim().replace(/[^a-zA-Z0-9-]+/g, '_').slice(0, 40);
  const comp = $el.attr('g-component') || $el.find('[g-component]').first().attr('g-component') || '';
  const name = comp || cls || el.tagName;
  const h = $.html($el);
  writeFileSync(`${out}${String(i).padStart(2, '0')}-${el.tagName}-${name}.html`, h);
  console.log(i, el.tagName, '|', comp, '|', cls.slice(0, 50), '|', (h.length / 1024).toFixed(1) + 'KB');
  i++;
}
