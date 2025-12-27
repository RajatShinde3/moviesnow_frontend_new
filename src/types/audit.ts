// types/audit.ts

/**
 * Audit log entry
 */
export interface AuditLog {
  id: string;
  timestamp: string; // ISO timestamp
  userId: string;
  username: string;
  email: string;
  action: AuditAction;
  resource: AuditResource;
  resourceId?: string;
  resourceName?: string;
  severity: AuditSeverity;
  status: 'success' | 'failure';
  ipAddress: string;
  userAgent: string;
  location?: {
    country: string;
    city?: string;
    flag?: string;
  };
  changes?: AuditChange[];
  metadata?: Record<string, any>;
  errorMessage?: string;
}

/**
 * Audit action types
 */
export type AuditAction =
  // Authentication
  | 'login'
  | 'logout'
  | 'mfa_enabled'
  | 'mfa_disabled'
  | 'password_changed'
  | 'password_reset_requested'
  | 'password_reset_completed'
  | 'email_verified'
  // User Management
  | 'user_created'
  | 'user_updated'
  | 'user_deleted'
  | 'user_suspended'
  | 'user_activated'
  | 'role_assigned'
  | 'role_removed'
  | 'permission_granted'
  | 'permission_revoked'
  // Content Management
  | 'content_created'
  | 'content_updated'
  | 'content_deleted'
  | 'content_published'
  | 'content_unpublished'
  | 'content_uploaded'
  // Subscription
  | 'subscription_created'
  | 'subscription_updated'
  | 'subscription_cancelled'
  | 'subscription_renewed'
  | 'payment_processed'
  | 'payment_failed'
  | 'refund_issued'
  // Security
  | 'session_created'
  | 'session_terminated'
  | 'api_key_created'
  | 'api_key_revoked'
  | 'suspicious_activity_detected'
  | 'account_locked'
  | 'account_unlocked'
  // System
  | 'settings_updated'
  | 'backup_created'
  | 'backup_restored'
  | 'maintenance_started'
  | 'maintenance_ended'
  // Data Export
  | 'data_exported'
  | 'report_generated';

/**
 * Resource types
 */
export type AuditResource =
  | 'user'
  | 'role'
  | 'permission'
  | 'content'
  | 'subscription'
  | 'payment'
  | 'session'
  | 'api_key'
  | 'settings'
  | 'system';

/**
 * Severity levels
 */
export type AuditSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';

/**
 * Audit change tracking
 */
export interface AuditChange {
  field: string;
  oldValue: any;
  newValue: any;
}

/**
 * Audit log filters
 */
export interface AuditFilters {
  startDate?: string; // ISO timestamp
  endDate?: string; // ISO timestamp
  userId?: string;
  actions?: AuditAction[];
  resources?: AuditResource[];
  severities?: AuditSeverity[];
  status?: ('success' | 'failure')[];
  searchQuery?: string;
  sortBy?: 'timestamp' | 'severity' | 'action';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

/**
 * Audit statistics
 */
export interface AuditStats {
  totalLogs: number;
  todayLogs: number;
  failedActions: number;
  criticalEvents: number;
  topActions: Array<{
    action: AuditAction;
    count: number;
    percentage: number;
  }>;
  topUsers: Array<{
    userId: string;
    username: string;
    actionCount: number;
  }>;
  severityBreakdown: {
    info: number;
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  actionTimeline: Array<{
    timestamp: string;
    count: number;
  }>;
}

/**
 * Export format options
 */
export type ExportFormat = 'json' | 'csv' | 'pdf' | 'excel';

/**
 * Export request
 */
export interface ExportAuditRequest {
  filters: AuditFilters;
  format: ExportFormat;
  includeMetadata?: boolean;
  includeChanges?: boolean;
}

/**
 * Severity color mapping
 */
export const SEVERITY_COLORS: Record<AuditSeverity, string> = {
  info: '#3b82f6',
  low: '#10b981',
  medium: '#f59e0b',
  high: '#f97316',
  critical: '#ef4444',
};

/**
 * Severity icons
 */
export const SEVERITY_ICONS: Record<AuditSeverity, string> = {
  info: 'Info',
  low: 'CheckCircle',
  medium: 'AlertCircle',
  high: 'AlertTriangle',
  critical: 'XOctagon',
};

/**
 * Action categories for grouping
 */
export const ACTION_CATEGORIES: Record<string, AuditAction[]> = {
  'Authentication': [
    'login',
    'logout',
    'mfa_enabled',
    'mfa_disabled',
    'password_changed',
    'password_reset_requested',
    'password_reset_completed',
    'email_verified',
  ],
  'User Management': [
    'user_created',
    'user_updated',
    'user_deleted',
    'user_suspended',
    'user_activated',
    'role_assigned',
    'role_removed',
    'permission_granted',
    'permission_revoked',
  ],
  'Content': [
    'content_created',
    'content_updated',
    'content_deleted',
    'content_published',
    'content_unpublished',
    'content_uploaded',
  ],
  'Billing': [
    'subscription_created',
    'subscription_updated',
    'subscription_cancelled',
    'subscription_renewed',
    'payment_processed',
    'payment_failed',
    'refund_issued',
  ],
  'Security': [
    'session_created',
    'session_terminated',
    'api_key_created',
    'api_key_revoked',
    'suspicious_activity_detected',
    'account_locked',
    'account_unlocked',
  ],
  'System': [
    'settings_updated',
    'backup_created',
    'backup_restored',
    'maintenance_started',
    'maintenance_ended',
    'data_exported',
    'report_generated',
  ],
};

/**
 * Action display names
 */
export const ACTION_LABELS: Record<AuditAction, string> = {
  login: 'User Login',
  logout: 'User Logout',
  mfa_enabled: 'MFA Enabled',
  mfa_disabled: 'MFA Disabled',
  password_changed: 'Password Changed',
  password_reset_requested: 'Password Reset Requested',
  password_reset_completed: 'Password Reset Completed',
  email_verified: 'Email Verified',
  user_created: 'User Created',
  user_updated: 'User Updated',
  user_deleted: 'User Deleted',
  user_suspended: 'User Suspended',
  user_activated: 'User Activated',
  role_assigned: 'Role Assigned',
  role_removed: 'Role Removed',
  permission_granted: 'Permission Granted',
  permission_revoked: 'Permission Revoked',
  content_created: 'Content Created',
  content_updated: 'Content Updated',
  content_deleted: 'Content Deleted',
  content_published: 'Content Published',
  content_unpublished: 'Content Unpublished',
  content_uploaded: 'Content Uploaded',
  subscription_created: 'Subscription Created',
  subscription_updated: 'Subscription Updated',
  subscription_cancelled: 'Subscription Cancelled',
  subscription_renewed: 'Subscription Renewed',
  payment_processed: 'Payment Processed',
  payment_failed: 'Payment Failed',
  refund_issued: 'Refund Issued',
  session_created: 'Session Created',
  session_terminated: 'Session Terminated',
  api_key_created: 'API Key Created',
  api_key_revoked: 'API Key Revoked',
  suspicious_activity_detected: 'Suspicious Activity',
  account_locked: 'Account Locked',
  account_unlocked: 'Account Unlocked',
  settings_updated: 'Settings Updated',
  backup_created: 'Backup Created',
  backup_restored: 'Backup Restored',
  maintenance_started: 'Maintenance Started',
  maintenance_ended: 'Maintenance Ended',
  data_exported: 'Data Exported',
  report_generated: 'Report Generated',
};
