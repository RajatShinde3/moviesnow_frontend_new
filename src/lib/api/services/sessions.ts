/**
 * =============================================================================
 * Session Management Service
 * =============================================================================
 * API service for managing user sessions and devices
 */

import { apiClient } from '../client';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface Session {
  id: string;
  user_id: string;
  device_id: string;
  device_name: string;
  device_type: 'desktop' | 'mobile' | 'tablet' | 'tv' | 'other';
  browser: string;
  os: string;
  ip_address: string;
  location?: {
    city: string;
    region: string;
    country: string;
  };
  created_at: string;
  last_active: string;
  expires_at: string;
  is_current: boolean;
}

export interface Device {
  id: string;
  name: string;
  type: 'desktop' | 'mobile' | 'tablet' | 'tv' | 'other';
  os: string;
  browser?: string;
  app_version?: string;
  is_trusted: boolean;
  last_used: string;
  created_at: string;
  session_count: number;
}

export interface SecurityEvent {
  id: string;
  event_type: 'login' | 'logout' | 'failed_login' | 'password_change' | 'mfa_enabled' | 'mfa_disabled' | 'suspicious_activity';
  device_id: string;
  device_name: string;
  ip_address: string;
  location?: {
    city: string;
    country: string;
  };
  timestamp: string;
  details?: Record<string, any>;
  risk_level: 'low' | 'medium' | 'high';
}

export interface LoginAttempt {
  id: string;
  email: string;
  ip_address: string;
  success: boolean;
  failure_reason?: string;
  device_info: string;
  location?: {
    city: string;
    country: string;
  };
  timestamp: string;
}

