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
  revealDelayMs?: number;
}

export function PostCard({ post, revealDelayMs = 0 }: Props) {
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
        <div className="relative aspect-[3/4] overflow-hidden rounded-[1.25rem] bg-forest-950">
          {post.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.coverImage}
              alt=""
              className="reveal-media h-full w-full object-cover transition-transform duration-[850ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.035]"
            />
          ) : (
            <div className="reveal-media flex h-full w-full items-center justify-center bg-gradient-to-br from-forest-800 to-forest-950">
              <span className="font-display text-2xl text-cream-50/35">F</span>
            </div>
          )}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-forest-950/45 to-transparent opacity-80"
          />
        </div>

        <div className="mt-4">
          <p className="text-[0.7rem] font-medium tracking-[0.14em] text-ink-muted">
            {post.dateLabel
              ? `${post.typeLabel} · ${post.dateLabel}`
              : post.typeLabel}
          </p>
          <h3 className="font-display mt-1.5 text-[1.05rem] leading-[1.2] tracking-[-0.025em] text-ink transition-colors duration-300 group-hover:text-forest-700 sm:text-[1.15rem]">
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
