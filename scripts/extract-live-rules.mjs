// Extrae de la web original en vivo las reglas CSS que aplican al h2 de
// TextAndLink y al contenedor article.post (para portarlas a la demo).
import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  defaultViewport: { width: 1440, height: 1000 },
});
const page = await browser.newPage();
await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36');
await page.goto('https://obeachibiza.com/', { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise((r) => setTimeout(r, 3000));

const rules = await page.evaluate(() => {
  const targets = {
    h2: document.querySelector('.TextAndLink__text h2'),
    post: document.querySelector('article.post'),
    text: document.querySelector('.TextAndLink__text'),
  };
  const out = {};
  for (const [name, el] of Object.entries(targets)) {
    if (!el) { out[name] = ['NO ENCONTRADO']; continue; }
    const matched = [];
    for (const sheet of document.styleSheets) {
      let cssRules;
      try { cssRules = sheet.cssRules; } catch { continue; }
      const walk = (list, media) => {
        for (const rule of list) {
          if (rule.type === 4) { walk(rule.cssRules, rule.conditionText); continue; }
          if (rule.type !== 1) continue;
          try {
            if (el.matches(rule.selectorText)) {
              matched.push((media ? `@media(${media}) ` : '') + rule.cssText);
            }
          } catch {}
        }
      };
      walk(cssRules, null);
    }
    out[name] = matched;
  }
  return out;
});

for (const [name, list] of Object.entries(rules)) {
  console.log(`\n===== ${name} (${list.length} reglas) =====`);
  list.forEach((r) => console.log(r));
}
await browser.close();
