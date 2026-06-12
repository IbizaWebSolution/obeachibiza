import { load } from 'cheerio';
import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const SCRAPE = String.raw`C:\Users\Sergio\Documents\MEGA\DESARROLLO WEB\DESARROLLO\oceanBeach\_scrape`;
const OUT = path.join(SCRAPE, 'sections');

await mkdir(OUT, { recursive: true });

const report = {};

for (const f of (await readdir(SCRAPE)).filter((x) => x.endsWith('.html'))) {
  const slug = path.basename(f, '.html');
  const html = await readFile(path.join(SCRAPE, f), 'utf8');
  const $ = load(html);
  const main = $('#swup');
  if (!main.length) {
    report[slug] = 'NO #swup';
    continue;
  }
  const sections = [];
  const dir = path.join(OUT, slug);
  await mkdir(dir, { recursive: true });
  let i = 0;
  for (const el of main.children().toArray()) {
    const $el = $(el);
    const comp = $el.attr('g-component') || $el.find('[g-component]').first().attr('g-component') || '';
    const cls = ($el.attr('class') || '').replace(/\s+/g, ' ').trim();
    const id = $el.attr('id') || '';
    sections.push({ i, tag: el.tagName, comp, cls: cls.slice(0, 80), id });
    await writeFile(path.join(dir, `${String(i).padStart(2, '0')}-${comp || el.tagName}.html`), $.html($el));
    i++;
  }
  report[slug] = sections;
}

await writeFile(path.join(OUT, '_report.json'), JSON.stringify(report, null, 2));

for (const [slug, secs] of Object.entries(report)) {
  console.log(`\n## ${slug}`);
  if (typeof secs === 'string') { console.log('  ' + secs); continue; }
  for (const s of secs) console.log(`  ${s.i}: <${s.tag}> ${s.comp || '-'} | ${s.cls}${s.id ? ' #' + s.id : ''}`);
}
