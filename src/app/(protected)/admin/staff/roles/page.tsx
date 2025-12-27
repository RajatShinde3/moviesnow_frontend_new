"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Plus,
  Edit2,
  Trash2,
  Users,
  Lock,
  Unlock,
  CheckCircle,
  X,
  Search,
} from "lucide-react";
import { api } from "@/lib/api/services";
import type { Role, Permission } from "@/lib/api/types";
import { ConfirmDialog } from "@/components/ui/data/ConfirmDialog";

const RESOURCE_CATEGORIES = [
  { name: "Content", resources: ["titles", "episodes", "seasons", "genres"] },
  { name: "Users", resources: ["users", "profiles", "subscriptions"] },
  { name: "Analytics", resources: ["analytics", "reports", "metrics"] },
  { name: "Monetization", resources: ["plans", "coupons", "ads", "revenue"] },
  { name: "Compliance", resources: ["dmca", "certifications", "legal"] },
  { name: "System", resources: ["settings", "cdn", "uploads", "api_keys"] },
];

const ACTIONS = [
  { value: "create", label: "Create", color: "green", icon: Plus },
  { value: "read", label: "Read", color: "blue", icon: Search },
  { value: "update", label: "Update", color: "amber", icon: Edit2 },
  { value: "delete", label: "Delete", color: "red", icon: Trash2 },
  { value: "manage", label: "Manage All", color: "purple", icon: Shield },
];

