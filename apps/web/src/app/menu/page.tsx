import { MenuGrid } from "@/components/menu-grid";
import { MenuTabs } from "@/components/menu-tabs";
import { getMenu, type MenuCategory, type MenuItem } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  let categories: MenuCategory[] = [];
  let items: MenuItem[] = [];
  let unavailable = false;

  try {
    const menu = await getMenu();
    categories = menu.categories;
    items = menu.items;
  } catch {
    // Clover not connected, rate limited, or API unreachable — show an empty
    // menu instead of failing the whole page.
    unavailable = true;
  }

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
      {unavailable ? (
        <div className="py-20 text-center">
          <p className="font-display text-2xl text-ink">
            Our menu is being updated
          </p>
          <p className="mt-3 text-sm text-ink-muted">
            Online ordering is temporarily unavailable. Please try again shortly
            or visit us in store.
          </p>
        </div>
      ) : (
        <MenuGrid categories={categories} items={items} />
      )}
    </div>
  );
}
