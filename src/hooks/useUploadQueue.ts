// hooks/useUploadQueue.ts
import { useState, useCallback } from 'react';
import { UploadQueueItem, UploadStatus, UploadMetadata, UploadStatistics } from '@/types/upload';
import { v4 as uuidv4 } from 'uuid';

export function useUploadQueue() {
  const [uploads, setUploads] = useState<UploadQueueItem[]>([]);

  // Add uploads to queue
  const addUploads = useCallback((files: File[], metadata?: UploadMetadata) => {
    const newUploads: UploadQueueItem[] = files.map(file => ({
      id: uuidv4(),
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      status: 'queued' as UploadStatus,
      progress: 0,
      metadata,
      file,
      retryCount: 0,
      maxRetries: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    setUploads(prev => [...prev, ...newUploads]);
    return newUploads;
  }, []);

  // Update upload progress
  const updateProgress = useCallback((uploadId: string, progress: number, speed?: number, remaining?: number) => {
    setUploads(prev => prev.map(upload =>
      upload.id === uploadId
        ? { ...upload, progress, speed, remaining, status: 'uploading' as UploadStatus, updatedAt: new Date().toISOString() }
        : upload
    ));
  }, []);

  // Mark upload as completed
  const markCompleted = useCallback((uploadId: string, url?: string) => {
    setUploads(prev => prev.map(upload =>
      upload.id === uploadId
        ? {
            ...upload,
            status: 'completed' as UploadStatus,
            progress: 100,
            url,
            completedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        : upload
    ));
  }, []);

  // Mark upload as failed
  const markFailed = useCallback((uploadId: string, error: string) => {
    setUploads(prev => prev.map(upload =>
      upload.id === uploadId
        ? {
            ...upload,
            status: 'failed' as UploadStatus,
            error,
            updatedAt: new Date().toISOString()
          }
        : upload
    ));
  }, []);

  // Retry upload
  const retryUpload = useCallback((uploadId: string) => {
    setUploads(prev => prev.map(upload =>
      upload.id === uploadId && upload.retryCount < upload.maxRetries
        ? {
            ...upload,
            status: 'queued' as UploadStatus,
            progress: 0,
            error: undefined,
            retryCount: upload.retryCount + 1,
            updatedAt: new Date().toISOString()
          }
        : upload
    ));
  }, []);

  // Cancel upload
  const cancelUpload = useCallback((uploadId: string) => {
    setUploads(prev => prev.map(upload =>
      upload.id === uploadId
        ? {
            ...upload,
            status: 'cancelled' as UploadStatus,
            updatedAt: new Date().toISOString()
          }
        : upload
    ));
  }, []);

  // Remove upload from queue
  const removeUpload = useCallback((uploadId: string) => {
    setUploads(prev => prev.filter(upload => upload.id !== uploadId));
  }, []);

  // Clear all completed/failed
  const clearCompleted = useCallback(() => {
    setUploads(prev => prev.filter(upload =>
      upload.status !== 'completed' && upload.status !== 'failed' && upload.status !== 'cancelled'
    ));
  }, []);

  // Get statistics
  const getStatistics = useCallback((): UploadStatistics => {
    const totalUploads = uploads.length;
    const completedUploads = uploads.filter(u => u.status === 'completed').length;
    const failedUploads = uploads.filter(u => u.status === 'failed').length;
    const totalSize = uploads.reduce((sum, u) => sum + u.fileSize, 0);
    const uploadedSize = uploads.reduce((sum, u) => sum + (u.fileSize * u.progress / 100), 0);

    const activeUploads = uploads.filter(u => u.status === 'uploading');
    const averageSpeed = activeUploads.length > 0
      ? activeUploads.reduce((sum, u) => sum + (u.speed || 0), 0) / activeUploads.length
      : 0;

    const remainingSize = totalSize - uploadedSize;
    const estimatedTimeRemaining = averageSpeed > 0 ? remainingSize / averageSpeed : 0;

    return {
      totalUploads,
      completedUploads,
      failedUploads,
      totalSize,
      uploadedSize,
      averageSpeed,
      estimatedTimeRemaining
    };
  }, [uploads]);

  return {
    uploads,
    addUploads,
    updateProgress,
    markCompleted,
    markFailed,
    retryUpload,
    cancelUpload,
    removeUpload,
    clearCompleted,
    getStatistics
  };
}
