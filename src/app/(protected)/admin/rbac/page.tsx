// app/(protected)/admin/rbac/page.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  Users,
  UserCircle,
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  Crown,
  Lock,
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { useRBAC } from '@/hooks/useRBAC';
import { RoleModal } from '@/components/admin/rbac/RoleModal';
import { UserRoleAssignment } from '@/components/admin/rbac/UserRoleAssignment';
import { PERMISSION_TEMPLATES } from '@/types/rbac';
import type { Role, UserRole, CreateRoleRequest, UpdateRoleRequest } from '@/types/rbac';

type Tab = 'roles' | 'users' | 'templates';

export default function RBACPage() {
  const {
    permissions,
    roles,
    users,
    isLoading,
    createRole,
    updateRole,
    deleteRole,
    assignRoles,
    isCreating,
    isUpdating,
    isDeleting,
    isAssigning,
    createError,
    updateError,
    deleteError,
    assignError,
  } = useRBAC();

  const [activeTab, setActiveTab] = useState<Tab>('roles');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | undefined>();
  const [assigningUser, setAssigningUser] = useState<UserRole | undefined>();
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);

  // Filter roles
  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter users
  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateRole = (data: CreateRoleRequest) => {
    createRole(data, {
      onSuccess: () => {
        setIsRoleModalOpen(false);
        setEditingRole(undefined);
      },
    });
  };

  const handleUpdateRole = (data: UpdateRoleRequest) => {
    if (!editingRole) return;
    updateRole(
      { roleId: editingRole.id, data },
      {
        onSuccess: () => {
          setIsRoleModalOpen(false);
          setEditingRole(undefined);
        },
      }
    );
  };

  const handleDeleteRole = (roleId: string) => {
    if (window.confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
      deleteRole(roleId, {
        onSuccess: () => setRoleToDelete(null),
      });
    }
  };

  const handleAssignRoles = (userId: string, roleIds: string[]) => {
    assignRoles(
      { userId, roleIds },
      {
        onSuccess: () => {
          setIsUserModalOpen(false);
          setAssigningUser(undefined);
        },
      }
    );
  };

  const openEditModal = (role: Role) => {
    setEditingRole(role);
    setIsRoleModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingRole(undefined);
    setIsRoleModalOpen(true);
  };

  const openUserModal = (user: UserRole) => {
    setAssigningUser(user);
    setIsUserModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-dark via-background to-background-dark">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 backdrop-blur-xl bg-background-dark/80 border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <motion.h1
                className="text-4xl font-bold bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                Permissions & Roles
              </motion.h1>
              <motion.p
                className="text-white/60 mt-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Manage user roles and access control
              </motion.p>
            </div>

            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-accent-primary to-accent-secondary hover:shadow-lg hover:shadow-accent-primary/20 transition-all"
              >
                <Plus className="w-5 h-5" />
                <span className="font-semibold">Create Role</span>
              </button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-2 p-2 bg-background-elevated rounded-xl border border-white/10 mb-6"
        >
          <button
            onClick={() => setActiveTab('roles')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all ${
              activeTab === 'roles'
                ? 'bg-gradient-to-r from-accent-primary to-accent-secondary text-white'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Shield className="w-5 h-5" />
            <span>Roles ({roles.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all ${
              activeTab === 'users'
                ? 'bg-gradient-to-r from-accent-primary to-accent-secondary text-white'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Users ({users.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all ${
              activeTab === 'templates'
                ? 'bg-gradient-to-r from-accent-primary to-accent-secondary text-white'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Crown className="w-5 h-5" />
            <span>Templates ({PERMISSION_TEMPLATES.length})</span>
          </button>
        </motion.div>

        {/* Search Bar */}
        {activeTab !== 'templates' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-6 relative"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'roles' ? 'Search roles...' : 'Search users...'}
              className="w-full pl-12 pr-4 py-3 bg-background-elevated border border-white/10 rounded-xl focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 outline-none transition-all"
            />
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent-primary border-t-transparent" />
          </div>
        )}

        {/* Roles Tab */}
        {!isLoading && activeTab === 'roles' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filteredRoles.map((role, index) => {
              const IconComponent = Icons[role.icon as keyof typeof Icons] as React.ComponentType<{
                className?: string;
              }>;

              return (
                <motion.div
                  key={role.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group p-5 rounded-xl border border-white/10 bg-gradient-to-br from-background-elevated to-background-hover hover:border-white/30 transition-all"
                  whileHover={{ y: -4 }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="p-3 rounded-xl border"
                      style={{
                        backgroundColor: `${role.color}20`,
                        borderColor: `${role.color}30`,
                      }}
                    >
                      <IconComponent className="w-6 h-6" style={{ color: role.color }} />
                    </div>
                    {role.isSystemRole ? (
                      <div className="px-2.5 py-1 bg-white/10 rounded-lg flex items-center gap-1.5 text-xs">
                        <Lock className="w-3 h-3" />
                        <span>System</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(role)}
                          className="p-2 rounded-lg hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRole(role.id)}
                          className="p-2 rounded-lg hover:bg-red-500/20 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    )}
                  </div>

                  <h3 className="font-semibold text-lg mb-2">{role.name}</h3>
                  <p className="text-sm text-white/60 mb-4 line-clamp-2">{role.description}</p>

                  <div className="flex items-center justify-between text-sm text-white/50">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      <span>{role.permissions.length} permissions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{role.userCount} users</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Users Tab */}
        {!isLoading && activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-3"
          >
            {filteredUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-5 rounded-xl border border-white/10 bg-gradient-to-br from-background-elevated to-background-hover hover:border-white/30 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20">
                      <UserCircle className="w-8 h-8 text-accent-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{user.username}</h3>
                      <p className="text-white/60 text-sm mt-1">{user.email}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {user.roles.length === 0 ? (
                          <span className="text-sm text-white/40">No roles assigned</span>
                        ) : (
                          user.roles.map((role) => {
                            const IconComponent = Icons[role.icon as keyof typeof Icons] as React.ComponentType<{
                              className?: string;
                            }>;
                            return (
                              <div
                                key={role.id}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-sm"
                                style={{
                                  backgroundColor: `${role.color}20`,
                                  borderColor: `${role.color}40`,
                                }}
                              >
                                <IconComponent className="w-4 h-4" style={{ color: role.color }} />
                                <span>{role.name}</span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => openUserModal(user)}
                    className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium"
                  >
                    Manage Roles
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {PERMISSION_TEMPLATES.map((template, index) => {
              const IconComponent = Icons[template.icon as keyof typeof Icons] as React.ComponentType<{
                className?: string;
              }>;

              return (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="group p-5 rounded-xl border border-white/10 bg-gradient-to-br from-background-elevated to-background-hover hover:border-white/30 transition-all"
                  whileHover={{ y: -4 }}
                >
                  <div
                    className="p-3 rounded-xl border inline-block mb-4"
                    style={{
                      backgroundColor: `${template.color}20`,
                      borderColor: `${template.color}30`,
                    }}
                  >
                    <IconComponent className="w-6 h-6" style={{ color: template.color }} />
                  </div>

                  <h3 className="font-semibold text-lg mb-2">{template.name}</h3>
                  <p className="text-sm text-white/60 mb-4">{template.description}</p>

                  <div className="text-sm text-white/50 mb-4">
                    <Shield className="w-4 h-4 inline mr-2" />
                    {template.permissions.length} permissions
                  </div>

                  <button
                    onClick={() => {
                      // Pre-fill modal with template data
                      setEditingRole(undefined);
                      setIsRoleModalOpen(true);
                      // Note: Would need to enhance RoleModal to accept template data
                    }}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium"
                  >
                    Use Template
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Empty States */}
        {!isLoading && activeTab === 'roles' && filteredRoles.length === 0 && (
          <div className="text-center py-20">
            <Shield className="w-16 h-16 mx-auto mb-4 text-white/20" />
            <h3 className="text-xl font-semibold mb-2">No roles found</h3>
            <p className="text-white/60">
              {searchQuery ? 'Try adjusting your search' : 'Create your first role to get started'}
            </p>
          </div>
        )}

        {!isLoading && activeTab === 'users' && filteredUsers.length === 0 && (
          <div className="text-center py-20">
            <Users className="w-16 h-16 mx-auto mb-4 text-white/20" />
            <h3 className="text-xl font-semibold mb-2">No users found</h3>
            <p className="text-white/60">
              {searchQuery ? 'Try adjusting your search' : 'No users to display'}
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <RoleModal
        isOpen={isRoleModalOpen}
        onClose={() => {
          setIsRoleModalOpen(false);
          setEditingRole(undefined);
        }}
        onSubmit={editingRole ? handleUpdateRole : handleCreateRole}
        permissions={permissions}
        role={editingRole}
        isLoading={isCreating || isUpdating}
        error={createError || updateError}
      />

      <UserRoleAssignment
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false);
          setAssigningUser(undefined);
        }}
        onSubmit={handleAssignRoles}
        user={assigningUser}
        roles={roles}
        isLoading={isAssigning}
        error={assignError}
      />
    </div>
  );
}
