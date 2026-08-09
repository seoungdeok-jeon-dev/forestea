import { prisma } from "@forestea/db";
import type { Post, PostType } from "@forestea/db";

export type { Post };

export async function getPublishedPosts(type?: PostType): Promise<Post[]> {
  return prisma.post.findMany({
    where: { published: true, ...(type ? { type } : {}) },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  return prisma.post.findUnique({ where: { slug } });
}

export async function getAllPosts(): Promise<Post[]> {
  return prisma.post.findMany({ orderBy: { updatedAt: "desc" } });
}
