import { readFile, writeFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const SCRAPE = String.raw`C:\Users\Sergio\Documents\MEGA\DESARROLLO WEB\DESARROLLO\oceanBeach\_scrape`;
const MEDIA = String.raw`C:\Users\Sergio\Documents\MEGA\DESARROLLO WEB\DESARROLLO\oceanBeach\obeachibiza\public\media`;

// inventario real de public/media
const existing = new Set();
async function walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) await walk(p);
    else existing.add(path.relative(MEDIA, p).replaceAll('\\', '/'));
  }
}
await walk(MEDIA);

const list = (await readFile(path.join(SCRAPE, 'assets-list.txt'), 'utf8'))
  .split(/\r?\n/).filter(Boolean)
  .filter((u) => u.includes('/wp-content/uploads/') && /\.(jpg|jpeg|png|gif|webp|svg|mp4)$/i.test(u));

const map = {};
const missing = [];
for (const url of list) {
  let rel = url.replace(/^https?:\/\/obeachibiza\.com\/wp-content\/uploads\//, '');
  rel = rel.replace(/-\d+x\d+(?=\.\w+$)/, ''); // quitar variante de tamaño
  const ext = path.extname(rel).toLowerCase();
  let candidate;
  if (['.jpg', '.jpeg', '.png'].includes(ext)) {
    candidate = rel.slice(0, -ext.length) + '.webp';
  } else {
    candidate = rel;
  }
  if (url.includes('/2026/02/Thanks-for-voting')) {
    map[url] = '/media/2026/02/thanks-for-voting-djmag-aspect-ratio-3-2.webp';
    continue;
  }
  if (existing.has(candidate)) { map[url] = '/media/' + candidate; continue; }
  if (existing.has(rel)) { map[url] = '/media/' + rel; continue; }
  // única copia local conservada con sufijo -WxH (la variante más grande)
  const dir = path.posix.dirname(candidate);
  const stem = path.posix.basename(candidate, path.extname(candidate));
  const alt = [...existing].find((p) => path.posix.dirname(p) === dir && path.posix.basename(p).startsWith(stem + '-'));
  if (alt) { map[url] = '/media/' + alt; continue; }
  missing.push(url);
}

// vídeos vimeo
const vids = {
  '1058235240': '540p', '792638068': '360p', '792638835': '540p',
  '850210954': '540p', '853934160': '360p',
};
for (const [id, r] of Object.entries(vids)) map[`vimeo:${id}`] = `/media/videos/vimeo-${id}-${r}.mp4`;
for (const p of existing) if (p.startsWith('videos/posters/')) {
  const id = p.match(/poster-(\d+)/)?.[1];
  if (id) map[`poster:${id}`] = '/media/' + p;
}

await writeFile(path.join(SCRAPE, 'media-map.json'), JSON.stringify(map, null, 2));
console.log(`Mapeadas: ${Object.keys(map).length}, sin local: ${missing.length}`);
if (missing.length) console.log(missing.slice(0, 20).join('\n'));
