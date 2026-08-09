import { getPostBySlug } from "@/lib/posts";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post || !post.published) notFound();

  return (
    <article className="mx-auto w-full max-w-3xl px-6 py-12 md:py-16">
      <Link href="/news" className="text-sm text-ink-soft hover:text-ink">
        ← Back to news
      </Link>

      <p className="mt-6 text-xs font-medium uppercase tracking-[0.28em] text-ink-muted">
        {post.type === "NEW_MENU" ? "New Menu" : "Announcement"}
      </p>
      <h1 className="font-display mt-3 text-4xl text-ink md:text-5xl">{post.title}</h1>
      {post.publishedAt && (
        <p className="mt-3 text-sm text-ink-muted">
          {new Date(post.publishedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      )}

      {post.coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.coverImage}
          alt={post.title}
          className="mt-8 w-full rounded-2xl object-cover"
        />
      )}

      <div className="mt-8 whitespace-pre-wrap text-base leading-relaxed text-ink-soft">
        {post.body}
      </div>

      <div className="mt-12 border-t border-line pt-8">
        <Link
          href="/menu"
          className="inline-block rounded-full bg-accent px-6 py-3 font-medium text-on-accent hover:bg-accent-hover"
        >
          Order now
        </Link>
      </div>
    </article>
  );
}
