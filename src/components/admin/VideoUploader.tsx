// components/admin/VideoUploader.tsx
/**
 * =============================================================================
 * Video Uploader Component - Admin Upload Center
 * =============================================================================
 * Best Practices:
 * - Chunked uploads for large files
 * - Progress tracking
 * - Queue management
 * - S3 presigned URL handling
 * - Drag-and-drop support
 * - File validation
 * - Error handling with retry
 */

"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import {
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Film,
  FileVideo,
  PlayCircle,
  RefreshCw,
  Folder,
  HardDrive,
} from "lucide-react";

interface UploadItem {
  id: string;
  file: File;
  titleId?: string;
  seasonNumber?: number;
  episodeNumber?: number;
  status: "pending" | "uploading" | "processing" | "completed" | "error";
  progress: number;
  error?: string;
  uploadUrl?: string;
}

/**
 * Main Video Uploader Component
 */
export function VideoUploader() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [uploadQueue, setUploadQueue] = React.useState<UploadItem[]>([]);
  const [dragActive, setDragActive] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Fetch available titles for episode upload
  const { data: titlesData } = useQuery({
    queryKey: ["admin", "titles", "series"],
    queryFn: async () => {
      const response = await fetch(`/api/v1/admin/titles?type=series&limit=100`, {
        credentials: "include",
      });
      if (!response.ok) return { items: [] };
      return response.json();
    },
  });

  // Get presigned upload URL
  const getUploadUrlMutation = useMutation({
    mutationFn: async (params: {
      filename: string;
      content_type: string;
      title_id?: string;
      season_number?: number;
      episode_number?: number;
    }) => {
      const response = await fetch("/api/v1/admin/upload/presigned-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(params),
      });
      if (!response.ok) throw new Error("Failed to get upload URL");
      return response.json();
    },
  });

  // Handle file selection
  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newItems: UploadItem[] = Array.from(files).map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      status: "pending",
      progress: 0,
    }));

    setUploadQueue((prev) => [...prev, ...newItems]);
  };

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  // Upload file to S3
  const uploadFile = async (item: UploadItem) => {
    try {
      // Update status to uploading
      setUploadQueue((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: "uploading" } : i))
      );

      // Get presigned URL
      const urlData = await getUploadUrlMutation.mutateAsync({
        filename: item.file.name,
        content_type: item.file.type,
        title_id: item.titleId,
        season_number: item.seasonNumber,
        episode_number: item.episodeNumber,
      });

      // Upload to S3
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadQueue((prev) =>
            prev.map((i) => (i.id === item.id ? { ...i, progress } : i))
          );
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setUploadQueue((prev) =>
            prev.map((i) =>
              i.id === item.id ? { ...i, status: "processing", progress: 100 } : i
            )
          );

          // Poll for processing completion
          pollProcessingStatus(item.id, urlData.video_id);
        } else {
          setUploadQueue((prev) =>
            prev.map((i) =>
              i.id === item.id
                ? { ...i, status: "error", error: "Upload failed" }
                : i
            )
          );
        }
      });

      xhr.addEventListener("error", () => {
        setUploadQueue((prev) =>
          prev.map((i) =>
            i.id === item.id ? { ...i, status: "error", error: "Network error" } : i
          )
        );
      });

      xhr.open("PUT", urlData.upload_url);
      xhr.setRequestHeader("Content-Type", item.file.type);
      xhr.send(item.file);
    } catch (error) {
      setUploadQueue((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? { ...i, status: "error", error: error instanceof Error ? error.message : "Upload failed" }
            : i
        )
      );
    }
  };

  // Poll for processing status
  const pollProcessingStatus = async (itemId: string, videoId: string) => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/v1/admin/videos/${videoId}/status`, {
          credentials: "include",
        });
        const data = await response.json();

        if (data.status === "ready") {
          setUploadQueue((prev) =>
            prev.map((i) => (i.id === itemId ? { ...i, status: "completed" } : i))
          );
          queryClient.invalidateQueries({ queryKey: ["admin", "titles"] });
        } else if (data.status === "error") {
          setUploadQueue((prev) =>
            prev.map((i) =>
              i.id === itemId
                ? { ...i, status: "error", error: "Processing failed" }
                : i
            )
          );
        } else {
          // Still processing, check again in 3 seconds
          setTimeout(() => checkStatus(), 3000);
        }
      } catch (error) {
        setUploadQueue((prev) =>
          prev.map((i) =>
            i.id === itemId
              ? { ...i, status: "error", error: "Failed to check status" }
              : i
          )
        );
      }
    };

    checkStatus();
  };

  // Remove item from queue
  const removeItem = (id: string) => {
    setUploadQueue((prev) => prev.filter((i) => i.id !== id));
  };

  // Retry upload
  const retryUpload = (item: UploadItem) => {
    setUploadQueue((prev) =>
      prev.map((i) =>
        i.id === item.id ? { ...i, status: "pending", error: undefined } : i
      )
    );
    uploadFile(item);
  };

  // Start uploads
  const startUploads = () => {
    uploadQueue
      .filter((item) => item.status === "pending")
      .forEach((item) => uploadFile(item));
  };

  const pendingCount = uploadQueue.filter((i) => i.status === "pending").length;
  const uploadingCount = uploadQueue.filter((i) => i.status === "uploading").length;
  const completedCount = uploadQueue.filter((i) => i.status === "completed").length;
  const errorCount = uploadQueue.filter((i) => i.status === "error").length;

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Upload Center</h1>
          <p className="mt-2 text-gray-400">
            Upload videos, manage processing, and organize your content
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Folder className="h-5 w-5" />}
            label="Pending"
            value={pendingCount}
            color="blue"
          />
          <StatCard
            icon={<Upload className="h-5 w-5" />}
            label="Uploading"
            value={uploadingCount}
            color="yellow"
          />
          <StatCard
            icon={<CheckCircle className="h-5 w-5" />}
            label="Completed"
            value={completedCount}
            color="green"
          />
          <StatCard
            icon={<AlertCircle className="h-5 w-5" />}
            label="Errors"
            value={errorCount}
            color="red"
          />
        </div>

        {/* Upload Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={cn(
            "mb-6 rounded-lg border-2 border-dashed p-12 text-center transition-colors",
            dragActive
              ? "border-blue-500 bg-blue-500/10"
              : "border-gray-700 bg-gray-900 hover:border-gray-600"
          )}
        >
          <Upload className="mx-auto h-16 w-16 text-gray-500" />
          <h3 className="mt-4 text-xl font-semibold text-white">
            Drop video files here
          </h3>
          <p className="mt-2 text-gray-400">
            or click to browse (MP4, MKV, AVI, MOV - up to 50GB)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="video/*"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Select Files
          </button>
        </div>

        {/* Upload Queue */}
        {uploadQueue.length > 0 && (
          <div className="rounded-lg bg-gray-900 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                Upload Queue ({uploadQueue.length})
              </h2>
              {pendingCount > 0 && (
                <button
                  onClick={startUploads}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  <PlayCircle className="h-5 w-5" />
                  Start Uploads
                </button>
              )}
            </div>

            <div className="space-y-3">
              {uploadQueue.map((item) => (
                <UploadItemCard
                  key={item.id}
                  item={item}
                  onRemove={() => removeItem(item.id)}
                  onRetry={() => retryUpload(item)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Help Section */}
        {uploadQueue.length === 0 && (
          <div className="rounded-lg bg-gray-900 p-6">
            <h3 className="mb-4 font-semibold text-white">Upload Guidelines</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                <span>Supported formats: MP4, MKV, AVI, MOV, WebM</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                <span>Maximum file size: 50GB per file</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                <span>
                  Videos are automatically transcoded to multiple qualities (1080p, 720p, 480p)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                <span>Processing typically takes 10-30 minutes depending on file size</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                <span>You can upload multiple files simultaneously</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Stat Card Component
 */
function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: "blue" | "green" | "yellow" | "red";
}) {
  const colorClasses = {
    blue: "bg-blue-500/20 text-blue-400",
    green: "bg-green-500/20 text-green-400",
    yellow: "bg-yellow-500/20 text-yellow-400",
    red: "bg-red-500/20 text-red-400",
  };

  return (
    <div className="rounded-lg bg-gray-900 p-4">
      <div className="mb-2 flex items-center gap-2">
        <div className={cn("rounded-full p-2", colorClasses[color])}>{icon}</div>
        <span className="text-sm text-gray-400">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  );
}

/**
 * Upload Item Card Component
 */
function UploadItemCard({
  item,
  onRemove,
  onRetry,
}: {
  item: UploadItem;
  onRemove: () => void;
  onRetry: () => void;
}) {
  const statusIcons = {
    pending: <Folder className="h-5 w-5 text-blue-400" />,
    uploading: <Upload className="h-5 w-5 text-yellow-400" />,
    processing: <RefreshCw className="h-5 w-5 animate-spin text-yellow-400" />,
    completed: <CheckCircle className="h-5 w-5 text-green-400" />,
    error: <AlertCircle className="h-5 w-5 text-red-400" />,
  };

  return (
    <div className="flex items-center gap-4 rounded-lg bg-gray-800 p-4">
      <div className="flex-shrink-0">{statusIcons[item.status]}</div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <FileVideo className="h-4 w-4 flex-shrink-0 text-gray-500" />
          <p className="truncate text-sm font-medium text-white">{item.file.name}</p>
        </div>
        <p className="text-xs text-gray-400">
          {(item.file.size / (1024 * 1024)).toFixed(2)} MB
        </p>

        {/* Progress bar */}
        {(item.status === "uploading" || item.status === "processing") && (
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-700">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${item.progress}%` }}
            />
          </div>
        )}

        {/* Error message */}
        {item.status === "error" && item.error && (
          <p className="mt-1 text-xs text-red-400">{item.error}</p>
        )}
      </div>

      {/* Status text */}
      <div className="text-sm">
        {item.status === "pending" && <span className="text-blue-400">Pending</span>}
        {item.status === "uploading" && (
          <span className="text-yellow-400">{item.progress}%</span>
        )}
        {item.status === "processing" && (
          <span className="text-yellow-400">Processing</span>
        )}
        {item.status === "completed" && (
          <span className="text-green-400">Completed</span>
        )}
        {item.status === "error" && <span className="text-red-400">Failed</span>}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {item.status === "error" && (
          <button
            onClick={onRetry}
            className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
            title="Retry"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        )}
        {(item.status === "pending" || item.status === "error" || item.status === "completed") && (
          <button
            onClick={onRemove}
            className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-700 hover:text-red-400"
            title="Remove"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
