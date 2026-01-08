// src/hooks/useFavorite.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { guestDashboardApi } from "@/lib/api/guest-dashboard-api";
import { useToast } from "@/hooks/use-toast";

const PENDING_FAVORITE_KEY = "pendingFavoriteHomestayId";

interface UseFavoriteReturn {
  favorites: Set<number>;
  isFavorite: (homestayId: number) => boolean;
  toggleFavorite: (homestayId: number, e?: React.MouseEvent) => Promise<void>;
  isLoading: boolean;
  isToggling: number | null;
}

export function useFavorite(): UseFavoriteReturn {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isToggling, setIsToggling] = useState<number | null>(null);

  const isAuthenticated = status === "authenticated";

  // Load favorites when authenticated
  useEffect(() => {
    const loadFavorites = async () => {
      if (!isAuthenticated) {
        setFavorites(new Set());
        return;
      }

      try {
        setIsLoading(true);
        const data = await guestDashboardApi.getFavorites();
        const favoriteIds = new Set(data.map((f) => f.homestayId));
        setFavorites(favoriteIds);
      } catch (error) {
        console.error("Failed to load favorites:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFavorites();
  }, [isAuthenticated]);

  // Process pending favorite after login
  useEffect(() => {
    const processPendingFavorite = async () => {
      if (!isAuthenticated) return;

      const pendingId = localStorage.getItem(PENDING_FAVORITE_KEY);
      if (!pendingId) return;

      const homestayId = parseInt(pendingId, 10);
      if (isNaN(homestayId)) {
        localStorage.removeItem(PENDING_FAVORITE_KEY);
        return;
      }

      // Clear the pending favorite first
      localStorage.removeItem(PENDING_FAVORITE_KEY);

      // Add to favorites if not already favorited
      if (!favorites.has(homestayId)) {
        try {
          await guestDashboardApi.addFavorite(homestayId);
          setFavorites((prev) => new Set([...prev, homestayId]));
          toast({
            title: "Added to favorites",
            description: "The homestay has been added to your favorites.",
          });
        } catch (error: any) {
          console.error("Failed to add pending favorite:", error);
          toast({
            title: "Error",
            description: error.message || "Failed to add to favorites",
            variant: "destructive",
          });
        }
      }
    };

    processPendingFavorite();
  }, [isAuthenticated, favorites, toast]);

  const isFavorite = useCallback(
    (homestayId: number): boolean => {
      return favorites.has(homestayId);
    },
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (homestayId: number, e?: React.MouseEvent) => {
      // Prevent event propagation (e.g., card click)
      if (e) {
        e.stopPropagation();
        e.preventDefault();
      }

      // If not authenticated, store pending favorite and redirect to signin
      if (!isAuthenticated) {
        localStorage.setItem(PENDING_FAVORITE_KEY, homestayId.toString());
        const currentPath = window.location.pathname;
        router.push(`/signin?returnUrl=${encodeURIComponent(currentPath)}`);
        return;
      }

      setIsToggling(homestayId);

      try {
        if (favorites.has(homestayId)) {
          // Remove from favorites
          await guestDashboardApi.removeFavorite(homestayId);
          setFavorites((prev) => {
            const newSet = new Set(prev);
            newSet.delete(homestayId);
            return newSet;
          });
          toast({
            title: "Removed from favorites",
            description: "The homestay has been removed from your favorites.",
          });
        } else {
          // Add to favorites
          await guestDashboardApi.addFavorite(homestayId);
          setFavorites((prev) => new Set([...prev, homestayId]));
          toast({
            title: "Added to favorites",
            description: "The homestay has been added to your favorites.",
          });
        }
      } catch (error: any) {
        console.error("Failed to toggle favorite:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to update favorites",
          variant: "destructive",
        });
      } finally {
        setIsToggling(null);
      }
    },
    [isAuthenticated, favorites, router, toast]
  );

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    isLoading,
    isToggling,
  };
}

// Simpler hook for individual components that just need toggle functionality
export function useFavoriteButton(homestayId: number) {
  const { isFavorite, toggleFavorite, isToggling } = useFavorite();

  return {
    isFavorited: isFavorite(homestayId),
    isToggling: isToggling === homestayId,
    toggle: (e?: React.MouseEvent) => toggleFavorite(homestayId, e),
  };
}
