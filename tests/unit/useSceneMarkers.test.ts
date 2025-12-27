// tests/unit/useSceneMarkers.test.ts
import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useSceneMarkers } from '@/hooks/useSceneMarkers';
import { api } from '@/lib/api';

// Mock the API
vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn()
  }
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

describe('useSceneMarkers', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };

  it('should fetch scene markers on mount', async () => {
    const mockMarkers = {
      id: 'marker-1',
      titleId: 'title-123',
      intro: { start: 10, end: 90 },
      recap: { start: 90, end: 150 }
    };

    vi.mocked(api.get).mockResolvedValueOnce({
      json: vi.fn().mockResolvedValue(mockMarkers)
    } as any);

    const { result } = renderHook(() => useSceneMarkers('title-123'), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.markers).toEqual(mockMarkers);
    expect(api.get).toHaveBeenCalledWith('/admin/titles/title-123/scene-markers');
  });

  it('should fetch markers for specific episode', async () => {
    const mockMarkers = {
      id: 'marker-1',
      titleId: 'title-123',
      episodeId: 'ep-1',
      intro: { start: 5, end: 60 }
    };

    vi.mocked(api.get).mockResolvedValueOnce({
      json: vi.fn().mockResolvedValue(mockMarkers)
    } as any);

    const { result } = renderHook(() => useSceneMarkers('title-123', 'ep-1'), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(api.get).toHaveBeenCalledWith('/admin/titles/title-123/episodes/ep-1/scene-markers');
  });

  it('should update marker locally', async () => {
    const mockMarkers = {
      id: 'marker-1',
      titleId: 'title-123'
    };

    vi.mocked(api.get).mockResolvedValueOnce({
      json: vi.fn().mockResolvedValue(mockMarkers)
    } as any);

    const { result } = renderHook(() => useSceneMarkers('title-123'), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.updateMarker('intro', { start: 10, end: 90 });
    });

    expect(result.current.markers?.intro).toEqual({ start: 10, end: 90 });
    expect(result.current.hasUnsavedChanges).toBe(true);
  });

  it('should clear specific marker', async () => {
    const mockMarkers = {
      id: 'marker-1',
      titleId: 'title-123',
      intro: { start: 10, end: 90 },
      recap: { start: 90, end: 150 }
    };

    vi.mocked(api.get).mockResolvedValueOnce({
      json: vi.fn().mockResolvedValue(mockMarkers)
    } as any);

    const { result } = renderHook(() => useSceneMarkers('title-123'), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.clearMarker('intro');
    });

    expect(result.current.markers?.intro).toBeNull();
    expect(result.current.markers?.recap).toEqual({ start: 90, end: 150 });
    expect(result.current.hasUnsavedChanges).toBe(true);
  });

  it('should clear all markers', async () => {
    const mockMarkers = {
      id: 'marker-1',
      titleId: 'title-123',
      intro: { start: 10, end: 90 },
      recap: { start: 90, end: 150 },
      opening: { start: 150, end: 240 }
    };

    vi.mocked(api.get).mockResolvedValueOnce({
      json: vi.fn().mockResolvedValue(mockMarkers)
    } as any);

    const { result } = renderHook(() => useSceneMarkers('title-123'), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.clearAll();
    });

    expect(result.current.markers?.intro).toBeUndefined();
    expect(result.current.markers?.recap).toBeUndefined();
    expect(result.current.markers?.opening).toBeUndefined();
    expect(result.current.markers?.titleId).toBe('title-123');
    expect(result.current.hasUnsavedChanges).toBe(true);
  });

  it('should save new markers', async () => {
    const mockMarkers = {
      titleId: 'title-123'
    };

    const savedMarkers = {
      id: 'marker-new',
      titleId: 'title-123',
      intro: { start: 10, end: 90 }
    };

    vi.mocked(api.get).mockResolvedValueOnce({
      json: vi.fn().mockResolvedValue(mockMarkers)
    } as any);

    vi.mocked(api.post).mockResolvedValueOnce({
      json: vi.fn().mockResolvedValue(savedMarkers)
    } as any);

    const { result } = renderHook(() => useSceneMarkers('title-123'), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.updateMarker('intro', { start: 10, end: 90 });
    });

    await act(async () => {
      result.current.save();
    });

    await waitFor(() => {
      expect(result.current.isSaving).toBe(false);
    });

    expect(api.post).toHaveBeenCalledWith('/admin/titles/title-123/scene-markers', {
      json: expect.objectContaining({
        titleId: 'title-123',
        intro: { start: 10, end: 90 }
      })
    });
  });

  it('should update existing markers', async () => {
    const mockMarkers = {
      id: 'marker-1',
      titleId: 'title-123',
      intro: { start: 10, end: 90 }
    };

    const updatedMarkers = {
      id: 'marker-1',
      titleId: 'title-123',
      intro: { start: 15, end: 95 }
    };

    vi.mocked(api.get).mockResolvedValueOnce({
      json: vi.fn().mockResolvedValue(mockMarkers)
    } as any);

    vi.mocked(api.patch).mockResolvedValueOnce({
      json: vi.fn().mockResolvedValue(updatedMarkers)
    } as any);

    const { result } = renderHook(() => useSceneMarkers('title-123'), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.updateMarker('intro', { start: 15, end: 95 });
    });

    await act(async () => {
      result.current.save();
    });

    await waitFor(() => {
      expect(result.current.isSaving).toBe(false);
    });

    expect(api.patch).toHaveBeenCalledWith('/admin/scene-markers/marker-1', {
      json: expect.objectContaining({
        id: 'marker-1',
        intro: { start: 15, end: 95 }
      })
    });
  });

  it('should revert unsaved changes', async () => {
    const mockMarkers = {
      id: 'marker-1',
      titleId: 'title-123',
      intro: { start: 10, end: 90 }
    };

    vi.mocked(api.get).mockResolvedValueOnce({
      json: vi.fn().mockResolvedValue(mockMarkers)
    } as any);

    const { result } = renderHook(() => useSceneMarkers('title-123'), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Make changes
    act(() => {
      result.current.updateMarker('intro', { start: 20, end: 100 });
    });

    expect(result.current.hasUnsavedChanges).toBe(true);
    expect(result.current.markers?.intro).toEqual({ start: 20, end: 100 });

    // Revert
    act(() => {
      result.current.revert();
    });

    expect(result.current.hasUnsavedChanges).toBe(false);
    expect(result.current.markers?.intro).toEqual({ start: 10, end: 90 });
  });

  it('should handle auto-detect', async () => {
    const mockMarkers = {
      titleId: 'title-123'
    };

    const detectedMarkers = {
      titleId: 'title-123',
      intro: { start: 5, end: 85 },
      recap: { start: 85, end: 120 },
      opening: { start: 120, end: 210 }
    };

    vi.mocked(api.get).mockResolvedValueOnce({
      json: vi.fn().mockResolvedValue(mockMarkers)
    } as any);

    vi.mocked(api.post).mockResolvedValueOnce({
      json: vi.fn().mockResolvedValue(detectedMarkers)
    } as any);

    const { result } = renderHook(() => useSceneMarkers('title-123'), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      result.current.autoDetect();
    });

    await waitFor(() => {
      expect(result.current.isAutoDetecting).toBe(false);
    });

    expect(api.post).toHaveBeenCalledWith('/admin/scene-markers/auto-detect', {
      json: { titleId: 'title-123', episodeId: undefined }
    });

    expect(result.current.markers?.intro).toEqual({ start: 5, end: 85 });
    expect(result.current.hasUnsavedChanges).toBe(true);
  });
});
