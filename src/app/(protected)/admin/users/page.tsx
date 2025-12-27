// app/(protected)/admin/users/page.tsx
/**
 * =============================================================================
 * Admin - User & Subscription Manager
 * =============================================================================
 * Comprehensive user management with:
 * - User search and filtering
 * - Subscription status management
 * - Role assignment (admin, superuser)
 * - Session management
 * - Activity logs
 * - Bulk operations
 */

"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Shield,
  ShieldCheck,
  Crown,
  Ban,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Calendar,
  Eye,
  Activity,
  DollarSign,
  Star,
  MoreVertical,
  RefreshCw,
  Download,
  Upload,
  Settings,
  LogOut,
  Sparkles,
  Award,
  TrendingUp,
} from "lucide-react";
import { fetchJson } from "@/lib/api/client";

// ============================================================================
// Types
// ============================================================================

interface User {
  id: string;
  email: string;
  full_name?: string;
  is_verified: boolean;
  is_active: boolean;
  role: "USER" | "ADMIN" | "SUPERUSER";
  created_at: string;
  last_login?: string;
  subscription?: {
    id: string;
    status: "active" | "canceled" | "expired" | "trial";
    plan_name: string;
    current_period_end: string;
  };
}

// ============================================================================
// Main Component
// ============================================================================

