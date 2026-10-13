"use client";

import { useRef } from "react";
import { type MenuItem } from "@/lib/api";
import { MenuItemCard, useRevealOnScroll } from "@/components/menu-item-card";

export function ItemCardGrid({ items }: { items: MenuItem[] }) {
  const gridRef = useRef<HTMLDivElement>(null);
  useRevealOnScroll(gridRef, [items.length]);

  if (items.length === 0) {
    return (
      <p className="py-16 text-center text-ink-muted">Nothing here yet.</p>
    );
  }

  return (
    <div
      ref={gridRef}
      className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-10 xl:grid-cols-4"
    >
      {items.map((item, index) => (
        <MenuItemCard
          key={item.id}
          item={item}
          revealDelayMs={(index % 4) * 70}
          priority={index < 2}
        />
      ))}
    </div>
  );
}