export interface TrustedDevice {
  id: string;
  device_id: string;
  device_name: string;
  trusted_at: string;
  expires_at?: string;
  is_active: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Session Management Service
// ─────────────────────────────────────────────────────────────────────────────

export const sessionsService = {
  /**
   * Get all active sessions
   */
  async getActiveSessions(): Promise<Session[]> {
    const response = await apiClient.get('/auth/sessions');
    return response.data.sessions || [];
  },

  /**
   * Get session by ID
   */
  async getSessionById(sessionId: string): Promise<Session> {
    const response = await apiClient.get(`/auth/sessions/${sessionId}`);
    return response.data;
  },

  /**
   * Get current session
   */
  async getCurrentSession(): Promise<Session> {
    const response = await apiClient.get('/auth/sessions/current');
    return response.data;
  },

  /**
   * Revoke session
   */
  async revokeSession(sessionId: string): Promise<void> {
    await apiClient.delete(`/auth/sessions/${sessionId}`);
  },

  /**
   * Revoke all sessions except current
   */
  async revokeAllOtherSessions(): Promise<{ revoked_count: number }> {
    const response = await apiClient.post('/auth/sessions/revoke-all-others');
    return response.data;
  },

  /**
   * Revoke all sessions (logout from all devices)
   */
  async revokeAllSessions(): Promise<{ revoked_count: number }> {
    const response = await apiClient.post('/auth/sessions/revoke-all');
    return response.data;
  },

  /**
   * Extend session expiry
   */
  async extendSession(sessionId: string, hoursToAdd: number = 24): Promise<Session> {
    const response = await apiClient.post(`/auth/sessions/${sessionId}/extend`, {
      hours: hoursToAdd,
    });
    return response.data;
  },

  /**
   * Get all registered devices
   */
  async getDevices(): Promise<Device[]> {
    const response = await apiClient.get('/auth/devices');
    return response.data.devices || [];
  },

  /**
   * Get device by ID
   */
  async getDeviceById(deviceId: string): Promise<Device> {
    const response = await apiClient.get(`/auth/devices/${deviceId}`);
    return response.data;
  },

  /**
   * Update device name
   */
  async updateDeviceName(deviceId: string, name: string): Promise<Device> {
    const response = await apiClient.patch(`/auth/devices/${deviceId}`, { name });
    return response.data;
  },

  /**
   * Remove device
   */
  async removeDevice(deviceId: string): Promise<void> {
    await apiClient.delete(`/auth/devices/${deviceId}`);
  },

  /**
   * Trust device
   */
  async trustDevice(deviceId: string, duration_days?: number): Promise<TrustedDevice> {
    const response = await apiClient.post(`/auth/devices/${deviceId}/trust`, {
      duration_days,
    });
    return response.data;
  },

  /**
   * Untrust device
   */
  async untrustDevice(deviceId: string): Promise<void> {
    await apiClient.delete(`/auth/devices/${deviceId}/trust`);
  },

  /**
   * Get trusted devices
   */
  async getTrustedDevices(): Promise<TrustedDevice[]> {
    const response = await apiClient.get('/auth/devices/trusted');
    return response.data.devices || [];
  },

  /**
   * Get security events
   */
  async getSecurityEvents(options?: {
    event_type?: string;
    risk_level?: 'low' | 'medium' | 'high';
    start_date?: string;
    end_date?: string;
    page?: number;
    per_page?: number;
  }): Promise<{
    events: SecurityEvent[];
    total: number;
  }> {
    const params = new URLSearchParams();
    if (options?.event_type) params.append('event_type', options.event_type);
    if (options?.risk_level) params.append('risk_level', options.risk_level);
    if (options?.start_date) params.append('start_date', options.start_date);
    if (options?.end_date) params.append('end_date', options.end_date);
    if (options?.page) params.append('page', String(options.page));
    if (options?.per_page) params.append('per_page', String(options.per_page));

    const response = await apiClient.get(`/auth/security-events?${params.toString()}`);
    return response.data;
  },

  /**
   * Get login history
   */
  async getLoginHistory(options?: {
    success_only?: boolean;
    page?: number;
    per_page?: number;
  }): Promise<{
    attempts: LoginAttempt[];
    total: number;
  }> {
    const params = new URLSearchParams();
    if (options?.success_only !== undefined) params.append('success_only', String(options.success_only));
    if (options?.page) params.append('page', String(options.page));
    if (options?.per_page) params.append('per_page', String(options.per_page));

    const response = await apiClient.get(`/auth/login-history?${params.toString()}`);
    return response.data;
  },

  /**
   * Report suspicious activity
   */
  async reportSuspiciousActivity(details: {
    session_id?: string;
    description: string;
    evidence?: Record<string, any>;
  }): Promise<void> {
    await apiClient.post('/auth/report-suspicious-activity', details);
  },

  /**
   * Enable session alerts
   */
  async enableSessionAlerts(alertTypes: ('new_login' | 'new_device' | 'failed_login' | 'suspicious_activity')[]): Promise<void> {
    await apiClient.post('/auth/session-alerts', { alert_types: alertTypes });
  },

  /**
   * Get session alerts configuration
   */
  async getSessionAlerts(): Promise<{
    enabled: boolean;
    alert_types: ('new_login' | 'new_device' | 'failed_login' | 'suspicious_activity')[];
  }> {
    const response = await apiClient.get('/auth/session-alerts');
    return response.data;
  },

  /**
   * Get session statistics
   */
  async getSessionStats(): Promise<{
    total_sessions: number;
    active_sessions: number;
    trusted_devices: number;
    security_events_30_days: number;
    last_password_change: string | null;
    mfa_enabled: boolean;
  }> {
    const response = await apiClient.get('/auth/session-stats');
    return response.data;
  },

  /**
   * Verify device fingerprint
   */
  async verifyDeviceFingerprint(fingerprint: string): Promise<{
    is_trusted: boolean;
    device_id?: string;
    last_seen?: string;
  }> {
    const response = await apiClient.post('/auth/verify-device-fingerprint', {
      fingerprint,
    });
    return response.data;
  },

  /**
   * Request two-factor authentication for sensitive action
   */
  async requestTwoFactorChallenge(action: string): Promise<{
    challenge_id: string;
    expires_at: string;
  }> {
    const response = await apiClient.post('/auth/2fa-challenge', { action });
    return response.data;
  },

  /**
   * Verify two-factor challenge
   */
  async verifyTwoFactorChallenge(challengeId: string, code: string): Promise<{
    verified: boolean;
    token?: string;
  }> {
    const response = await apiClient.post(`/auth/2fa-challenge/${challengeId}/verify`, {
      code,
    });
    return response.data;
  },
};
