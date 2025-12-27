// types/upload.ts
export type UploadStatus =
  | 'queued'
  | 'uploading'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'paused'
  | 'cancelled';

export interface UploadMetadata {
  genre?: string;
  studio?: string;
  year?: number;
  rating?: string;
  titleType?: 'movie' | 'series' | 'anime' | 'documentary';
  language?: string;
  quality?: '480p' | '720p' | '1080p' | '4k';
}

export interface UploadProgress {
  uploadId: string;
  progress: number; // 0-100
  speed: number; // bytes per second
  remaining: number; // seconds
  uploaded: number; // bytes
  total: number; // bytes
}

export interface Upload {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  status: UploadStatus;
  progress: number;
  speed?: number;
  remaining?: number;
  metadata?: UploadMetadata;
  error?: string;
  url?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface UploadQueueItem extends Upload {
  file?: File;
  retryCount: number;
  maxRetries: number;
}

export interface UploadStatistics {
  totalUploads: number;
  completedUploads: number;
  failedUploads: number;
  totalSize: number;
  uploadedSize: number;
  averageSpeed: number;
  estimatedTimeRemaining: number;
}

export interface WebSocketMessage {
  type: 'upload:progress' | 'upload:completed' | 'upload:error' | 'upload:paused';
  data: UploadProgress | { uploadId: string; fileName: string } | { uploadId: string; error: string };
}
