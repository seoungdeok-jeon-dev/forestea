import { PostCard } from "@/components/post-card";
import { getPublishedPosts } from "@/lib/posts";

export const dynamic = "force-dynamic";
export const metadata = { title: "News — Forestea" };

export default async function NewsPage() {
  const posts = await getPublishedPosts();

  return (
    <div className="mx-auto w-full max-w-[1440px] px-6 py-12 md:py-16">
      <header className="mb-10">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-ink-muted">
          Forestea
        </p>
        <h1 className="font-display mt-3 text-4xl text-ink md:text-5xl">
          News &amp; New Menu
        </h1>
      </header>

      {posts.length === 0 ? (
        <p className="py-16 text-center text-ink-muted">No posts yet.</p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
