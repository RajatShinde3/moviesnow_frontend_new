// types/session.ts

/**
 * User session information
 */
export interface UserSession {
  id: string;
  userId: string;
  username: string;
  email: string;
  deviceInfo: DeviceInfo;
  location: LocationInfo;
  ipAddress: string;
  userAgent: string;
  isCurrentSession: boolean;
  createdAt: string; // ISO timestamp
  lastActivity: string; // ISO timestamp
  expiresAt: string; // ISO timestamp
  status: SessionStatus;
  activityLog: ActivityEntry[];
}

/**
 * Device information
 */
export interface DeviceInfo {
  type: DeviceType;
  os: string;
  osVersion: string;
  browser: string;
  browserVersion: string;
  deviceName?: string;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

/**
 * Location information from IP
 */
export interface LocationInfo {
  country: string;
  countryCode: string;
  region?: string;
  city?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
  flag?: string; // Country flag emoji
}

/**
 * Session status
 */
export type SessionStatus = 'active' | 'idle' | 'expired' | 'terminated';

/**
 * Device types
 */
export type DeviceType = 'desktop' | 'mobile' | 'tablet' | 'tv' | 'unknown';

/**
 * Activity log entry
 */
export interface ActivityEntry {
  id: string;
  type: ActivityType;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

/**
 * Activity types
 */
export type ActivityType =
  | 'login'
  | 'logout'
  | 'page_view'
  | 'content_watch'
  | 'content_download'
  | 'settings_change'
  | 'api_request'
  | 'error'
  | 'security_event';

/**
 * Session statistics
 */
export interface SessionStats {
  totalActiveSessions: number;
  totalUsers: number;
  deviceBreakdown: {
    desktop: number;
    mobile: number;
    tablet: number;
    tv: number;
  };
  topLocations: Array<{
    country: string;
    countryCode: string;
    count: number;
    flag: string;
  }>;
  topBrowsers: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  sessionDuration: {
    average: number; // seconds
    median: number; // seconds
    max: number; // seconds
  };
  recentActivity: ActivityEntry[];
}

/**
 * Session filter options
 */
export interface SessionFilters {
  status?: SessionStatus[];
  deviceType?: DeviceType[];
  searchQuery?: string;
  sortBy?: 'lastActivity' | 'createdAt' | 'username';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Request to terminate a session
 */
export interface TerminateSessionRequest {
  sessionId: string;
  reason?: string;
}

/**
 * Bulk session termination
 */
export interface BulkTerminateRequest {
  sessionIds: string[];
  reason?: string;
}

/**
 * Session alert rules
 */
export interface SessionAlert {
  id: string;
  type: AlertType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  sessionId?: string;
  userId?: string;
  timestamp: string;
  acknowledged: boolean;
}

/**
 * Alert types
 */
export type AlertType =
  | 'suspicious_location'
  | 'multiple_devices'
  | 'expired_session'
  | 'unusual_activity'
  | 'concurrent_limit'
  | 'security_breach';

/**
 * Real-time session update via WebSocket
 */
export interface SessionUpdate {
  type: 'session_created' | 'session_updated' | 'session_terminated' | 'activity_logged';
  session: UserSession;
  timestamp: string;
}

/**
 * Device icon mapping
 */
export const DEVICE_ICONS: Record<DeviceType, string> = {
  desktop: 'Monitor',
  mobile: 'Smartphone',
  tablet: 'Tablet',
  tv: 'Tv',
  unknown: 'HelpCircle',
};

/**
 * Status color mapping
 */
export const STATUS_COLORS: Record<SessionStatus, string> = {
  active: '#10b981',
  idle: '#f59e0b',
  expired: '#ef4444',
  terminated: '#6b7280',
};

/**
 * Status labels
 */
export const STATUS_LABELS: Record<SessionStatus, string> = {
  active: 'Active',
  idle: 'Idle',
  expired: 'Expired',
  terminated: 'Terminated',
};
