"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { type MenuCategory, type MenuItem } from "@/lib/api";
import { MenuItemCard, useRevealOnScroll } from "@/components/menu-item-card";

interface MenuGridProps {
  categories: MenuCategory[];
  items: MenuItem[];
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
  const gridRef = useRef<HTMLDivElement>(null);

  useRevealOnScroll(gridRef, [sections.length]);

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
    <div className="lg:grid lg:grid-cols-[200px_minmax(0,1fr)] lg:items-start lg:gap-16 xl:grid-cols-[220px_minmax(0,1fr)] xl:gap-20">
      <nav className="sticky top-14 z-30 -mx-5 mb-10 border-b border-black/5 bg-white px-5 py-3 sm:top-16 sm:-mx-8 sm:px-8 lg:mx-0 lg:mb-0 lg:border-0 lg:px-0 lg:py-1">
        <p className="mb-3 hidden text-[0.65rem] font-medium tracking-[0.2em] text-ink-muted lg:block">
          Categories
        </p>
        <ul className="scrollbar-none flex gap-1 overflow-x-auto lg:flex-col lg:gap-0.5 lg:overflow-visible">
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
                  className={`block whitespace-nowrap px-3 py-2.5 text-sm tracking-[-0.01em] transition-colors lg:px-0 ${
                    active
                      ? "font-semibold text-ink"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  {category.name}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      <div ref={gridRef} className="space-y-16 md:space-y-20">
        {sections.map(({ category, items: catItems }, sectionIndex) => (
          <section
            key={category.id}
            id={category.id}
            ref={(el) => {
              sectionRefs.current[category.id] = el;
            }}
            className="scroll-mt-28 lg:scroll-mt-32"
          >
            <div className="mb-7 flex items-end justify-between gap-4 border-b border-line/70 pb-4 md:mb-9">
              <h2 className="font-display text-[1.65rem] tracking-[-0.03em] text-ink md:text-[2rem]">
                {category.name}
              </h2>
              <span className="pb-1 text-xs tabular-nums tracking-wide text-ink-muted">
                {catItems.length}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-5 sm:gap-y-11 md:grid-cols-3 xl:grid-cols-3 xl:gap-x-7 xl:gap-y-12">
              {catItems.map((item, itemIndex) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  revealDelayMs={(itemIndex % 3) * 60}
                  priority={sectionIndex === 0 && itemIndex < 3}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
