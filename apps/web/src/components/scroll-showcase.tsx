"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const SLIDES = [
  {
    src: "/images/hero/pic1.png",
    eyebrow: "Forestea",
    title: "Beneath the canopy",
    body: "A calm, forest-inspired space for coffee, tea, and slow mornings.",
  },
  {
    src: "/images/hero/pic2.png",
    eyebrow: "Our story",
    title: "Rooted in craft",
    body: "Warm wood, stone, and light — designed for unhurried conversation.",
  },
  {
    src: "/images/hero/pic3.png",
    eyebrow: "Espresso bar",
    title: "Precision in every pull",
    body: "Professional equipment and carefully sourced beans, dialed in daily.",
  },
  {
    src: "/images/hero/pic4.png",
    eyebrow: "Pick up",
    title: "Order ahead",
    body: "Skip the line. Customize your drink and collect it when it is ready.",
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
      { root, threshold: 0.6 },
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
      className="scroll-showcase relative -mx-[max(0px,calc((100vw-100%)/2))] h-svh snap-y snap-mandatory overflow-y-auto overscroll-y-contain bg-forest-950"
    >
      {/* Fixed brand mark */}
      <div
        className={`pointer-events-none fixed left-1/2 top-7 z-30 -translate-x-1/2 transition-colors duration-500 ${
          onImageSlide ? "text-cream-50" : "text-ink"
        }`}
      >
        <span className="font-display text-sm tracking-[0.4em] uppercase">
          Forestea
        </span>
      </div>

      {/* Side dot navigation */}
      <div className="pointer-events-none fixed right-5 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-center gap-3 md:flex">
        {[...SLIDES, { src: "cta" }].map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to section ${i + 1}`}
            onClick={() => scrollToPanel(i)}
            className={`pointer-events-auto h-2 w-2 rounded-full transition-all duration-300 ${
              active === i
                ? `${onImageSlide ? "bg-cream-50" : "bg-accent"} scale-150`
                : onImageSlide
                  ? "bg-cream-50/40 hover:bg-cream-50/70"
                  : "bg-ink/25 hover:bg-ink/50"
            }`}
          />
        ))}
      </div>

      {SLIDES.map((slide, index) => (
        <section
          key={slide.src}
          data-panel={index}
          className="scroll-showcase-panel relative flex min-h-[100svh] snap-start snap-always items-center justify-center overflow-hidden bg-forest-950"
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
            <div className="absolute inset-0 bg-gradient-to-t from-forest-950/85 via-forest-950/25 to-forest-950/45" />
          </div>

          <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-6 text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.34em] text-moss-200/90">
              {slide.eyebrow}
            </p>
            <h2 className="font-display mt-4 text-5xl leading-[1.05] text-cream-50 md:text-7xl">
              {slide.title}
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-cream-50/80 md:text-lg">
              {slide.body}
            </p>
          </div>

          {index === 0 ? (
            <div className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2 text-cream-50/70">
              <span className="scroll-showcase-hint block h-9 w-[1.5px] bg-cream-50/50" />
            </div>
          ) : null}
        </section>
      ))}

      <section
        data-panel={SLIDES.length}
        className="scroll-showcase-panel relative flex min-h-[100svh] snap-start snap-always flex-col items-center justify-center bg-surface px-6 text-center"
      >
        <p className="text-[11px] font-medium uppercase tracking-[0.34em] text-ink-muted">
          Ready when you are
        </p>
        <h2 className="font-display mt-5 text-5xl text-ink md:text-7xl">
          Taste the forest
        </h2>
        <p className="mx-auto mt-5 max-w-md text-ink-soft md:text-lg">
          Browse our menu, tailor every detail to your taste, and pay with ease.
        </p>
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          <Link
            href="/menu"
            className="rounded-full bg-accent px-10 py-4 text-sm font-semibold text-on-accent shadow-lg shadow-forest-900/10 transition hover:bg-accent-hover active:scale-[0.98]"
          >
            View menu
          </Link>
          <Link
            href="/checkout"
            className="rounded-full border border-line px-10 py-4 text-sm font-semibold text-ink transition hover:border-accent hover:bg-subtle"
          >
            Go to cart
          </Link>
        </div>

        <p className="mt-16 text-xs text-ink-muted">
          15127 Main St E, Ste 102, Sumner, WA 98390 · Open daily 10:30am–9pm
        </p>
      </section>
    </div>
  );
}
