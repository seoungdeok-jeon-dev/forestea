import { MenuGrid } from "@/components/menu-grid";
import { MenuTabs } from "@/components/menu-tabs";
import { getMenu } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const { categories, items } = await getMenu();

  return (
    <div className="mx-auto w-full max-w-[1440px] px-6 py-12 md:py-16">
      <header className="mb-10">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-ink-muted">
          Order ahead
        </p>
        <h1 className="font-display mt-3 text-4xl text-ink md:text-5xl">
          Menu
        </h1>
      </header>
      <MenuTabs />
      <MenuGrid categories={categories} items={items} />
    </div>
  );
}
