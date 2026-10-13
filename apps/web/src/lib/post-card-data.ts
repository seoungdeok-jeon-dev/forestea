import type { Post } from "@/lib/posts";
import type { PostCardData } from "@/components/post-card";

const TYPE_LABEL: Record<string, string> = {
  NEW_MENU: "New menu",
  ANNOUNCEMENT: "Note",
};

function formatPostDate(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function toPostCardData(post: Post): PostCardData {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    coverImage: post.coverImage,
    typeLabel: TYPE_LABEL[post.type] ?? post.type,
    dateLabel: formatPostDate(post.publishedAt),
  };
}
