"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface AccountMenuProps {
  /**
   * "dropdown" is the desktop header popover. "inline" renders the same
   * destinations as a flat, tappable list for the mobile nav panel.
   */
  variant?: "dropdown" | "inline";
  onNavigate?: () => void;
}

export function AccountMenu({
  variant = "dropdown",
  onNavigate,
}: AccountMenuProps = {}) {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const label = session?.user
    ? (session.user.name ?? session.user.email ?? "Account")
    : null;
  const isAdmin = session?.user?.role === "ADMIN";

  if (variant === "inline") {
    if (status === "loading") {
      return <span className="mx-3 block h-5 w-24 animate-pulse rounded bg-subtle" />;
    }

    if (!session?.user) {
      return (
        <Link href="/login" onClick={onNavigate} className={inlineItemClass}>
          Log in
        </Link>
      );
    }

    return (
      <>
        <p className="truncate px-3 pb-1 pt-2 text-xs uppercase tracking-[0.16em] text-ink-muted">
          {label}
        </p>
        <Link
          href="/account/favorites"
          onClick={onNavigate}
          className={inlineItemClass}
        >
          Favorites
        </Link>
        <Link
          href="/account/orders"
          onClick={onNavigate}
          className={inlineItemClass}
        >
          Previous orders
        </Link>
        {isAdmin && (
          <>
            <Link href="/admin/posts" onClick={onNavigate} className={inlineItemClass}>
              Manage posts
            </Link>
            <Link
              href="/admin/setting"
              onClick={onNavigate}
              className={inlineItemClass}
            >
              Settings
            </Link>
          </>
        )}
        <button
          type="button"
          onClick={() => {
            onNavigate?.();
            void signOut({ callbackUrl: "/" });
          }}
          className={`${inlineItemClass} w-full text-left text-red-700`}
        >
          Log out
        </button>
      </>
    );
  }

  if (status === "loading") {
    return <span className="h-8 w-8 animate-pulse rounded-full bg-subtle" />;
  }

  if (!session?.user) {
    return (
      <Link
        href="/login"
        className="text-[0.8rem] font-medium tracking-[0.04em] text-ink/70 transition-colors hover:text-ink"
      >
        Log in
      </Link>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-[0.8rem] font-medium tracking-[0.04em] text-ink/70 transition-colors hover:text-ink"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        Account
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-3 w-48 overflow-hidden rounded-lg border border-black/8 bg-white py-1 shadow-sm"
        >
          <MenuLink href="/account/favorites" onClick={() => setOpen(false)}>
            Favorites
          </MenuLink>
          <MenuLink href="/account/orders" onClick={() => setOpen(false)}>
            Previous orders
          </MenuLink>
          {isAdmin && (
            <>
              <div className="my-1 h-px bg-line" />
              <MenuLink href="/admin/posts" onClick={() => setOpen(false)}>
                Manage posts
              </MenuLink>
              <MenuLink href="/admin/setting" onClick={() => setOpen(false)}>
                Settings
              </MenuLink>
            </>
          )}
          <div className="my-1 h-px bg-line" />
          <button
            type="button"
            role="menuitem"
            onClick={() => void signOut({ callbackUrl: "/" })}
            className="block w-full px-4 py-2.5 text-left text-sm text-red-700 transition-colors hover:bg-subtle"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

const inlineItemClass =
  "flex min-h-[44px] items-center rounded-xl px-3 text-[15px] font-medium text-ink transition-colors hover:bg-subtle";

function MenuLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onClick}
      className="block px-4 py-2.5 text-sm text-ink transition-colors hover:bg-subtle"
    >
      {children}
    </Link>
  );
}
