import { MenuGrid } from "@/components/menu-grid";
import { getMenuCatalog } from "@forestea/menu";

export const dynamic = "force-dynamic";

export default function MenuPage() {
  const { categories, items } = getMenuCatalog();

  return (
    <div className="mx-auto w-full max-w-[1440px] px-5 pb-20 pt-10 sm:px-8 sm:pt-14 md:pb-28 md:pt-16">
      <header className="mb-10 max-w-2xl md:mb-14">
        <h1 className="font-display text-[clamp(2.75rem,6vw,4.25rem)] leading-[0.95] tracking-[-0.035em] text-ink">
          Menu
        </h1>
      </header>
      <MenuGrid categories={categories} items={items} />
    </div>
  );
}
