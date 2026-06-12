// Optimiza las imágenes pesadas detectadas por PageSpeed:
// - tarjetas (aspect-ratio-6-7): se muestran a ~600px CSS -> 1200px reales (retina)
// - resto de webp >1600px y >150KB: recompresión q75 manteniendo dimensiones
// - posters de vídeo jpg: recompresión q70
// Los originales se respaldan en %TEMP%/obeach-img-orig con la misma ruta.
import sharp from 'sharp';
import { readdirSync, statSync, mkdirSync, copyFileSync, rmSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';

// Fase 1: generar las versiones optimizadas en STAGING (sin sobrescribir nada);
// la sustitución la hace después PowerShell con Copy-Item -Force.
const STAGING = join(process.env.TEMP || '/tmp', 'obeach-img-staging');

const ROOT = 'public/media';
const BACKUP = join(process.env.TEMP || '/tmp', 'obeach-img-orig');

const files = [];
(function walk(d) {
  for (const e of readdirSync(d)) {
    const p = join(d, e);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(webp|jpg|jpeg)$/i.test(e)) files.push(p);
  }
})(ROOT);

let saved = 0;
for (const f of files) {
  const before = statSync(f).size;
  if (before < 150 * 1024) continue;
  const meta = await sharp(f).metadata();
  if (!meta.width || meta.width <= 1600) continue;

  const isCard = /aspect-ratio-6-7/.test(f);
  const isPoster = /videos[\\/]posters/.test(f);
  const targetWidth = isCard ? 1200 : meta.width; // tarjetas: 2x su tamaño CSS

  let pipe = sharp(f);
  if (targetWidth < meta.width) pipe = pipe.resize({ width: targetWidth });
  if (/\.webp$/i.test(f)) pipe = pipe.webp({ quality: 75, effort: 5 });
  else pipe = pipe.jpeg({ quality: isPoster ? 70 : 75, mozjpeg: true });

  const staged = join(STAGING, relative(ROOT, f));
  mkdirSync(dirname(staged), { recursive: true });
  await pipe.toFile(staged);
  const after = statSync(staged).size;
  if (after >= before * 0.92) {
    rmSync(staged); // no compensa
    continue;
  }
  const bak = join(BACKUP, relative(ROOT, f));
  mkdirSync(dirname(bak), { recursive: true });
  copyFileSync(f, bak);
  saved += before - after;
  console.log(`${relative(ROOT, f)}: ${(before / 1024).toFixed(0)} -> ${(after / 1024).toFixed(0)} KB${targetWidth < meta.width ? ` (${meta.width}->${targetWidth}px)` : ''}`);
}
console.log(`\nAhorro previsto: ${(saved / 1024 / 1024).toFixed(2)} MB — staging en ${STAGING}, originales en ${BACKUP}`);
