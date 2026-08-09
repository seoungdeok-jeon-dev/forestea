"use server";

import { auth } from "@/auth";
import { prisma } from "@forestea/db";

export async function getFavoriteItemIds(): Promise<string[]> {
  const session = await auth();
  if (!session?.user?.id) return [];
  const rows = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    select: { cloverItemId: true },
  });
  return rows.map((r) => r.cloverItemId);
}

export interface ToggleFavoriteResult {
  ok: boolean;
  favorited: boolean;
  error?: string;
}

export async function toggleFavorite(
  cloverItemId: string,
): Promise<ToggleFavoriteResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, favorited: false, error: "Not signed in" };
  }
  if (!cloverItemId) {
    return { ok: false, favorited: false, error: "Missing item id" };
  }

  const userId = session.user.id;
  const existing = await prisma.favorite.findUnique({
    where: { userId_cloverItemId: { userId, cloverItemId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return { ok: true, favorited: false };
  }

  await prisma.favorite.create({ data: { userId, cloverItemId } });
  return { ok: true, favorited: true };
}
