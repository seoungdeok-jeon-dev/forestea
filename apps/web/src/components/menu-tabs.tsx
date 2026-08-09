"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "Menu", href: "/menu" },
  { label: "Featured", href: "/menu/featured" },
  { label: "Previous", href: "/account/orders" },
  { label: "Favorites", href: "/account/favorites" },
];

export function MenuTabs() {
  const pathname = usePathname();

  return (
    <nav className="mb-10 border-b border-line">
      <ul className="scrollbar-none flex gap-8 overflow-x-auto">
        {TABS.map((tab) => {
          const active =
            tab.href === "/menu"
              ? pathname === "/menu"
              : pathname.startsWith(tab.href);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={`-mb-px block whitespace-nowrap border-b-2 pb-3 text-base font-medium transition-colors ${
                  active
                    ? "border-ink text-ink"
                    : "border-transparent text-ink-muted hover:text-ink"
                }`}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
