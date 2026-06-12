import sharp from 'sharp';
import { readdir, mkdir, copyFile, stat } from 'node:fs/promises';
import path from 'node:path';

const SRC = String.raw`C:\Users\Sergio\Documents\MEGA\DESARROLLO WEB\DESARROLLO\oceanBeach\_scrape\assets\wp-content\uploads`;
const OUT = String.raw`C:\Users\Sergio\Documents\MEGA\DESARROLLO WEB\DESARROLLO\oceanBeach\obeachibiza\public\media`;

const MAX_W = 1920;
const QUALITY = 80;

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

let converted = 0, copied = 0, inBytes = 0, outBytes = 0;

for await (const file of walk(SRC)) {
  const rel = path.relative(SRC, file);
  const ext = path.extname(file).toLowerCase();
  const { size } = await stat(file);
  inBytes += size;

  if (['.jpg', '.jpeg', '.png'].includes(ext)) {
    const dest = path.join(OUT, rel.slice(0, -ext.length) + '.webp');
    await mkdir(path.dirname(dest), { recursive: true });
    try {
      const img = sharp(file, { limitInputPixels: 1e9 });
      const meta = await img.metadata();
      const pipeline = meta.width > MAX_W ? img.resize({ width: MAX_W }) : img;
      await pipeline.webp({ quality: QUALITY }).toFile(dest);
      outBytes += (await stat(dest)).size;
      converted++;
    } catch (err) {
      console.error(`FALLO ${rel}: ${err.message} -> copiando original`);
      const copyDest = path.join(OUT, rel);
      await mkdir(path.dirname(copyDest), { recursive: true });
      await copyFile(file, copyDest);
      outBytes += size;
      copied++;
    }
  } else {
    // svg, gif, webp existentes, mp4...
    const dest = path.join(OUT, rel);
    await mkdir(path.dirname(dest), { recursive: true });
    await copyFile(file, dest);
    outBytes += size;
    copied++;
  }
}

console.log(`Convertidas a WebP: ${converted}, copiadas tal cual: ${copied}`);
console.log(`Entrada: ${(inBytes / 1048576).toFixed(1)} MB -> Salida: ${(outBytes / 1048576).toFixed(1)} MB`);
