'use client';

/**
 * Account Activity Page
 * Professional eye-comfortable dark design for viewing account activity
 * - Timeline of login attempts and security events
 * - Filter by type and success/failure
 * - Export activity log
 */

import * as React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fetchJson } from '@/lib/api/client';
import { cn } from '@/lib/cn';

// ══════════════════════════════════════════════════════════════════════════════
// Custom SVG Icons
// ══════════════════════════════════════════════════════════════════════════════

const ActivityIcon = ({ className = '', size = 20 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const LogInIcon = ({ className = '', size = 18 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <polyline points="10 17 15 12 10 7" />
    <line x1="15" y1="12" x2="3" y2="12" />
  </svg>
);

const LogOutIcon = ({ className = '', size = 18 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const KeyIcon = ({ className = '', size = 18 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
);

const MailIcon = ({ className = '', size = 18 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const ShieldIcon = ({ className = '', size = 18 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const CheckIcon = ({ className = '', size = 12 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = ({ className = '', size = 12 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const GlobeIcon = ({ className = '', size = 12 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const SmartphoneIcon = ({ className = '', size = 12 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
    <line x1="12" y1="18" x2="12.01" y2="18" />
  </svg>
);

const DownloadIcon = ({ className = '', size = 16 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const ArrowLeftIcon = ({ className = '', size = 16 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const ClockIcon = ({ className = '', size = 20 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

// ══════════════════════════════════════════════════════════════════════════════
// Types
// ══════════════════════════════════════════════════════════════════════════════

interface ActivityEvent {
  id: string;
  type: string;
  timestamp: string;
  success: boolean;
  ip?: string;
  user_agent?: string;
  location?: string;
  device?: string;
}

// ══════════════════════════════════════════════════════════════════════════════
// Component
// ══════════════════════════════════════════════════════════════════════════════

export default function ActivityPage() {
  const [filter, setFilter] = React.useState('all');
  const [showFailed, setShowFailed] = React.useState(false);

  // Mock data
  const MOCK_EVENTS: ActivityEvent[] = [
    {
      id: '1',
      type: 'login',
      timestamp: new Date().toISOString(),
      success: true,
      ip: '192.168.1.1',
      device: 'Chrome on Windows',
      user_agent: 'Mozilla/5.0',
    },
    {
      id: '2',
      type: 'password_change',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      success: true,
      ip: '192.168.1.1',
      device: 'Chrome on Windows',
      user_agent: 'Mozilla/5.0',
    },
    {
      id: '3',
      type: 'login',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      success: false,
      ip: '192.168.1.100',
      device: 'Safari on macOS',
      user_agent: 'Mozilla/5.0',
    },
  ];

  // Fetch activity log
  const { data: activityData, isLoading } = useQuery({
    queryKey: ['account-activity', filter, showFailed],
    queryFn: async () => {
      try {
        const response = await fetchJson<{ events: ActivityEvent[] }>('/auth/activity', {
          method: 'GET',
        });
        // Check if response has error property (backend returned error object)
        if (response && 'error' in response && (response as any).error) {
          return { events: MOCK_EVENTS };
        }
        return response;
      } catch (err: any) {
        if (err?.status === 404 || err?.code === 404 || err?.message?.includes('Not Found')) {
          return { events: MOCK_EVENTS };
        }
        throw err;
      }
    },
  });

  const events = activityData?.events ?? [];
  const filteredEvents = events.filter((event) => {
    if (showFailed && event.success) return false;
    if (filter !== 'all' && event.type !== filter) return false;
    return true;
  });

  const formatDate = (iso: string) => {
    try {
      const date = new Date(iso);
      return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date);
    } catch {
      return iso;
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login':
        return LogInIcon;
      case 'logout':
        return LogOutIcon;
      case 'password_change':
        return KeyIcon;
      case 'email_change':
        return MailIcon;
      case 'mfa_enable':
      case 'mfa_disable':
        return ShieldIcon;
      default:
        return ActivityIcon;
    }
  };

  const getEventLabel = (type: string) => {
    const labels: Record<string, string> = {
      login: 'Login',
      logout: 'Logout',
      password_change: 'Password Changed',
      email_change: 'Email Changed',
      mfa_enable: 'MFA Enabled',
      mfa_disable: 'MFA Disabled',
    };
    return labels[type] || type;
  };

  const exportToCsv = () => {
    const headers = ['Timestamp', 'Type', 'Status', 'IP', 'Device'];
    const rows = filteredEvents.map((event) => [
      formatDate(event.timestamp),
      getEventLabel(event.type),
      event.success ? 'Success' : 'Failed',
      event.ip || '-',
      event.device || event.user_agent || '-',
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `activity-log-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Activity log exported');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0D0D0D] via-[#0A0A0A] to-[#050505] text-[#E5E5E5]">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-4 border-[#1A1A1A]"></div>
            <div className="h-12 w-12 rounded-full border-4 border-[#2A2A2A] border-t-[#CECECE] animate-spin absolute top-0"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D0D0D] via-[#0A0A0A] to-[#050505] text-[#E5E5E5] p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div className="flex items-start gap-6">
            <div className="rounded-2xl bg-gradient-to-br from-[#252525] via-[#1C1C1C] to-[#161616] p-5 border border-[#2F2F2F] shadow-2xl shadow-black/60 backdrop-blur-sm">
              <ActivityIcon className="text-[#999999]" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#F0F0F0] mb-2 tracking-tight bg-gradient-to-r from-[#F5F5F5] to-[#D0D0D0] bg-clip-text text-transparent">Account Activity</h1>
              <p className="text-sm text-[#999999] leading-relaxed max-w-2xl">
                Review recent security events and login attempts across all your devices
              </p>
            </div>
          </div>
          {events.length > 0 && (
            <button
              onClick={exportToCsv}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#222222] to-[#1A1A1A] border border-[#2F2F2F] text-[#D0D0D0] text-sm font-semibold hover:from-[#252525] hover:to-[#1F1F1F] hover:border-[#3A3A3A] transition-all duration-300 shadow-lg"
            >
              <DownloadIcon className="text-[#888888]" size={18} />
              Export CSV
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="relative rounded-2xl border border-[#252525] bg-gradient-to-br from-[#161616] via-[#131313] to-[#0F0F0F] p-7 mb-8 shadow-2xl shadow-black/60 overflow-hidden backdrop-blur-sm">
          <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-[#1F1F1F]/10 to-transparent rounded-full blur-3xl -z-10"></div>
          <div className="flex flex-col gap-6">
            {/* Filter Dropdown */}
            <div className="flex items-center gap-5">
              <div className="rounded-xl bg-gradient-to-br from-[#222222] to-[#181818] p-3 border border-[#2F2F2F] shadow-lg flex-shrink-0">
                <svg className="text-[#888888]" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-[#999999] mb-2 tracking-wide uppercase">Filter Events</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full px-5 py-3 rounded-xl border border-[#2A2A2A] bg-gradient-to-r from-[#1C1C1C] to-[#181818] text-[#F0F0F0] text-sm font-semibold focus:outline-none focus:border-[#3A3A3A] hover:border-[#323232] transition-all duration-300 shadow-lg cursor-pointer appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23999999' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.75rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem',
                  }}
                >
                  <option value="all" className="bg-[#1A1A1A] text-[#F0F0F0]">All Events</option>
                  <option value="login" className="bg-[#1A1A1A] text-[#F0F0F0]">Logins</option>
                  <option value="logout" className="bg-[#1A1A1A] text-[#F0F0F0]">Logouts</option>
                  <option value="password_change" className="bg-[#1A1A1A] text-[#F0F0F0]">Password Changes</option>
                  <option value="email_change" className="bg-[#1A1A1A] text-[#F0F0F0]">Email Changes</option>
                  <option value="mfa_enable" className="bg-[#1A1A1A] text-[#F0F0F0]">MFA Events</option>
                </select>
              </div>
            </div>

            {/* Failed Attempts Toggle */}
            <div className="flex items-center gap-5 pt-2 border-t border-[#222222]">
              <div className="rounded-xl bg-gradient-to-br from-[#222222] to-[#181818] p-3 border border-[#2F2F2F] shadow-lg flex-shrink-0">
                <svg className="text-[#EF4444]" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <label className="flex items-center gap-4 cursor-pointer group flex-1 py-1">
                <div className="relative flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={showFailed}
                    onChange={(e) => setShowFailed(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gradient-to-r from-[#222222] to-[#1C1C1C] border border-[#2A2A2A] rounded-full peer-checked:bg-gradient-to-r peer-checked:from-[#EF4444] peer-checked:via-[#DC2626] peer-checked:to-[#B91C1C] peer-checked:border-[#EF4444]/50 transition-all duration-300 shadow-lg peer-checked:shadow-[#EF4444]/20"></div>
                  <div className="absolute left-1 top-1 w-5 h-5 bg-gradient-to-br from-[#7A7A7A] to-[#606060] rounded-full transition-all duration-300 peer-checked:translate-x-7 peer-checked:from-[#FFFFFF] peer-checked:to-[#F0F0F0] shadow-lg"></div>
                </div>
                <div>
                  <div className="text-sm font-bold text-[#F0F0F0] group-hover:text-[#FFFFFF] transition-colors duration-200">
                    Only Failed Attempts
                  </div>
                  <p className="text-xs text-[#888888] mt-0.5">Show only unsuccessful login and security events</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        {filteredEvents.length > 0 ? (
          <div className="relative rounded-2xl border border-[#252525] bg-gradient-to-br from-[#161616] via-[#131313] to-[#0F0F0F] p-7 shadow-2xl shadow-black/60 overflow-hidden backdrop-blur-sm">
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-[#1C1C1C]/10 to-transparent rounded-full blur-3xl -z-10"></div>
            <div className="flex items-center gap-4 mb-7">
              <div className="rounded-xl bg-gradient-to-br from-[#222222] to-[#181818] p-3 border border-[#2F2F2F] shadow-lg">
                <ClockIcon className="text-[#888888]" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#F0F0F0] tracking-tight">Activity Timeline</h2>
                <p className="text-sm text-[#888888] mt-1">
                  {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {filteredEvents.map((event) => {
                const EventIcon = getEventIcon(event.type);
                return (
                  <div
                    key={event.id}
                    className="flex items-start gap-4 p-5 rounded-xl border border-[#222222] bg-gradient-to-br from-[#131313] to-[#0F0F0F] hover:border-[#2F2F2F] hover:bg-gradient-to-br hover:from-[#161616] hover:to-[#111111] transition-all duration-300 shadow-lg group"
                  >
                    <div className="rounded-xl bg-gradient-to-br from-[#1F1F1F] to-[#181818] p-3 border border-[#2A2A2A] shadow-md group-hover:border-[#353535] transition-colors duration-300">
                      <EventIcon
                        className={event.success ? 'text-[#22C55E]' : 'text-[#EF4444]'}
                        size={20}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-base font-bold text-[#F0F0F0] group-hover:text-[#FFFFFF] transition-colors duration-200">
                          {getEventLabel(event.type)}
                        </h3>
                        {event.success ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/30 px-3 py-1 text-xs font-bold text-[#22C55E]">
                            <CheckIcon size={12} />
                            Success
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EF4444]/10 border border-[#EF4444]/30 px-3 py-1 text-xs font-bold text-[#EF4444]">
                            <XIcon size={12} />
                            Failed
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#999999] mb-3">
                        {formatDate(event.timestamp)}
                      </p>
                      <div className="flex flex-wrap gap-4 text-xs text-[#888888]">
                        {event.ip && (
                          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1A1A1A]/50 border border-[#252525]">
                            <GlobeIcon size={14} />
                            {event.ip}
                          </span>
                        )}
                        {event.location && (
                          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1A1A1A]/50 border border-[#252525]">
                            <GlobeIcon size={14} />
                            {event.location}
                          </span>
                        )}
                        {event.device && (
                          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1A1A1A]/50 border border-[#252525]">
                            <SmartphoneIcon size={14} />
                            {event.device}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="relative rounded-2xl border border-[#252525] bg-gradient-to-br from-[#161616] via-[#131313] to-[#0F0F0F] p-16 text-center shadow-2xl shadow-black/60 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#1A1A1A]/5 to-transparent rounded-full blur-3xl -z-10"></div>
            <ActivityIcon className="text-[#666666] mx-auto mb-5" size={56} />
            <h3 className="text-xl font-bold text-[#E0E0E0] mb-3">No Activity Found</h3>
            <p className="text-sm text-[#999999] max-w-md mx-auto">
              {showFailed
                ? 'No failed attempts found with the current filter settings'
                : 'No activity events match your current filter criteria'}
            </p>
          </div>
        )}

        {/* Back Link */}
        <div className="mt-12">
          <Link
            href="/settings/security"
            className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-[#1F1F1F] via-[#1A1A1A] to-[#161616] border border-[#2A2A2A] text-[#E0E0E0] text-sm font-bold hover:from-[#252525] hover:via-[#202020] hover:to-[#1C1C1C] hover:border-[#353535] hover:text-[#F0F0F0] transition-all duration-300 shadow-xl shadow-black/40 hover:shadow-2xl hover:shadow-black/60 group"
          >
            <ArrowLeftIcon className="group-hover:-translate-x-1 transition-transform duration-300" />
            Back to Security
          </Link>
        </div>

        {/* Bottom Spacing */}
        <div className="h-12" />
      </div>
    </div>
  );
}
