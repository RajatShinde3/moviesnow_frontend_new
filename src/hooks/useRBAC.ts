// hooks/useRBAC.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import type {
  Permission,
  Role,
  UserRole,
  CreateRoleRequest,
  UpdateRoleRequest,
  AssignRolesRequest,
  PermissionCheck,
  ResourceType,
  ActionType,
} from '@/types/rbac';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Hook for managing roles and permissions
 */
export function useRBAC() {
  const queryClient = useQueryClient();

  // Fetch all permissions
  const {
    data: permissions = [],
    isLoading: permissionsLoading,
    error: permissionsError,
  } = useQuery<Permission[]>({
    queryKey: ['permissions'],
    queryFn: async () => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/api/v1/rbac/permissions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch permissions');
      return response.json();
    },
  });

  // Fetch all roles
  const {
    data: roles = [],
    isLoading: rolesLoading,
    error: rolesError,
  } = useQuery<Role[]>({
    queryKey: ['roles'],
    queryFn: async () => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/api/v1/rbac/roles`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch roles');
      return response.json();
    },
  });

  // Fetch users with roles
  const {
    data: users = [],
    isLoading: usersLoading,
    error: usersError,
  } = useQuery<UserRole[]>({
    queryKey: ['users-with-roles'],
    queryFn: async () => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/api/v1/rbac/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
  });

  // Create role mutation
  const createRoleMutation = useMutation({
    mutationFn: async (data: CreateRoleRequest) => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/api/v1/rbac/roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create role');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ roleId, data }: { roleId: string; data: UpdateRoleRequest }) => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/api/v1/rbac/roles/${roleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update role');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
    },
  });

  // Delete role mutation
  const deleteRoleMutation = useMutation({
    mutationFn: async (roleId: string) => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/api/v1/rbac/roles/${roleId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to delete role');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
    },
  });

  // Assign roles to user mutation
  const assignRolesMutation = useMutation({
    mutationFn: async (data: AssignRolesRequest) => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/api/v1/rbac/users/${data.userId}/roles`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ roleIds: data.roleIds }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to assign roles');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });

  // Check if current user has permission
  const checkPermission = useCallback(
    async (resource: ResourceType, action: ActionType): Promise<PermissionCheck> => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(
          `${API_BASE}/api/v1/rbac/check-permission?resource=${resource}&action=${action}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) throw new Error('Permission check failed');
        return response.json();
      } catch (error) {
        return {
          hasPermission: false,
          missingPermissions: [`${resource}:${action}`],
          reason: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    },
    []
  );

  return {
    // Data
    permissions,
    roles,
    users,

    // Loading states
    isLoading: permissionsLoading || rolesLoading || usersLoading,
    permissionsLoading,
    rolesLoading,
    usersLoading,

    // Errors
    permissionsError,
    rolesError,
    usersError,

    // Mutations
    createRole: createRoleMutation.mutate,
    updateRole: updateRoleMutation.mutate,
    deleteRole: deleteRoleMutation.mutate,
    assignRoles: assignRolesMutation.mutate,

    // Mutation states
    isCreating: createRoleMutation.isPending,
    isUpdating: updateRoleMutation.isPending,
    isDeleting: deleteRoleMutation.isPending,
    isAssigning: assignRolesMutation.isPending,

    // Mutation errors
    createError: createRoleMutation.error,
    updateError: updateRoleMutation.error,
    deleteError: deleteRoleMutation.error,
    assignError: assignRolesMutation.error,

    // Utility functions
    checkPermission,
  };
}

/**
 * Hook for permission checking in components
 */
export function usePermission(resource: ResourceType, action: ActionType) {
  const { data: permissionCheck, isLoading } = useQuery<PermissionCheck>({
    queryKey: ['permission-check', resource, action],
    queryFn: async () => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${API_BASE}/api/v1/rbac/check-permission?resource=${resource}&action=${action}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error('Permission check failed');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1,
  });

  return {
    hasPermission: permissionCheck?.hasPermission ?? false,
    missingPermissions: permissionCheck?.missingPermissions ?? [],
    reason: permissionCheck?.reason,
    isLoading,
  };
}
