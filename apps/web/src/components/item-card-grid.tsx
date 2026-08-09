"use client";

import { FavoriteButton } from "@/components/favorite-button";
import { formatPrice, type MenuItem } from "@/lib/api";
import Link from "next/link";

function iconFor(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("coffee")) return "☕";
  if (n.includes("tea")) return "🍵";
  if (n.includes("pastry") || n.includes("bakery")) return "🥐";
  if (n.includes("cake") || n.includes("dessert")) return "🍰";
  if (n.includes("ice")) return "🍦";
  return "🌿";
}

export function ItemCardGrid({ items }: { items: MenuItem[] }) {
  if (items.length === 0) {
    return (
      <p className="py-16 text-center text-ink-muted">Nothing here yet.</p>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-x-8 gap-y-7">
      {items.map((item) => (
        <div key={item.id} className="group relative flex items-center gap-5">
          <Link href={`/menu/${item.id}`} className="flex flex-1 items-center gap-5">
            <span className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-subtle text-3xl ring-1 ring-line transition-transform duration-300 group-hover:scale-105">
              {iconFor(item.name)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-medium text-ink transition-colors group-hover:text-accent">
                {item.name}
              </span>
              <span className="mt-1 block text-sm font-medium text-ink-soft">
                {formatPrice(item.price)}
              </span>
            </span>
          </Link>
          <FavoriteButton itemId={item.id} className="shrink-0" />
        </div>
      ))}
    </div>
  );
}
