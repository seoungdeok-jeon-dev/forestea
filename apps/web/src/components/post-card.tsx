import Link from "next/link";

export type PostCardData = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  typeLabel: string;
  dateLabel: string | null;
};

interface Props {
  post: PostCardData;
  variant?: "feature" | "row" | "tile";
  revealDelayMs?: number;
}

export function PostCard({
  post,
  variant = "tile",
  revealDelayMs = 0,
}: Props) {
  if (variant === "feature") {
    return (
      <article
        data-reveal
        style={{ transitionDelay: `${revealDelayMs}ms` }}
        className="reveal-card group"
      >
        <Link
          href={`/news/${post.slug}`}
          className="grid gap-8 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent md:grid-cols-12 md:items-center md:gap-12"
        >
          <div className="relative aspect-[16/10] overflow-hidden bg-forest-950 md:col-span-7 md:aspect-[5/4]">
            {post.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.coverImage}
                alt=""
                className="reveal-media h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
              />
            ) : (
              <div className="reveal-media flex h-full w-full items-center justify-center bg-gradient-to-br from-forest-800 to-forest-950">
                <span className="font-display text-4xl text-white/25">F</span>
              </div>
            )}
          </div>

          <div className="md:col-span-5">
            <p className="text-[0.7rem] font-medium tracking-[0.18em] text-ink-muted">
              {post.dateLabel
                ? `${post.typeLabel} · ${post.dateLabel}`
                : post.typeLabel}
            </p>
            <h2 className="font-display mt-4 text-[clamp(1.85rem,4vw,2.75rem)] leading-[1.05] tracking-[-0.03em] text-ink transition-colors duration-300 group-hover:text-forest-700">
              {post.title}
            </h2>
            {post.excerpt ? (
              <p className="mt-4 max-w-md text-[1.02rem] leading-relaxed text-ink-soft">
                {post.excerpt}
              </p>
            ) : null}
            <p className="mt-7 text-[0.8rem] font-medium tracking-[0.08em] text-ink/55 transition-colors group-hover:text-ink">
              Read more →
            </p>
          </div>
        </Link>
      </article>
    );
  }

  if (variant === "row") {
    return (
      <article
        data-reveal
        style={{ transitionDelay: `${revealDelayMs}ms` }}
        className="reveal-card group border-t border-black/5"
      >
        <Link
          href={`/news/${post.slug}`}
          className="grid grid-cols-[112px_minmax(0,1fr)] items-center gap-5 py-7 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-8 sm:py-8"
        >
          <div className="relative aspect-[4/5] overflow-hidden bg-forest-950">
            {post.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.coverImage}
                alt=""
                className="reveal-media h-full w-full object-cover transition-transform duration-[850ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
              />
            ) : (
              <div className="reveal-media flex h-full w-full items-center justify-center bg-gradient-to-br from-forest-800 to-forest-950">
                <span className="font-display text-xl text-white/25">F</span>
              </div>
            )}
          </div>
          <div>
            <p className="text-[0.68rem] font-medium tracking-[0.16em] text-ink-muted">
              {post.dateLabel
                ? `${post.typeLabel} · ${post.dateLabel}`
                : post.typeLabel}
            </p>
            <h3 className="font-display mt-2 text-[1.2rem] leading-[1.2] tracking-[-0.025em] text-ink transition-colors duration-300 group-hover:text-forest-700 sm:text-[1.35rem]">
              {post.title}
            </h3>
            {post.excerpt ? (
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-soft">
                {post.excerpt}
              </p>
            ) : null}
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article
      data-reveal
      style={{ transitionDelay: `${revealDelayMs}ms` }}
      className="reveal-card group"
    >
      <Link
        href={`/news/${post.slug}`}
        className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-forest-950">
          {post.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.coverImage}
              alt=""
              className="reveal-media h-full w-full object-cover transition-transform duration-[850ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.035]"
            />
          ) : (
            <div className="reveal-media flex h-full w-full items-center justify-center bg-gradient-to-br from-forest-800 to-forest-950">
              <span className="font-display text-2xl text-white/25">F</span>
            </div>
          )}
        </div>
        <div className="mt-4">
          <p className="text-[0.68rem] font-medium tracking-[0.16em] text-ink-muted">
            {post.dateLabel
              ? `${post.typeLabel} · ${post.dateLabel}`
              : post.typeLabel}
          </p>
          <h3 className="font-display mt-2 text-[1.15rem] leading-[1.2] tracking-[-0.025em] text-ink transition-colors duration-300 group-hover:text-forest-700">
            {post.title}
          </h3>
        </div>
      </Link>
    </article>
  );
}
