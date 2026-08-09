"use client";

import { useFavorites } from "@/context/favorites-context";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function FavoriteButton({
  itemId,
  className = "",
}: {
  itemId: string;
  className?: string;
}) {
  const { status } = useSession();
  const { isFavorite, toggle } = useFavorites();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const favorited = isFavorite(itemId);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (status !== "authenticated") {
      router.push(`/login?callbackUrl=/menu`);
      return;
    }
    setBusy(true);
    await toggle(itemId);
    setBusy(false);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      aria-pressed={favorited}
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
      className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
        favorited
          ? "text-red-500"
          : "text-ink-muted hover:text-red-400"
      } ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill={favorited ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
      </svg>
    </button>
  );
}
