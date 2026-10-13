import { NewsGrid } from "@/components/news-grid";
import { getPublishedPosts } from "@/lib/posts";
import { toPostCardData } from "@/lib/post-card-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "News — Forestea" };

export default async function NewsPage() {
  const posts = (await getPublishedPosts()).map(toPostCardData);

  return (
    <div className="mx-auto w-full max-w-[1440px] px-5 pb-20 pt-10 sm:px-8 sm:pt-14 md:pb-28 md:pt-16">
      <header className="mb-10 max-w-2xl md:mb-14">
        <h1 className="font-display text-[clamp(2.75rem,6vw,4.25rem)] leading-[0.95] tracking-[-0.035em] text-ink">
          News
        </h1>
      </header>

      {posts.length === 0 ? (
        <p className="py-20 text-center text-ink-muted">No posts yet.</p>
      ) : (
        <NewsGrid posts={posts} />
      )}
    </div>
  );
}
