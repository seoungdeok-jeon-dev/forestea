"use client";

import {
  getFavoriteItemIds,
  toggleFavorite as toggleFavoriteAction,
} from "@/app/account/favorites-actions";
import { useSession } from "next-auth/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface FavoritesContextValue {
  favorites: Set<string>;
  isReady: boolean;
  isFavorite: (itemId: string) => boolean;
  toggle: (itemId: string) => Promise<boolean>;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isReady, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (status === "authenticated") {
      void getFavoriteItemIds().then((ids) => {
        if (!cancelled) {
          setFavorites(new Set(ids));
          setReady(true);
        }
      });
    } else if (status === "unauthenticated") {
      setFavorites(new Set());
      setReady(true);
    }
    return () => {
      cancelled = true;
    };
  }, [status]);

  const isFavorite = useCallback(
    (itemId: string) => favorites.has(itemId),
    [favorites],
  );

  const toggle = useCallback(async (itemId: string) => {
    // Optimistic update
    let nextFavorited = false;
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
        nextFavorited = false;
      } else {
        next.add(itemId);
        nextFavorited = true;
      }
      return next;
    });

    const res = await toggleFavoriteAction(itemId);
    if (!res.ok) {
      // Revert on failure
      setFavorites((prev) => {
        const next = new Set(prev);
        if (nextFavorited) next.delete(itemId);
        else next.add(itemId);
        return next;
      });
      return !nextFavorited;
    }
    return res.favorited;
  }, []);

  return (
    <FavoritesContext.Provider value={{ favorites, isReady, isFavorite, toggle }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
