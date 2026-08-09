"use server";

import { auth } from "@/auth";
import { prisma } from "@forestea/db";
import { revalidatePath } from "next/cache";

async function requireAdmin(): Promise<string> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Not authorized");
  }
  return session.user.id;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export interface PostActionResult {
  ok: boolean;
  error?: string;
  slug?: string;
}

export async function createPost(formData: FormData): Promise<PostActionResult> {
  let authorId: string;
  try {
    authorId = await requireAdmin();
  } catch {
    return { ok: false, error: "Not authorized" };
  }

  const title = (formData.get("title") as string | null)?.trim();
  const body = (formData.get("body") as string | null)?.trim();
  const excerpt = (formData.get("excerpt") as string | null)?.trim() || null;
  const coverImage = (formData.get("coverImage") as string | null)?.trim() || null;
  const type = (formData.get("type") as string | null) === "NEW_MENU"
    ? "NEW_MENU"
    : "ANNOUNCEMENT";
  const published = formData.get("published") === "on";

  if (!title || !body) {
    return { ok: false, error: "Title and body are required." };
  }

  const base = slugify(title) || "post";
  let slug = base;
  let n = 1;
  while (await prisma.post.findUnique({ where: { slug } })) {
    slug = `${base}-${n++}`;
  }

  await prisma.post.create({
    data: {
      slug,
      title,
      body,
      excerpt,
      coverImage,
      type,
      published,
      publishedAt: published ? new Date() : null,
      authorId,
    },
  });

  revalidatePath("/news");
  revalidatePath("/menu/featured");
  revalidatePath("/admin/posts");
  revalidatePath("/");
  return { ok: true, slug };
}

export async function togglePublish(id: string): Promise<PostActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Not authorized" };
  }

  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return { ok: false, error: "Post not found" };

  const nextPublished = !post.published;
  await prisma.post.update({
    where: { id },
    data: {
      published: nextPublished,
      publishedAt: nextPublished ? (post.publishedAt ?? new Date()) : post.publishedAt,
    },
  });

  revalidatePath("/news");
  revalidatePath("/menu/featured");
  revalidatePath("/admin/posts");
  revalidatePath("/");
  return { ok: true };
}

export async function deletePost(id: string): Promise<PostActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Not authorized" };
  }
  await prisma.post.delete({ where: { id } });
  revalidatePath("/news");
  revalidatePath("/menu/featured");
  revalidatePath("/admin/posts");
  revalidatePath("/");
  return { ok: true };
}
