import type { Post } from "@/lib/posts";
import Link from "next/link";

const TYPE_LABEL: Record<string, string> = {
  NEW_MENU: "New Menu",
  ANNOUNCEMENT: "Announcement",
};

export function PostCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/news/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-card transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-subtle">
        {post.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImage}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl">
            🌿
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-surface/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink">
          {TYPE_LABEL[post.type] ?? post.type}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-xl text-ink transition-colors group-hover:text-accent">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-2 line-clamp-2 text-sm text-ink-soft">{post.excerpt}</p>
        )}
        {post.publishedAt && (
          <p className="mt-3 text-xs text-ink-muted">
            {new Date(post.publishedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        )}
      </div>
    </Link>
  );
}
