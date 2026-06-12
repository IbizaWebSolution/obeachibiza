// Verifica que todas las referencias locales del HTML generado existen en dist/
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';

const DIST = 'C:/Users/Sergio/Documents/MEGA/DESARROLLO WEB/DESARROLLO/oceanBeach/obeachibiza/dist';

function* walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

const missing = new Map();
const external = new Set();
let pages = 0;

for (const file of walk(DIST)) {
  if (!file.endsWith('.html')) continue;
  pages++;
  const html = readFileSync(file, 'utf8');
  const refs = [...html.matchAll(/(?:src|href|poster)="([^"]+)"/g)].map((m) => m[1]);
  const styleRefs = [...html.matchAll(/url\((['"]?)(\/[^)'"]+)\1\)/g)].map((m) => m[2]);
  for (const ref of [...refs, ...styleRefs]) {
    if (/^(https?:|mailto:|tel:|#|data:|javascript:)/.test(ref)) {
      if (/^https?:\/\/(?!obeachibiza\.com)/.test(ref)) external.add(ref.split('/')[2]);
      continue;
    }
    if (!ref.startsWith('/')) continue;
    const clean = ref.split('?')[0].split('#')[0];
    if (clean === '/') continue;
    let target = path.join(DIST, clean);
    const ok =
      (existsSync(target) && statSync(target).isFile()) ||
      existsSync(path.join(target, 'index.html'));
    if (!ok) {
      if (!missing.has(clean)) missing.set(clean, []);
      missing.get(clean).push(path.relative(DIST, file));
    }
  }
}

console.log(`Páginas analizadas: ${pages}`);
console.log(`Dominios externos referenciados: ${[...external].sort().join(', ')}`);
if (missing.size === 0) {
  console.log('✔ Todas las referencias locales existen.');
} else {
  console.log(`✘ Referencias rotas: ${missing.size}`);
  for (const [ref, files] of [...missing].slice(0, 40)) {
    console.log(`  ${ref}  ← ${files.slice(0, 3).join(', ')}${files.length > 3 ? ` (+${files.length - 3})` : ''}`);
  }
}
