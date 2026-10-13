import { NewsGrid } from "@/components/news-grid";
import { getPublishedPosts } from "@/lib/posts";
import { toPostCardData } from "@/lib/post-card-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "News — Forestea" };

export default async function NewsPage() {
  const posts = (await getPublishedPosts()).map(toPostCardData);

  return (
    <div className="mx-auto w-full max-w-[1100px] px-5 pb-24 pt-12 sm:px-8 sm:pt-16 md:pb-32 md:pt-20">
      <header className="mb-14 max-w-2xl md:mb-20">
        <p className="text-[0.7rem] font-medium tracking-[0.2em] text-ink-muted">
          FROM THE CAFÉ
        </p>
        <h1 className="font-display mt-4 text-[clamp(2.75rem,7vw,5rem)] leading-[0.92] tracking-[-0.04em] text-ink">
          News
        </h1>
        <p className="mt-5 max-w-md text-[1.05rem] leading-relaxed text-ink-soft">
          New drinks, seasonal specials, and quiet notes from Sumner.
        </p>
      </header>

      {posts.length === 0 ? (
        <div className="border-t border-black/5 py-20">
          <p className="font-display text-2xl tracking-[-0.02em] text-ink">
            Nothing posted yet
          </p>
          <p className="mt-3 max-w-sm text-ink-soft">
            Check back soon for menu updates and café notes.
          </p>
        </div>
      ) : (
        <NewsGrid posts={posts} />
      )}
    </div>
  );
}
