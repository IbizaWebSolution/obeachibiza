// Verifica que todo enlace a otro dominio tiene target=_blank + noopener en runtime.
import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  defaultViewport: { width: 1440, height: 1000 },
});
const page = await browser.newPage();
for (const url of ['/', '/faqs/', '/inner-circle/', '/bed-menus/', '/es/']) {
  await page.goto(`http://localhost:4322${url}`, { waitUntil: 'networkidle2', timeout: 45000 });
  await new Promise((r) => setTimeout(r, 1500));
  const res = await page.evaluate(() => {
    const anchors = [...document.querySelectorAll('a[href^="http"]')];
    const external = anchors.filter((a) => new URL(a.href).host !== window.location.host);
    return {
      externos: external.length,
      sinBlank: external.filter((a) => a.getAttribute('target') !== '_blank').map((a) => a.getAttribute('href')).slice(0, 5),
      sinNoopener: external.filter((a) => !(a.getAttribute('rel') || '').includes('noopener')).length,
    };
  });
  console.log(`${url}: externos=${res.externos} sinBlank=${res.sinBlank.length} sinNoopener=${res.sinNoopener}`, res.sinBlank.join(', '));
}
await browser.close();
