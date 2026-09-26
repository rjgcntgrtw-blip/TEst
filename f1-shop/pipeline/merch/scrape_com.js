const { chromium } = require('playwright');
const fs = require('fs');
const queries = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const out = process.argv[3];
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  
  const results = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, 'utf8')) : {};
  for (const q of queries) {
    if (results[q] && results[q].length) continue;
    const ctx = await browser.newContext({ locale: 'en-US', viewport: { width: 1440, height: 1000 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36' });
    const page = await ctx.newPage();
    try {
      await page.goto(`https://www.aliexpress.com/w/wholesale-${encodeURIComponent(q.replace(/ /g, '-'))}.html`, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await sleep(10000);
      for (let i = 0; i < 12; i++) { await page.mouse.wheel(0, 1200); await sleep(800); }
      const items = await page.evaluate(() => {
        const seen = new Set(); const list = [];
        for (const a of document.querySelectorAll('a[href*="/item/"]')) {
          const m = a.href.match(/\/item\/(\d+)\.html/);
          if (!m || seen.has(m[1])) continue;
          const text = a.innerText.replace(/\s+/g, ' ').trim();
          if (text.length < 20) continue;
          seen.add(m[1]);
          const img = a.querySelector('img');
          list.push({ id: m[1], href: a.href.split('?')[0], text, img: img ? (img.currentSrc || img.src) : null });
        }
        return list;
      });
      if (!items.length) {
        const title = await page.title();
        await page.screenshot({ path: `blocked-${Date.now()}.png` });
        console.log(q, `0 items, page title: ${title} — stop`);
        break;
      }
      results[q] = items;
      console.log(q, items.length);
    } catch (e) {
      console.log(q, 'ERR', e.message.split('\n')[0]);
    }
    fs.writeFileSync(out, JSON.stringify(results, null, 1));
    await ctx.close();
    await sleep(parseInt(process.env.GAP || '60000'));
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
