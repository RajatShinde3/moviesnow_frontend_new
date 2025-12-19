/**
 * useVerificationStatus Hook
 * ===========================
 *
 * Polls the backend to check if an email has been verified.
 * Useful for showing real-time verification status after signup.
 *
 * Features:
 * - Automatic polling with configurable interval
 * - Stops polling when verified
 * - Error handling and retry logic
 * - Type-safe return values
 */

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/lib/env";

interface VerificationStatusResponse {
  is_verified: boolean;
  message: string;
}

export interface UseVerificationStatusOptions {
  email: string | null;
  enabled?: boolean;
  pollingInterval?: number; // milliseconds
  stopWhenVerified?: boolean;
}

export function useVerificationStatus({
  email,
  enabled = true,
  pollingInterval = 3000, // 3 seconds
  stopWhenVerified = true,
}: UseVerificationStatusOptions) {
  const [isVerified, setIsVerified] = useState(false);

  const { data, isLoading, error, refetch } = useQuery<VerificationStatusResponse>({
    queryKey: ["verification-status", email],
    queryFn: async () => {
      if (!email) {
        throw new Error("Email is required");
      }

      const url = new URL(`${API_ENDPOINTS.BASE_URL}/api/v1/auth/verify-email/status`);
      url.searchParams.set("email", email);

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Failed to check verification status: ${response.statusText}`);
      }

      return response.json();
    },
    enabled: enabled && !!email && !isVerified,
    refetchInterval: (query) => {
      // Stop polling if verified or disabled
      if (stopWhenVerified && query.state.data?.is_verified) {
        return false;
      }
      return pollingInterval;
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Update local state when data changes
  useEffect(() => {
    if (data?.is_verified) {
      setIsVerified(true);
    }
  }, [data?.is_verified]);

  return {
    isVerified: data?.is_verified ?? false,
    message: data?.message ?? "",
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
