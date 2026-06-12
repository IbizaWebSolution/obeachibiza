// Verifica los 4 cambios: navbar sin enlaces, vídeos en pausa + cursor,
// placeholders "Próximamente" en lugar de iframes/APIs.
import puppeteer from 'puppeteer-core';

const SHOTS = 'C:/Users/Sergio/AppData/Local/Temp/obeach-shots';
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  defaultViewport: { width: 1440, height: 1000 },
});
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));

// ---- HOME: navbar + vídeo ----
await page.goto('http://localhost:4321/', { waitUntil: 'domcontentloaded', timeout: 30000 });
await new Promise((r) => setTimeout(r, 2500));

const navbar = await page.evaluate(() => ({
  navLinks: document.querySelectorAll('.Header__nav').length,
  bookBtn: !!document.querySelector('.Header__btns__btn'),
  menuBtn: !!document.querySelector('.Burger'),
}));
console.log('Navbar:', JSON.stringify(navbar), '(navLinks debe ser 0)');

const video = await page.evaluate(() => {
  const v = document.querySelector('.HeroCTA video');
  return v ? { paused: v.paused, hasAutoplay: v.hasAttribute('autoplay'), playBtn: !!document.querySelector('.VideoPlayBtn') } : { none: true };
});
console.log('Vídeo home:', JSON.stringify(video), '(paused=true, hasAutoplay=false)');

// hover sobre el vídeo → cursor con texto PLAY
await page.mouse.move(700, 350);
await new Promise((r) => setTimeout(r, 400));
const cursorText = await page.evaluate(() => document.querySelector('.Cursor [g-ref="text"]')?.textContent);
console.log('Cursor sobre vídeo:', JSON.stringify(cursorText));

// clic para reproducir
await page.click('.HeroCTA video');
await new Promise((r) => setTimeout(r, 800));
const afterClick = await page.evaluate(() => {
  const v = document.querySelector('.HeroCTA video');
  return { paused: v.paused, cursor: document.querySelector('.Cursor [g-ref="text"]')?.textContent };
});
console.log('Tras clic en vídeo:', JSON.stringify(afterClick), '(paused=false)');
await page.screenshot({ path: `${SHOTS}/chg-home.png` });

// ---- Placeholders "Próximamente" ----
const pages = [
  ['/events-calendar/', 'Eventos'],
  ['/restaurant-calendar/', 'Restaurante'],
  ['/celebration-packages/', 'Celebración'],
  ['/contact-us/', 'Contacto'],
];
for (const [url, name] of pages) {
  await page.goto(`http://localhost:4321${url}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 800));
  const info = await page.evaluate(() => ({
    coming: document.querySelectorAll('.ComingSoon').length,
    iframes: document.querySelectorAll('iframe').length,
    title: document.querySelector('.ComingSoon__title')?.textContent || '',
  }));
  console.log(`${name} (${url}):`, JSON.stringify(info));
}
await page.goto('http://localhost:4321/events-calendar/', { waitUntil: 'domcontentloaded' });
await new Promise((r) => setTimeout(r, 600));
await page.evaluate(() => document.querySelector('.ComingSoon')?.scrollIntoView({ block: 'center' }));
await new Promise((r) => setTimeout(r, 400));
await page.screenshot({ path: `${SHOTS}/chg-events.png` });

// Instagram (en el pie de cualquier página)
const insta = await page.evaluate(() => document.querySelectorAll('.InstagramFeed .ComingSoon').length);
console.log('Instagram placeholder en pie:', insta);

console.log(errors.length ? `\nERRORES JS: ${errors.join(' | ')}` : '\nSin errores JS.');
await browser.close();
