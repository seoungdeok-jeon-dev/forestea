import { ItemConfigurator } from "@/components/item-configurator";
import { getMenuItemDetail } from "@forestea/menu";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ itemId: string }>;
  searchParams: Promise<{ edit?: string; from?: string }>;
}

export default async function MenuItemPage({ params, searchParams }: PageProps) {
  const { itemId } = await params;
  const { edit, from } = await searchParams;

  const item = getMenuItemDetail(itemId);
  if (!item) notFound();

  const returnTo = from === "cart" ? "/checkout" : undefined;

  return (
    <ItemConfigurator
      item={item}
      editLineId={edit}
      returnTo={returnTo}
    />
  );
}
