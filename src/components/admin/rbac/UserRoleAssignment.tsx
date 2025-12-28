// components/admin/rbac/UserRoleAssignment.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, UserCircle, Mail, Calendar, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import * as Icons from 'lucide-react';
import type { UserRole, Role } from '@/types/rbac';

interface UserRoleAssignmentProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userId: string, roleIds: string[]) => void;
  user?: UserRole;
  roles: Role[];
  isLoading?: boolean;
  error?: Error | null;
}

export function UserRoleAssignment({
  isOpen,
  onClose,
  onSubmit,
  user,
  roles,
  isLoading,
  error,
}: UserRoleAssignmentProps) {
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(
    new Set(user?.roles.map((r) => r.id) || [])
  );
  const [searchQuery, setSearchQuery] = useState('');

  // Filter roles
  const filteredRoles = roles.filter((role) =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleRole = (roleId: string) => {
    const newSet = new Set(selectedRoles);
    if (newSet.has(roleId)) {
      newSet.delete(roleId);
    } else {
      newSet.add(roleId);
    }
    setSelectedRoles(newSet);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    onSubmit(user.id, Array.from(selectedRoles));
  };

  if (!user) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="bg-gradient-to-br from-background-elevated to-background-hover rounded-2xl border border-white/10 w-full max-w-3xl max-h-[90vh] overflow-hidden pointer-events-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Assign Roles</h2>
                    <p className="text-white/60 mt-1">Manage roles for this user</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    disabled={isLoading}
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-180px)]">
                <div className="p-6 space-y-6">
                  {/* Error Display */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3"
                    >
                      <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-red-100">Error</h4>
                        <p className="text-sm text-red-200/80 mt-1">{error.message}</p>
                      </div>
                    </motion.div>
                  )}

                  {/* User Information */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20">
                        <UserCircle className="w-8 h-8 text-accent-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{user.username}</h3>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-white/60">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            <span>{user.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                          </div>
                          {user.lastLogin && (
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4" />
                              <span>Last login {new Date(user.lastLogin).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                        {user.roles.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {user.roles.map((role) => {
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
                                  {/* @ts-expect-error - Dynamic Icon component */}
                                  <IconComponent className="w-4 h-4" style={{ color: role.color }} />
                                  <span>{role.name}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Role Selection */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">Select Roles ({selectedRoles.size} selected)</h3>
                    </div>

                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search roles..."
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 outline-none transition-all"
                        disabled={isLoading}
                      />
                    </div>

                    {/* Role Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2">
                      {filteredRoles.map((role) => {
                        const isSelected = selectedRoles.has(role.id);
                        const IconComponent = Icons[role.icon as keyof typeof Icons] as React.ComponentType<{
                          className?: string;
                        }>;

                        return (
                          <motion.button
                            key={role.id}
                            type="button"
                            onClick={() => !role.isSystemRole && toggleRole(role.id)}
                            className={`p-4 rounded-xl border transition-all text-left relative ${
                              isSelected
                                ? 'border-2'
                                : 'border hover:border-white/30'
                            } ${
                              role.isSystemRole
                                ? 'opacity-50 cursor-not-allowed'
                                : 'cursor-pointer'
                            }`}
                            style={{
                              backgroundColor: isSelected ? `${role.color}15` : 'rgba(255, 255, 255, 0.05)',
                              borderColor: isSelected ? role.color : 'rgba(255, 255, 255, 0.1)',
                            }}
                            whileHover={!role.isSystemRole ? { scale: 1.02 } : {}}
                            whileTap={!role.isSystemRole ? { scale: 0.98 } : {}}
                            disabled={isLoading || role.isSystemRole}
                          >
                            {/* Selection Indicator */}
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute top-3 right-3"
                              >
                                <CheckCircle className="w-5 h-5" style={{ color: role.color }} />
                              </motion.div>
                            )}

                            <div className="flex items-start gap-3 pr-8">
                              <div
                                className="p-2.5 rounded-lg"
                                style={{
                                  backgroundColor: `${role.color}25`,
                                }}
                              >
                                {/* @ts-expect-error - Dynamic Icon component */}
                                <IconComponent className="w-5 h-5" style={{ color: role.color }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold flex items-center gap-2">
                                  {role.name}
                                  {role.isSystemRole && (
                                    <span className="px-2 py-0.5 bg-white/10 rounded text-xs font-normal">
                                      System
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-white/60 mt-1 line-clamp-2">{role.description}</p>
                                <div className="flex items-center gap-2 mt-2 text-xs text-white/50">
                                  <Shield className="w-3 h-3" />
                                  <span>{role.permissions.length} permissions</span>
                                  {role.userCount > 0 && (
                                    <>
                                      <span>•</span>
                                      <span>{role.userCount} users</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>

                    {filteredRoles.length === 0 && (
                      <div className="text-center py-12 text-white/40">
                        <Search className="w-12 h-12 mx-auto mb-3 opacity-40" />
                        <p>No roles found matching your search</p>
                      </div>
                    )}
                  </div>

                  {/* Info Box */}
                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-100/80">
                      <p className="font-medium mb-1">Role Hierarchy</p>
                      <p>System roles are automatically assigned and cannot be removed manually. Custom roles can be added or removed as needed.</p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 bg-background-elevated flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-accent-primary to-accent-secondary hover:shadow-lg hover:shadow-accent-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Update Roles'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
