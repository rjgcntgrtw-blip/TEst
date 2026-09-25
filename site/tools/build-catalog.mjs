// Собирает каталог для сайта из content/products/<slug>/product.json
// и public/products/<slug>/manifest.json (фото после tools/images/process.py).
//
// В сайт попадают только данные для покупателя: supplier.json (ссылки на AliExpress,
// закупочные цены) и поле verify (что проверить перед публикацией) сюда не читаются.

import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const site = fileURLToPath(new URL("..", import.meta.url));
const content = join(site, "content", "products");
const out = join(site, "src", "data", "products.json");

const products = [];
for (const slug of readdirSync(content).sort()) {
  const file = join(content, slug, "product.json");
  if (!existsSync(file)) continue;
  const product = JSON.parse(readFileSync(file, "utf8"));
  if (product.status === "hidden") continue;
  if (product.slug !== slug) throw new Error(`${file}: slug "${product.slug}" не совпадает с папкой "${slug}"`);
  delete product.verify;

  const manifestFile = join(site, "public", "products", slug, "manifest.json");
  if (existsSync(manifestFile)) {
    const m = JSON.parse(readFileSync(manifestFile, "utf8"));
    const url = (name) => (name ? `/products/${slug}/${name}` : null);
    product.images = {
      main: url(m.main),
      thumb: m.main ? url("thumb.webp") : null,
      gallery: m.gallery.map(url),
      box: url(m.box),
      withBox: url(m.withBox),
    };
  }
  products.push(product);
}

writeFileSync(out, JSON.stringify(products, null, 2) + "\n");
console.log(`catalog: ${products.length} товаров → src/data/products.json`);
