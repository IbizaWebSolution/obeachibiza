// Auditoría estática de dist/: SEO, rendimiento (pesos), seguridad y a11y.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import * as cheerio from 'cheerio';

const DIST = 'dist';
const htmlFiles = [];
(function walk(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p);
    else if (e.endsWith('.html')) htmlFiles.push(p);
  }
})(DIST);

const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
const mb = (n) => `${(n / 1024 / 1024).toFixed(2)} MB`;

// ---------- SEO + a11y + seguridad por página ----------
const seo = [];
const secIssues = { httpLinks: new Set(), blankNoRel: [], externalForms: [] };
const allInternalHrefs = new Set();
const pageSet = new Set(htmlFiles.map((f) => '/' + relative(DIST, f).replace(/\\/g, '/').replace(/index\.html$/, '').replace(/\.html$/, '')));

for (const f of htmlFiles) {
  const rel = '/' + relative(DIST, f).replace(/\\/g, '/').replace('index.html', '');
  const html = readFileSync(f, 'utf8');
  const $ = cheerio.load(html);
  const imgs = $('img');
  const noAlt = imgs.filter((_, el) => !($(el).attr('alt') ?? '').length).length;
  const lazyless = imgs.filter((_, el) => !$(el).attr('loading') && !$(el).attr('fetchpriority')).length;
  seo.push({
    page: rel,
    title: $('title').text() || '(SIN TITLE)',
    titleLen: ($('title').text() || '').length,
    desc: ($('meta[name="description"]').attr('content') || '').length,
    canonical: !!$('link[rel="canonical"]').length,
    og: $('meta[property^="og:"]').length,
    hreflang: $('link[rel="alternate"][hreflang]').length,
    h1: $('h1').length,
    lang: $('html').attr('lang'),
    imgs: imgs.length,
    noAlt,
    lazyless,
    robotsMeta: $('meta[name="robots"]').attr('content') || '',
  });
  // seguridad
  $('a[href^="http://"]').each((_, el) => secIssues.httpLinks.add($(el).attr('href').split('?')[0]));
  $('a[target="_blank"]').each((_, el) => {
    const relAttr = $(el).attr('rel') || '';
    if (!relAttr.includes('noopener') && !relAttr.includes('noreferrer'))
      secIssues.blankNoRel.push(`${rel} → ${($(el).attr('href') || '').slice(0, 60)}`);
  });
  $('form[action]').each((_, el) => secIssues.externalForms.push(`${rel} → ${$(el).attr('action')}`));
  // enlaces internos para chequear rotos
  $('a[href^="/"]').each((_, el) => {
    const href = $(el).attr('href').split('#')[0].split('?')[0];
    if (href && !/\.(pdf|webp|jpg|png|svg|mp4|css|js|ico)$/i.test(href)) allInternalHrefs.add(href);
  });
}

