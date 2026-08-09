import { PostCard } from "@/components/post-card";
import { getPublishedPosts } from "@/lib/posts";
import Link from "next/link";

export async function HomeNews() {
  const posts = (await getPublishedPosts()).slice(0, 4);
  if (posts.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-[1440px] px-6 py-16 md:py-24">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-ink-muted">
            Fresh from Forestea
          </p>
          <h2 className="font-display mt-3 text-3xl text-ink md:text-4xl">
            New menu &amp; announcements
          </h2>
        </div>
        <Link
          href="/news"
          className="text-sm font-medium text-accent hover:underline"
        >
          View all →
        </Link>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
