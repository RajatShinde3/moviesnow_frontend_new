// components/ProfileSelector.tsx
/**
 * Profile Selector - Shows active profile and allows switching
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { User } from "lucide-react";
import { useProfileStore } from "@/lib/stores/profileStore";

export function ProfileSelector() {
  const { activeProfile } = useProfileStore();

  if (!activeProfile) return null;

  return (
    <Link
      href="/profiles"
      className="flex items-center gap-2 rounded-lg border border-transparent px-3 py-2 transition-colors hover:border-border hover:bg-muted/50"
      title={`Active Profile: ${activeProfile.name}`}
    >
      <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 border-primary bg-muted">
        {activeProfile.avatar_url ? (
          <img
            src={activeProfile.avatar_url}
            alt={activeProfile.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <User className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
      <div className="hidden flex-col sm:flex">
        <span className="text-sm font-medium">{activeProfile.name}</span>
        <span className="text-xs text-muted-foreground">
          {activeProfile.is_primary ? "Primary Profile" : "Profile"}
        </span>
      </div>
    </Link>
  );
}
