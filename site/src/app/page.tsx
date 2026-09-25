import Shop from "@/components/Shop";
import { getAssets } from "@/lib/assets";

export default async function Home({ searchParams }: PageProps<"/">) {
  const { p } = await searchParams;
  return <Shop initialSlug={typeof p === "string" ? p : undefined} assets={getAssets()} />;
}
