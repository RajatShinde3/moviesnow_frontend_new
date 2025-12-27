// hooks/useVideoPlayer.ts
import { useState, useRef, useCallback, useEffect } from 'react';
import { VideoMetadata } from '@/types/sceneMarkers';

export function useVideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [metadata, setMetadata] = useState<VideoMetadata>({
    duration: 0,
    currentTime: 0,
    isPlaying: false,
    volume: 1
  });

  // Update current time
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setMetadata(prev => ({
        ...prev,
        currentTime: videoRef.current!.currentTime
      }));
    }
  }, []);

  // Load video metadata
  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setMetadata(prev => ({
        ...prev,
        duration: videoRef.current!.duration
      }));
    }
  }, []);

  // Play/pause toggle
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      videoRef.current.play();
      setMetadata(prev => ({ ...prev, isPlaying: true }));
    } else {
      videoRef.current.pause();
      setMetadata(prev => ({ ...prev, isPlaying: false }));
    }
  }, []);

  // Seek to time
  const seekTo = useCallback((time: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    setMetadata(prev => ({ ...prev, currentTime: time }));
  }, []);

  // Skip forward/backward
  const skip = useCallback((seconds: number) => {
    if (!videoRef.current) return;
    const newTime = Math.max(0, Math.min(metadata.duration, metadata.currentTime + seconds));
    seekTo(newTime);
  }, [metadata.currentTime, metadata.duration, seekTo]);

  // Set volume
  const setVolume = useCallback((volume: number) => {
    if (!videoRef.current) return;
    const clampedVolume = Math.max(0, Math.min(1, volume));
    videoRef.current.volume = clampedVolume;
    setMetadata(prev => ({ ...prev, volume: clampedVolume }));
  }, []);

  // Jump to marker and play
  const jumpToMarker = useCallback((time: number) => {
    seekTo(time);
    if (!metadata.isPlaying) {
      togglePlay();
    }
  }, [seekTo, metadata.isPlaying, togglePlay]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [handleTimeUpdate, handleLoadedMetadata]);

  return {
    videoRef,
    metadata,
    togglePlay,
    seekTo,
    skip,
    setVolume,
    jumpToMarker
  };
}
