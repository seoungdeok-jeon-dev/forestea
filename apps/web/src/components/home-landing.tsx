"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

const MOMENTS = [
  {
    src: "/images/hero/pic1.png",
    href: "/menu",
    label: "The café",
    caption: "Light wood, quiet seats",
    position: "object-center",
  },
  {
    src: "/images/hero/pic2.png",
    href: "/menu",
    label: "Under the canopy",
    caption: "Greens and soft glow",
    position: "object-[center_35%]",
  },
  {
    src: "/images/home/forest-cafe.jpg",
    href: "/menu",
    label: "Forest light",
    caption: "Trees just outside",
    position: "object-center",
  },
] as const;

export function HomeLanding() {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    requestAnimationFrame(() => hero.classList.add("is-ready"));
  }, []);

  return (
    <div className="bg-white">
      <section
        ref={heroRef}
        className="home-hero relative isolate min-h-[calc(100svh-3.5rem)] overflow-hidden bg-forest-950 sm:min-h-[calc(100svh-4rem)]"
      >
        <div className="absolute inset-0">
          <Image
            src="/images/home/forest-window.jpg"
            alt=""
            fill
            priority
            quality={95}
            sizes="100vw"
            className="home-hero-media object-cover object-[center_45%]"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,20,16,0.2)_0%,rgba(11,20,16,0.15)_40%,rgba(11,20,16,0.72)_100%)] sm:bg-[linear-gradient(90deg,rgba(11,20,16,0.78)_0%,rgba(11,20,16,0.35)_48%,rgba(11,20,16,0.12)_100%)]"
          />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[calc(100svh-3.5rem)] w-full max-w-[1440px] flex-col justify-end px-5 pb-14 pt-24 sm:min-h-[calc(100svh-4rem)] sm:px-8 sm:pb-20 md:justify-center md:pb-24">
          <p className="home-hero-copy text-[0.7rem] font-medium tracking-[0.22em] text-white/65">
            SUMNER, WA
          </p>
          <h1 className="home-hero-copy home-hero-title font-display mt-4 max-w-[11ch] text-[clamp(3.75rem,13vw,8rem)] leading-[0.88] tracking-[-0.04em] text-white">
            Forestea
          </h1>
          <p className="home-hero-copy mt-5 max-w-md text-[1.05rem] leading-relaxed text-white/78 sm:text-lg">
            A quiet café at the edge of the trees — coffee, matcha, and dessert.
          </p>
          <div className="home-hero-copy mt-9 flex flex-wrap items-center gap-6">
            <Link
              href="/menu"
              className="inline-flex min-h-[48px] items-center rounded-full bg-white px-8 text-sm font-semibold text-ink transition hover:bg-white/90"
            >
              Order ahead
            </Link>
            <Link
              href="/news"
              className="text-[0.8rem] font-medium tracking-[0.06em] text-white/75 transition hover:text-white"
            >
              What’s new
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1440px] px-5 py-16 sm:px-8 sm:py-24 md:py-28">
        <div className="mb-10 flex items-end justify-between gap-6 md:mb-14">
          <h2 className="font-display text-[clamp(2rem,4.5vw,3.25rem)] leading-[0.95] tracking-[-0.035em] text-ink">
            Inside the forest
          </h2>
          <Link
            href="/menu"
            className="hidden text-[0.8rem] font-medium tracking-[0.06em] text-ink/55 transition hover:text-ink sm:inline"
          >
            Full menu →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-5 md:gap-7">
          {MOMENTS.map((moment) => (
            <Link key={moment.src} href={moment.href} className="group block">
              <div className="relative aspect-[4/5] overflow-hidden bg-forest-950">
                <Image
                  src={moment.src}
                  alt=""
                  fill
                  quality={90}
                  sizes="(min-width: 640px) 30vw, 92vw"
                  className={`object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.035] ${moment.position}`}
                />
              </div>
              <p className="mt-4 font-display text-[1.15rem] tracking-[-0.025em] text-ink">
                {moment.label}
              </p>
              <p className="mt-1 text-sm text-ink-muted">{moment.caption}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-forest-950 text-white">
        <div className="mx-auto flex w-full max-w-[900px] flex-col items-center px-5 py-24 text-center sm:px-8 sm:py-32 md:py-40">
          <h2 className="font-display text-[clamp(2.25rem,6vw,4.25rem)] leading-[1.02] tracking-[-0.035em]">
            Skip the line.
            <br />
            Keep the quiet.
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-white/70 sm:text-lg">
            Order ahead for pickup — ready when you walk in.
          </p>
          <Link
            href="/menu"
            className="mt-10 inline-flex min-h-[48px] items-center rounded-full border border-white/25 px-8 text-sm font-semibold text-white transition hover:border-white/50 hover:bg-white/5"
          >
            Browse the menu
          </Link>
          <p className="mt-16 text-[0.7rem] tracking-[0.16em] text-white/45">
            15127 MAIN ST E · SUMNER · DAILY 10:30–21:00
          </p>
        </div>
      </section>
    </div>
  );
}
