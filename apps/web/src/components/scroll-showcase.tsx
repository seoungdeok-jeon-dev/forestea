"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const SLIDES = [
  {
    src: "/images/posters/1.png",
    brand: true,
    title: "Forestea",
    body: "Coffee, boba, tea & dessert — made to linger.",
  },
  {
    src: "/images/posters/3.png",
    title: "Premium Thai Milk Tea",
    body: "Bold, creamy, and poured over ice.",
  },
  {
    src: "/images/posters/5.png",
    title: "Ube Jasmine Milk Tea",
    body: "Purple swirl, jasmine tea, poured over ice.",
  },
  {
    src: "/images/posters/7.png",
    title: "Bagel Sandwich",
    body: "Cream cheese, scallion, and smoked salmon.",
  },
  {
    src: "/images/posters/9.png",
    title: "Matcha Collection",
    body: "Double, jasmine, strawberry, and coconut.",
  },
] as const;

export function ScrollShowcase() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const panels = Array.from(
      root.querySelectorAll<HTMLElement>("[data-panel]"),
    );

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute("data-panel"));
            setActive(idx);
          }
        }
      },
      { root, threshold: 0.55 },
    );

    panels.forEach((p) => observer.observe(p));
    return () => observer.disconnect();
  }, []);

  function scrollToPanel(idx: number) {
    const root = rootRef.current;
    if (!root) return;
    const panel = root.querySelector<HTMLElement>(`[data-panel="${idx}"]`);
    panel?.scrollIntoView({ behavior: "smooth" });
  }

  const onImageSlide = active < SLIDES.length;

  return (
    <div
      ref={rootRef}
      className="scroll-showcase relative h-[calc(100svh-3.5rem)] snap-y snap-mandatory overflow-y-auto overscroll-y-contain bg-forest-950 sm:h-[calc(100svh-4rem)]"
    >
      <div className="pointer-events-none fixed right-6 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-center gap-3.5 md:flex">
        {[...SLIDES, { src: "cta" }].map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to section ${i + 1}`}
            onClick={() => scrollToPanel(i)}
            className={`pointer-events-auto h-1.5 w-1.5 rounded-full transition-all duration-300 ${
              active === i
                ? `${onImageSlide ? "bg-white" : "bg-ink"} scale-[1.7]`
                : onImageSlide
                  ? "bg-white/35 hover:bg-white/70"
                  : "bg-ink/20 hover:bg-ink/45"
            }`}
          />
        ))}
      </div>

      {SLIDES.map((slide, index) => {
        const isBrand = "brand" in slide && slide.brand;
        return (
          <section
            key={slide.src}
            data-panel={index}
            className="scroll-showcase-panel relative flex h-[calc(100svh-3.5rem)] snap-start snap-always items-end overflow-hidden bg-forest-950 sm:h-[calc(100svh-4rem)] sm:items-center"
          >
            <div className="absolute inset-0">
              <Image
                src={slide.src}
                alt=""
                fill
                priority={index === 0}
                className="scroll-showcase-img object-cover object-center"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/35 to-forest-950/20 sm:bg-gradient-to-r sm:from-forest-950/80 sm:via-forest-950/25 sm:to-transparent" />
            </div>

            <div className="relative z-10 mx-auto w-full max-w-[1440px] px-6 pb-20 pt-16 sm:px-10 sm:pb-0">
              <div className="max-w-xl">
                {isBrand ? (
                  <h1 className="font-display text-[clamp(3.5rem,12vw,7.5rem)] leading-[0.92] tracking-[-0.03em] text-white">
                    {slide.title}
                  </h1>
                ) : (
                  <h2 className="font-display text-[clamp(2.75rem,8vw,5.5rem)] leading-[0.98] tracking-[-0.025em] text-white">
                    {slide.title}
                  </h2>
                )}
                <p className="mt-5 max-w-sm text-base leading-relaxed text-white/78 sm:text-lg">
                  {slide.body}
                </p>
                {isBrand ? (
                  <Link
                    href="/menu"
                    className="mt-9 inline-flex min-h-[48px] items-center rounded-full bg-white px-7 text-sm font-semibold text-ink transition hover:bg-white/90"
                  >
                    Order ahead
                  </Link>
                ) : null}
              </div>
            </div>

            {index === 0 ? (
              <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-white/55">
                <span className="scroll-showcase-hint block h-10 w-px bg-white/60" />
              </div>
            ) : null}
          </section>
        );
      })}

      <section
        data-panel={SLIDES.length}
        className="scroll-showcase-panel relative flex h-[calc(100svh-3.5rem)] snap-start snap-always flex-col items-center justify-center bg-white px-6 text-center sm:h-[calc(100svh-4rem)]"
      >
        <h2 className="font-display text-[clamp(2.75rem,8vw,5rem)] leading-[0.98] tracking-[-0.03em] text-ink">
          Your table is ready
        </h2>
        <p className="mx-auto mt-5 max-w-sm text-base leading-relaxed text-ink-soft sm:text-lg">
          Browse coffee, matcha, bingsu, and more — then pick up in store.
        </p>
        <Link
          href="/menu"
          className="mt-10 inline-flex min-h-[48px] items-center rounded-full bg-ink px-9 text-sm font-semibold text-white transition hover:bg-ink/85"
        >
          View menu
        </Link>
        <p className="mt-16 text-xs tracking-wide text-ink-muted">
          Sumner, WA · Daily 10:30am–9pm
        </p>
      </section>
    </div>
  );
}
