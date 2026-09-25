#!/usr/bin/env python3
"""Готовит фото товаров для сайта из реальных фотографий.

Удаляет фон, ставит все товары в одинаковый кадр («на один пол»), добавляет мягкую
тень и собирает кадр «модель + коробка, в которой она приедет». Ничего не дорисовывает:
на выходе только то, что было на исходных фото.

Вход:  content/products/<slug>/raw/
    main.jpg         главное фото для витрины: модель 3/4 спереди (лицом к покупателю)
    box.jpg          коробка, в которой модель приедет покупателю
    01.jpg, 02.jpg   остальные ракурсы — в том порядке, в котором их показывать
    03-keep.jpg      суффикс -keep: фон не удалять (крупные планы, вещь на человеке)
    04-center.jpg    суффикс -center: не ставить «на пол», а центрировать (вид сверху, детали)

Выход: public/products/<slug>/
    main.webp, thumb.webp, 01.webp …, box.webp, with-box.webp, manifest.json

Запуск (из папки site/):
    python3 tools/images/process.py                  # все товары
    python3 tools/images/process.py <slug> [<slug>]  # выбранные
    python3 tools/images/process.py <slug> --align center   # одежда: по центру, а не «на полу»
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageOps

SITE = Path(__file__).resolve().parents[2]
CONTENT = SITE / "content" / "products"
PUBLIC = SITE / "public" / "products"

CANVAS = (1600, 1200)  # 4:3, как карточки на сайте
FLOOR = 0.86  # «пол» — на этой доле высоты стоят все модели
FIT = (0.84, 0.72)  # максимальная ширина и высота товара в кадре
EXTS = {".jpg", ".jpeg", ".png", ".webp"}

_session = None


def cutout(img: Image.Image, model: str, matting: bool) -> Image.Image:
    """Удаляет фон. Модель скачивается при первом запуске."""
    global _session
    from rembg import new_session, remove

    if _session is None:
        _session = new_session(model)
    return remove(img, session=_session, alpha_matting=matting, post_process_mask=True)


def trim(img: Image.Image) -> Image.Image:
    alpha = img.getchannel("A").point(lambda a: 255 if a > 10 else 0)
    box = alpha.getbbox()
    return img.crop(box) if box else img


def shadow(size: tuple[int, int], width: int, center_x: int, floor_y: int) -> Image.Image:
    """Мягкая контактная тень под предметом."""
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    h = max(8, int(width * 0.07))
    ImageDraw.Draw(layer).ellipse(
        (center_x - width // 2, floor_y - h // 2, center_x + width // 2, floor_y + h // 2),
        fill=(0, 0, 0, 80),
    )
    return layer.filter(ImageFilter.GaussianBlur(max(6, h // 2)))


def place(obj: Image.Image, align: str, fit=FIT, canvas=CANVAS) -> Image.Image:
    """Вписывает вырезанный товар в кадр: одинаковый масштаб, одинаковый «пол»."""
    obj = trim(obj)
    scale = min(canvas[0] * fit[0] / obj.width, canvas[1] * fit[1] / obj.height)
    obj = obj.resize((max(1, round(obj.width * scale)), max(1, round(obj.height * scale))), Image.LANCZOS)
    out = Image.new("RGBA", canvas, (0, 0, 0, 0))
    x = (canvas[0] - obj.width) // 2
    if align == "floor":
        y = int(canvas[1] * FLOOR) - obj.height
        out.alpha_composite(shadow(canvas, int(obj.width * 0.86), canvas[0] // 2, int(canvas[1] * FLOOR)))
    else:
        y = (canvas[1] - obj.height) // 2
    out.alpha_composite(obj, (x, y))
    return out


def with_box(model: Image.Image, box: Image.Image) -> Image.Image:
    """Кадр «модель + коробка»: коробка сзади слева, модель спереди справа."""
    out = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    floor = int(CANVAS[1] * FLOOR)
    box, model = trim(box), trim(model)

    bs = min(CANVAS[0] * 0.55 / box.width, CANVAS[1] * 0.66 / box.height)
    box = box.resize((round(box.width * bs), round(box.height * bs)), Image.LANCZOS)
    bx, by = int(CANVAS[0] * 0.08), floor - box.height - int(CANVAS[1] * 0.04)
    out.alpha_composite(shadow(CANVAS, int(box.width * 0.9), bx + box.width // 2, by + box.height))
    out.alpha_composite(box, (bx, by))

    ms = min(CANVAS[0] * 0.6 / model.width, CANVAS[1] * 0.45 / model.height)
    model = model.resize((round(model.width * ms), round(model.height * ms)), Image.LANCZOS)
    mx, my = CANVAS[0] - model.width - int(CANVAS[0] * 0.06), floor - model.height
    out.alpha_composite(shadow(CANVAS, int(model.width * 0.86), mx + model.width // 2, floor))
    out.alpha_composite(model, (mx, my))
    return out


def keep(img: Image.Image) -> Image.Image:
    """Фото без удаления фона: кадрируем в 4:3 с белыми полями."""
    img = img.convert("RGB")
    img.thumbnail(CANVAS, Image.LANCZOS)
    out = Image.new("RGB", CANVAS, (255, 255, 255))
    out.paste(img, ((CANVAS[0] - img.width) // 2, (CANVAS[1] - img.height) // 2))
    return out


def save(img: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, "WEBP", quality=86, method=6)


def process(slug: str, align: str, model: str, matting: bool) -> dict:
    raw = CONTENT / slug / "raw"
    files = sorted(p for p in raw.iterdir() if p.suffix.lower() in EXTS) if raw.exists() else []
    if not files:
        raise SystemExit(f"{slug}: нет фото в {raw.relative_to(SITE)}")

    out_dir = PUBLIC / slug
    manifest: dict = {"main": None, "gallery": [], "box": None, "withBox": None}
    cut: dict[str, Image.Image] = {}

    for f in files:
        name = f.stem.lower()
        img = ImageOps.exif_transpose(Image.open(f)).convert("RGBA")
        if name.endswith("-keep"):
            target = re.sub(r"-keep$", "", name)
            save(keep(img), out_dir / f"{target}.webp")
            manifest["gallery"].append(f"{target}.webp")
            print(f"  {f.name} → {target}.webp (фон оставлен)")
            continue
        centered = name.endswith("-center")
        name = re.sub(r"-center$", "", name)
        cut[name] = cutout(img, model, matting)
        placed = place(cut[name], "center" if centered else "floor" if name == "box" else align)
        save(placed, out_dir / f"{name}.webp")
        print(f"  {f.name} → {name}.webp")
        if name == "main":
            manifest["main"] = "main.webp"
            thumb = placed.copy()
            thumb.thumbnail((400, 300), Image.LANCZOS)
            save(thumb, out_dir / "thumb.webp")
        elif name == "box":
            manifest["box"] = "box.webp"
        else:
            manifest["gallery"].append(f"{name}.webp")

    if "main" in cut and "box" in cut:
        save(with_box(cut["main"], cut["box"]), out_dir / "with-box.webp")
        manifest["withBox"] = "with-box.webp"
        print("  main + box → with-box.webp")

    if not manifest["main"]:
        print(f"  ⚠ {slug}: нет main.* — витрина покажет заглушку", file=sys.stderr)
    (out_dir / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    return manifest


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("slugs", nargs="*", help="товары; по умолчанию все из content/products")
    parser.add_argument("--align", choices=["floor", "center"], default="floor")
    parser.add_argument("--model", default="isnet-general-use", help="модель rembg, напр. birefnet-general")
    parser.add_argument("--matting", action="store_true", help="аккуратнее края (медленнее)")
    args = parser.parse_args()

    slugs = args.slugs or sorted(p.name for p in CONTENT.iterdir() if (p / "raw").is_dir())
    for slug in slugs:
        print(slug)
        process(slug, args.align, args.model, args.matting)


if __name__ == "__main__":
    main()
