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
import ToastsRoot from "@/components/feedback/Toasts";
import { ReauthProvider } from "@/components/ReauthDialog";
import ReactQueryProvider from "./providers/ReactQueryProvider";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryProvider>
      <ReauthProvider>
        <SubscriptionProvider>
          {/* Wrap app children with the Toast provider so useToast() works anywhere */}
          <ToastsRoot>
            <React.Suspense fallback={null}>{children}</React.Suspense>
          </ToastsRoot>
        </SubscriptionProvider>
      </ReauthProvider>
    </ReactQueryProvider>
  );
}
