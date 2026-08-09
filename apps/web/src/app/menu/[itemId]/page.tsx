import { ItemConfigurator } from "@/components/item-configurator";
import { getMenuItem } from "@/lib/api";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ itemId: string }>;
  searchParams: Promise<{ edit?: string; from?: string }>;
}

export default async function MenuItemPage({ params, searchParams }: PageProps) {
  const { itemId } = await params;
  const { edit, from } = await searchParams;

  const item = await getMenuItem(itemId).catch(() => undefined);

  if (!item) notFound();

  const returnTo = from === "cart" ? "/checkout" : undefined;

  return (
    <div className="px-6 py-12 md:py-20">
      <ItemConfigurator
        item={item}
        editLineId={edit}
        returnTo={returnTo}
      />
    </div>
  );
}
