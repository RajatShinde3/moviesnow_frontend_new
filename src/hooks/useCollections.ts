// hooks/useCollections.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  Collection,
  CollectionFilters,
  CreateCollectionRequest,
  UpdateCollectionRequest,
  AddToCollectionRequest,
  CollectionStats,
} from '@/types/collection';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Hook for managing collections
 */
export function useCollections(filters?: CollectionFilters) {
  const queryClient = useQueryClient();

  // Fetch all collections
  const {
    data: collections = [],
    isLoading: collectionsLoading,
    error: collectionsError,
  } = useQuery<Collection[]>({
    queryKey: ['collections', filters],
    queryFn: async () => {
      const token = localStorage.getItem('access_token');
      const params = new URLSearchParams();

      if (filters?.category) {
        filters.category.forEach((c) => params.append('category', c));
      }
      if (filters?.isPublic !== undefined) {
        params.append('isPublic', filters.isPublic.toString());
      }
      if (filters?.tags) {
        filters.tags.forEach((t) => params.append('tag', t));
      }
      if (filters?.searchQuery) {
        params.append('search', filters.searchQuery);
      }
      if (filters?.sortBy) {
        params.append('sortBy', filters.sortBy);
      }
      if (filters?.sortOrder) {
        params.append('sortOrder', filters.sortOrder);
      }

      const response = await fetch(`${API_BASE}/api/v1/collections?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch collections');
      return response.json();
    },
  });

  // Fetch collection statistics
  const {
    data: stats,
    isLoading: statsLoading,
  } = useQuery<CollectionStats>({
    queryKey: ['collection-stats'],
    queryFn: async () => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/api/v1/collections/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
  });

  // Create collection mutation
  const createCollectionMutation = useMutation({
    mutationFn: async (data: CreateCollectionRequest) => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/api/v1/collections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create collection');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['collection-stats'] });
    },
  });

  // Update collection mutation
  const updateCollectionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCollectionRequest }) => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/api/v1/collections/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update collection');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });

  // Delete collection mutation
  const deleteCollectionMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/api/v1/collections/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to delete collection');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['collection-stats'] });
    },
  });

  // Add item to collection mutation
  const addItemMutation = useMutation({
    mutationFn: async (data: AddToCollectionRequest) => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/api/v1/collections/${data.collectionId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to add item');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });

  // Remove item from collection mutation
  const removeItemMutation = useMutation({
    mutationFn: async ({ collectionId, itemId }: { collectionId: string; itemId: string }) => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/api/v1/collections/${collectionId}/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to remove item');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });

  // Like collection mutation
  const likeCollectionMutation = useMutation({
    mutationFn: async (collectionId: string) => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/api/v1/collections/${collectionId}/like`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to like collection');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });

  return {
    // Data
    collections,
    stats,

    // Loading states
    isLoading: collectionsLoading || statsLoading,
    collectionsLoading,
    statsLoading,

    // Errors
    collectionsError,

    // Mutations
    createCollection: createCollectionMutation.mutate,
    updateCollection: updateCollectionMutation.mutate,
    deleteCollection: deleteCollectionMutation.mutate,
    addItem: addItemMutation.mutate,
    removeItem: removeItemMutation.mutate,
    likeCollection: likeCollectionMutation.mutate,

    // Mutation states
    isCreating: createCollectionMutation.isPending,
    isUpdating: updateCollectionMutation.isPending,
    isDeleting: deleteCollectionMutation.isPending,
    isAddingItem: addItemMutation.isPending,
    isRemovingItem: removeItemMutation.isPending,
    isLiking: likeCollectionMutation.isPending,

    // Mutation errors
    createError: createCollectionMutation.error,
    updateError: updateCollectionMutation.error,
    deleteError: deleteCollectionMutation.error,
    addItemError: addItemMutation.error,
    removeItemError: removeItemMutation.error,
    likeError: likeCollectionMutation.error,
  };
}
