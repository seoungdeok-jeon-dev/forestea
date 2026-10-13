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
    <article className="pb-24 md:pb-32">
      <div className="mx-auto w-full max-w-[720px] px-5 pt-10 sm:px-8 sm:pt-14 md:pt-16">
        <Link
          href="/news"
          className="text-[0.8rem] font-medium tracking-[0.06em] text-ink/55 transition-colors hover:text-ink"
        >
          ← News
        </Link>

        <header className="mt-10 md:mt-12">
          <p className="text-[0.7rem] font-medium tracking-[0.18em] text-ink-muted">
            {dateLabel ? `${typeLabel} · ${dateLabel}` : typeLabel}
          </p>
          <h1 className="font-display mt-4 text-[clamp(2.35rem,5.5vw,3.75rem)] leading-[1.02] tracking-[-0.035em] text-ink">
            {post.title}
          </h1>
        </header>
      </div>

      {post.coverImage ? (
        <div className="mx-auto mt-10 w-full max-w-[1100px] px-5 sm:px-8 md:mt-14">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.coverImage}
            alt=""
            className="aspect-[16/9] w-full object-cover md:aspect-[2/1]"
          />
        </div>
      ) : null}

      <div className="mx-auto mt-10 w-full max-w-[720px] px-5 sm:px-8 md:mt-14">
        <div className="whitespace-pre-wrap text-[1.08rem] leading-[1.8] text-ink-soft">
          {post.body}
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-black/5 pt-8">
          <Link
            href="/news"
            className="text-[0.8rem] font-medium tracking-[0.06em] text-ink/55 transition-colors hover:text-ink"
          >
            ← All news
          </Link>
          <Link
            href="/menu"
            className="text-[0.8rem] font-medium tracking-[0.06em] text-ink/55 transition-colors hover:text-ink"
          >
            View menu →
          </Link>
        </div>
      </div>
    </article>
  );
}