export default function UsersManagementPage() {
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [subscriptionFilter, setSubscriptionFilter] = React.useState<string>("all");
  const [showFilters, setShowFilters] = React.useState(false);
  const [selectedUsers, setSelectedUsers] = React.useState<Set<string>>(new Set());

  // Fetch users
  const { data: usersData, isLoading, refetch } = useQuery({
    queryKey: ["admin", "users", searchQuery, roleFilter, statusFilter, subscriptionFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (roleFilter !== "all") params.append("role", roleFilter);
      if (statusFilter !== "all") params.append("status", statusFilter);
      params.append("limit", "100");

      const response = await fetchJson<{ items: User[]; total: number }>(
        `/api/v1/admin/users?${params.toString()}`
      );
      return response;
    },
    refetchInterval: 30000,
  });

  const users = usersData?.items || [];
  const totalCount = usersData?.total || 0;

  // Toggle user selection
  const toggleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map((u) => u.id)));
    }
  };

  // Bulk deactivate
  const bulkDeactivateMutation = useMutation({
    mutationFn: async (userIds: string[]) => {
      await Promise.all(
        userIds.map((id) =>
          fetchJson(`/api/v1/admin/users/${id}/deactivate`, { method: "POST" })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      setSelectedUsers(new Set());
    },
  });

  const activeUsers = users.filter((u) => u.is_active).length;
  const subscribedUsers = users.filter((u) => u.subscription?.status === "active").length;
  const admins = users.filter((u) => u.role === "ADMIN" || u.role === "SUPERUSER").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      <div className="mx-auto max-w-[1800px] px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 p-3 shadow-lg shadow-blue-500/30">
                <Users className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">User Management</h1>
                <p className="mt-1 text-gray-400">
                  {totalCount} users • {selectedUsers.size} selected
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => refetch()}
                className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2.5 font-medium text-white transition-all hover:bg-gray-800"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>

              <button className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2.5 font-medium text-white transition-all hover:bg-gray-800">
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Users className="h-5 w-5" />}
            label="Total Users"
            value={totalCount}
            color="blue"
          />
          <StatCard
            icon={<CheckCircle className="h-5 w-5" />}
            label="Active Users"
            value={activeUsers}
            color="green"
          />
          <StatCard
            icon={<Star className="h-5 w-5" />}
            label="Subscribed"
            value={subscribedUsers}
            color="purple"
          />
          <StatCard
            icon={<Shield className="h-5 w-5" />}
            label="Admins"
            value={admins}
            color="yellow"
          />
        </div>

        {/* Filters & Search */}
        <div className="mb-6 rounded-xl border border-gray-800 bg-gray-900/50 p-6 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by email or name..."
                className="w-full rounded-lg border border-gray-700 bg-gray-800 py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 rounded-lg border px-4 py-3 font-medium transition-all ${
                showFilters
                  ? "border-blue-500 bg-blue-500/10 text-blue-400"
                  : "border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              <Filter className="h-5 w-5" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="grid gap-4 border-t border-gray-800 pt-4 sm:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-400">Role</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="all">All Roles</option>
                  <option value="USER">Users</option>
                  <option value="ADMIN">Admins</option>
                  <option value="SUPERUSER">Superusers</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-400">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="verified">Verified</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-400">Subscription</label>
                <select
                  value={subscriptionFilter}
                  onChange={(e) => setSubscriptionFilter(e.target.value)}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="trial">Trial</option>
                  <option value="expired">Expired</option>
                  <option value="none">No Subscription</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedUsers.size > 0 && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <CheckCircle className="h-5 w-5 text-blue-400" />
              <p className="font-medium text-blue-300">
                {selectedUsers.size} user{selectedUsers.size === 1 ? "" : "s"} selected
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => bulkDeactivateMutation.mutate(Array.from(selectedUsers))}
                disabled={bulkDeactivateMutation.isPending}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition-all hover:bg-red-700 disabled:opacity-50"
              >
                <Ban className="h-4 w-4" />
                Deactivate
              </button>

              <button
                onClick={() => setSelectedUsers(new Set())}
                className="ml-2 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 font-semibold text-white transition-all hover:bg-gray-700"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Users Table */}
        {isLoading ? (
          <LoadingState />
        ) : users.length === 0 ? (
          <EmptyState searchQuery={searchQuery} />
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900/50">
            <table className="w-full">
              <thead className="border-b border-gray-800 bg-gray-800/50">
                <tr>
                  <th className="w-12 px-4 py-4">
                    <button
                      onClick={toggleSelectAll}
                      className="text-gray-400 hover:text-white"
                    >
                      {selectedUsers.size === users.length ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <div className="h-5 w-5 rounded border-2 border-gray-600" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">
                    User
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">
                    Role
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">
                    Status
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">
                    Subscription
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">
                    Joined
                  </th>
                  <th className="w-24 px-4 py-4 text-right text-sm font-semibold text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {users.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    isSelected={selectedUsers.has(user.id)}
                    onToggleSelect={() => toggleSelectUser(user.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Sub-Components
// ============================================================================

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: "blue" | "green" | "purple" | "yellow";
}) {
  const colorClasses = {
    blue: "from-blue-500 to-cyan-600",
    green: "from-green-500 to-emerald-600",
    purple: "from-purple-500 to-pink-600",
    yellow: "from-yellow-500 to-orange-600",
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-800 bg-gray-900/50 p-6 backdrop-blur-xl">
      <div className={`absolute right-0 top-0 h-24 w-24 opacity-10 blur-3xl bg-gradient-to-br ${colorClasses[color]}`} />
      <div className="relative">
        <div className={`mb-4 inline-flex rounded-full bg-gradient-to-br ${colorClasses[color]} p-3 text-white`}>
          {icon}
        </div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className="mt-1 text-3xl font-bold text-white">{value.toLocaleString()}</p>
      </div>
    </div>
  );
}

function UserRow({
  user,
  isSelected,
  onToggleSelect,
}: {
  user: User;
  isSelected: boolean;
  onToggleSelect: () => void;
}) {
  return (
    <tr className="group transition-colors hover:bg-gray-800/50">
      <td className="px-4 py-4">
        <button onClick={onToggleSelect} className="text-gray-400 hover:text-white">
          {isSelected ? (
            <CheckCircle className="h-5 w-5 text-blue-400" />
          ) : (
            <div className="h-5 w-5 rounded border-2 border-gray-600" />
          )}
        </button>
      </td>

      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-bold text-white">
            {user.full_name?.[0] || user.email[0].toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-white">{user.full_name || "No name"}</p>
            <p className="text-sm text-gray-400">{user.email}</p>
          </div>
        </div>
      </td>

      <td className="px-4 py-4">
        <RoleBadge role={user.role} />
      </td>

      <td className="px-4 py-4">
        <StatusBadge isActive={user.is_active} isVerified={user.is_verified} />
      </td>

      <td className="px-4 py-4">
        {user.subscription ? (
          <SubscriptionBadge subscription={user.subscription} />
        ) : (
          <span className="text-sm text-gray-500">No subscription</span>
        )}
      </td>

      <td className="px-4 py-4">
        <div className="text-sm text-gray-300">
          {new Date(user.created_at).toLocaleDateString()}
        </div>
      </td>

      <td className="px-4 py-4 text-right">
        <UserActions user={user} />
      </td>
    </tr>
  );
}

function RoleBadge({ role }: { role: string }) {
  const config = {
    USER: { icon: Users, label: "User", color: "bg-blue-500/20 text-blue-400" },
    ADMIN: { icon: Shield, label: "Admin", color: "bg-purple-500/20 text-purple-400" },
    SUPERUSER: { icon: Crown, label: "Super", color: "bg-yellow-500/20 text-yellow-400" },
  };

  const { icon: Icon, label, color } = config[role as keyof typeof config] || config.USER;

  return (
    <div className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${color}`}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </div>
  );
}

function StatusBadge({ isActive, isVerified }: { isActive: boolean; isVerified: boolean }) {
  if (!isActive) {
    return (
      <div className="inline-flex items-center gap-1 rounded-full bg-red-500/20 px-2.5 py-1 text-xs font-medium text-red-400">
        <XCircle className="h-3.5 w-3.5" />
        Inactive
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="inline-flex items-center gap-1 rounded-full bg-yellow-500/20 px-2.5 py-1 text-xs font-medium text-yellow-400">
        <Clock className="h-3.5 w-3.5" />
        Unverified
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-green-500/20 px-2.5 py-1 text-xs font-medium text-green-400">
      <CheckCircle className="h-3.5 w-3.5" />
      Active
    </div>
  );
}

function SubscriptionBadge({ subscription }: { subscription: any }) {
  const config = {
    active: { label: "Active", color: "bg-green-500/20 text-green-400" },
    trial: { label: "Trial", color: "bg-blue-500/20 text-blue-400" },
    canceled: { label: "Canceled", color: "bg-orange-500/20 text-orange-400" },
    expired: { label: "Expired", color: "bg-red-500/20 text-red-400" },
  };

  const { label, color } = config[subscription.status as keyof typeof config] || config.active;

  return (
    <div className="space-y-1">
      <div className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${color}`}>
        <Star className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="text-xs text-gray-500">{subscription.plan_name}</p>
    </div>
  );
}

function UserActions({ user }: { user: User }) {
  const [showMenu, setShowMenu] = React.useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-lg border border-gray-700 bg-gray-800 shadow-xl">
            <button className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-white hover:bg-gray-700">
              <Eye className="h-4 w-4" />
              View Details
            </button>
            <button className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-white hover:bg-gray-700">
              <Edit className="h-4 w-4" />
              Edit User
            </button>
            <button className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-white hover:bg-gray-700">
              <LogOut className="h-4 w-4" />
              Revoke Sessions
            </button>
            <div className="border-t border-gray-700" />
            <button className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-400 hover:bg-red-500/10">
              <Ban className="h-4 w-4" />
              Deactivate User
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="mb-4 flex items-center gap-4">
          <div className="h-10 w-10 animate-pulse rounded-full bg-gray-800" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-48 animate-pulse rounded bg-gray-800" />
            <div className="h-3 w-32 animate-pulse rounded bg-gray-800" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ searchQuery }: { searchQuery: string }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-gray-800 bg-gray-900/30 p-16 text-center">
      <Users className="mx-auto h-16 w-16 text-gray-700" />
      <h3 className="mt-4 text-xl font-semibold text-white">
        {searchQuery ? "No users found" : "No users yet"}
      </h3>
      <p className="mt-2 text-gray-400">
        {searchQuery
          ? "Try adjusting your search or filters"
          : "Users will appear here as they register"}
      </p>
    </div>
  );
}
