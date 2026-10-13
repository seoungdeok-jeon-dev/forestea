import { NewsGrid } from "@/components/news-grid";
import { getPublishedPosts } from "@/lib/posts";
import { toPostCardData } from "@/lib/post-card-data";
import Link from "next/link";

export async function HomeNews() {
  const posts = (await getPublishedPosts()).slice(0, 3).map(toPostCardData);
  if (posts.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-[1440px] px-5 py-20 sm:px-8 md:py-28">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4 md:mb-14">
        <h2 className="font-display text-[clamp(2rem,4vw,3rem)] leading-[0.95] tracking-[-0.035em] text-ink">
          From the café
        </h2>
        <Link
          href="/news"
          className="text-[0.8rem] font-medium tracking-[0.04em] text-ink/70 transition-colors hover:text-ink"
        >
          All news →
        </Link>
      </div>

      <NewsGrid posts={posts} />
    </section>
  );
}
