type MenuPayload = {
  categories: unknown[];
  items: unknown[];
};

let cache: { key: string; at: number; data: MenuPayload } | null = null;

const TTL_MS = Number(process.env.MENU_CACHE_TTL_MS ?? 60_000);

export function getCachedMenu(merchantId: string): MenuPayload | null {
  if (!cache || cache.key !== merchantId) return null;
  if (Date.now() - cache.at > TTL_MS) return null;
  return cache.data;
}

export function setCachedMenu(merchantId: string, data: MenuPayload): void {
  cache = { key: merchantId, at: Date.now(), data };
}

export function clearMenuCache(): void {
  cache = null;
}
