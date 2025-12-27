"use client";

/**
 * AdvancedFileUploader - Drag & drop file uploader with preview
 * Features:
 * - Drag & drop zone
 * - Multiple file selection
 * - Progress bars per file
 * - Retry failed uploads
 * - File validation (size, type)
 * - Preview thumbnails
 * - Queue management
 */

import React, { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  File,
  Image as ImageIcon,
  Video,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Loader2,
} from "lucide-react";

export interface FileWithProgress {
  file: File;
  id: string;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
  preview?: string;
}

interface AdvancedFileUploaderProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  maxFiles?: number;
  onUpload: (files: File[]) => Promise<void>;
  onFileRemove?: (fileId: string) => void;
  className?: string;
  disabled?: boolean;
}

export function AdvancedFileUploader({
  accept = "*/*",
  multiple = true,
  maxSize = 100 * 1024 * 1024, // 100MB default
  maxFiles = 10,
  onUpload,
  onFileRemove,
  className = "",
  disabled = false,
}: AdvancedFileUploaderProps) {
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate preview for image/video files
  const generatePreview = useCallback((file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => resolve(undefined);
        reader.readAsDataURL(file);
      } else {
        resolve(undefined);
      }
    });
  }, []);

  // Validate file
  const validateFile = useCallback(
    (file: File): string | null => {
      if (maxSize && file.size > maxSize) {
        return `File size exceeds ${(maxSize / 1024 / 1024).toFixed(0)}MB`;
      }
      if (accept !== "*/*") {
        const acceptedTypes = accept.split(",").map((t) => t.trim());
        const fileExtension = `.${file.name.split(".").pop()}`;
        const isAccepted =
          acceptedTypes.some((type) => {
            if (type.startsWith(".")) {
              return fileExtension.toLowerCase() === type.toLowerCase();
            }
            if (type.endsWith("/*")) {
              const category = type.split("/")[0];
              return file.type.startsWith(category + "/");
            }
            return file.type === type;
          });

        if (!isAccepted) {
          return `File type not accepted. Accepted: ${accept}`;
        }
      }
      return null;
    },
    [accept, maxSize]
  );

  // Handle file selection
  const handleFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || disabled) return;

      const newFiles = Array.from(fileList);
      const totalFiles = files.length + newFiles.length;

      if (totalFiles > maxFiles) {
        alert(`Maximum ${maxFiles} files allowed`);
        return;
      }

      const filesWithProgress: FileWithProgress[] = await Promise.all(
        newFiles.map(async (file) => {
          const error = validateFile(file);
          const preview = await generatePreview(file);

          return {
            file,
            id: `${file.name}-${Date.now()}-${Math.random()}`,
            progress: 0,
            status: error ? ("error" as const) : ("pending" as const),
            error: error || undefined,
            preview,
          };
        })
      );

      setFiles((prev) => [...prev, ...filesWithProgress]);

      // Auto-upload valid files
      const validFiles = filesWithProgress
        .filter((f) => f.status === "pending")
        .map((f) => f.file);

      if (validFiles.length > 0) {
        handleUpload(validFiles);
      }
    },
    [files, maxFiles, validateFile, generatePreview, disabled]
  );

  // Handle upload
  const handleUpload = useCallback(
    async (filesToUpload: File[]) => {
      try {
        // Update status to uploading
        setFiles((prev) =>
          prev.map((f) =>
            filesToUpload.includes(f.file)
              ? { ...f, status: "uploading" as const, progress: 0 }
              : f
          )
        );

        // Simulate progress (replace with actual upload logic)
        const progressInterval = setInterval(() => {
          setFiles((prev) =>
            prev.map((f) =>
              filesToUpload.includes(f.file) && f.status === "uploading"
                ? { ...f, progress: Math.min(f.progress + 10, 90) }
                : f
            )
          );
        }, 200);

        // Call the upload handler
        await onUpload(filesToUpload);

        clearInterval(progressInterval);

        // Mark as success
        setFiles((prev) =>
          prev.map((f) =>
            filesToUpload.includes(f.file)
              ? { ...f, status: "success" as const, progress: 100 }
              : f
          )
        );
      } catch (error) {
        setFiles((prev) =>
          prev.map((f) =>
            filesToUpload.includes(f.file)
              ? {
                  ...f,
                  status: "error" as const,
                  error: error instanceof Error ? error.message : "Upload failed",
                }
              : f
          )
        );
      }
    },
    [onUpload]
  );

  // Handle retry
  const handleRetry = useCallback(
    (fileId: string) => {
      const fileWithProgress = files.find((f) => f.id === fileId);
      if (fileWithProgress) {
        handleUpload([fileWithProgress.file]);
      }
    },
    [files, handleUpload]
  );

  // Handle remove
  const handleRemove = useCallback(
    (fileId: string) => {
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      onFileRemove?.(fileId);
    },
    [onFileRemove]
  );

  // Drag & drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  // Get file icon
  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return <ImageIcon className="w-6 h-6" />;
    if (file.type.startsWith("video/")) return <Video className="w-6 h-6" />;
    if (file.type.startsWith("text/") || file.type.includes("document"))
      return <FileText className="w-6 h-6" />;
    return <File className="w-6 h-6" />;
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer
          ${isDragging
            ? "border-purple-500 bg-purple-500/10"
            : "border-slate-700 hover:border-slate-600 bg-slate-900/50"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          disabled={disabled}
        />

        <div className="flex flex-col items-center gap-4 text-center">
          <div className={`p-4 rounded-full ${isDragging ? "bg-purple-500/20" : "bg-slate-800"}`}>
            <Upload className={`w-8 h-8 ${isDragging ? "text-purple-400" : "text-slate-400"}`} />
          </div>

          <div>
            <p className="text-lg font-medium text-white mb-1">
              {isDragging ? "Drop files here" : "Click to upload or drag and drop"}
            </p>
            <p className="text-sm text-slate-400">
              {accept !== "*/*" ? `Accepted: ${accept}` : "Any file type"}
              {" • "}
              Max {(maxSize / 1024 / 1024).toFixed(0)}MB
              {multiple && ` • Up to ${maxFiles} files`}
            </p>
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
            <span>
              {files.length} file{files.length !== 1 ? "s" : ""}
            </span>
            <span>
              {files.filter((f) => f.status === "success").length} uploaded •{" "}
              {files.filter((f) => f.status === "error").length} failed
            </span>
          </div>

          <AnimatePresence>
            {files.map((fileWithProgress) => (
              <motion.div
                key={fileWithProgress.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-slate-900/50 border border-slate-700 rounded-lg p-4"
              >
                <div className="flex items-start gap-3">
                  {/* Preview or Icon */}
                  <div className="flex-shrink-0">
                    {fileWithProgress.preview ? (
                      <img
                        src={fileWithProgress.preview}
                        alt={fileWithProgress.file.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-slate-800 rounded flex items-center justify-center text-slate-400">
                        {getFileIcon(fileWithProgress.file)}
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-medium text-white truncate">
                        {fileWithProgress.file.name}
                      </p>
                      <button
                        onClick={() => handleRemove(fileWithProgress.id)}
                        className="flex-shrink-0 text-slate-400 hover:text-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-500 mb-2">
                      {formatFileSize(fileWithProgress.file.size)}
                    </p>

                    {/* Progress Bar */}
                    {fileWithProgress.status === "uploading" && (
                      <div className="mb-2">
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${fileWithProgress.progress}%` }}
                            className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                          />
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          {fileWithProgress.progress}%
                        </p>
                      </div>
                    )}

                    {/* Status */}
                    <div className="flex items-center gap-2">
                      {fileWithProgress.status === "uploading" && (
                        <div className="flex items-center gap-1.5 text-xs text-blue-400">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Uploading...</span>
                        </div>
                      )}

                      {fileWithProgress.status === "success" && (
                        <div className="flex items-center gap-1.5 text-xs text-green-400">
                          <CheckCircle className="w-3 h-3" />
                          <span>Upload complete</span>
                        </div>
                      )}

                      {fileWithProgress.status === "error" && (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 text-xs text-red-400">
                            <AlertCircle className="w-3 h-3" />
                            <span>{fileWithProgress.error || "Upload failed"}</span>
                          </div>
                          <button
                            onClick={() => handleRetry(fileWithProgress.id)}
                            className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
                          >
                            <RefreshCw className="w-3 h-3" />
                            Retry
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export default AdvancedFileUploader;
