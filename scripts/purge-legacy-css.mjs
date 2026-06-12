// Purga los CSS heredados del WordPress original contra el HTML real (dist)
// y el JS de la demo. Solo toca los 4 archivos legacy; el design system
// "six" (main.css, six-blocks.css, componentes) queda intacto.
import { PurgeCSS } from 'purgecss';
import { readFileSync, writeFileSync, copyFileSync, statSync } from 'node:fs';

const FILES = [
  'src/styles/legacy-theme.css',
  'src/styles/components/legacy.css',
  'src/styles/custom-style.css',
  'src/styles/wp-inline.css',
];

const result = await new PurgeCSS().purge({
  content: ['dist/**/*.html', 'src/scripts/main.js'],
  css: FILES,
  // clases que añade JS en runtime (flickity, choices, estados del tema y de la demo)
  safelist: {
    standard: [
      'burger-menu-open', 'scroll-lock', 'slideout-open', 'hero-in-view', 'footer-in-view',
      'no-custom-cursor', 'cursor-text', 'demo-collapsed', 'opens-up',
      'gasp-loading', 'demo-embed-fallback', 'demo-embed-note',
    ],
    deep: [/^is-/, /^has-/, /^flickity/, /^choices/, /^headroom/, /^owl-/, /^hamburger/, /^LanguageSwitcher/, /^VideoPlayBtn/, /^demo-/],
    greedy: [/flickity/, /choices/, /headroom/, /hamburger/, /owl-/],
  },
  // conservar variables CSS y @font-face/keyframes usados
  variables: true,
  fontFace: false,
  keyframes: false,
});

for (const r of result) {
  const before = statSync(r.file).size;
  copyFileSync(r.file, r.file + '.orig');
  writeFileSync(r.file, r.css);
  const after = Buffer.byteLength(r.css);
  console.log(`${r.file}: ${(before / 1024).toFixed(1)} KB -> ${(after / 1024).toFixed(1)} KB (${(100 - (after / before) * 100).toFixed(0)}% menos)`);
}
