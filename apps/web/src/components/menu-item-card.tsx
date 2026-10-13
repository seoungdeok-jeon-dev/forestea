"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, type RefObject } from "react";
import { FavoriteButton } from "@/components/favorite-button";
import { formatPrice, type MenuItem } from "@/lib/api";
import { menuImageFor } from "@/lib/menu-images";

const CARD_SIZES =
  "(min-width: 1280px) 24vw, (min-width: 768px) 30vw, (min-width: 640px) 45vw, 92vw";

/**
 * Reveals `[data-reveal]` descendants once as they scroll into view.
 */
export function useRevealOnScroll<T extends HTMLElement>(
  ref: RefObject<T | null>,
  deps: unknown[] = [],
): void {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const cards = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (cards.length === 0) return;

    if (!("IntersectionObserver" in window)) {
      cards.forEach((card) => card.classList.add("is-revealed"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.06 },
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, ...deps]);
}

interface Props {
  item: MenuItem;
  revealDelayMs?: number;
  priority?: boolean;
}

export function MenuItemCard({
  item,
  revealDelayMs = 0,
  priority = false,
}: Props) {
  const image = menuImageFor(item.name, item.image);
  const soldOut = item.available === false;

  return (
    <article
      data-reveal
      style={{ transitionDelay: `${revealDelayMs}ms` }}
      className="reveal-card group relative"
    >
      <Link
        href={`/menu/${item.id}`}
        className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        <div className="relative aspect-[3/4] overflow-hidden rounded-[1.25rem] bg-forest-950">
          {image ? (
            <Image
              src={image}
              alt={item.name}
              fill
              sizes={CARD_SIZES}
              priority={priority}
              className="reveal-media object-cover object-bottom transition-transform duration-[850ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.035]"
            />
          ) : (
            <div className="reveal-media flex h-full w-full items-center justify-center bg-gradient-to-br from-forest-800 to-forest-950">
              <span className="font-display text-2xl text-cream-50/35">F</span>
            </div>
          )}

          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-forest-950/55 to-transparent opacity-80"
          />

          {soldOut ? (
            <div className="absolute inset-0 flex items-center justify-center bg-forest-950/55">
              <span className="rounded-full bg-cream-50/90 px-3 py-1 text-xs font-semibold tracking-wide text-forest-950">
                Sold out
              </span>
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex items-baseline justify-between gap-3">
          <h3 className="font-display text-[1.05rem] leading-[1.2] tracking-[-0.025em] text-ink transition-colors duration-300 group-hover:text-forest-700 sm:text-[1.15rem]">
            {item.name}
          </h3>
          <p className="shrink-0 text-[0.9rem] font-medium tabular-nums tracking-tight text-ink-soft">
            {formatPrice(item.price)}
          </p>
        </div>
      </Link>

      <FavoriteButton
        itemId={item.id}
        tone="onImage"
        className="absolute right-2.5 top-2.5 bg-forest-950/30 opacity-90 backdrop-blur-sm transition hover:bg-forest-950/55 hover:opacity-100"
      />
    </article>
  );
}
