// app/(protected)/admin/upload/page.tsx
/**
 * =============================================================================
 * Admin - Media Upload Interface
 * =============================================================================
 * Upload videos, posters, subtitles using AWS S3 presigned URLs
 */

"use client";

import * as React from "react";
import { api } from "@/lib/api/services";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useMutation } from "@tanstack/react-query";
import { Upload, CheckCircle, XCircle, Loader2, Film, Image, FileText } from "lucide-react";

type UploadType = "video" | "poster" | "backdrop" | "subtitle";

interface UploadItem {
  id: string;
  file: File;
  type: UploadType;
  status: "pending" | "uploading" | "success" | "error";
  progress: number;
  error?: string;
  uploadUrl?: string;
}

export default function AdminUploadPage() {
  const [uploads, setUploads] = React.useState<UploadItem[]>([]);
  const [titleId, setTitleId] = React.useState("");

  const requestUploadUrl = useMutation({
    mutationFn: async ({ key, contentType }: { key: string; contentType: string }) => {
      return api.admin.requestUploadUrl({ key, content_type: contentType });
    },
  });

  const handleFileSelect = (files: FileList | null, type: UploadType) => {
    if (!files) return;

    const newUploads: UploadItem[] = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      type,
      status: "pending",
      progress: 0,
    }));

    setUploads((prev) => [...prev, ...newUploads]);
  };

  const uploadFile = async (upload: UploadItem) => {
    try {
      // Update status to uploading
      setUploads((prev) =>
        prev.map((u) => (u.id === upload.id ? { ...u, status: "uploading" as const } : u))
      );

      // Request presigned URL
      const key = `uploads/${upload.type}/${Date.now()}-${upload.file.name}`;
      const response = await requestUploadUrl.mutateAsync({
        key,
        contentType: upload.file.type,
      });
      const upload_url = response?.upload_url;
      if (!upload_url) {
        throw new Error("Failed to get upload URL");
      }

      // Upload to S3
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploads((prev) =>
            prev.map((u) => (u.id === upload.id ? { ...u, progress } : u))
          );
        }
      });

      await new Promise((resolve, reject) => {
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(xhr.response);
          } else {
            reject(new Error(`Upload failed: ${xhr.status}`));
          }
        });

        xhr.addEventListener("error", () => reject(new Error("Upload failed")));
        xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));

        xhr.open("PUT", upload_url);
        xhr.setRequestHeader("Content-Type", upload.file.type);
        xhr.send(upload.file);
      });

      // Mark as success
      setUploads((prev) =>
        prev.map((u) =>
          u.id === upload.id ? { ...u, status: "success" as const, progress: 100 } : u
        )
      );
    } catch (error: any) {
      console.error("Upload failed:", error);
      setUploads((prev) =>
        prev.map((u) =>
          u.id === upload.id
            ? { ...u, status: "error" as const, error: error.message }
            : u
        )
      );
    }
  };

  const uploadAll = () => {
    uploads
      .filter((u) => u.status === "pending")
      .forEach((upload) => uploadFile(upload));
  };

  const removeUpload = (id: string) => {
    setUploads((prev) => prev.filter((u) => u.id !== id));
  };

  const clearCompleted = () => {
    setUploads((prev) => prev.filter((u) => u.status !== "success"));
  };

  const getIcon = (type: UploadType) => {
    switch (type) {
      case "video":
        return Film;
      case "poster":
      case "backdrop":
        return Image;
      case "subtitle":
        return FileText;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="min-h-screen">
      <div className="space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-xl space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">Media Upload</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload videos, images, and subtitles to AWS S3
            </p>
          </div>

          {/* Upload Sections */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Video Upload */}
            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-3">
                  <Film className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Video Files</h3>
                  <p className="text-sm text-muted-foreground">MP4, MKV, AVI</p>
                </div>
              </div>
              <label className="mt-4 block">
                <input
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={(e) => handleFileSelect(e.target.files, "video")}
                  className="hidden"
                />
                <Button variant="outline" className="w-full" asChild>
                  <span>
                    <Upload className="h-4 w-4" />
                    Select Videos
                  </span>
                </Button>
              </label>
            </div>

            {/* Poster Upload */}
            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-purple-500/10 p-3">
                  <Image className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Posters</h3>
                  <p className="text-sm text-muted-foreground">JPG, PNG (2:3 ratio)</p>
                </div>
              </div>
              <label className="mt-4 block">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileSelect(e.target.files, "poster")}
                  className="hidden"
                />
                <Button variant="outline" className="w-full" asChild>
                  <span>
                    <Upload className="h-4 w-4" />
                    Select Posters
                  </span>
                </Button>
              </label>
            </div>

            {/* Backdrop Upload */}
            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-500/10 p-3">
                  <Image className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Backdrops</h3>
                  <p className="text-sm text-muted-foreground">JPG, PNG (16:9 ratio)</p>
                </div>
              </div>
              <label className="mt-4 block">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileSelect(e.target.files, "backdrop")}
                  className="hidden"
                />
                <Button variant="outline" className="w-full" asChild>
                  <span>
                    <Upload className="h-4 w-4" />
                    Select Backdrops
                  </span>
                </Button>
              </label>
            </div>

            {/* Subtitle Upload */}
            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-500/10 p-3">
                  <FileText className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Subtitles</h3>
                  <p className="text-sm text-muted-foreground">SRT, VTT</p>
                </div>
              </div>
              <label className="mt-4 block">
                <input
                  type="file"
                  accept=".srt,.vtt"
                  multiple
                  onChange={(e) => handleFileSelect(e.target.files, "subtitle")}
                  className="hidden"
                />
                <Button variant="outline" className="w-full" asChild>
                  <span>
                    <Upload className="h-4 w-4" />
                    Select Subtitles
                  </span>
                </Button>
              </label>
            </div>
          </div>

          {/* Upload Queue */}
          {uploads.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Upload Queue</h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearCompleted}
                    disabled={!uploads.some((u) => u.status === "success")}
                  >
                    Clear Completed
                  </Button>
                  <Button
                    size="sm"
                    onClick={uploadAll}
                    disabled={!uploads.some((u) => u.status === "pending")}
                  >
                    Upload All
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {uploads.map((upload) => {
                  const Icon = getIcon(upload.type);
                  return (
                    <div
                      key={upload.id}
                      className="flex items-center gap-4 rounded-lg border bg-card p-4"
                    >
                      <div className="rounded-full bg-muted p-2">
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{upload.file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(upload.file.size)} • {upload.type}
                            </p>
                          </div>

                          {upload.status === "uploading" && (
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                          )}
                          {upload.status === "success" && (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                          {upload.status === "error" && (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          {upload.status === "pending" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeUpload(upload.id)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        {upload.status === "uploading" && (
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{ width: `${upload.progress}%` }}
                            />
                          </div>
                        )}

                        {upload.error && (
                          <p className="text-xs text-red-500">{upload.error}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="rounded-lg border bg-muted/50 p-6">
            <h3 className="font-semibold">Upload Instructions</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>• Videos are uploaded directly to AWS S3 using presigned URLs</li>
              <li>• Maximum file size depends on your S3 configuration</li>
              <li>• Uploads happen in the background - you can navigate away</li>
              <li>• Failed uploads can be retried individually</li>
              <li>• Videos are automatically processed after upload</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
