// lib/stores/profileStore.ts
/**
 * Profile Store - Active Profile Management
 * Tracks which profile is currently active for the user
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ActiveProfile {
  id: string;
  name: string;
  avatar_url?: string;
  is_primary: boolean;
}

interface ProfileStore {
  activeProfile: ActiveProfile | null;
  setActiveProfile: (profile: ActiveProfile | null) => void;
  clearActiveProfile: () => void;
}

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      activeProfile: null,
      setActiveProfile: (profile) => set({ activeProfile: profile }),
      clearActiveProfile: () => set({ activeProfile: null }),
    }),
    {
      name: 'active-profile-storage',
    }
  )
);
