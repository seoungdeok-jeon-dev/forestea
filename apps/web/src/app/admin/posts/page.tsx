import { auth } from "@/auth";
import { PostEditor } from "@/components/admin/post-editor";
import { PostRowActions } from "@/components/admin/post-row-actions";
import { getAllPosts } from "@/lib/posts";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin/posts");
  }
  if (session.user.role !== "ADMIN") {
    return (
      <div className="mx-auto w-full max-w-2xl px-6 py-16 text-center">
        <h1 className="font-display text-3xl text-ink">Admins only</h1>
        <p className="mt-3 text-ink-soft">
          Your account does not have admin access. Ask an owner to add your email to
          <code className="mx-1 rounded bg-subtle px-1">ADMIN_EMAILS</code>.
        </p>
        <Link href="/" className="mt-6 inline-block text-accent hover:underline">
          Back home
        </Link>
      </div>
    );
  }

  const posts = await getAllPosts();

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12 md:py-16">
      <header className="mb-10">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-ink-muted">
          Admin
        </p>
        <h1 className="font-display mt-3 text-4xl text-ink md:text-5xl">Manage posts</h1>
      </header>

      <PostEditor />

      <h2 className="font-display mt-12 mb-4 text-xl text-ink">All posts</h2>
      {posts.length === 0 ? (
        <p className="text-ink-muted">No posts yet.</p>
      ) : (
        <div className="divide-y divide-line rounded-2xl border border-line bg-card">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex flex-wrap items-center justify-between gap-3 p-4"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">{post.title}</p>
                <p className="text-xs text-ink-muted">
                  {post.type} ·{" "}
                  {post.published ? (
                    <span className="text-green-700">Published</span>
                  ) : (
                    <span className="text-amber-700">Draft</span>
                  )}{" "}
                  · /news/{post.slug}
                </p>
              </div>
              <PostRowActions id={post.id} published={post.published} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
