import Image from "next/image";
import type { Product } from "@/data/catalog";
import ProductArt from "./ProductArt";

/** Главное фото товара (без фона, 3/4 спереди). Пока фото нет — рисованная заглушка. */
export default function ProductVisual({
  product,
  sizes,
  thumb = false,
  priority = false,
  className = "",
}: {
  product: Product;
  sizes: string;
  thumb?: boolean;
  priority?: boolean;
  className?: string;
}) {
  const src = thumb ? (product.images?.thumb ?? product.images?.main) : product.images?.main;
  if (!src) {
    return <ProductArt art={product.art} title={product.title} className={`h-full w-full ${className}`} />;
  }
  return (
    <span className={`relative block h-full w-full ${className}`}>
      <Image
        src={src}
        alt={product.title}
        fill
        sizes={sizes}
        priority={priority}
        draggable={false}
        className="object-contain"
      />
    </span>
  );
}
