import { load } from 'cheerio';
import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';

const SCRAPE = 'C:/Users/Sergio/Documents/MEGA/DESARROLLO WEB/DESARROLLO/oceanBeach/_scrape';
const OUT = path.join(SCRAPE, 'sections-deep');

// tipos de sección de nivel superior (no internos como Card o Slide)
const SECTION_TYPES = new Set([
  'HeroCTA', 'TextAndLink', 'Marquee', 'CTAs', 'SimpleCard', 'EventsRow', 'CardsRow',
  'DetailCardGrid', 'PageWithSideMenu', 'RestaurantBookingCalendar', 'EventsCalendarPage',
  'JournalHero', 'JournalCardGrid', 'PositionsPullout', 'PositionsListings', 'Slider',
  'ImageRow', 'Video', 'HtmlScriptEmbed', 'BlinkingTitle', 'Carousel', 'InstagramFeed',
]);

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

for (const f of readdirSync(SCRAPE).filter((x) => x.endsWith('.html'))) {
  const slug = path.basename(f, '.html');
  const $ = load(readFileSync(path.join(SCRAPE, f), 'utf8'));
  const main = $('#swup');
  if (!main.length) continue;
  const dir = path.join(OUT, slug);
  mkdirSync(dir, { recursive: true });

  const all = main.find('[g-component]').toArray()
    .filter((el) => SECTION_TYPES.has($(el).attr('g-component')));
  // solo de nivel superior: sin ancestro que también sea sección
  const top = all.filter((el) => !$(el).parents('[g-component]').toArray()
    .some((p) => SECTION_TYPES.has($(p).attr('g-component'))));

  let i = 0;
  const order = [];
  for (const el of top) {
    const comp = $(el).attr('g-component');
    const file = `${String(i).padStart(2, '0')}-${comp}.html`;
    writeFileSync(path.join(dir, file), $.html($(el)));
    order.push({ i, comp, cls: ($(el).attr('class') || '').replace(/\s+/g, ' ').trim(), bytes: $.html($(el)).length });
    i++;
  }
  // contenido sin g-component (custom: inner-circle, contact, faqs, hoteles)
  writeFileSync(path.join(dir, '_main-full.html'), $.html(main));
  writeFileSync(path.join(dir, '_order.json'), JSON.stringify(order, null, 2));
  console.log(`${slug}: ${order.map((o) => o.comp).join(', ')}`);
}
