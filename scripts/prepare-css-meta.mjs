import { load } from 'cheerio';
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';

const SCRAPE = 'C:/Users/Sergio/Documents/MEGA/DESARROLLO WEB/DESARROLLO/oceanBeach/_scrape';
const PROJ = 'C:/Users/Sergio/Documents/MEGA/DESARROLLO WEB/DESARROLLO/oceanBeach/obeachibiza';
const THEME6 = path.join(SCRAPE, 'assets/wp-content/themes/ocean-beach-wp-theme-six');
const mediaMap = JSON.parse(readFileSync(path.join(SCRAPE, 'media-map.json'), 'utf8'));

const STYLES = path.join(PROJ, 'src/styles');
mkdirSync(path.join(STYLES, 'components'), { recursive: true });

function fixCss(css) {
  let out = css;
  // fuentes del tema six (relativas a dist/)
  out = out.replaceAll(/url\(["']?(?:\.\/)?(?:\.\.\/dist\/)?tw_cen_mt-webfont\.(woff2?)["']?\)/g, 'url(/fonts/tw_cen_mt-webfont.$1)');
  // rutas absolutas de temas
  out = out.replaceAll(/url\(["']?\/wp-content\/themes\/ocean-beach-wp-theme-six\/src\/svg\/([^"')]+)["']?\)/g, 'url(/img/$1)');
  out = out.replaceAll(/url\(["']?\/wp-content\/themes\/ocean-beach-wp-theme\/assets\/img\/([^"')]+)["']?\)/g, 'url(/img/$1)');
  out = out.replaceAll(/url\(["']?\/wp-content\/themes\/ocean-beach-wp-theme\/assets\/fonts\/([^"')]+)["']?\)/g, 'url(/fonts/$1)');
  // uploads → media map
  out = out.replaceAll(/url\(["']?(https?:\/\/obeachibiza\.com\/wp-content\/uploads\/[^"')]+)["']?\)/g, (m, u) => `url(${mediaMap[u.split('?')[0]] || u})`);
  out = out.replaceAll(/url\(["']?(\/wp-content\/uploads\/[^"')]+)["']?\)/g, (m, u) => {
    const abs = 'https://obeachibiza.com' + u.split('?')[0];
    return `url(${mediaMap[abs] || u})`;
  });
  return out;
}

// 1. CSS de componentes dist/
const distCss = readdirSync(path.join(THEME6, 'dist')).filter((f) => f.endsWith('.css'));
for (const f of distCss) {
  writeFileSync(path.join(STYLES, 'components', f), fixCss(readFileSync(path.join(THEME6, 'dist', f), 'utf8')));
}
// 2. CSS base del tema
for (const [src, dst] of [
  ['src/css/custom-style.css', 'custom-style.css'],
  ['src/css/owl.carousel.min.css', 'owl.carousel.css'],
]) {
  const p = path.join(THEME6, src);
  if (existsSync(p)) writeFileSync(path.join(STYLES, dst), fixCss(readFileSync(p, 'utf8')));
}
const legacyTheme = path.join(SCRAPE, 'assets/wp-content/themes/ocean-beach-wp-theme/assets/css/style.min.css');
if (existsSync(legacyTheme)) writeFileSync(path.join(STYLES, 'legacy-theme.css'), fixCss(readFileSync(legacyTheme, 'utf8')));

// 3. estilos inline del head + meta por página
const meta = {};
const inlineSeen = new Map();
for (const f of readdirSync(SCRAPE).filter((x) => x.endsWith('.html'))) {
  const slug = path.basename(f, '.html');
  const $ = load(readFileSync(path.join(SCRAPE, f), 'utf8'));
  meta[slug] = {
    title: $('title').first().text().trim(),
    description: $('meta[name="description"]').attr('content') || '',
    bodyClass: ($('body').attr('class') || '').replace(/\s+/g, ' ').trim(),
  };
  $('head style').each((_, el) => {
    const css = $(el).html() || '';
    const key = css.slice(0, 200);
    if (!inlineSeen.has(key)) inlineSeen.set(key, css);
  });
}
writeFileSync(path.join(STYLES, 'wp-inline.css'), fixCss([...inlineSeen.values()].join('\n\n')));
mkdirSync(path.join(PROJ, 'src/data'), { recursive: true });
writeFileSync(path.join(PROJ, 'src/data/pages-meta.json'), JSON.stringify(meta, null, 2));

console.log(`CSS componentes: ${distCss.length}, inline blocks: ${inlineSeen.size}, meta pages: ${Object.keys(meta).length}`);
const totalKb = readdirSync(path.join(STYLES, 'components')).reduce((a, f) => a + readFileSync(path.join(STYLES, 'components', f), 'utf8').length, 0) / 1024;
console.log(`Total CSS componentes: ${totalKb.toFixed(0)} KB`);
