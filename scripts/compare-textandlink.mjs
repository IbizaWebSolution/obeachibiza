// Compara los estilos computados de la sección TextAndLink (home) entre la
// web original en vivo y la demo local, para detectar diferencias visuales.
import puppeteer from 'puppeteer-core';

const LOCAL = process.env.BASE || 'http://localhost:4322';
const PROPS = [
  'font-family', 'font-size', 'font-weight', 'font-style', 'line-height',
  'letter-spacing', 'text-transform', 'text-align', 'color', 'margin-top',
  'margin-bottom', 'padding-top', 'padding-bottom', 'max-width', 'width',
  'display', 'grid-column-start', 'grid-column-end', 'justify-content',
  'align-items', 'text-decoration-line', 'border-bottom-width', 'opacity',
];

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  defaultViewport: { width: 1440, height: 1000 },
});

async function grab(url) {
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36');
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise((r) => setTimeout(r, 3000));
  const data = await page.evaluate((props) => {
    const sels = {
      section: '.TextAndLink',
      text: '.TextAndLink__text',
      h2: '.TextAndLink__text h2',
      link: '.TextAndLink__link',
    };
    const out = {};
    for (const [name, sel] of Object.entries(sels)) {
      const el = document.querySelector(sel);
      if (!el) { out[name] = null; continue; }
      const cs = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      out[name] = Object.fromEntries(props.map((p) => [p, cs.getPropertyValue(p)]));
      out[name].rect = { w: Math.round(rect.width), left: Math.round(rect.left) };
      out[name].classes = el.className;
    }
    return out;
  }, PROPS);
  await page.close();
  return data;
}

const [live, local] = [await grab('https://obeachibiza.com/'), await grab(`${LOCAL}/`)];

for (const part of ['section', 'text', 'h2', 'link']) {
  console.log(`\n=== ${part} ===`);
  if (!live[part]) { console.log('LIVE: no encontrado'); continue; }
  if (!local[part]) { console.log('LOCAL: no encontrado'); continue; }
  for (const k of Object.keys(live[part])) {
    const a = JSON.stringify(live[part][k]);
    const b = JSON.stringify(local[part][k]);
    if (a !== b) console.log(`  ${k}: LIVE=${a}  LOCAL=${b}`);
  }
}
console.log('\n(solo se listan diferencias)');
await browser.close();
