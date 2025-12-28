/**
 * =============================================================================
 * Session Management Service
 * =============================================================================
 * API service for managing user sessions and devices
 */

import { fetchJson } from '../client';

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
    const response: any = await fetchJson<any>('/auth/sessions');
    return response.data.sessions || [];
  },

  /**
   * Get session by ID
   */
  async getSessionById(sessionId: string): Promise<Session> {
    const response: any = await fetchJson<any>(`/auth/sessions/${sessionId}`);
    return response as any;
  },

  /**
   * Get current session
   */
  async getCurrentSession(): Promise<Session> {
    const response: any = await fetchJson<any>('/auth/sessions/current');
    return response as any;
  },

  /**
   * Revoke session
   */
  async revokeSession(sessionId: string): Promise<void> {
    await fetchJson<any>(`/auth/sessions/${sessionId}`);
  },

  /**
   * Revoke all sessions except current
   */
  async revokeAllOtherSessions(): Promise<{ revoked_count: number }> {
    const response: any = await fetchJson<any>('/auth/sessions/revoke-all-others');
    return response as any;
  },

  /**
   * Revoke all sessions (logout from all devices)
   */
  async revokeAllSessions(): Promise<{ revoked_count: number }> {
    const response: any = await fetchJson<any>('/auth/sessions/revoke-all');
    return response as any;
  },

  /**
   * Extend session expiry
   */
  async extendSession(sessionId: string, hoursToAdd: number = 24): Promise<Session> {
    const response: any = await fetchJson<any>(`/auth/sessions/${sessionId}/extend`, {
      method: 'POST',
      body: JSON.stringify({ hours: hoursToAdd }),
    });
    return response as any;
  },

  /**
   * Get all registered devices
   */
  async getDevices(): Promise<Device[]> {
    const response: any = await fetchJson<any>('/auth/devices');
    return response.data.devices || [];
  },

  /**
   * Get device by ID
   */
  async getDeviceById(deviceId: string): Promise<Device> {
    const response: any = await fetchJson<any>(`/auth/devices/${deviceId}`);
    return response as any;
  },

  /**
   * Update device name
   */
  async updateDeviceName(deviceId: string, name: string): Promise<Device> {
    const response: any = await fetchJson<any>(`/auth/devices/${deviceId}`, {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    });
    return response as any;
  },

  /**
   * Remove device
   */
  async removeDevice(deviceId: string): Promise<void> {
    await fetchJson<any>(`/auth/devices/${deviceId}`);
  },

  /**
   * Trust device
   */
  async trustDevice(deviceId: string, duration_days?: number): Promise<TrustedDevice> {
    const response: any = await fetchJson<any>(`/auth/devices/${deviceId}/trust`, {
      method: 'POST',
      body: JSON.stringify({ duration_days }),
    });
    return response as any;
  },

  /**
   * Untrust device
   */
  async untrustDevice(deviceId: string): Promise<void> {
    await fetchJson<any>(`/auth/devices/${deviceId}/trust`);
  },

  /**
   * Get trusted devices
   */
  async getTrustedDevices(): Promise<TrustedDevice[]> {
    const response: any = await fetchJson<any>('/auth/devices/trusted');
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

    const response: any = await fetchJson<any>(`/auth/security-events?${params.toString()}`);
    return response as any;
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

    const response: any = await fetchJson<any>(`/auth/login-history?${params.toString()}`);
    return response as any;
  },

  /**
   * Report suspicious activity
   */
  async reportSuspiciousActivity(details: {
    session_id?: string;
    description: string;
    evidence?: Record<string, any>;
  }): Promise<void> {
    await fetchJson<any>('/auth/report-suspicious-activity', { method: "PATCH", json: details });
  },

  /**
   * Enable session alerts
   */
  async enableSessionAlerts(alertTypes: ('new_login' | 'new_device' | 'failed_login' | 'suspicious_activity')[]): Promise<void> {
    await fetchJson<any>('/auth/session-alerts', {
      method: 'POST',
      body: JSON.stringify({ alert_types: alertTypes }),
    });
  },

  /**
   * Get session alerts configuration
   */
  async getSessionAlerts(): Promise<{
    enabled: boolean;
    alert_types: ('new_login' | 'new_device' | 'failed_login' | 'suspicious_activity')[];
  }> {
    const response: any = await fetchJson<any>('/auth/session-alerts');
    return response as any;
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
    const response: any = await fetchJson<any>('/auth/session-stats');
    return response as any;
  },

  /**
   * Verify device fingerprint
   */
  async verifyDeviceFingerprint(fingerprint: string): Promise<{
    is_trusted: boolean;
    device_id?: string;
    last_seen?: string;
  }> {
    const response: any = await fetchJson<any>('/auth/verify-device-fingerprint', {
      method: 'POST',
      body: JSON.stringify({ fingerprint }),
    });
    return response as any;
  },

  /**
   * Request two-factor authentication for sensitive action
   */
  async requestTwoFactorChallenge(action: string): Promise<{
    challenge_id: string;
    expires_at: string;
  }> {
    const response: any = await fetchJson<any>('/auth/2fa-challenge', {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
    return response as any;
  },

  /**
   * Verify two-factor challenge
   */
  async verifyTwoFactorChallenge(challengeId: string, code: string): Promise<{
    verified: boolean;
    token?: string;
  }> {
    const response: any = await fetchJson<any>(`/auth/2fa-challenge/${challengeId}/verify`, {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
    return response as any;
  },
};
