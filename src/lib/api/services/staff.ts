/**
 * =============================================================================
 * Admin Staff Management Service
 * =============================================================================
 * API service for managing admin users, roles, and permissions
 */

import { fetchJson } from '../client';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface StaffMember {
  id: string;
  email: string;
  username: string;
  full_name: string;
  role: 'super_admin' | 'admin' | 'content_manager' | 'moderator' | 'support';
  permissions: string[];
  is_active: boolean;
  created_at: string;
  last_login: string | null;
  avatar_url?: string;
  department?: string;
}

export interface CreateStaffRequest {
  email: string;
  username: string;
  full_name: string;
  password: string;
  role: 'super_admin' | 'admin' | 'content_manager' | 'moderator' | 'support';
  permissions?: string[];
  department?: string;
}

export interface UpdateStaffRequest {
  full_name?: string;
  role?: 'super_admin' | 'admin' | 'content_manager' | 'moderator' | 'support';
  permissions?: string[];
  is_active?: boolean;
  department?: string;
}

export interface Role {
  id: string;
  name: string;
  display_name: string;
  description: string;
  permissions: Permission[];
  created_at: string;
}

export interface Permission {
  id: string;
  name: string;
  display_name: string;
  description: string;
  category: string;
}

export interface AuditLog {
  id: string;
  staff_id: string;
  staff_email: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: Record<string, any>;
  ip_address: string;
  user_agent: string;
  timestamp: string;
}

