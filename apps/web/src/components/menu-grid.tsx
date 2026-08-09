"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatPrice, type MenuCategory, type MenuItem } from "@/lib/api";
import { FavoriteButton } from "@/components/favorite-button";

interface MenuGridProps {
  categories: MenuCategory[];
  items: MenuItem[];
}

function iconFor(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("coffee")) return "☕";
  if (n.includes("tea")) return "🍵";
  if (n.includes("pastry") || n.includes("bakery")) return "🥐";
  if (n.includes("cake") || n.includes("dessert")) return "🍰";
  if (n.includes("ice")) return "🍦";
  return "🌿";
}

export function MenuGrid({ categories, items }: MenuGridProps) {
  const sections = useMemo(() => {
    return [...categories]
      .sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99))
      .map((category) => ({
        category,
        items: items.filter((i) => i.categoryIds?.includes(category.id)),
      }))
      .filter((s) => s.items.length > 0);
  }, [categories, items]);

  const [activeId, setActiveId] = useState<string>("");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    if (sections.length === 0) return;
    setActiveId((prev) => prev || sections[0]!.category.id);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-120px 0px -55% 0px", threshold: 0 },
    );

    for (const s of sections) {
      const el = sectionRefs.current[s.category.id];
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [sections]);

  function scrollTo(id: string) {
    setActiveId(id);
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (sections.length === 0) {
    return (
      <p className="py-20 text-center text-ink-muted">No menu items available.</p>
    );
  }

  return (
    <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-12">
      {/* Sidebar / category nav */}
      <nav className="sticky top-[4.5rem] z-30 -mx-6 mb-8 bg-surface/90 px-6 py-3 backdrop-blur-md lg:top-24 lg:mx-0 lg:mb-0 lg:self-start lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none">
        <ul className="scrollbar-none flex gap-2 overflow-x-auto lg:flex-col lg:gap-1 lg:overflow-visible">
          {sections.map(({ category }) => {
            const active = category.id === activeId;
            return (
              <li key={category.id} className="shrink-0">
                <a
                  href={`#${category.id}`}
                  onClick={(event) => {
                    event.preventDefault();
                    scrollTo(category.id);
                  }}
                  aria-current={active ? "location" : undefined}
                  className={`block w-full whitespace-nowrap rounded-full px-4 py-2 text-left text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent lg:rounded-lg ${
                    active
                      ? "bg-subtle text-ink lg:bg-transparent lg:font-semibold"
                      : "text-ink-muted hover:text-ink lg:hover:bg-subtle"
                  }`}
                >
                  <span
                    className={`hidden lg:mr-2 lg:inline-block lg:h-4 lg:w-1 lg:rounded-full lg:align-middle ${
                      active ? "lg:bg-accent" : "lg:bg-transparent"
                    }`}
                    aria-hidden
                  />
                  {category.name}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Sections */}
      <div className="space-y-16">
        {sections.map(({ category, items: catItems }) => (
          <section
            key={category.id}
            id={category.id}
            ref={(el) => {
              sectionRefs.current[category.id] = el;
            }}
            className="scroll-mt-28"
          >
            <h2 className="font-display mb-7 border-b border-line pb-4 text-2xl text-ink md:text-3xl">
              {category.name}
            </h2>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-x-8 gap-y-7">
              {catItems.map((item) => (
                <div key={item.id} className="group relative flex items-center gap-5">
                  <Link
                    href={`/menu/${item.id}`}
                    className="flex flex-1 items-center gap-5"
                  >
                    <span className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-subtle text-3xl ring-1 ring-line transition-transform duration-300 group-hover:scale-105">
                      {iconFor(category.name)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium text-ink transition-colors group-hover:text-accent">
                        {item.name}
                      </span>
                      {item.description ? (
                        <span className="mt-0.5 block truncate text-sm text-ink-muted">
                          {item.description}
                        </span>
                      ) : null}
                      <span className="mt-1 block text-sm font-medium text-ink-soft">
                        {formatPrice(item.price)}
                      </span>
                    </span>
                  </Link>
                  <FavoriteButton itemId={item.id} className="shrink-0" />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
