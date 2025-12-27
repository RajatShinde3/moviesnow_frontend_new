// hooks/useAPIKeys.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  APIKey,
  APIKeyUsage,
  CreateAPIKeyRequest,
  UpdateAPIKeyRequest,
  CreateAPIKeyResponse,
} from '@/types/apiKey';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Hook for managing API keys
 */
export function useAPIKeys() {
  const queryClient = useQueryClient();

  // Fetch all API keys
  const {
    data: apiKeys = [],
    isLoading: keysLoading,
    error: keysError,
  } = useQuery<APIKey[]>({
    queryKey: ['api-keys'],
    queryFn: async () => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/api/v1/api-keys`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch API keys');
      return response.json();
    },
  });

  // Create API key mutation
  const createKeyMutation = useMutation({
    mutationFn: async (data: CreateAPIKeyRequest) => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/api/v1/api-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create API key');
      }
      return response.json() as Promise<CreateAPIKeyResponse>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    },
  });

  // Update API key mutation
  const updateKeyMutation = useMutation({
    mutationFn: async ({ keyId, data }: { keyId: string; data: UpdateAPIKeyRequest }) => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/api/v1/api-keys/${keyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update API key');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    },
  });

  // Revoke API key mutation
  const revokeKeyMutation = useMutation({
    mutationFn: async (keyId: string) => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/api/v1/api-keys/${keyId}/revoke`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to revoke API key');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    },
  });

  // Delete API key mutation
  const deleteKeyMutation = useMutation({
    mutationFn: async (keyId: string) => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/api/v1/api-keys/${keyId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to delete API key');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    },
  });

  return {
    // Data
    apiKeys,

    // Loading states
    isLoading: keysLoading,

    // Errors
    keysError,

    // Mutations
    createKey: createKeyMutation.mutate,
    updateKey: updateKeyMutation.mutate,
    revokeKey: revokeKeyMutation.mutate,
    deleteKey: deleteKeyMutation.mutate,

    // Mutation states
    isCreating: createKeyMutation.isPending,
    isUpdating: updateKeyMutation.isPending,
    isRevoking: revokeKeyMutation.isPending,
    isDeleting: deleteKeyMutation.isPending,

    // Mutation errors
    createError: createKeyMutation.error,
    updateError: updateKeyMutation.error,
    revokeError: revokeKeyMutation.error,
    deleteError: deleteKeyMutation.error,

    // Mutation data
    createdKey: createKeyMutation.data,
  };
}

/**
 * Hook for fetching API key usage statistics
 */
export function useAPIKeyUsage(keyId?: string) {
  const {
    data: usage,
    isLoading,
    error,
  } = useQuery<APIKeyUsage>({
    queryKey: ['api-key-usage', keyId],
    queryFn: async () => {
      if (!keyId) throw new Error('Key ID required');
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/api/v1/api-keys/${keyId}/usage`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch usage stats');
      return response.json();
    },
    enabled: !!keyId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  return {
    usage,
    isLoading,
    error,
  };
}
