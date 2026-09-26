const { chromium } = require('playwright');
const out = process.argv[2];
const log = (...a) => console.log(...a);
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  for (const [name, vp] of [['d', { width: 1440, height: 900 }], ['m', { width: 390, height: 844 }]]) {
    const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 1 });
    const p = await ctx.newPage();
    const errors = [];
    p.on('pageerror', (e) => errors.push(e.message));
    p.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

    // 1. Интро: середина и финал
    await p.goto('http://localhost:3100/', { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(1000);
    await p.screenshot({ path: `${out}/f-${name}-01-intro.png` });
    await p.waitForTimeout(2600);
    await p.screenshot({ path: `${out}/f-${name}-02-hero.png` });
    // 2. Повторный заход — интро пропускается
    await p.reload({ waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(500);
    await p.screenshot({ path: `${out}/f-${name}-03-reload.png` });
    // 3. Поиск
    await p.getByRole('button', { name: 'Поиск' }).click();
    await p.waitForTimeout(300);
    await p.keyboard.type('ферстаппен');
    await p.waitForTimeout(500);
    await p.screenshot({ path: `${out}/f-${name}-04-search.png` });
    await p.keyboard.press('Enter');
    await p.waitForTimeout(1800);
    log(name, 'after search URL:', p.url());
    await p.screenshot({ path: `${out}/f-${name}-05-opened.png` });
    // 4. В корзину
    const addBtn = p.getByRole('button', { name: /В корзину/ }).first();
    await addBtn.click();
    await p.waitForTimeout(600);
    await p.screenshot({ path: `${out}/f-${name}-06-toast.png` });
    // 5. Корзина → оформление → пустая отправка → заполнение → готово
    await p.getByRole('button', { name: /Корзина, товаров/ }).click();
    await p.waitForTimeout(700);
    await p.screenshot({ path: `${out}/f-${name}-07-cart.png` });
    await p.getByRole('button', { name: 'Оформить заказ' }).click();
    await p.waitForTimeout(500);
    await p.getByRole('button', { name: 'Перейти к оплате' }).click();
    await p.waitForTimeout(300);
    await p.screenshot({ path: `${out}/f-${name}-08-checkout-invalid.png` });
    const fill = { name: 'Иван Иванов', phone: '+7 900 000-00-00', email: 'test@example.com', city: 'Москва', address: 'ПВЗ, ул. Ленина 1' };
    for (const [k, v] of Object.entries(fill)) await p.fill(`input[name=${k}]`, v);
    await p.check('input[type=checkbox]');
    await p.getByRole('button', { name: 'Перейти к оплате' }).click();
    await p.waitForTimeout(600);
    await p.screenshot({ path: `${out}/f-${name}-09-done.png` });
    await p.keyboard.press('Escape');
    await p.waitForTimeout(500);
    // 6. Корзина сохраняется после перезагрузки
    await p.goto('http://localhost:3100/', { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(800);
    const cartLabel = await p.getByRole('button', { name: /Корзина, товаров/ }).getAttribute('aria-label');
    log(name, 'cart after reload:', cartLabel);
    // 7. Прямая ссылка на товар
    await p.goto('http://localhost:3100/p/replica-redbull-rb21-1-8', { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(1500);
    await p.screenshot({ path: `${out}/f-${name}-10-direct.png` });
    // 8. Витрина с фильтром команды
    await p.goto('http://localhost:3100/', { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(600);
    await p.getByRole('button', { name: 'Смотреть витрину' }).click();
    await p.waitForTimeout(1500);
    await p.getByRole('button', { name: 'Команда' }).click();
    await p.waitForTimeout(300);
    await p.getByRole('button', { name: /^Ferrari/ }).first().click();
    await p.waitForTimeout(1200);
    await p.screenshot({ path: `${out}/f-${name}-11-team.png` });
    // 9. Подвал и /info
    await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await p.waitForTimeout(800);
    await p.screenshot({ path: `${out}/f-${name}-12-footer.png` });
    await p.goto('http://localhost:3100/info', { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(500);
    await p.screenshot({ path: `${out}/f-${name}-13-info.png` });
    log(name, 'errors:', errors.length ? errors.slice(0, 5) : 'none');
    await ctx.close();
  }
  await b.close();
})().catch((e) => { console.error('FAIL', e.message); process.exit(1); });
