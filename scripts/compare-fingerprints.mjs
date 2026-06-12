// Compara las huellas de estilos baseline vs purged y lista los elementos cambiados.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIR = join(process.env.TEMP || '/tmp', 'obeach-fp');
const A = join(DIR, process.argv[2] || 'baseline');
const B = join(DIR, process.argv[3] || 'purged');

let totalChanged = 0;
for (const f of readdirSync(A)) {
  const a = new Map(JSON.parse(readFileSync(join(A, f), 'utf8')));
  let b;
  try { b = new Map(JSON.parse(readFileSync(join(B, f), 'utf8'))); } catch { console.log(`${f}: FALTA en B`); continue; }
  const changed = [];
  for (const [k, v] of a) {
    if (!b.has(k)) changed.push(`AUSENTE: ${k}`);
    else if (b.get(k) !== v) changed.push(`CAMBIADO: ${k}`);
  }
  for (const k of b.keys()) if (!a.has(k)) changed.push(`NUEVO: ${k}`);
  totalChanged += changed.length;
  console.log(`${f}: ${changed.length} diferencias de ${a.size}`);
  changed.slice(0, 8).forEach((c) => console.log('   ', c.slice(0, 150)));
}
console.log(`\nTOTAL: ${totalChanged} diferencias`);
process.exitCode = totalChanged > 0 ? 1 : 0;
