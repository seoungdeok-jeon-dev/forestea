"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

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
            FEDERAL WAY, WA
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
            33304 PACIFIC HWY S · FEDERAL WAY · DAILY 10:30–21:30
          </p>
        </div>
      </section>
    </div>
  );
}
