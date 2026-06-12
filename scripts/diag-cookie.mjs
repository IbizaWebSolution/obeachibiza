// Diagnóstico: localizar el widget de cookies de PremiumGuest
import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--disable-blink-features=AutomationControlled'],
  defaultViewport: { width: 1352, height: 1400 },
});
const page = await browser.newPage();
await page.setUserAgent(
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
);
await page.goto('https://sales.premiumguest.com/obeachibiza/en/?mode=list', { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise((r) => setTimeout(r, 9000));

const info = await page.evaluate(() => {
  // elemento más profundo que contiene el texto
  const all = [...document.querySelectorAll('body *')];
  const hits = all.filter(
    (e) => /cookie consent/i.test(e.textContent || '') && ![...e.children].some((c) => /cookie consent/i.test(c.textContent || ''))
  );
  return hits.slice(0, 3).map((e) => {
    const chain = [];
    let n = e;
    while (n && n !== document.body && chain.length < 8) {
      chain.push(`${n.tagName.toLowerCase()}${n.id ? '#' + n.id : ''}${n.className && typeof n.className === 'string' ? '.' + n.className.split(/\s+/).slice(0, 3).join('.') : ''}`);
      n = n.parentElement;
    }
    return chain.join(' < ');
  });
});
console.log(info.join('\n---\n') || 'no encontrado en DOM principal');
await browser.close();
