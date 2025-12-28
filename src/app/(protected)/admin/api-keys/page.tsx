// app/(protected)/admin/api-keys/page.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Key,
  Plus,
  Copy,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  AlertTriangle,
  Shield,
  X,
  Calendar,
  Globe,
  Zap,
  TrendingUp,
  BarChart,
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { useAPIKeys, useAPIKeyUsage } from '@/hooks/useAPIKeys';
import type { APIKey, CreateAPIKeyRequest, APIKeyPermission, APIKeyStatus } from '@/types/apiKey';
import {
  API_KEY_TEMPLATES,
  API_KEY_STATUS_COLORS,
  API_KEY_STATUS_LABELS,
  PERMISSION_CATEGORIES,
  PERMISSION_LABELS,
  DEFAULT_RATE_LIMITS,
} from '@/types/apiKey';

export default function APIKeysPage() {
  const { apiKeys, isLoading, createKey, updateKey, revokeKey, deleteKey, isCreating, createdKey } = useAPIKeys();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedKey, setSelectedKey] = useState<APIKey | null>(null);
  const [showFullKey, setShowFullKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopyKey = (key: string, keyId: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRevokeKey = (keyId: string) => {
    if (window.confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      revokeKey(keyId);
    }
  };

  const handleDeleteKey = (keyId: string) => {
    if (window.confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      deleteKey(keyId);
    }
  };

  const getStatusIcon = (status: APIKeyStatus) => {
    switch (status) {
      case 'active':
        return CheckCircle;
      case 'inactive':
        return Clock;
      case 'revoked':
        return Ban;
      case 'expired':
        return XCircle;
    }
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
                API Key Management
              </motion.h1>
              <motion.p
                className="text-white/60 mt-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Create and manage API keys for programmatic access
              </motion.p>
            </div>

            <motion.button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-accent-primary to-accent-secondary hover:shadow-lg hover:shadow-accent-primary/20 transition-all"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Plus className="w-5 h-5" />
              <span className="font-semibold">Create API Key</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
        >
          <div className="p-5 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-lg bg-green-500/20">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold">{apiKeys.filter((k) => k.status === 'active').length}</h3>
            <p className="text-sm text-white/60 mt-1">Active Keys</p>
          </div>

          <div className="p-5 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-lg bg-blue-500/20">
                <Key className="w-5 h-5 text-blue-400" />
              </div>
              <Activity className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold">{apiKeys.length}</h3>
            <p className="text-sm text-white/60 mt-1">Total Keys</p>
          </div>

          <div className="p-5 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-lg bg-purple-500/20">
                <Zap className="w-5 h-5 text-purple-400" />
              </div>
              <BarChart className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold">
              {apiKeys.reduce((sum, key) => sum + key.usageCount, 0).toLocaleString()}
            </h3>
            <p className="text-sm text-white/60 mt-1">Total Requests</p>
          </div>

          <div className="p-5 rounded-xl bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-500/20">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-lg bg-red-500/20">
                <Ban className="w-5 h-5 text-red-400" />
              </div>
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="text-2xl font-bold">{apiKeys.filter((k) => k.status === 'revoked').length}</h3>
            <p className="text-sm text-white/60 mt-1">Revoked Keys</p>
          </div>
        </motion.div>

        {/* API Keys List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent-primary border-t-transparent" />
          </div>
        ) : apiKeys.length === 0 ? (
          <div className="text-center py-20">
            <Key className="w-16 h-16 mx-auto mb-4 text-white/20" />
            <h3 className="text-xl font-semibold mb-2">No API keys yet</h3>
            <p className="text-white/60 mb-6">Create your first API key to get started</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-accent-primary to-accent-secondary hover:shadow-lg hover:shadow-accent-primary/20 transition-all"
            >
              Create API Key
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3"
          >
            {apiKeys.map((apiKey, index) => {
              const StatusIcon = getStatusIcon(apiKey.status);
              const statusColor = API_KEY_STATUS_COLORS[apiKey.status];

              return (
                <motion.div
                  key={apiKey.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="p-5 rounded-xl border border-white/10 bg-gradient-to-br from-background-elevated to-background-hover hover:border-white/30 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20">
                        <Key className="w-6 h-6 text-accent-primary" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                              {apiKey.name}
                              <span
                                className="px-2.5 py-0.5 rounded-lg text-xs font-medium"
                                style={{
                                  backgroundColor: `${statusColor}20`,
                                  color: statusColor,
                                }}
                              >
                                {API_KEY_STATUS_LABELS[apiKey.status]}
                              </span>
                              <span className="px-2 py-0.5 bg-white/10 rounded text-xs">
                                {apiKey.environment}
                              </span>
                            </h3>
                            {apiKey.description && (
                              <p className="text-sm text-white/60 mt-1">{apiKey.description}</p>
                            )}
                          </div>
                        </div>

                        {/* Key Display */}
                        <div className="mt-4 p-3 bg-black/30 rounded-lg border border-white/10 font-mono text-sm flex items-center justify-between">
                          <span className="text-white/80">
                            {showFullKey === apiKey.id ? apiKey.key : `${apiKey.keyPrefix}••••••••••••••••••••••••`}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setShowFullKey(showFullKey === apiKey.id ? null : apiKey.id)}
                              className="p-1.5 hover:bg-white/10 rounded transition-colors"
                            >
                              {showFullKey === apiKey.id ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleCopyKey(apiKey.key, apiKey.id)}
                              className="p-1.5 hover:bg-white/10 rounded transition-colors"
                            >
                              {copiedKey === apiKey.id ? (
                                <CheckCircle className="w-4 h-4 text-green-400" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Metadata */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                          <div>
                            <p className="text-xs text-white/40 mb-1">Usage</p>
                            <p className="font-medium text-white/80">{apiKey.usageCount.toLocaleString()} requests</p>
                          </div>
                          <div>
                            <p className="text-xs text-white/40 mb-1">Rate Limit</p>
                            <p className="font-medium text-white/80">{apiKey.rateLimits.requestsPerMinute}/min</p>
                          </div>
                          <div>
                            <p className="text-xs text-white/40 mb-1">Created</p>
                            <p className="font-medium text-white/80">
                              {new Date(apiKey.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-white/40 mb-1">Last Used</p>
                            <p className="font-medium text-white/80">
                              {apiKey.lastUsedAt
                                ? new Date(apiKey.lastUsedAt).toLocaleDateString()
                                : 'Never'}
                            </p>
                          </div>
                        </div>

                        {/* Permissions */}
                        <div className="mt-3">
                          <p className="text-xs text-white/40 mb-2">Permissions</p>
                          <div className="flex flex-wrap gap-2">
                            {apiKey.permissions.slice(0, 5).map((permission) => (
                              <span
                                key={permission}
                                className="px-2 py-1 bg-white/10 rounded text-xs"
                              >
                                {PERMISSION_LABELS[permission]}
                              </span>
                            ))}
                            {apiKey.permissions.length > 5 && (
                              <span className="px-2 py-1 bg-white/10 rounded text-xs">
                                +{apiKey.permissions.length - 5} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedKey(apiKey)}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <BarChart className="w-5 h-5 text-blue-400" />
                      </button>
                      {apiKey.status === 'active' && (
                        <button
                          onClick={() => handleRevokeKey(apiKey.id)}
                          className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                        >
                          <Ban className="w-5 h-5 text-red-400" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteKey(apiKey.id)}
                        className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 className="w-5 h-5 text-red-400" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Create Modal */}
      <CreateAPIKeyModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={(data) => {
          createKey(data, {
            onSuccess: () => setShowCreateModal(false),
          });
        }}
        isCreating={isCreating}
        createdKey={createdKey}
      />

      {/* Usage Stats Modal */}
      {selectedKey && (
        <UsageStatsModal
          apiKey={selectedKey}
          onClose={() => setSelectedKey(null)}
        />
      )}
    </div>
  );
}

// Create API Key Modal Component
function CreateAPIKeyModal({
  isOpen,
  onClose,
  onCreate,
  isCreating,
  createdKey,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: CreateAPIKeyRequest) => void;
  isCreating: boolean;
  createdKey?: any;
}) {
  const [formData, setFormData] = useState<CreateAPIKeyRequest>({
    name: '',
    description: '',
    permissions: [],
    rateLimits: DEFAULT_RATE_LIMITS,
    environment: 'development',
  });
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleTemplateSelect = (templateId: string) => {
    const template = API_KEY_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setFormData((prev) => ({
        ...prev,
        permissions: template.permissions,
        rateLimits: template.rateLimits,
      }));
      setSelectedTemplate(templateId);
    }
  };

  const togglePermission = (permission: APIKeyPermission) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />
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
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Create API Key</h2>
                  <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {createdKey ? (
                <div className="p-6">
                  <div className="text-center mb-6">
                    <div className="inline-flex p-4 rounded-full bg-green-500/20 mb-4">
                      <CheckCircle className="w-12 h-12 text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">API Key Created!</h3>
                    <p className="text-white/60">Save this key securely - it won't be shown again</p>
                  </div>

                  <div className="p-4 bg-black/30 rounded-lg border border-white/10 font-mono text-sm mb-6">
                    <p className="text-white/40 text-xs mb-2">Your API Key:</p>
                    <div className="flex items-center justify-between">
                      <span className="text-accent-primary break-all">{createdKey.fullKey}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(createdKey.fullKey);
                        }}
                        className="p-2 hover:bg-white/10 rounded transition-colors ml-2"
                      >
                        <Copy className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={onClose}
                    className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-accent-primary to-accent-secondary hover:shadow-lg transition-all"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-180px)]">
                  <div className="p-6 space-y-6">
                    {/* Templates */}
                    <div>
                      <label className="block text-sm font-medium mb-3">Quick Templates</label>
                      <div className="grid grid-cols-2 gap-3">
                        {API_KEY_TEMPLATES.map((template) => {
                          const IconComponent = Icons[template.icon as keyof typeof Icons] as React.ComponentType<{
                            className?: string;
                          }>;
                          return (
                            <button
                              key={template.id}
                              type="button"
                              onClick={() => handleTemplateSelect(template.id)}
                              className={`p-4 rounded-lg border transition-all text-left ${
                                selectedTemplate === template.id
                                  ? 'border-2'
                                  : 'border-white/10 hover:border-white/30'
                              }`}
                              style={{
                                backgroundColor:
                                  selectedTemplate === template.id ? `${template.color}15` : 'rgba(255, 255, 255, 0.05)',
                                borderColor: selectedTemplate === template.id ? template.color : undefined,
                              }}
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className="p-2 rounded-lg"
                                  style={{ backgroundColor: `${template.color}20` }}
                                >
                                  <div style={{ color: template.color }}>
                                    <IconComponent className="w-5 h-5" />
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-sm">{template.name}</h4>
                                  <p className="text-xs text-white/60 mt-1">{template.description}</p>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Basic Info */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="Production API Key"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 outline-none transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="Used for production streaming API..."
                        rows={3}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 outline-none transition-all resize-none"
                      />
                    </div>

                    {/* Environment */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Environment *</label>
                      <div className="flex gap-2">
                        {(['production', 'development', 'testing'] as const).map((env) => (
                          <button
                            key={env}
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, environment: env }))}
                            className={`flex-1 px-4 py-2 rounded-lg border transition-all capitalize ${
                              formData.environment === env
                                ? 'bg-accent-primary/20 border-accent-primary/40 text-accent-primary'
                                : 'bg-white/5 border-white/10 hover:bg-white/10'
                            }`}
                          >
                            {env}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Permissions */}
                    <div>
                      <label className="block text-sm font-medium mb-3">
                        Permissions ({formData.permissions.length} selected)
                      </label>
                      <div className="space-y-3">
                        {Object.entries(PERMISSION_CATEGORIES).map(([category, permissions]) => (
                          <div key={category}>
                            <p className="text-sm font-medium text-white/60 mb-2">{category}</p>
                            <div className="flex flex-wrap gap-2">
                              {permissions.map((permission) => {
                                const isSelected = formData.permissions.includes(permission);
                                return (
                                  <button
                                    key={permission}
                                    type="button"
                                    onClick={() => togglePermission(permission)}
                                    className={`px-3 py-1.5 rounded-lg border text-sm transition-all ${
                                      isSelected
                                        ? 'bg-accent-primary/20 border-accent-primary/40 text-accent-primary'
                                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                                    }`}
                                  >
                                    {PERMISSION_LABELS[permission]}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 border-t border-white/10 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreating || formData.permissions.length === 0 || !formData.name}
                      className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-accent-primary to-accent-secondary hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCreating ? 'Creating...' : 'Create API Key'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Usage Stats Modal
function UsageStatsModal({ apiKey, onClose }: { apiKey: APIKey; onClose: () => void }) {
  const { usage, isLoading } = useAPIKeyUsage(apiKey.id);

  return (
    <AnimatePresence>
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
        >
          <div
            className="bg-gradient-to-br from-background-elevated to-background-hover rounded-2xl border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-auto pointer-events-auto shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-2xl font-bold">Usage Statistics - {apiKey.name}</h2>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent-primary border-t-transparent" />
              </div>
            ) : usage ? (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-white/5 rounded-lg">
                    <p className="text-sm text-white/60 mb-1">Total Requests</p>
                    <p className="text-2xl font-bold">{usage.totalRequests.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg">
                    <p className="text-sm text-white/60 mb-1">Success Rate</p>
                    <p className="text-2xl font-bold text-green-400">
                      {((usage.successfulRequests / usage.totalRequests) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg">
                    <p className="text-sm text-white/60 mb-1">Avg Response Time</p>
                    <p className="text-2xl font-bold">{usage.averageResponseTime}ms</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Top Endpoints</h3>
                  <div className="space-y-2">
                    {usage.endpointBreakdown.slice(0, 10).map((endpoint) => (
                      <div key={endpoint.endpoint} className="p-3 bg-white/5 rounded-lg flex items-center justify-between">
                        <span className="font-mono text-sm">{endpoint.endpoint}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-white/60">{endpoint.count} calls</span>
                          <span className="text-white/40">{endpoint.averageResponseTime}ms avg</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-white/60 py-20">No usage data available</p>
            )}
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  );
}
