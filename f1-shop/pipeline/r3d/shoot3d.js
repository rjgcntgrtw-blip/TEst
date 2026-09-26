const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
(async () => {
  const jobs = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1200 } });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto('http://localhost:8765/render.html');
  await page.waitForFunction(() => window.ready === true, null, { timeout: 30000 });
  for (const job of jobs) {
    const url = await page.evaluate((s) => window.renderShot(s), job.spec);
    const b64 = url.split(',')[1];
    fs.mkdirSync(path.dirname(job.out), { recursive: true });
    fs.writeFileSync(job.out, Buffer.from(b64, 'base64'));
    console.log('saved', job.out);
  }
  if (errors.length) console.log('errors', errors);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
