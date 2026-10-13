/**
 * Re-exports the shared storefront catalog. Kept as `demo-menu` so existing
 * imports keep working after the Clover → Stripe migration.
 */
export {
  getMenuItemDetail as getDemoMenuItem,
  MENU_CATEGORIES as DEMO_CATEGORIES,
  MENU_ITEMS as DEMO_ITEMS,
  SHOWCASE_ITEM_IDS as DEMO_SHOWCASE_IDS,
} from "@forestea/menu";

export function isDemoItemId(_itemId: string): boolean {
  // Every storefront id is catalog-backed now; legacy `demo-*` urls still resolve.
  return true;
}
