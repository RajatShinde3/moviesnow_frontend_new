// types/apiKey.ts

/**
 * API Key with full details
 */
export interface APIKey {
  id: string;
  name: string;
  description?: string;
  key: string; // The actual API key (only shown once on creation)
  keyPrefix: string; // First 8 chars for identification
  userId: string;
  username: string;
  permissions: APIKeyPermission[];
  rateLimits: RateLimits;
  allowedIPs?: string[]; // IP whitelist
  allowedDomains?: string[]; // Domain whitelist
  expiresAt?: string; // ISO timestamp
  lastUsedAt?: string; // ISO timestamp
  usageCount: number;
  status: APIKeyStatus;
  createdAt: string;
  updatedAt: string;
  environment: 'production' | 'development' | 'testing';
}

/**
 * API Key status
 */
export type APIKeyStatus = 'active' | 'inactive' | 'revoked' | 'expired';

/**
 * API Key permissions
 */
export type APIKeyPermission =
  // Content
  | 'content:read'
  | 'content:write'
  | 'content:delete'
  // Users
  | 'users:read'
  | 'users:write'
  | 'users:delete'
  // Subscriptions
  | 'subscriptions:read'
  | 'subscriptions:write'
  // Analytics
  | 'analytics:read'
  // Uploads
  | 'uploads:write'
  // Streaming
  | 'streaming:read'
  | 'streaming:write'
  // Downloads
  | 'downloads:read'
  // All (admin)
  | 'admin:all';

/**
 * Rate limits for API keys
 */
export interface RateLimits {
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  burstLimit?: number; // Max requests in a 1-second window
}

/**
 * API Key usage statistics
 */
export interface APIKeyUsage {
  keyId: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number; // milliseconds
  lastHourRequests: number;
  lastDayRequests: number;
  endpointBreakdown: Array<{
    endpoint: string;
    count: number;
    averageResponseTime: number;
  }>;
  statusCodeBreakdown: Record<string, number>; // "200": 150, "404": 5, etc.
  requestsOverTime: Array<{
    timestamp: string;
    count: number;
  }>;
}

/**
 * Create API Key request
 */
export interface CreateAPIKeyRequest {
  name: string;
  description?: string;
  permissions: APIKeyPermission[];
  rateLimits?: RateLimits;
  allowedIPs?: string[];
  allowedDomains?: string[];
  expiresAt?: string;
  environment: 'production' | 'development' | 'testing';
}

/**
 * Update API Key request
 */
export interface UpdateAPIKeyRequest {
  name?: string;
  description?: string;
  permissions?: APIKeyPermission[];
  rateLimits?: RateLimits;
  allowedIPs?: string[];
  allowedDomains?: string[];
  status?: APIKeyStatus;
}

/**
 * API Key response (after creation - includes full key)
 */
export interface CreateAPIKeyResponse {
  apiKey: APIKey;
  fullKey: string; // Only returned once
  warning: string; // "Save this key securely - it won't be shown again"
}

/**
 * Permission templates for quick setup
 */
export interface APIKeyTemplate {
  id: string;
  name: string;
  description: string;
  permissions: APIKeyPermission[];
  rateLimits: RateLimits;
  icon: string;
  color: string;
}

export const API_KEY_TEMPLATES: APIKeyTemplate[] = [
  {
    id: 'readonly',
    name: 'Read-Only Access',
    description: 'View content, users, and analytics without modification rights',
    permissions: ['content:read', 'users:read', 'analytics:read', 'streaming:read', 'downloads:read'],
    rateLimits: {
      requestsPerMinute: 100,
      requestsPerHour: 5000,
      requestsPerDay: 100000,
    },
    icon: 'Eye',
    color: '#3b82f6',
  },
  {
    id: 'content_manager',
    name: 'Content Manager',
    description: 'Full content and upload management',
    permissions: ['content:read', 'content:write', 'content:delete', 'uploads:write'],
    rateLimits: {
      requestsPerMinute: 60,
      requestsPerHour: 3000,
      requestsPerDay: 50000,
    },
    icon: 'FileVideo',
    color: '#8b5cf6',
  },
  {
    id: 'streaming',
    name: 'Streaming API',
    description: 'Access streaming and playback endpoints',
    permissions: ['streaming:read', 'streaming:write', 'content:read'],
    rateLimits: {
      requestsPerMinute: 200,
      requestsPerHour: 10000,
      requestsPerDay: 200000,
    },
    icon: 'Play',
    color: '#10b981',
  },
  {
    id: 'analytics',
    name: 'Analytics API',
    description: 'Access analytics and reporting data',
    permissions: ['analytics:read', 'content:read', 'users:read'],
    rateLimits: {
      requestsPerMinute: 30,
      requestsPerHour: 1000,
      requestsPerDay: 20000,
    },
    icon: 'BarChart',
    color: '#f59e0b',
  },
  {
    id: 'admin',
    name: 'Full Admin Access',
    description: 'Unrestricted access to all endpoints',
    permissions: ['admin:all'],
    rateLimits: {
      requestsPerMinute: 300,
      requestsPerHour: 15000,
      requestsPerDay: 300000,
      burstLimit: 50,
    },
    icon: 'Shield',
    color: '#ef4444',
  },
];

/**
 * Status colors
 */
export const API_KEY_STATUS_COLORS: Record<APIKeyStatus, string> = {
  active: '#10b981',
  inactive: '#6b7280',
  revoked: '#ef4444',
  expired: '#f59e0b',
};

/**
 * Status labels
 */
export const API_KEY_STATUS_LABELS: Record<APIKeyStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  revoked: 'Revoked',
  expired: 'Expired',
};

/**
 * Permission categories
 */
export const PERMISSION_CATEGORIES: Record<string, APIKeyPermission[]> = {
  'Content': ['content:read', 'content:write', 'content:delete'],
  'Users': ['users:read', 'users:write', 'users:delete'],
  'Subscriptions': ['subscriptions:read', 'subscriptions:write'],
  'Analytics': ['analytics:read'],
  'Uploads': ['uploads:write'],
  'Streaming': ['streaming:read', 'streaming:write'],
  'Downloads': ['downloads:read'],
  'Admin': ['admin:all'],
};

/**
 * Permission labels
 */
export const PERMISSION_LABELS: Record<APIKeyPermission, string> = {
  'content:read': 'Read Content',
  'content:write': 'Write Content',
  'content:delete': 'Delete Content',
  'users:read': 'Read Users',
  'users:write': 'Write Users',
  'users:delete': 'Delete Users',
  'subscriptions:read': 'Read Subscriptions',
  'subscriptions:write': 'Write Subscriptions',
  'analytics:read': 'Read Analytics',
  'uploads:write': 'Upload Content',
  'streaming:read': 'Read Streaming',
  'streaming:write': 'Write Streaming',
  'downloads:read': 'Read Downloads',
  'admin:all': 'Full Admin Access',
};

/**
 * Default rate limits
 */
export const DEFAULT_RATE_LIMITS: RateLimits = {
  requestsPerMinute: 60,
  requestsPerHour: 3000,
  requestsPerDay: 50000,
};