console.log('==================== SEO ====================');
const seoEN = seo.filter((s) => !/^\/(es|it|fr|de)\//.test(s.page));
for (const s of seoEN) {
  const issues = [];
  if (!s.titleLen) issues.push('SIN <title>');
  if (s.titleLen > 60) issues.push(`title ${s.titleLen}ch`);
  if (!s.desc) issues.push('sin meta description');
  if (!s.canonical) issues.push('sin canonical');
  if (!s.og) issues.push('sin OpenGraph');
  if (!s.hreflang) issues.push('sin hreflang');
  if (s.h1 !== 1) issues.push(`h1=${s.h1}`);
  console.log(`${s.page}  ${issues.length ? '⚠ ' + issues.join(', ') : '✓'}`);
}
const locPages = seo.filter((s) => /^\/(es|it|fr|de)\//.test(s.page));
console.log(`\nPáginas localizadas: ${locPages.length} — lang correcto: ${locPages.filter((s) => s.lang && s.lang !== 'en-GB').length}, sin canonical: ${locPages.filter((s) => !s.canonical).length}, sin hreflang: ${locPages.filter((s) => !s.hreflang).length}`);
console.log(`robots.txt: ${existsSync(join(DIST, 'robots.txt')) ? 'SÍ' : 'NO'} | sitemap.xml: ${existsSync(join(DIST, 'sitemap.xml')) || existsSync(join(DIST, 'sitemap-index.xml')) ? 'SÍ' : 'NO'} | favicon: ${existsSync(join(DIST, 'favicon.png')) ? 'SÍ' : 'NO'}`);

console.log('\n==================== ACCESIBILIDAD (rápida) ====================');
const totNoAlt = seoEN.reduce((a, s) => a + s.noAlt, 0);
console.log(`Imágenes sin alt (páginas EN): ${totNoAlt} de ${seoEN.reduce((a, s) => a + s.imgs, 0)}`);
console.log('Peores páginas:', seoEN.filter((s) => s.noAlt > 0).sort((a, b) => b.noAlt - a.noAlt).slice(0, 5).map((s) => `${s.page}(${s.noAlt})`).join(', '));

console.log('\n==================== ENLACES INTERNOS ROTOS ====================');
let broken = 0;
for (const href of [...allInternalHrefs].sort()) {
  const norm = href.endsWith('/') ? href : href + '/';
  if (!pageSet.has(norm) && !pageSet.has(href) && !existsSync(join(DIST, href.slice(1)))) {
    console.log('  ROTO:', href);
    broken++;
  }
}
if (!broken) console.log('  Ninguno ✓');

console.log('\n==================== SEGURIDAD ====================');
console.log('Enlaces http:// (sin TLS):', [...secIssues.httpLinks].join(', ') || 'ninguno');
console.log(`target="_blank" sin rel=noopener: ${secIssues.blankNoRel.length}`);
[...new Set(secIssues.blankNoRel.map((x) => x.split(' → ')[1]))].slice(0, 10).forEach((x) => console.log('   ·', x));
console.log('Forms con action:', secIssues.externalForms.length ? secIssues.externalForms.join(', ') : 'ninguno (demo) ✓');
const iframes = htmlFiles.flatMap((f) => { const $ = cheerio.load(readFileSync(f, 'utf8')); return $('iframe').map((_, el) => $(el).attr('src')).get(); });
console.log('Iframes:', [...new Set(iframes)].join(', ') || 'ninguno');
const inlineScripts = htmlFiles.reduce((a, f) => a + cheerio.load(readFileSync(f, 'utf8'))('script:not([src])').length, 0);
console.log('Scripts inline totales (CSP):', inlineScripts);

console.log('\n==================== RENDIMIENTO (pesos) ====================');
const assets = [];
(function walkA(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walkA(p);
    else assets.push({ p: relative(DIST, p).replace(/\\/g, '/'), size: statSync(p).size });
  }
})(DIST);
const byExt = {};
for (const a of assets) {
  const ext = a.p.split('.').pop().toLowerCase();
  byExt[ext] = (byExt[ext] || 0) + a.size;
}
console.log('Total dist:', mb(assets.reduce((x, a) => x + a.size, 0)));
for (const [ext, size] of Object.entries(byExt).sort((a, b) => b[1] - a[1]).slice(0, 10)) console.log(`  .${ext}: ${mb(size)}`);
console.log('\nTop 12 archivos más pesados:');
for (const a of assets.sort((x, y) => y.size - x.size).slice(0, 12)) console.log(`  ${kb(a.size).padStart(10)}  ${a.p}`);

// peso de la home: html + css/js referenciados
const home = readFileSync(join(DIST, 'index.html'), 'utf8');
const $h = cheerio.load(home);
let cssTotal = 0, jsTotal = 0, cssCount = 0, jsCount = 0;
$h('link[rel="stylesheet"]').each((_, el) => { const href = $h(el).attr('href'); const p = join(DIST, href.replace(/^\//, '')); if (existsSync(p)) { cssTotal += statSync(p).size; cssCount++; } });
$h('script[src]').each((_, el) => { const src = $h(el).attr('src'); const p = join(DIST, src.replace(/^\//, '')); if (existsSync(p)) { jsTotal += statSync(p).size; jsCount++; } });
console.log(`\nHome: HTML ${kb(Buffer.byteLength(home))} + CSS ${kb(cssTotal)} (${cssCount} hojas, render-blocking) + JS ${kb(jsTotal)} (${jsCount})`);
const homeImgs = $h('img').length;
const homeEager = $h('img:not([loading="lazy"])').length;
console.log(`Imágenes en home: ${homeImgs} (${homeEager} sin lazy)`);
