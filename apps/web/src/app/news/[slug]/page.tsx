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

  const typeLabel = post.type === "NEW_MENU" ? "New menu" : "Note";
  const dateLabel = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <article className="mx-auto w-full max-w-[720px] px-5 pb-20 pt-10 sm:px-8 sm:pt-14 md:pb-28 md:pt-16">
      <Link
        href="/news"
        className="text-[0.8rem] font-medium tracking-[0.04em] text-ink/70 transition-colors hover:text-ink"
      >
        ← News
      </Link>

      <header className="mt-8 md:mt-10">
        <p className="text-[0.7rem] font-medium tracking-[0.14em] text-ink-muted">
          {dateLabel ? `${typeLabel} · ${dateLabel}` : typeLabel}
        </p>
        <h1 className="font-display mt-3 text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.02] tracking-[-0.035em] text-ink">
          {post.title}
        </h1>
      </header>

      {post.coverImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.coverImage}
          alt=""
          className="mt-10 aspect-[16/10] w-full rounded-[1.25rem] object-cover md:mt-12"
        />
      ) : null}

      <div className="mt-10 whitespace-pre-wrap text-[1.05rem] leading-[1.75] text-ink-soft md:mt-12">
        {post.body}
      </div>

      <div className="mt-14 border-t border-black/5 pt-8">
        <Link
          href="/menu"
          className="text-[0.8rem] font-medium tracking-[0.04em] text-ink/70 transition-colors hover:text-ink"
        >
          View menu →
        </Link>
      </div>
    </article>
  );
}
