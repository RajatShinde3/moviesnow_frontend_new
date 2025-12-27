// hooks/useSceneMarkers.ts
import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { SceneMarkers, MarkerType, MarkerRange } from '@/types/sceneMarkers';

export function useSceneMarkers(titleId: string, episodeId?: string) {
  const queryClient = useQueryClient();
  const [localMarkers, setLocalMarkers] = useState<SceneMarkers | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Fetch scene markers
  const { data: markers, isLoading } = useQuery({
    queryKey: ['sceneMarkers', titleId, episodeId],
    queryFn: async () => {
      const url = episodeId
        ? `/admin/titles/${titleId}/episodes/${episodeId}/scene-markers`
        : `/admin/titles/${titleId}/scene-markers`;
      const response = await api.get(url);
      return response.json();
    },
    onSuccess: (data) => {
      setLocalMarkers(data);
      setHasUnsavedChanges(false);
    }
  });

  // Save scene markers
  const saveMutation = useMutation({
    mutationFn: async (data: SceneMarkers) => {
      if (data.id) {
        // Update existing
        const response = await api.patch(`/admin/scene-markers/${data.id}`, {
          json: data
        });
        return response.json();
      } else {
        // Create new
        const response = await api.post(`/admin/titles/${titleId}/scene-markers`, {
          json: data
        });
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sceneMarkers', titleId, episodeId] });
      toast.success('Scene markers saved successfully');
      setHasUnsavedChanges(false);
    },
    onError: (error) => {
      console.error('Save error:', error);
      toast.error('Failed to save scene markers');
    }
  });

  // Auto-detect markers
  const autoDetectMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/admin/scene-markers/auto-detect', {
        json: { titleId, episodeId }
      });
      return response.json();
    },
    onSuccess: (detectedMarkers) => {
      setLocalMarkers(detectedMarkers);
      setHasUnsavedChanges(true);
      toast.success('Scene markers detected successfully');
    },
    onError: () => {
      toast.error('Failed to auto-detect scene markers');
    }
  });

  // Batch update for series
  const batchUpdateMutation = useMutation({
    mutationFn: async ({ episodeIds, markers }: { episodeIds: string[]; markers: SceneMarkers }) => {
      const response = await api.post(`/admin/titles/${titleId}/scene-markers/batch`, {
        json: { episodeIds, markers }
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast.success(`Updated ${data.updated} episodes`);
      queryClient.invalidateQueries({ queryKey: ['sceneMarkers'] });
    }
  });

  // Update single marker
  const updateMarker = useCallback((type: MarkerType, range: MarkerRange | null) => {
    setLocalMarkers(prev => {
      if (!prev) return null;
      const updated = { ...prev, [type]: range };
      setHasUnsavedChanges(true);
      return updated;
    });
  }, []);

  // Clear marker
  const clearMarker = useCallback((type: MarkerType) => {
    updateMarker(type, null);
  }, [updateMarker]);

  // Clear all markers
  const clearAll = useCallback(() => {
    setLocalMarkers(prev => {
      if (!prev) return null;
      return {
        titleId: prev.titleId,
        episodeId: prev.episodeId
      };
    });
    setHasUnsavedChanges(true);
  }, []);

  // Save changes
  const save = useCallback(() => {
    if (!localMarkers) return;
    saveMutation.mutate(localMarkers);
  }, [localMarkers, saveMutation]);

  // Revert changes
  const revert = useCallback(() => {
    setLocalMarkers(markers || null);
    setHasUnsavedChanges(false);
  }, [markers]);

  return {
    markers: localMarkers,
    isLoading,
    hasUnsavedChanges,
    isSaving: saveMutation.isPending,
    isAutoDetecting: autoDetectMutation.isPending,
    updateMarker,
    clearMarker,
    clearAll,
    save,
    revert,
    autoDetect: autoDetectMutation.mutate,
    batchUpdate: batchUpdateMutation.mutate
  };
}
