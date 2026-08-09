import { MenuTabs } from "@/components/menu-tabs";
import { PostCard } from "@/components/post-card";
import { getPublishedPosts } from "@/lib/posts";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function FeaturedPage() {
  const posts = await getPublishedPosts("NEW_MENU");

  return (
    <div className="mx-auto w-full max-w-[1440px] px-6 py-12 md:py-16">
      <header className="mb-10">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-ink-muted">
          What&apos;s new
        </p>
        <h1 className="font-display mt-3 text-4xl text-ink md:text-5xl">Featured</h1>
      </header>
      <MenuTabs />

      {posts.length === 0 ? (
        <p className="py-16 text-center text-ink-muted">
          No featured items yet. Check back soon!
        </p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      <p className="mt-10 text-sm text-ink-soft">
        Looking for the full menu?{" "}
        <Link href="/menu" className="font-medium text-accent hover:underline">
          Browse all items
        </Link>
      </p>
    </div>
  );
}
