// types/rbac.ts

/**
 * Permission represents a single atomic action that can be performed
 */
export interface Permission {
  id: string;
  name: string;
  resource: ResourceType;
  action: ActionType;
  description: string;
  category: PermissionCategory;
  isSystemPermission: boolean; // Cannot be deleted
  createdAt: string;
  updatedAt: string;
}

/**
 * Role is a collection of permissions
 */
export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  userCount: number; // Number of users with this role
  isSystemRole: boolean; // Cannot be deleted (e.g., Super Admin, User)
  color: string; // For UI display
  icon: string; // Icon identifier
  createdAt: string;
  updatedAt: string;
}

/**
 * User with role information
 */
export interface UserRole {
  id: string;
  email: string;
  username: string;
  roles: Role[];
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

/**
 * Resource types that can be protected by permissions
 */
export type ResourceType =
  | 'content' // Movies, Series, Anime, Documentaries
  | 'users' // User management
  | 'subscriptions' // Billing and subscriptions
  | 'analytics' // View analytics data
  | 'settings' // Platform settings
  | 'roles' // Role management
  | 'permissions' // Permission management
  | 'uploads' // Content upload
  | 'downloads' // Download management
  | 'ads' // Ad management
  | 'api_keys' // API key management
  | 'audit_logs' // Audit log access
  | 'sessions'; // Session management

/**
 * Action types that can be performed on resources
 */
export type ActionType =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'publish' // Publish content
  | 'unpublish' // Unpublish content
  | 'manage' // Full management access
  | 'view_sensitive' // View sensitive data
  | 'export'; // Export data

/**
 * Permission categories for organization
 */
export type PermissionCategory =
  | 'Content Management'
  | 'User Management'
  | 'Financial'
  | 'Analytics'
  | 'Security'
  | 'System';

/**
 * Request to create a new role
 */
export interface CreateRoleRequest {
  name: string;
  description: string;
  permissionIds: string[];
  color?: string;
  icon?: string;
}

/**
 * Request to update an existing role
 */
export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissionIds?: string[];
  color?: string;
  icon?: string;
}

/**
 * Request to assign roles to a user
 */
export interface AssignRolesRequest {
  userId: string;
  roleIds: string[];
}

/**
 * Permission check result
 */
export interface PermissionCheck {
  hasPermission: boolean;
  missingPermissions: string[];
  reason?: string;
}

/**
 * Predefined system roles
 */
export const SYSTEM_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  CONTENT_MANAGER: 'content_manager',
  MODERATOR: 'moderator',
  ANALYST: 'analyst',
  USER: 'user',
} as const;

/**
 * Permission templates for quick role creation
 */
export interface PermissionTemplate {
  id: string;
  name: string;
  description: string;
  permissions: Array<{
    resource: ResourceType;
    action: ActionType;
  }>;
  icon: string;
  color: string;
}

export const PERMISSION_TEMPLATES: PermissionTemplate[] = [
  {
    id: 'content_creator',
    name: 'Content Creator',
    description: 'Can create and manage content but cannot publish',
    permissions: [
      { resource: 'content', action: 'create' },
      { resource: 'content', action: 'read' },
      { resource: 'content', action: 'update' },
      { resource: 'uploads', action: 'create' },
      { resource: 'uploads', action: 'read' },
    ],
    icon: 'FileVideo',
    color: '#3b82f6',
  },
  {
    id: 'content_publisher',
    name: 'Content Publisher',
    description: 'Full content management including publish/unpublish',
    permissions: [
      { resource: 'content', action: 'create' },
      { resource: 'content', action: 'read' },
      { resource: 'content', action: 'update' },
      { resource: 'content', action: 'delete' },
      { resource: 'content', action: 'publish' },
      { resource: 'content', action: 'unpublish' },
      { resource: 'uploads', action: 'manage' },
    ],
    icon: 'CheckCircle',
    color: '#10b981',
  },
  {
    id: 'user_manager',
    name: 'User Manager',
    description: 'Manage users and their roles',
    permissions: [
      { resource: 'users', action: 'read' },
      { resource: 'users', action: 'update' },
      { resource: 'users', action: 'delete' },
      { resource: 'roles', action: 'read' },
      { resource: 'sessions', action: 'read' },
      { resource: 'sessions', action: 'delete' },
    ],
    icon: 'Users',
    color: '#8b5cf6',
  },
  {
    id: 'financial_admin',
    name: 'Financial Admin',
    description: 'Manage subscriptions and view financial data',
    permissions: [
      { resource: 'subscriptions', action: 'read' },
      { resource: 'subscriptions', action: 'update' },
      { resource: 'analytics', action: 'read' },
      { resource: 'analytics', action: 'export' },
    ],
    icon: 'DollarSign',
    color: '#f59e0b',
  },
  {
    id: 'security_admin',
    name: 'Security Admin',
    description: 'Manage security settings and audit logs',
    permissions: [
      { resource: 'audit_logs', action: 'read' },
      { resource: 'audit_logs', action: 'export' },
      { resource: 'api_keys', action: 'manage' },
      { resource: 'sessions', action: 'manage' },
      { resource: 'settings', action: 'update' },
    ],
    icon: 'Shield',
    color: '#ef4444',
  },
  {
    id: 'data_analyst',
    name: 'Data Analyst',
    description: 'View and export analytics data',
    permissions: [
      { resource: 'analytics', action: 'read' },
      { resource: 'analytics', action: 'export' },
      { resource: 'content', action: 'read' },
      { resource: 'users', action: 'read' },
    ],
    icon: 'BarChart',
    color: '#06b6d4',
  },
];

/**
 * Role color options for UI
 */
export const ROLE_COLORS = [
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#10b981', // Green
  '#06b6d4', // Cyan
  '#ef4444', // Red
  '#6366f1', // Indigo
] as const;

/**
 * Role icon options
 */
export const ROLE_ICONS = [
  'Shield',
  'Crown',
  'Star',
  'Zap',
  'Award',
  'Key',
  'Lock',
  'Eye',
  'Users',
  'User',
  'Settings',
  'Tool',
] as const;
