"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/cart-context";
import { AccountMenu } from "@/components/account-menu";

export function Header() {
  const { itemCount, cartPulse } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-surface/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-4">
        <Link href="/" className="group flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Forestea logo"
            width={48}
            height={41}
            className="h-10 w-auto transition-transform duration-300 group-hover:scale-105 dark:invert"
          />
          <div>
            <p className="font-display text-xl tracking-wide text-ink">
              Forestea
            </p>
            <p className="text-xs text-ink-soft">Forest café & tea house</p>
          </div>
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium text-ink-soft">
          <Link href="/menu" className="transition-colors hover:text-ink">
            Menu
          </Link>
          <Link href="/news" className="transition-colors hover:text-ink">
            News
          </Link>
          <AccountMenu />
          <Link
            href="/checkout"
            className="relative rounded-full bg-accent px-5 py-2.5 text-on-accent transition-colors hover:bg-accent-hover"
          >
            Cart
            {itemCount > 0 && (
              <span
                key={cartPulse}
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-bark-600 text-[10px] font-bold text-cream-50 animate-cart-badge"
              >
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
