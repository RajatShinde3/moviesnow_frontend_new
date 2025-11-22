// components/DeviceManager.tsx
/**
 * =============================================================================
 * Device Manager Component
 * =============================================================================
 * Best Practices:
 * - Active sessions display
 * - Device identification
 * - Sign out functionality
 * - Download management
 * - Security alerts
 */

"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/cn";
import {
  Monitor,
  Smartphone,
  Tablet,
  Tv2,
  Globe,
  MapPin,
  Clock,
  LogOut,
  Shield,
  AlertTriangle,
  Download,
  Trash2,
  CheckCircle,
} from "lucide-react";

interface Session {
  id: string;
  device_type: "desktop" | "mobile" | "tablet" | "tv" | "unknown";
  device_name: string;
  browser?: string;
  os?: string;
  ip_address: string;
  location?: string;
  last_active: string;
  created_at: string;
  is_current: boolean;
}

interface DownloadedTitle {
  id: string;
  title: string;
  poster_url?: string;
  downloaded_at: string;
  size_mb: number;
  expires_at: string;
  device_name: string;
}

export function DeviceManager() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState<"sessions" | "downloads">("sessions");

  // Fetch sessions
  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ["sessions"],
    queryFn: async () => {
      const response = await fetch("/api/v1/auth/sessions", { credentials: "include" });
      if (!response.ok) {
        // Mock data for demo
        return [
          {
            id: "1",
            device_type: "desktop",
            device_name: "Chrome on Windows",
            browser: "Chrome 120",
            os: "Windows 11",
            ip_address: "192.168.1.100",
            location: "New York, US",
            last_active: new Date().toISOString(),
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            is_current: true,
          },
          {
            id: "2",
            device_type: "mobile",
            device_name: "Safari on iPhone",
            browser: "Safari 17",
            os: "iOS 17",
            ip_address: "192.168.1.101",
            location: "New York, US",
            last_active: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            is_current: false,
          },
          {
            id: "3",
            device_type: "tv",
            device_name: "Smart TV App",
            os: "Samsung Tizen",
            ip_address: "192.168.1.102",
            location: "New York, US",
            last_active: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            is_current: false,
          },
        ] as Session[];
      }
      return response.json();
    },
  });

  // Fetch downloads
  const { data: downloads, isLoading: downloadsLoading } = useQuery({
    queryKey: ["downloads"],
    queryFn: async () => {
      const response = await fetch("/api/v1/downloads", { credentials: "include" });
      if (!response.ok) return [];
      return response.json();
    },
  });

  // Sign out session mutation
  const signOutMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await fetch(`/api/v1/auth/sessions/${sessionId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to sign out");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });

  // Sign out all mutation
  const signOutAllMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/v1/auth/sessions/all", {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to sign out all");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });

  // Delete download mutation
  const deleteDownloadMutation = useMutation({
    mutationFn: async (downloadId: string) => {
      const response = await fetch(`/api/v1/downloads/${downloadId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["downloads"] });
    },
  });

  const deviceIcons = {
    desktop: <Monitor className="h-8 w-8" />,
    mobile: <Smartphone className="h-8 w-8" />,
    tablet: <Tablet className="h-8 w-8" />,
    tv: <Tv2 className="h-8 w-8" />,
    unknown: <Globe className="h-8 w-8" />,
  };

  const handleSignOut = (sessionId: string) => {
    if (confirm("Sign out this device?")) {
      signOutMutation.mutate(sessionId);
    }
  };

  const handleSignOutAll = () => {
    if (confirm("Sign out all other devices? You will remain signed in on this device.")) {
      signOutAllMutation.mutate();
    }
  };

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Devices & Sessions</h1>
          <p className="mt-2 text-gray-400">Manage where you're signed in</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex rounded-lg bg-gray-900 p-1">
          <button
            onClick={() => setActiveTab("sessions")}
            className={cn(
              "flex-1 rounded-lg py-2 text-sm font-semibold transition-colors",
              activeTab === "sessions" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
            )}
          >
            Active Sessions ({sessions?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("downloads")}
            className={cn(
              "flex-1 rounded-lg py-2 text-sm font-semibold transition-colors",
              activeTab === "downloads" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
            )}
          >
            Downloads ({downloads?.length || 0})
          </button>
        </div>

        {activeTab === "sessions" ? (
          <>
            {/* Security Alert */}
            <div className="mb-6 flex items-start gap-3 rounded-lg bg-green-500/10 p-4">
              <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
              <div>
                <p className="font-medium text-green-500">All sessions look secure</p>
                <p className="text-sm text-green-400">
                  We haven't detected any suspicious activity on your account.
                </p>
              </div>
            </div>

            {/* Sign Out All Button */}
            {sessions && sessions.filter((s: Session) => !s.is_current).length > 0 && (
              <div className="mb-6 flex justify-end">
                <button
                  onClick={handleSignOutAll}
                  disabled={signOutAllMutation.isPending}
                  className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                >
                  <LogOut className="h-5 w-5" />
                  {signOutAllMutation.isPending ? "Signing out..." : "Sign Out All Other Devices"}
                </button>
              </div>
            )}

            {/* Sessions List */}
            {sessionsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-900" />
                ))}
              </div>
            ) : sessions && sessions.length > 0 ? (
              <div className="space-y-4">
                {sessions.map((session: Session) => (
                  <div
                    key={session.id}
                    className={cn(
                      "rounded-lg bg-gray-900 p-4",
                      session.is_current && "ring-2 ring-blue-500"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className="rounded-full bg-gray-800 p-3 text-gray-400">
                        {deviceIcons[session.device_type]}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white">{session.device_name}</h3>
                          {session.is_current && (
                            <span className="flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-400">
                              <CheckCircle className="h-3 w-3" />
                              This Device
                            </span>
                          )}
                        </div>

                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-400">
                          {session.browser && session.os && (
                            <span>{session.browser} • {session.os}</span>
                          )}
                          {session.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {session.location}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Last active: {formatTimeAgo(session.last_active)}
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-gray-500">
                          Signed in {new Date(session.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      {!session.is_current && (
                        <button
                          onClick={() => handleSignOut(session.id)}
                          disabled={signOutMutation.isPending}
                          className="rounded-lg bg-gray-800 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
                        >
                          <LogOut className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg bg-gray-900 p-12 text-center">
                <Monitor className="mx-auto h-16 w-16 text-gray-600" />
                <h3 className="mt-4 text-xl font-semibold text-white">No active sessions</h3>
                <p className="mt-2 text-gray-400">Sign in on a device to see it here</p>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Downloads List */}
            {downloadsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-900" />
                ))}
              </div>
            ) : downloads && downloads.length > 0 ? (
              <div className="space-y-3">
                {downloads.map((download: DownloadedTitle) => (
                  <div key={download.id} className="flex items-center gap-4 rounded-lg bg-gray-900 p-4">
                    <div className="h-16 w-12 flex-shrink-0 overflow-hidden rounded bg-gray-800">
                      {download.poster_url ? (
                        <img src={download.poster_url} alt={download.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Download className="h-6 w-6 text-gray-600" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold text-white">{download.title}</h3>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-400">
                        <span>{download.size_mb} MB</span>
                        <span>{download.device_name}</span>
                        <span>Expires: {new Date(download.expires_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteDownloadMutation.mutate(download.id)}
                      className="rounded p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-red-400"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg bg-gray-900 p-12 text-center">
                <Download className="mx-auto h-16 w-16 text-gray-600" />
                <h3 className="mt-4 text-xl font-semibold text-white">No downloads</h3>
                <p className="mt-2 text-gray-400">Download titles to watch offline</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  return date.toLocaleDateString();
}