export interface StaffActivity {
  staff_id: string;
  staff_email: string;
  actions_count: number;
  last_action: string;
  last_action_time: string;
  top_actions: Array<{ action: string; count: number }>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Staff Management Service
// ─────────────────────────────────────────────────────────────────────────────

export const staffService = {
  /**
   * List all staff members
   */
  async listStaff(options?: {
    role?: string;
    is_active?: boolean;
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<{
    staff: StaffMember[];
    total: number;
    page: number;
    per_page: number;
  }> {
    const params = new URLSearchParams();
    if (options?.role) params.append('role', options.role);
    if (options?.is_active !== undefined) params.append('is_active', String(options.is_active));
    if (options?.search) params.append('search', options.search);
    if (options?.page) params.append('page', String(options.page));
    if (options?.per_page) params.append('per_page', String(options.per_page));

    const response: any = await fetchJson<any>(`/admin/staff?${params.toString()}`);
    return response as any;
  },

  /**
   * Get staff member by ID
   */
  async getStaffById(staffId: string): Promise<StaffMember> {
    const response: any = await fetchJson<any>(`/admin/staff/${staffId}`);
    return response as any;
  },

  /**
   * Create new staff member
   */
  async createStaff(data: CreateStaffRequest): Promise<StaffMember> {
    const response: any = await fetchJson<any>('/admin/staff', { method: "PATCH", json: data });
    return response as any;
  },

  /**
   * Update staff member
   */
  async updateStaff(staffId: string, data: UpdateStaffRequest): Promise<StaffMember> {
    const response: any = await fetchJson<any>(`/admin/staff/${staffId}`, { method: "PATCH", json: data });
    return response as any;
  },

  /**
   * Delete staff member
   */
  async deleteStaff(staffId: string): Promise<void> {
    await fetchJson<any>(`/admin/staff/${staffId}`);
  },

  /**
   * Activate staff member
   */
  async activateStaff(staffId: string): Promise<StaffMember> {
    const response: any = await fetchJson<any>(`/admin/staff/${staffId}/activate`);
    return response as any;
  },

  /**
   * Deactivate staff member
   */
  async deactivateStaff(staffId: string): Promise<StaffMember> {
    const response: any = await fetchJson<any>(`/admin/staff/${staffId}/deactivate`);
    return response as any;
  },

  /**
   * Reset staff password
   */
  async resetStaffPassword(staffId: string, newPassword: string): Promise<void> {
    await fetchJson<any>(`/admin/staff/${staffId}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ new_password: newPassword }),
    });
  },

  /**
   * Update staff permissions
   */
  async updatePermissions(staffId: string, permissions: string[]): Promise<StaffMember> {
    const response: any = await fetchJson<any>(`/admin/staff/${staffId}/permissions`, {
      method: 'PUT',
      body: JSON.stringify({ permissions }),
    });
    return response as any;
  },

  /**
   * Get all available roles
   */
  async getRoles(): Promise<Role[]> {
    const response: any = await fetchJson<any>('/admin/roles');
    return response.data.roles || [];
  },

  /**
   * Get role by ID
   */
  async getRoleById(roleId: string): Promise<Role> {
    const response: any = await fetchJson<any>(`/admin/roles/${roleId}`);
    return response as any;
  },

  /**
   * Create custom role
   */
  async createRole(data: {
    name: string;
    display_name: string;
    description: string;
    permissions: string[];
  }): Promise<Role> {
    const response: any = await fetchJson<any>('/admin/roles', { method: "PATCH", json: data });
    return response as any;
  },

  /**
   * Update role
   */
  async updateRole(roleId: string, data: {
    display_name?: string;
    description?: string;
    permissions?: string[];
  }): Promise<Role> {
    const response: any = await fetchJson<any>(`/admin/roles/${roleId}`, { method: "PATCH", json: data });
    return response as any;
  },

  /**
   * Delete role
   */
  async deleteRole(roleId: string): Promise<void> {
    await fetchJson<any>(`/admin/roles/${roleId}`);
  },

  /**
   * Get all available permissions
   */
  async getPermissions(): Promise<{
    permissions: Permission[];
    categories: string[];
  }> {
    const response: any = await fetchJson<any>('/admin/permissions');
    return response as any;
  },

  /**
   * Get audit logs
   */
  async getAuditLogs(options?: {
    staff_id?: string;
    action?: string;
    resource_type?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    per_page?: number;
  }): Promise<{
    logs: AuditLog[];
    total: number;
    page: number;
    per_page: number;
  }> {
    const params = new URLSearchParams();
    if (options?.staff_id) params.append('staff_id', options.staff_id);
    if (options?.action) params.append('action', options.action);
    if (options?.resource_type) params.append('resource_type', options.resource_type);
    if (options?.start_date) params.append('start_date', options.start_date);
    if (options?.end_date) params.append('end_date', options.end_date);
    if (options?.page) params.append('page', String(options.page));
    if (options?.per_page) params.append('per_page', String(options.per_page));

    const response: any = await fetchJson<any>(`/admin/audit-logs?${params.toString()}`);
    return response as any;
  },

  /**
   * Get staff activity summary
   */
  async getStaffActivity(options?: {
    staff_id?: string;
    period?: 'day' | 'week' | 'month';
  }): Promise<StaffActivity[]> {
    const params = new URLSearchParams();
    if (options?.staff_id) params.append('staff_id', options.staff_id);
    if (options?.period) params.append('period', options.period);

    const response: any = await fetchJson<any>(`/admin/staff/activity?${params.toString()}`);
    return response.data.activities || [];
  },

  /**
   * Invite staff member via email
   */
  async inviteStaff(data: {
    email: string;
    role: string;
    full_name?: string;
  }): Promise<{ invitation_id: string; expires_at: string }> {
    const response: any = await fetchJson<any>('/admin/staff/invite', { method: "PATCH", json: data });
    return response as any;
  },

  /**
   * Revoke staff invitation
   */
  async revokeInvitation(invitationId: string): Promise<void> {
    await fetchJson<any>(`/admin/staff/invitations/${invitationId}`);
  },

  /**
   * Get pending invitations
   */
  async getPendingInvitations(): Promise<Array<{
    id: string;
    email: string;
    role: string;
    invited_by: string;
    created_at: string;
    expires_at: string;
  }>> {
    const response: any = await fetchJson<any>('/admin/staff/invitations');
    return response.data.invitations || [];
  },

  /**
   * Bulk update staff members
   */
  async bulkUpdateStaff(updates: Array<{
    staff_id: string;
    data: UpdateStaffRequest;
  }>): Promise<{ success: number; failed: number; errors: any[] }> {
    const response: any = await fetchJson<any>('/admin/staff/bulk-update', {
      method: 'PUT',
      body: JSON.stringify({ updates }),
    });
    return response as any;
  },

  /**
   * Export staff list
   */
  async exportStaffList(format: 'csv' | 'xlsx'): Promise<Blob> {
    const response: any = await fetchJson<any>(`/admin/staff/export?format=${format}`);
    return response as any;
  },
};
