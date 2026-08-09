import { auth } from "@/auth";
import { ItemCardGrid } from "@/components/item-card-grid";
import { MenuTabs } from "@/components/menu-tabs";
import { getFavoriteItemIds } from "@/app/account/favorites-actions";
import { getMenu } from "@/lib/api";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
  const session = await auth();

  return (
    <div className="mx-auto w-full max-w-[1440px] px-6 py-12 md:py-16">
      <header className="mb-10">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-ink-muted">
          Saved for later
        </p>
        <h1 className="font-display mt-3 text-4xl text-ink md:text-5xl">Favorites</h1>
      </header>
      <MenuTabs />

      {!session?.user ? (
        <div className="py-16 text-center">
          <p className="text-ink-soft">Log in to see your saved items.</p>
          <Link
            href="/login?callbackUrl=/account/favorites"
            className="mt-4 inline-block rounded-full bg-accent px-6 py-3 font-medium text-on-accent hover:bg-accent-hover"
          >
            Log in
          </Link>
        </div>
      ) : (
        <FavoritesList />
      )}
    </div>
  );
}

async function FavoritesList() {
  const [favoriteIds, menu] = await Promise.all([
    getFavoriteItemIds(),
    getMenu().catch(() => ({ items: [], categories: [] })),
  ]);

  const favoriteSet = new Set(favoriteIds);
  const items = menu.items.filter((item) => favoriteSet.has(item.id));

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-ink-soft">No favorites yet.</p>
        <p className="mt-2 text-sm text-ink-muted">
          Tap the heart on any menu item to save it here.
        </p>
        <Link
          href="/menu"
          className="mt-4 inline-block rounded-full bg-accent px-6 py-3 font-medium text-on-accent hover:bg-accent-hover"
        >
          Browse menu
        </Link>
      </div>
    );
  }

  return <ItemCardGrid items={items} />;
}
