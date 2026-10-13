import { NewsGrid } from "@/components/news-grid";
import { getPublishedPosts } from "@/lib/posts";
import { toPostCardData } from "@/lib/post-card-data";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function FeaturedPage() {
  const posts = (await getPublishedPosts("NEW_MENU")).map(toPostCardData);

  return (
    <div className="mx-auto w-full max-w-[1440px] px-5 pb-20 pt-10 sm:px-8 sm:pt-14 md:pb-28 md:pt-16">
      <header className="mb-10 max-w-2xl md:mb-14">
        <h1 className="font-display text-[clamp(2.75rem,6vw,4.25rem)] leading-[0.95] tracking-[-0.035em] text-ink">
          Featured
        </h1>
      </header>

      {posts.length === 0 ? (
        <p className="py-20 text-center text-ink-muted">
          No featured items yet. Check back soon!
        </p>
      ) : (
        <NewsGrid posts={posts} />
      )}

      <p className="mt-14 text-sm text-ink-soft">
        Looking for the full menu?{" "}
        <Link
          href="/menu"
          className="font-medium text-ink transition-colors hover:text-forest-700"
        >
          Browse all items →
        </Link>
      </p>
    </div>
  );
}
