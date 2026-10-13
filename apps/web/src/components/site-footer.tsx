"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <footer className="border-t border-black/5 bg-white px-6 py-12 text-center text-sm text-ink-muted">
      <p className="font-display text-lg tracking-[-0.02em] text-ink">Forestea</p>
      <p className="mx-auto mt-3 max-w-sm leading-relaxed">
        15127 Main St E, Ste 102, Sumner, WA 98390
        <br />
        Open daily 10:30am–9pm
      </p>
      <p className="mt-5 flex items-center justify-center gap-5 text-xs tracking-wide">
        <Link href="/privacy" className="transition hover:text-ink">
          Privacy
        </Link>
        <Link href="/terms" className="transition hover:text-ink">
          Terms
        </Link>
      </p>
    </footer>
  );
}
