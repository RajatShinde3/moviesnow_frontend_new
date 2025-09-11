// app/providers.tsx
"use client";

/**
 * =============================================================================
 * Providers
 * =============================================================================
 * Mounts global client-side providers once for the whole app:
 *  • ReauthDialogProvider (step-up flows)
 *  • ToastsRoot (portal for useToast)
 *
 * Notes
 * -----
 * • <React.Suspense/> keeps lazy client components from throwing during
 *   transition boundaries without introducing layout shifts.
 * • Keep portals after children so they render at the end of <body>.
 */

import * as React from "react";
import { ToastsRoot } from "@/components/Toasts";
import { ReauthDialogProvider } from "@/components/ReauthDialog";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReauthDialogProvider>
      <React.Suspense fallback={null}>{children}</React.Suspense>
      {/* Portals live at the end of <body> to layer correctly above content */}
      <ToastsRoot />
    </ReauthDialogProvider>
  );
}
