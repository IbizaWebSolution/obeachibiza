// Purga ronda 2: CSS del design system "six" (main, six-blocks, owl y
// componentes) contra el HTML real. Mismo safelist que la ronda 1.
// Se verifica después con style-fingerprint (exigencia: 0 diferencias).
import { PurgeCSS } from 'purgecss';
import { writeFileSync, copyFileSync, statSync, readdirSync } from 'node:fs';

const FILES = [
  'src/styles/components/main.css',
  'src/styles/components/six-blocks.css',
  'src/styles/owl.carousel.css',
  ...readdirSync('src/styles/components')
    .filter((f) => f.endsWith('.css') && !['main.css', 'six-blocks.css', 'legacy.css'].includes(f))
    .map((f) => `src/styles/components/${f}`),
];

const result = await new PurgeCSS().purge({
  content: ['dist/**/*.html', 'src/scripts/main.js'],
  css: FILES,
  safelist: {
    standard: [
      'burger-menu-open', 'scroll-lock', 'slideout-open', 'hero-in-view', 'footer-in-view',
      'no-custom-cursor', 'cursor-text', 'demo-collapsed', 'opens-up',
      'gasp-loading', 'demo-embed-fallback', 'demo-embed-note',
    ],
    deep: [/^is-/, /^has-/, /^flickity/, /^choices/, /^headroom/, /^owl-/, /^hamburger/, /^LanguageSwitcher/, /^demo-/],
    greedy: [/flickity/, /choices/, /headroom/, /hamburger/, /owl-/],
  },
  // variables:false — el análisis de variables de PurgeCSS eliminó
  // --six-panel-width (ancho de los SlideOut); conservar todas las custom props
  variables: false,
  fontFace: false,
  keyframes: false,
});

let totalBefore = 0, totalAfter = 0;
for (const r of result) {
  const before = statSync(r.file).size;
  const after = Buffer.byteLength(r.css);
  totalBefore += before;
  totalAfter += after;
  if (after < before * 0.99) {
    copyFileSync(r.file, r.file + '.orig');
    writeFileSync(r.file, r.css);
    console.log(`${r.file}: ${(before / 1024).toFixed(1)} -> ${(after / 1024).toFixed(1)} KB`);
  }
}
console.log(`\nTOTAL: ${(totalBefore / 1024).toFixed(0)} KB -> ${(totalAfter / 1024).toFixed(0)} KB`);
