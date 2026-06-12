// Temp extraction script: builds src/data/sections/open-positions/03-PositionsListings.json
// from the scraped 03-PositionsListings.html (huge g-options payloads per SimpleCard).
import fs from 'fs';
import path from 'path';

const SCRAPE = 'C:/Users/Sergio/Documents/MEGA/DESARROLLO WEB/DESARROLLO/oceanBeach/_scrape';
const OUT = 'C:/Users/Sergio/Documents/MEGA/DESARROLLO WEB/DESARROLLO/oceanBeach/obeachibiza/src/data/sections/open-positions/03-PositionsListings.json';

const html = fs.readFileSync(path.join(SCRAPE, 'sections-deep/open-positions/03-PositionsListings.html'), 'utf8');
const mediaMap = JSON.parse(fs.readFileSync(path.join(SCRAPE, 'media-map.json'), 'utf8'));

const unresolved = new Set();
function resolveUrl(u) {
  if (!u) return u;
  if (mediaMap[u]) return mediaMap[u];
  const noSize = u.replace(/-\d+x\d+(\.\w+)$/, '$1');
  if (mediaMap[noSize]) return mediaMap[noSize];
  unresolved.add(u);
  return u;
}

function decodeEntities(s) {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#0?39;/g, "'")
    .replace(/&amp;/g, '&');
}

// lazyload WP pattern -> native img with local URL (keeps wrapper div + style vars)
function transformIntrinsic(h) {
  if (!h) return h;
  h = h.replace(/<noscript>[\s\S]*?<\/noscript>\s*/g, '');
  h = h.replace(/<img\b[^>]*>/g, (img) => {
    const src = (/data-src="([^"]+)"/.exec(img) || /src="([^"]+)"/.exec(img))?.[1];
    const width = /width="([^"]+)"/.exec(img)?.[1];
    const height = /height="([^"]+)"/.exec(img)?.[1];
    const alt = /alt="([^"]*)"/.exec(img)?.[1] ?? '';
    return `<img src="${resolveUrl(src)}" width="${width}" height="${height}" alt="${alt}" loading="lazy">`;
  });
  return h;
}

function demoForm(h) {
  if (!h) return h;
  return h.replace(/<form\b([^>]*)>/, (m, attrs) => '<form' + attrs.replace(/\s*action="[^"]*"/, '') + ' data-demo>');
}

const title = /<h2 class="PositionsListings__title">([^<]*)<\/h2>/.exec(html)[1];

const report = { downloadLinks: [], counts: [] };

const categories = html.split('<div class="PositionsListings__category" ').slice(1).map((chunk) => {
  const identifier = /^g-ref="slider" data-identifier="([^"]*)"/.exec(chunk)[1];
  const catTitle = /<h3 class="PositionsListings__category__title">([^<]*)<\/h3>/.exec(chunk)[1];
  const carouselOptions = JSON.parse(decodeEntities(/g-component="Carousel" g-options="([^"]*)"/.exec(chunk)[1]));

  const positions = chunk.split('<div class="PositionsListings__cell">').slice(1).map((cell) => {
    const options = JSON.parse(decodeEntities(/g-component="SimpleCard" g-options="([^"]*)"/.exec(cell)[1]));
    const a = /<a href="([^"]*)" class="SimpleCard__link" data-cursor-text="([^"]*)"/.exec(cell);
    const div = /<div class="SimpleCard__image intrinsic-image" style="--six-intrinsic-ratio: ([^;]+); --six-intrinsic-fallback: ([^"]+)">/.exec(cell);
    const img = /<img width="(\d+)" height="(\d+)" data-src="([^"]+)"[^>]*alt="([^"]*)" class="lazy lazyload/.exec(cell);
    const titleHtml = /<div class="SimpleCard__title">\s*([\s\S]*?)\s*<\/div>/.exec(cell)[1].trim();

    const pc = options.pulloutContent || {};
    pc.image = transformIntrinsic(pc.image);
    pc.form = demoForm(pc.form);
    if (pc.downloadLink) report.downloadLinks.push(pc.title + ' -> ' + JSON.stringify(pc.downloadLink));

    return {
      modifiers: 'SimpleCard--no-below-title',
      options,
      href: a[1].replace(/^https:\/\/obeachibiza\.com/, ''),
      cursorText: a[2],
      image: {
        style: `--six-intrinsic-ratio: ${div[1]}; --six-intrinsic-fallback: ${div[2]}`,
        src: resolveUrl(img[3]),
        width: Number(img[1]),
        height: Number(img[2]),
        alt: img[4],
      },
      titleHtml,
    };
  });

  report.counts.push(`${catTitle}: ${positions.length} positions`);
  return { title: catTitle, identifier, carouselOptions, positions };
});

const out = { type: 'PositionsListings', props: { title, categories } };
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n', 'utf8');

console.log('written:', OUT);
console.log(report.counts.join(' | '));
console.log('downloadLinks:', report.downloadLinks.length ? report.downloadLinks.join(' ; ') : 'none (all null)');
console.log('unresolved URLs:', unresolved.size ? [...unresolved].join('\n') : 'none');
