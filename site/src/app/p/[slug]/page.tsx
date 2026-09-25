import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Shop from "@/components/Shop";
import { PRODUCTS } from "@/data/catalog";
import { getAssets } from "@/lib/assets";

// Своя страница у каждого товара: ссылка для Telegram и поисковиков. Открывает витрину сразу на карточке.
export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/p/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = PRODUCTS.find((p) => p.slug === slug);
  if (!product) return {};
  const image = product.images?.main ?? undefined;
  return {
    title: product.seo.title,
    description: product.seo.description,
    alternates: { canonical: `/p/${slug}` },
    openGraph: {
      title: product.seo.title,
      description: product.seo.description,
      type: "website",
      ...(image ? { images: [{ url: image }] } : {}),
    },
  };
}

export default async function ProductPage({ params }: PageProps<"/p/[slug]">) {
  const { slug } = await params;
  if (!PRODUCTS.some((p) => p.slug === slug)) notFound();
  return <Shop initialSlug={slug} assets={getAssets()} />;
}
