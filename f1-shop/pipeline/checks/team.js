const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  for (const [name, vp] of [['d', { width: 1440, height: 900 }], ['m', { width: 390, height: 844 }]]) {
    const p = await b.newPage({ viewport: vp });
    await p.goto('http://localhost:3100/', { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(3500);
    await p.getByRole('button', { name: 'Смотреть витрину' }).click();
    await p.waitForTimeout(1500);
    await p.getByRole('button', { name: 'Команда' }).click();
    await p.waitForTimeout(300);
    await p.getByText('Ferrari', { exact: true }).first().click();
    await p.waitForTimeout(1300);
    await p.screenshot({ path: `${process.argv[2]}/t-${name}-ferrari.png` });
    await p.getByRole('button', { name: 'Ferrari', exact: true }).first().click();
    await p.waitForTimeout(300);
    await p.getByText('Red Bull Racing', { exact: true }).first().click();
    await p.waitForTimeout(1300);
    await p.screenshot({ path: `${process.argv[2]}/t-${name}-redbull.png` });
    await p.getByRole('button', { name: 'Поиск' }).click();
    await p.waitForTimeout(400);
    await p.screenshot({ path: `${process.argv[2]}/t-${name}-searchfocus.png` });
    await p.close();
  }
  await b.close();
})().catch((e) => { console.error('FAIL', e.message.split('\n')[0]); process.exit(1); });
