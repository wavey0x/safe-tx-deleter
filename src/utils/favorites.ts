import { useCallback, useEffect, useMemo, useState } from "react";
import { type ChainKey } from "./chains";

export type FavoriteSafe = {
  chainKey: ChainKey;
  safeAddress: string;
  label?: string;
};

const STORAGE_KEY = "safe-deleter:favorites";

const loadFavorites = (): FavoriteSafe[] => {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as FavoriteSafe[];
  } catch {
    return [];
  }
};

const saveFavorites = (favorites: FavoriteSafe[]) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch {
    console.error("Failed to save favorites to localStorage");
  }
};

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoriteSafe[]>([]);

  useEffect(() => {
    setFavorites(loadFavorites());
  }, []);

  const isFavorite = useCallback(
    (chainKey: ChainKey, safeAddress: string) =>
      favorites.some(
        (fav) =>
          fav.chainKey === chainKey &&
          fav.safeAddress.toLowerCase() === safeAddress.toLowerCase()
      ),
    [favorites]
  );

  const toggleFavorite = useCallback(
    (entry: FavoriteSafe) => {
      setFavorites((prev) => {
        const exists = prev.some(
          (fav) =>
            fav.chainKey === entry.chainKey &&
            fav.safeAddress.toLowerCase() === entry.safeAddress.toLowerCase()
        );
        const next = exists
          ? prev.filter(
              (fav) =>
                !(
                  fav.chainKey === entry.chainKey &&
                  fav.safeAddress.toLowerCase() ===
                    entry.safeAddress.toLowerCase()
                )
            )
          : [...prev, entry];
        saveFavorites(next);
        return next;
      });
    },
    [setFavorites]
  );

  const value = useMemo(
    () => ({ favorites, toggleFavorite, isFavorite }),
    [favorites, toggleFavorite, isFavorite]
  );

  return value;
};
