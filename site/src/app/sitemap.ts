import type { MetadataRoute } from "next";
import { PRODUCTS } from "@/data/catalog";
import { SITE_URL } from "@/lib/assets";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/info`, changeFrequency: "monthly", priority: 0.3 },
    ...PRODUCTS.filter((p) => p.status === "published").map((p) => ({
      url: `${SITE_URL}/p/${p.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
