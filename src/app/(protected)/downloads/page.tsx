// app/(protected)/downloads/page.tsx
/**
 * =============================================================================
 * Downloads Page - Manage offline downloads
 * =============================================================================
 */

"use client";

import * as React from "react";
import { api } from "@/lib/api/services";
import { Button } from "@/components/ui/Button";
import { useQuery } from "@tanstack/react-query";
import { Download, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function DownloadsPage() {
  const { data: downloads, isLoading } = useQuery({
    queryKey: ["downloads"],
    queryFn: () => api.downloads.getAll(),
  });

  const { data: bundles, isLoading: bundlesLoading } = useQuery({
    queryKey: ["bundles"],
    queryFn: () => api.downloads.getBundles(),
  });

  const handleDownload = async (bundleId: string) => {
    try {
      const response = await api.downloads.getBundleDownloadUrl(bundleId);
      const download_url = response?.download_url;
      if (download_url) {
        window.open(download_url, "_blank");
      }
    } catch (error) {
      console.error("Failed to get download URL:", error);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-2xl space-y-8">
          {/* Header */}
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-bold">
              <Download className="h-8 w-8" />
              Downloads
            </h1>
            <p className="mt-2 text-muted-foreground">
              Manage your offline downloads
            </p>
          </div>

          {/* Available Bundles */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Available Bundles</h2>
            {bundlesLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            ) : bundles && bundles.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {bundles.map((bundle) => (
                  <div
                    key={bundle.id}
                    className="flex flex-col justify-between rounded-lg border bg-card p-6"
                  >
                    <div>
                      <h3 className="font-semibold">{bundle.name}</h3>
                      {bundle.description && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          {bundle.description}
                        </p>
                      )}
                      <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
                        {bundle.size_bytes && (
                          <span>{(bundle.size_bytes / 1024 / 1024 / 1024).toFixed(2)} GB</span>
                        )}
                        {bundle.file_count && <span>{bundle.file_count} files</span>}
                      </div>
                    </div>

                    <Button
                      className="mt-4"
                      onClick={() => handleDownload(bundle.id)}
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <p className="text-sm text-muted-foreground">No bundles available</p>
              </div>
            )}
          </section>

          {/* My Downloads */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">My Downloads</h2>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            ) : downloads && downloads.length > 0 ? (
              <div className="space-y-3">
                {downloads.map((download) => (
                  <div
                    key={download.id}
                    className="flex items-center justify-between rounded-lg border bg-card p-4"
                  >
                    <div className="flex-1">
                      <p className="font-medium">
                        {download.quality} • {download.title_id}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Downloaded on {new Date(download.downloaded_at || download.expires_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {download.download_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(download.download_url!, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                      <Button size="sm" variant="ghost">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-12 text-center">
                <Download className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 font-medium">No downloads yet</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Download titles to watch offline
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