export default function StaffRolesPage() {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null);
  const [viewingRole, setViewingRole] = useState<Role | null>(null);

  // Form state
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [permissionSearch, setPermissionSearch] = useState("");

  // Fetch roles
  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ["admin", "rbac", "roles"],
    queryFn: () => api.permissions.listRoles(),
  });

  // Fetch available permissions
  const { data: permissions = [], isLoading: permissionsLoading } = useQuery({
    queryKey: ["admin", "rbac", "permissions"],
    queryFn: () => api.permissions.listPermissions(),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: { name: string; description?: string; permission_ids: string[] }) =>
      api.permissions.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "rbac", "roles"] });
      closeModal();
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: {
      roleId: string;
      updates: { name?: string; description?: string; permission_ids?: string[] };
    }) => api.permissions.updateRole(data.roleId, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "rbac", "roles"] });
      closeModal();
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (roleId: string) => api.permissions.deleteRole(roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "rbac", "roles"] });
      setDeleteRoleId(null);
    },
  });

  const closeModal = () => {
    setIsCreateModalOpen(false);
    setEditingRole(null);
    setRoleName("");
    setRoleDescription("");
    setSelectedPermissions([]);
  };

  const openEditModal = (role: Role) => {
    setEditingRole(role);
    setRoleName(role.name);
    setRoleDescription(role.description || "");
    setSelectedPermissions(role.permissions.map((p) => p.id));
    setIsCreateModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const roleData = {
      name: roleName,
      description: roleDescription || undefined,
      permission_ids: selectedPermissions,
    };

    if (editingRole) {
      updateMutation.mutate({ roleId: editingRole.id, updates: roleData });
    } else {
      createMutation.mutate(roleData);
    }
  };

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const toggleAllInResource = (resource: string) => {
    const resourcePerms = permissions.filter((p) => p.resource === resource);
    const allSelected = resourcePerms.every((p) => selectedPermissions.includes(p.id));

    if (allSelected) {
      setSelectedPermissions((prev) =>
        prev.filter((id) => !resourcePerms.map((p) => p.id).includes(id))
      );
    } else {
      setSelectedPermissions((prev) => [
        ...prev,
        ...resourcePerms.filter((p) => !prev.includes(p.id)).map((p) => p.id),
      ]);
    }
  };

  // Filter permissions by search
  const filteredPermissions = permissions.filter(
    (p) =>
      p.name.toLowerCase().includes(permissionSearch.toLowerCase()) ||
      p.resource.toLowerCase().includes(permissionSearch.toLowerCase()) ||
      p.description?.toLowerCase().includes(permissionSearch.toLowerCase())
  );

  const isLoading = rolesLoading || permissionsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/20 to-slate-950 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-8 w-64 bg-slate-800 animate-pulse rounded" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-slate-800 animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/20 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Shield className="w-8 h-8 text-indigo-400" />
              Staff Role Management
            </h1>
            <p className="text-slate-400">
              Manage roles and permissions for staff members
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-lg font-medium flex items-center gap-2 transition-all"
          >
            <Plus className="w-5 h-5" />
            Create Role
          </button>
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 backdrop-blur-sm border border-indigo-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Shield className="w-8 h-8 text-indigo-400" />
              <span className="text-3xl font-bold text-white">{roles.length}</span>
            </div>
            <p className="text-slate-400 text-sm">Total Roles</p>
          </div>

          <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 backdrop-blur-sm border border-blue-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Lock className="w-8 h-8 text-blue-400" />
              <span className="text-3xl font-bold text-white">{permissions.length}</span>
            </div>
            <p className="text-slate-400 text-sm">Available Permissions</p>
          </div>

          <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 backdrop-blur-sm border border-green-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-green-400" />
              <span className="text-3xl font-bold text-white">
                {roles.reduce((sum, role) => sum + role.user_count, 0)}
              </span>
            </div>
            <p className="text-slate-400 text-sm">Total Staff Members</p>
          </div>
        </motion.div>

        {/* Roles Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {roles.map((role, index) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className={`bg-slate-900/50 backdrop-blur-sm border rounded-xl p-6 hover:border-indigo-500/50 transition-all ${
                role.is_system_role ? "border-amber-700/50" : "border-slate-700"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{role.name}</h3>
                    {role.is_system_role && (
                      <span className="text-xs text-amber-400">System Role</span>
                    )}
                  </div>
                </div>

                {!role.is_system_role && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(role)}
                      className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteRoleId(role.id)}
                      className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {role.description && (
                <p className="text-sm text-slate-400 mb-4">{role.description}</p>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <span className="text-sm text-slate-400">Permissions</span>
                  <span className="text-white font-bold">{role.permissions.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <span className="text-sm text-slate-400">Staff Members</span>
                  <span className="text-white font-bold">{role.user_count}</span>
                </div>
              </div>

              <button
                onClick={() => setViewingRole(role)}
                className="mt-4 w-full px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-400 rounded-lg font-medium transition-all"
              >
                View Permissions
              </button>
            </motion.div>
          ))}
        </motion.div>

        {/* Create/Edit Modal */}
        <AnimatePresence>
          {isCreateModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
              onClick={closeModal}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-slate-900 border border-slate-700 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 z-10">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">
                      {editingRole ? "Edit" : "Create"} Role
                    </h2>
                    <button
                      onClick={closeModal}
                      className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Role Name & Description */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Role Name *
                      </label>
                      <input
                        type="text"
                        value={roleName}
                        onChange={(e) => setRoleName(e.target.value)}
                        required
                        placeholder="e.g., Content Manager"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Description (Optional)
                      </label>
                      <input
                        type="text"
                        value={roleDescription}
                        onChange={(e) => setRoleDescription(e.target.value)}
                        placeholder="Brief description of this role"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Permission Search */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Search Permissions
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        value={permissionSearch}
                        onChange={(e) => setPermissionSearch(e.target.value)}
                        placeholder="Search by name, resource, or description..."
                        className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Permissions Selection */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-slate-300">
                        Permissions ({selectedPermissions.length} selected)
                      </label>
                    </div>

                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                      {RESOURCE_CATEGORIES.map((category) => {
                        const categoryPerms = filteredPermissions.filter((p) =>
                          category.resources.includes(p.resource)
                        );

                        if (categoryPerms.length === 0) return null;

                        return (
                          <div
                            key={category.name}
                            className="bg-slate-800/50 rounded-lg p-4"
                          >
                            <h4 className="text-white font-semibold mb-3">
                              {category.name}
                            </h4>
                            <div className="space-y-2">
                              {category.resources.map((resource) => {
                                const resourcePerms = categoryPerms.filter(
                                  (p) => p.resource === resource
                                );
                                if (resourcePerms.length === 0) return null;

                                const allSelected = resourcePerms.every((p) =>
                                  selectedPermissions.includes(p.id)
                                );

                                return (
                                  <div key={resource} className="space-y-2">
                                    <button
                                      type="button"
                                      onClick={() => toggleAllInResource(resource)}
                                      className="w-full flex items-center justify-between p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
                                    >
                                      <span className="text-white font-medium capitalize">
                                        {resource}
                                      </span>
                                      {allSelected ? (
                                        <CheckCircle className="w-5 h-5 text-green-400" />
                                      ) : (
                                        <div className="w-5 h-5 border-2 border-slate-600 rounded" />
                                      )}
                                    </button>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 ml-4">
                                      {resourcePerms.map((perm) => {
                                        const action = ACTIONS.find(
                                          (a) => a.value === perm.action
                                        );
                                        const isSelected =
                                          selectedPermissions.includes(perm.id);

                                        return (
                                          <button
                                            key={perm.id}
                                            type="button"
                                            onClick={() => togglePermission(perm.id)}
                                            className={`p-2 rounded-lg border text-sm transition-all ${
                                              isSelected
                                                ? `border-${action?.color}-500 bg-${action?.color}-500/10 text-${action?.color}-400`
                                                : "border-slate-700 text-slate-400 hover:border-slate-600"
                                            }`}
                                          >
                                            {action?.label || perm.action}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={
                        !roleName ||
                        selectedPermissions.length === 0 ||
                        createMutation.isPending ||
                        updateMutation.isPending
                      }
                      className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {createMutation.isPending || updateMutation.isPending
                        ? "Saving..."
                        : editingRole
                          ? "Update Role"
                          : "Create Role"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* View Role Permissions Modal */}
        <AnimatePresence>
          {viewingRole && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
              onClick={() => setViewingRole(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white">{viewingRole.name}</h2>
                      {viewingRole.description && (
                        <p className="text-slate-400 mt-1">{viewingRole.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => setViewingRole(null)}
                      className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Permissions ({viewingRole.permissions.length})
                  </h3>
                  <div className="space-y-3">
                    {viewingRole.permissions.map((perm) => {
                      const action = ACTIONS.find((a) => a.value === perm.action);
                      const Icon = action?.icon || Lock;

                      return (
                        <div
                          key={perm.id}
                          className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-lg bg-${action?.color}-500/20 border border-${action?.color}-500/30 flex items-center justify-center`}
                            >
                              <Icon
                                className="w-5 h-5"
                                style={{
                                  color:
                                    action?.color === "green"
                                      ? "#10B981"
                                      : action?.color === "blue"
                                        ? "#3B82F6"
                                        : action?.color === "amber"
                                          ? "#F59E0B"
                                          : action?.color === "red"
                                            ? "#EF4444"
                                            : "#8B5CF6",
                                }}
                              />
                            </div>
                            <div>
                              <div className="text-white font-medium">{perm.name}</div>
                              <div className="text-xs text-slate-400">
                                {perm.resource} • {perm.action}
                              </div>
                            </div>
                          </div>
                          {perm.description && (
                            <div className="text-sm text-slate-400 max-w-md">
                              {perm.description}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={deleteRoleId !== null}
          onClose={() => setDeleteRoleId(null)}
          onConfirm={() => deleteRoleId && deleteMutation.mutate(deleteRoleId)}
          title="Delete Role"
          description="Are you sure you want to delete this role? Users with this role will lose their permissions. This action cannot be undone."
          confirmText="Delete Role"
          isDestructive
        />
      </div>
    </div>
  );
}
