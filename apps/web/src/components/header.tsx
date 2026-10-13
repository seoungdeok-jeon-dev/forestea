"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/context/cart-context";
import { AccountMenu } from "@/components/account-menu";

function navLinkClass(active: boolean) {
  return [
    "text-[0.8rem] font-medium tracking-[0.04em] transition-colors",
    active ? "text-ink" : "text-ink/55 hover:text-ink",
  ].join(" ");
}

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const { itemCount } = useCart();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const menuActive = isActivePath(pathname, "/menu");
  const newsActive = isActivePath(pathname, "/news");
  const cartActive = isActivePath(pathname, "/checkout");

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-50 bg-white">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-5 sm:h-16 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-display text-[1.05rem] tracking-[-0.02em] text-ink sm:gap-3 sm:text-lg"
        >
          <Image
            src="/logo.png"
            alt=""
            width={36}
            height={36}
            className="h-7 w-7 object-contain sm:h-8 sm:w-8"
            priority
          />
          <span>Forestea</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          <Link
            href="/menu"
            className={navLinkClass(menuActive)}
            aria-current={menuActive ? "page" : undefined}
          >
            Menu
          </Link>
          <Link
            href="/news"
            className={navLinkClass(newsActive)}
            aria-current={newsActive ? "page" : undefined}
          >
            News
          </Link>
          <AccountMenu />
          <Link
            href="/checkout"
            className={navLinkClass(cartActive)}
            aria-current={cartActive ? "page" : undefined}
          >
            Cart{itemCount > 0 ? ` (${itemCount})` : ""}
          </Link>
        </nav>

        <div className="flex items-center gap-5 md:hidden">
          <Link
            href="/checkout"
            className={navLinkClass(cartActive)}
            aria-current={cartActive ? "page" : undefined}
          >
            Cart{itemCount > 0 ? ` (${itemCount})` : ""}
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex h-10 w-10 items-center justify-center text-ink"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              aria-hidden="true"
            >
              {open ? (
                <>
                  <path d="M6 6l12 12" />
                  <path d="M18 6 6 18" />
                </>
              ) : (
                <>
                  <path d="M4 7h16" />
                  <path d="M4 17h16" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          className="border-t border-black/5 bg-white px-5 pb-4 pt-2 md:hidden"
        >
          <Link
            href="/menu"
            className={`flex min-h-[44px] items-center text-[0.95rem] font-medium ${
              menuActive ? "text-ink" : "text-ink/55"
            }`}
            aria-current={menuActive ? "page" : undefined}
          >
            Menu
          </Link>
          <Link
            href="/news"
            className={`flex min-h-[44px] items-center text-[0.95rem] font-medium ${
              newsActive ? "text-ink" : "text-ink/55"
            }`}
            aria-current={newsActive ? "page" : undefined}
          >
            News
          </Link>
          <div className="my-2 h-px bg-black/5" />
          <AccountMenu variant="inline" onNavigate={() => setOpen(false)} />
        </nav>
      ) : null}
    </header>
  );
}
