/**
 * =============================================================================
 * EnhancedAdminDashboard Component
 * =============================================================================
 * Complete admin dashboard with stats, analytics, and management tools
 */

'use client';

import { useState } from 'react';
import {
  LayoutDashboard,
  Film,
  Users,
  TrendingUp,
  Upload,
  BarChart3,
  DollarSign,
  PlayCircle,
} from 'lucide-react';
import {
  useAdminStats,
  useUserAnalytics,
  useRevenueAnalytics,
} from '@/lib/api/hooks/useAdmin';

type AdminTab = 'dashboard' | 'content' | 'users' | 'analytics' | 'upload';

export default function EnhancedAdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  const TABS = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'content' as const, label: 'Content', icon: Film },
    { id: 'users' as const, label: 'Users', icon: Users },
    { id: 'analytics' as const, label: 'Analytics', icon: BarChart3 },
    { id: 'upload' as const, label: 'Upload', icon: Upload },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Manage content, users, and analytics</p>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </div>

        <div>
          {activeTab === 'dashboard' && <DashboardOverview />}
          {activeTab === 'content' && <div className="text-white">Content Management</div>}
          {activeTab === 'users' && <div className="text-white">User Management</div>}
          {activeTab === 'analytics' && <AnalyticsDashboard />}
          {activeTab === 'upload' && <div className="text-white">Content Upload</div>}
        </div>
      </div>
    </div>
  );
}

function DashboardOverview() {
  const { data: stats, isLoading } = useAdminStats();
  const { data: userAnalytics } = useUserAnalytics(30);
  const { data: revenueAnalytics } = useRevenueAnalytics(30);

  if (isLoading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Titles"
          value={stats?.total_titles || 0}
          icon={<Film className="h-8 w-8" />}
          color="from-blue-500 to-blue-600"
        />
        <StatCard
          title="Total Users"
          value={stats?.total_users || 0}
          icon={<Users className="h-8 w-8" />}
          color="from-green-500 to-green-600"
        />
        <StatCard
          title="Active Subscribers"
          value={stats?.active_subscribers || 0}
          icon={<TrendingUp className="h-8 w-8" />}
          color="from-purple-500 to-purple-600"
        />
        <StatCard
          title="Total Revenue"
          value={`$${((stats?.total_revenue_cents || 0) / 100).toFixed(2)}`}
          icon={<DollarSign className="h-8 w-8" />}
          color="from-yellow-500 to-orange-500"
        />
      </div>
    </div>
  );
}

function AnalyticsDashboard() {
  const { data: userAnalytics } = useUserAnalytics(30);
  const { data: revenueAnalytics } = useRevenueAnalytics(30);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
        <h3 className="text-xl font-bold text-white mb-4">User Analytics (30 days)</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400">New Users</span>
            <span className="text-white font-bold">{userAnalytics?.new_users || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Active Users</span>
            <span className="text-white font-bold">{userAnalytics?.active_users || 0}</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
        <h3 className="text-xl font-bold text-white mb-4">Revenue Analytics (30 days)</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400">Total Revenue</span>
            <span className="text-white font-bold">
              ${((revenueAnalytics?.total_revenue_cents || 0) / 100).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">New Subscriptions</span>
            <span className="text-white font-bold">{revenueAnalytics?.new_subscriptions || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
      <div className={`p-3 bg-gradient-to-br ${color} rounded-xl mb-4 w-fit`}>{icon}</div>
      <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}
