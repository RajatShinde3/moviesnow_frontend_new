// components/admin/rbac/RoleModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, CheckCircle, Circle, AlertCircle } from 'lucide-react';
import type { Role, Permission, CreateRoleRequest, UpdateRoleRequest, PermissionCategory } from '@/types/rbac';
import { ROLE_COLORS, ROLE_ICONS } from '@/types/rbac';
import * as Icons from 'lucide-react';

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateRoleRequest | UpdateRoleRequest) => void;
  permissions: Permission[];
  role?: Role; // If provided, edit mode
  isLoading?: boolean;
  error?: Error | null;
}

export function RoleModal({ isOpen, onClose, onSubmit, permissions, role, isLoading, error }: RoleModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [selectedColor, setSelectedColor] = useState<string>("#3b82f6");
  const [selectedIcon, setSelectedIcon] = useState<string>("Shield");
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PermissionCategory | 'all'>('all');

  // Initialize form with role data if editing
  useEffect(() => {
    if (role) {
      setName(role.name);
      setDescription(role.description);
      setSelectedPermissions(new Set(role.permissions.map((p) => p.id)));
      setSelectedColor(role.color);
      setSelectedIcon(role.icon);
    } else {
      // Reset form
      setName('');
      setDescription('');
      setSelectedPermissions(new Set());
      setSelectedColor(ROLE_COLORS[0]);
      setSelectedIcon(ROLE_ICONS[0]);
    }
  }, [role, isOpen]);

  // Filter permissions
  const filteredPermissions = permissions.filter((permission) => {
    const matchesSearch =
      permission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      permission.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || permission.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group permissions by category
  const permissionsByCategory = filteredPermissions.reduce(
    (acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    },
    {} as Record<PermissionCategory, Permission[]>
  );

  const categories: PermissionCategory[] = [
    'Content Management',
    'User Management',
    'Financial',
    'Analytics',
    'Security',
    'System',
  ];

  const togglePermission = (permissionId: string) => {
    const newSet = new Set(selectedPermissions);
    if (newSet.has(permissionId)) {
      newSet.delete(permissionId);
    } else {
      newSet.add(permissionId);
    }
    setSelectedPermissions(newSet);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name,
      description,
      permissionIds: Array.from(selectedPermissions),
      color: selectedColor,
      icon: selectedIcon,
    };
    onSubmit(data);
  };

  const SelectedIconComponent = Icons[selectedIcon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;

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
              className="bg-gradient-to-br from-background-elevated to-background-hover rounded-2xl border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-hidden pointer-events-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10 bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{role ? 'Edit Role' : 'Create New Role'}</h2>
                    <p className="text-white/60 mt-1">
                      {role ? 'Update role details and permissions' : 'Define a new role with custom permissions'}
                    </p>
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

                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Basic Information</h3>

                    <div>
                      <label className="block text-sm font-medium mb-2">Role Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Content Manager"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 outline-none transition-all"
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe what this role can do..."
                        rows={3}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 outline-none transition-all resize-none"
                        required
                        disabled={isLoading}
                      />
                    </div>

                    {/* Color and Icon Selection */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Color</label>
                        <div className="flex flex-wrap gap-2">
                          {ROLE_COLORS.map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setSelectedColor(color as string)}
                              className={`w-10 h-10 rounded-lg transition-all ${
                                selectedColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-background-elevated scale-110' : 'hover:scale-110'
                              }`}
                              style={{ backgroundColor: color }}
                              disabled={isLoading}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Icon</label>
                        <div className="flex flex-wrap gap-2">
                          {ROLE_ICONS.map((iconName) => {
                            const IconComponent = Icons[iconName as keyof typeof Icons] as React.ComponentType<{
                              className?: string;
                            }>;
                            return (
                              <button
                                key={iconName}
                                type="button"
                                onClick={() => setSelectedIcon(iconName)}
                                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                                  selectedIcon === iconName
                                    ? 'bg-accent-primary text-white'
                                    : 'bg-white/5 hover:bg-white/10 text-white/60'
                                }`}
                                disabled={isLoading}
                              >
                                <IconComponent className="w-5 h-5" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Preview Badge */}
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <p className="text-sm text-white/60 mb-2">Preview:</p>
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border" style={{ backgroundColor: `${selectedColor}20`, borderColor: `${selectedColor}40` }}>
                        {/* @ts-expect-error - Dynamic Icon component */}
                        <SelectedIconComponent className="w-5 h-5" style={{ color: selectedColor }} />
                        <span className="font-semibold">{name || 'Role Name'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Permissions */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">
                        Permissions ({selectedPermissions.size} selected)
                      </h3>
                    </div>

                    {/* Search and Filter */}
                    <div className="flex gap-3">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search permissions..."
                          className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 outline-none transition-all"
                          disabled={isLoading}
                        />
                      </div>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value as PermissionCategory | 'all')}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 outline-none transition-all"
                        disabled={isLoading}
                      >
                        <option value="all">All Categories</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Permission List */}
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                      {Object.entries(permissionsByCategory).map(([category, perms]) => (
                        <div key={category}>
                          <h4 className="font-medium text-sm text-white/80 mb-2">{category}</h4>
                          <div className="space-y-2">
                            {perms.map((permission) => {
                              const isSelected = selectedPermissions.has(permission.id);
                              return (
                                <motion.button
                                  key={permission.id}
                                  type="button"
                                  onClick={() => togglePermission(permission.id)}
                                  className={`w-full p-3 rounded-lg border transition-all text-left ${
                                    isSelected
                                      ? 'bg-accent-primary/20 border-accent-primary/40'
                                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                                  }`}
                                  whileHover={{ scale: 1.01 }}
                                  whileTap={{ scale: 0.99 }}
                                  disabled={isLoading}
                                >
                                  <div className="flex items-start gap-3">
                                    {isSelected ? (
                                      <CheckCircle className="w-5 h-5 text-accent-primary mt-0.5 flex-shrink-0" />
                                    ) : (
                                      <Circle className="w-5 h-5 text-white/40 mt-0.5 flex-shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium">{permission.name}</div>
                                      <div className="text-sm text-white/60 mt-0.5">{permission.description}</div>
                                      <div className="flex items-center gap-2 mt-2">
                                        <span className="px-2 py-0.5 bg-white/10 rounded text-xs">
                                          {permission.resource}
                                        </span>
                                        <span className="px-2 py-0.5 bg-white/10 rounded text-xs">
                                          {permission.action}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </motion.button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    {filteredPermissions.length === 0 && (
                      <div className="text-center py-12 text-white/40">
                        <Search className="w-12 h-12 mx-auto mb-3 opacity-40" />
                        <p>No permissions found matching your search</p>
                      </div>
                    )}
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
                    disabled={isLoading || selectedPermissions.size === 0 || !name || !description}
                  >
                    {isLoading ? 'Saving...' : role ? 'Update Role' : 'Create Role'}
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
