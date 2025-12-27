/**
 * =============================================================================
 * Staff Management Page (Admin)
 * =============================================================================
 * Manage staff members, roles, and permissions
 */

'use client';

import { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Shield,
  Edit,
  Trash2,
  Mail,
  Phone,
  Calendar,
  Check,
  X,
  Crown,
} from 'lucide-react';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'super_admin' | 'admin' | 'moderator' | 'content_manager' | 'support';
  is_active: boolean;
  last_login?: string;
  created_at: string;
  permissions: string[];
}

export default function StaffManagementPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock data - replace with actual API
  const [staffMembers] = useState<StaffMember[]>([
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@moviesnow.com',
      role: 'super_admin',
      is_active: true,
      created_at: '2024-01-01',
      permissions: ['all'],
    },
  ]);

  const filteredStaff = staffMembers.filter((member) => {
    const matchesSearch =
      search === '' ||
      member.name.toLowerCase().includes(search.toLowerCase()) ||
      member.email.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === 'all' || member.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Users className="h-10 w-10 text-purple-400" />
                Staff Management
              </h1>
              <p className="text-gray-400">Manage team members and their permissions</p>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold hover:scale-105 transition-transform shadow-lg shadow-purple-500/30 flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Add Staff Member
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={<Users />}
              label="Total Staff"
              value={staffMembers.length}
              color="from-blue-500 to-blue-600"
            />
            <StatCard
              icon={<Crown />}
              label="Admins"
              value={staffMembers.filter((s) => s.role.includes('admin')).length}
              color="from-purple-500 to-purple-600"
            />
            <StatCard
              icon={<Check />}
              label="Active"
              value={staffMembers.filter((s) => s.is_active).length}
              color="from-green-500 to-green-600"
            />
            <StatCard
              icon={<Shield />}
              label="Moderators"
              value={staffMembers.filter((s) => s.role === 'moderator').length}
              color="from-yellow-500 to-orange-500"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
              <option value="content_manager">Content Manager</option>
              <option value="support">Support</option>
            </select>
          </div>
        </div>

        {/* Staff List */}
        {filteredStaff.length > 0 ? (
          <div className="space-y-3">
            {filteredStaff.map((member) => (
              <StaffCard key={member.id} member={member} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-16 text-center">
            <Users className="h-24 w-24 text-gray-700 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">No Staff Members Found</h2>
            <p className="text-gray-400 mb-6">
              {search || roleFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Add your first staff member to get started'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6">
      <div className={`p-3 bg-gradient-to-br ${color} rounded-lg mb-3 w-fit text-white`}>
        {icon}
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  );
}

function StaffCard({ member }: { member: StaffMember }) {
  const getRoleBadge = (role: string) => {
    const badges = {
      super_admin: { color: 'from-red-500 to-pink-500', label: 'Super Admin', icon: <Crown /> },
      admin: { color: 'from-purple-500 to-purple-600', label: 'Admin', icon: <Shield /> },
      moderator: { color: 'from-blue-500 to-blue-600', label: 'Moderator', icon: <Shield /> },
      content_manager: { color: 'from-green-500 to-green-600', label: 'Content Manager', icon: <Users /> },
      support: { color: 'from-yellow-500 to-orange-500', label: 'Support', icon: <Users /> },
    };

    const badge = badges[role as keyof typeof badges];
    if (!badge) return null;

    return (
      <span className={`px-3 py-1 bg-gradient-to-r ${badge.color} text-white rounded-full text-xs font-bold flex items-center gap-1 w-fit`}>
        {badge.icon && <span className="h-3 w-3">{badge.icon}</span>}
        {badge.label}
      </span>
    );
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6 hover:border-purple-500 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-xl font-bold text-white">{member.name}</h3>
            {getRoleBadge(member.role)}
            {member.is_active ? (
              <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold border border-green-500/30">
                Active
              </span>
            ) : (
              <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-bold border border-red-500/30">
                Inactive
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <Mail className="h-4 w-4" />
              <span>{member.email}</span>
            </div>
            {member.phone && (
              <div className="flex items-center gap-2 text-gray-400">
                <Phone className="h-4 w-4" />
                <span>{member.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-gray-400">
              <Calendar className="h-4 w-4" />
              <span>Joined {new Date(member.created_at).toLocaleDateString()}</span>
            </div>
            {member.last_login && (
              <div className="flex items-center gap-2 text-gray-400">
                <Clock className="h-4 w-4" />
                <span>Last login {new Date(member.last_login).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
          <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
            <Edit className="h-5 w-5 text-gray-400 hover:text-white" />
          </button>
          <button className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors">
            <Trash2 className="h-5 w-5 text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
