"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export function AccountMenu() {
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

  if (status === "loading") {
    return <span className="h-8 w-8 animate-pulse rounded-full bg-subtle" />;
  }

  if (!session?.user) {
    return (
      <Link href="/login" className="transition-colors hover:text-ink">
        Log in
      </Link>
    );
  }

  const label = session.user.name ?? session.user.email ?? "Account";
  const initial = label.charAt(0).toUpperCase();
  const isAdmin = session.user.role === "ADMIN";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-line bg-card px-2 py-1.5 text-ink transition-colors hover:bg-subtle"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-on-accent">
          {initial}
        </span>
        <span className="hidden max-w-[8rem] truncate text-sm sm:inline">{label}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-line bg-card py-1 shadow-lg"
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
                Clover settings
              </MenuLink>
            </>
          )}
          <div className="my-1 h-px bg-line" />
          <button
            type="button"
            role="menuitem"
            onClick={() => void signOut({ callbackUrl: "/" })}
            className="block w-full px-4 py-2 text-left text-sm text-red-700 transition-colors hover:bg-subtle"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

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
      className="block px-4 py-2 text-sm text-ink transition-colors hover:bg-subtle"
    >
      {children}
    </Link>
  );
}
