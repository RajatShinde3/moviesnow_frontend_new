// app/(protected)/title/[slug]/AddToWatchlistButton.tsx
"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Plus, Check } from "lucide-react";
import { api } from "@/lib/api/services";

export function AddToWatchlistButton({ titleId }: { titleId: string }) {
  const [isInWatchlist, setIsInWatchlist] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    // Check if already in watchlist
    api.watchlist.get().then((items) => {
      setIsInWatchlist(items?.some((item) => item.title_id === titleId) || false);
    }).catch(() => {});
  }, [titleId]);

  const handleToggle = async () => {
    setLoading(true);
    try {
      if (isInWatchlist) {
        // Find and remove
        const items = await api.watchlist.get();
        const item = items?.find((i) => i.title_id === titleId);
        if (item) {
          await api.watchlist.remove(item.id);
          setIsInWatchlist(false);
        }
      } else {
        await api.watchlist.add(titleId);
        setIsInWatchlist(true);
      }
    } catch (error) {
      console.error("Failed to toggle watchlist:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size="lg"
      variant="info"
      onClick={handleToggle}
      loading={loading}
    >
      {isInWatchlist ? (
        <>
          <Check className="h-5 w-5" />
          In Watchlist
        </>
      ) : (
        <>
          <Plus className="h-5 w-5" />
          Add to Watchlist
        </>
      )}
    </Button>
  );
}
