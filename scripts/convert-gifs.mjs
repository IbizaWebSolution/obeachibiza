// Convierte los GIF animados a WebP animado (sharp/libvips) con gran ahorro.
import sharp from 'sharp';
import { statSync } from 'node:fs';

const gifs = [
  'public/media/2025/02/397fgZ7Y.gif',
  'public/media/2025/02/XyWn_JY5-1.gif',
];

for (const gif of gifs) {
  const out = gif.replace(/\.gif$/, '.webp');
  const img = sharp(gif, { animated: true });
  const meta = await img.metadata();
  await img.webp({ quality: 75, effort: 4 }).toFile(out);
  const a = statSync(gif).size, b = statSync(out).size;
  console.log(`${gif} (${meta.width}x${meta.height}, ${meta.pages} frames): ${(a / 1024 / 1024).toFixed(2)} MB -> ${(b / 1024 / 1024).toFixed(2)} MB`);
}
