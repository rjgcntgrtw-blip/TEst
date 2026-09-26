// Открывает страницу лота на aliexpress: название, магазин, варианты (в т.ч. «с коробкой»), фото, отзывы.
const { chromium } = require('playwright');
const fs = require('fs');
const urls = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const out = process.argv[3];
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const res = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, 'utf8')) : {};
  for (const [key, url] of urls) {
    if (res[key] && res[key].title) continue;
    const ctx = await browser.newContext({ locale: 'en-US', viewport: { width: 1440, height: 1100 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36' });
    const page = await ctx.newPage();
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await sleep(9000);
      const data = await page.evaluate(() => {
        const txt = (sel) => { const e = document.querySelector(sel); return e ? e.innerText.replace(/\s+/g, ' ').trim() : null; };
        const title = txt('h1') || document.title;
        const body = document.body.innerText.replace(/\s+/g, ' ');
        const store = (body.match(/([A-Za-z0-9 &'._-]{3,60} (?:Store|Official Store|Toy Store|Shop))/) || [])[1] || null;
        const skus = [...document.querySelectorAll('[class*="sku"] img, [class*="sku"] span, [class*="Sku"] img, [class*="Sku"] span')]
          .map(e => (e.getAttribute('alt') || e.getAttribute('title') || e.innerText || '').trim()).filter(Boolean);
        const imgs = [...document.querySelectorAll('img')].map(i => i.currentSrc || i.src)
          .filter(s => /alicdn|aliexpress-media/.test(s) && /\.(jpg|jpeg|png|webp|avif)/i.test(s)).slice(0, 40);
        const price = (body.match(/(?:RUB|₽|\$)\s?[\d.,]+/) || [])[0] || null;
        const reviews = (body.match(/([\d,.]+)\s+reviews?/i) || [])[1] || null;
        const sold = (body.match(/([\d,]+\+?)\s+sold/i) || [])[1] || null;
        const boxWords = (body.match(/[^.]{0,60}\b(?:box|packag)\w*[^.]{0,60}/gi) || []).slice(0, 8);
        return { title, store, skus: [...new Set(skus)].slice(0, 30), imgs, price, reviews, sold, boxWords };
      });
      await page.screenshot({ path: `item-${key}.png` });
      res[key] = { url, ...data };
      console.log(key, '|', (data.title || '').slice(0, 80), '|', data.store, '|', data.price, '|', data.sold);
    } catch (e) {
      console.log(key, 'ERR', e.message.split('\n')[0]);
      res[key] = { url, error: e.message.split('\n')[0] };
    }
    fs.writeFileSync(out, JSON.stringify(res, null, 1));
    await ctx.close();
    await sleep(45000);
  }
  await browser.close();
})();
