"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Smartphone,
  Monitor,
  Tablet,
  Tv,
  Laptop,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  Clock,
  MapPin,
  Globe,
  Trash2,
  Plus,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";
import { api } from "@/lib/api/services";
import { ConfirmDialog } from "@/components/ui/dialogs/ConfirmDialog";

interface TrustedDevice {
  id: string;
  device_id: string;
  device_name: string;
  device_type: "desktop" | "mobile" | "tablet" | "tv" | "other";
  os: string;
  browser?: string;
  trusted_at: string;
  expires_at?: string;
  is_active: boolean;
  last_used?: string;
}

const DEVICE_ICONS = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
  tv: Tv,
  other: Laptop,
};

const DEVICE_COLORS = {
  desktop: "#3B82F6",
  mobile: "#10B981",
  tablet: "#8B5CF6",
  tv: "#F59E0B",
  other: "#6B7280",
};

export default function TrustedDevicesPage() {
  const queryClient = useQueryClient();
  const [selectedDevice, setSelectedDevice] = useState<TrustedDevice | null>(null);
  const [showUntrustDialog, setShowUntrustDialog] = useState(false);
  const [showTrustCurrentDialog, setShowTrustCurrentDialog] = useState(false);
  const [trustDuration, setTrustDuration] = useState<number>(30);

  // Fetch trusted devices
  const { data: trustedDevices = [], isLoading } = useQuery({
    queryKey: ["trusted-devices"],
    queryFn: () => api.sessions.getTrustedDevices(),
  });

  // Fetch all devices
  const { data: allDevices = [] } = useQuery({
    queryKey: ["devices"],
    queryFn: () => api.sessions.getDevices(),
  });

  // Trust device mutation
  const trustDeviceMutation = useMutation({
    mutationFn: (data: { deviceId: string; durationDays: number }) =>
      api.sessions.trustDevice(data.deviceId, data.durationDays),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trusted-devices"] });
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      setShowTrustCurrentDialog(false);
    },
  });

  // Untrust device mutation
  const untrustDeviceMutation = useMutation({
    mutationFn: (deviceId: string) => api.sessions.untrustDevice(deviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trusted-devices"] });
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      setShowUntrustDialog(false);
      setSelectedDevice(null);
    },
  });

  const handleUntrustDevice = () => {
    if (selectedDevice) {
      untrustDeviceMutation.mutate(selectedDevice.device_id);
    }
  };

  const handleTrustCurrentDevice = () => {
    // Get current device (assuming first non-trusted device or current session device)
    const currentDevice = allDevices.find(
      (d) => !trustedDevices.some((td) => td.device_id === d.id)
    );
    if (currentDevice) {
      trustDeviceMutation.mutate({
        deviceId: currentDevice.id,
        durationDays: trustDuration,
      });
    }
  };

  const getExpiryStatus = (expiresAt?: string) => {
    if (!expiresAt) return { status: "permanent", text: "Never expires", color: "green" };

    const now = new Date();
    const expiry = new Date(expiresAt);
    const daysUntil = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntil < 0) {
      return { status: "expired", text: "Expired", color: "red" };
    } else if (daysUntil <= 7) {
      return { status: "expiring", text: `Expires in ${daysUntil} days`, color: "amber" };
    } else {
      return { status: "active", text: `${daysUntil} days remaining`, color: "green" };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950/20 to-slate-950 p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="h-8 w-64 bg-slate-800 animate-pulse rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-slate-800 animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const activeTrusted = trustedDevices.filter((d) => d.is_active);
  const expiredTrusted = trustedDevices.filter((d) => !d.is_active);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950/20 to-slate-950 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-emerald-500" />
              Trusted Devices
            </h1>
            <p className="text-slate-400">
              Manage devices that don't require 2FA for login
            </p>
          </div>

          <button
            onClick={() => setShowTrustCurrentDialog(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Trust Current Device
          </button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-emerald-900/20 backdrop-blur-sm border border-emerald-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-emerald-400 text-sm">Active Trusted</span>
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="text-3xl font-bold text-white">{activeTrusted.length}</div>
          </div>

          <div className="bg-amber-900/20 backdrop-blur-sm border border-amber-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-amber-400 text-sm">Expiring Soon</span>
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-3xl font-bold text-white">
              {
                activeTrusted.filter((d) => {
                  if (!d.expires_at) return false;
                  const days = Math.ceil(
                    (new Date(d.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                  );
                  return days > 0 && days <= 7;
                }).length
              }
            </div>
          </div>

          <div className="bg-red-900/20 backdrop-blur-sm border border-red-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-red-400 text-sm">Expired</span>
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-3xl font-bold text-white">{expiredTrusted.length}</div>
          </div>
        </motion.div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-blue-900/20 border border-blue-700/50 rounded-xl p-4 flex items-start gap-3"
        >
          <Shield className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-white font-semibold mb-1">About Trusted Devices</div>
            <p className="text-sm text-slate-300">
              Trusted devices skip two-factor authentication for faster login. Trust only your personal devices.
              You can revoke trust at any time, and devices expire automatically for security.
            </p>
          </div>
        </motion.div>

        {/* Active Trusted Devices */}
        {activeTrusted.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
              Active Trusted Devices
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeTrusted.map((device, index) => {
                const Icon = DEVICE_ICONS[device.device_type] || Laptop;
                const color = DEVICE_COLORS[device.device_type];
                const expiryInfo = getExpiryStatus(device.expires_at);

                return (
                  <motion.div
                    key={device.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-emerald-700/50 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center"
                          style={{
                            backgroundColor: `${color}20`,
                            border: `1px solid ${color}30`,
                          }}
                        >
                          <Icon className="w-6 h-6" style={{ color }} />
                        </div>
                        <div>
                          <div className="text-white font-semibold">{device.device_name}</div>
                          <div className="text-sm text-slate-400 capitalize">
                            {device.device_type}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedDevice(device);
                          setShowUntrustDialog(true);
                        }}
                        className="p-2 hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5 text-red-400" />
                      </button>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">OS</span>
                        <span className="text-white">{device.os}</span>
                      </div>
                      {device.browser && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Browser</span>
                          <span className="text-white">{device.browser}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Trusted Since</span>
                        <span className="text-white">
                          {new Date(device.trusted_at).toLocaleDateString()}
                        </span>
                      </div>
                      {device.last_used && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Last Used</span>
                          <span className="text-white">
                            {new Date(device.last_used).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-700">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">Expiry Status</span>
                        <span
                          className={`text-xs font-semibold ${
                            expiryInfo.color === "green"
                              ? "text-green-400"
                              : expiryInfo.color === "amber"
                              ? "text-amber-400"
                              : "text-red-400"
                          }`}
                        >
                          {expiryInfo.text}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-12 text-center"
          >
            <ShieldOff className="w-16 h-16 mx-auto mb-4 text-slate-400" />
            <h3 className="text-xl font-semibold text-white mb-2">No Trusted Devices</h3>
            <p className="text-slate-400 mb-6">
              You haven't trusted any devices yet. Trust your personal devices for faster login.
            </p>
            <button
              onClick={() => setShowTrustCurrentDialog(true)}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Trust Current Device
            </button>
          </motion.div>
        )}

        {/* Expired Devices */}
        {expiredTrusted.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <XCircle className="w-6 h-6 text-red-400" />
              Expired Devices
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {expiredTrusted.map((device, index) => {
                const Icon = DEVICE_ICONS[device.device_type] || Laptop;
                const color = DEVICE_COLORS[device.device_type];

                return (
                  <motion.div
                    key={device.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    className="bg-slate-900/50 backdrop-blur-sm border border-red-700/30 rounded-xl p-6 opacity-60"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center opacity-50"
                          style={{
                            backgroundColor: `${color}20`,
                            border: `1px solid ${color}30`,
                          }}
                        >
                          <Icon className="w-6 h-6" style={{ color }} />
                        </div>
                        <div>
                          <div className="text-white font-semibold">{device.device_name}</div>
                          <div className="text-sm text-red-400">Expired</div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedDevice(device);
                          setShowUntrustDialog(true);
                        }}
                        className="p-2 hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5 text-red-400" />
                      </button>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Expired On</span>
                        <span className="text-red-400">
                          {device.expires_at
                            ? new Date(device.expires_at).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Trust Current Device Dialog */}
        <AnimatePresence>
          {showTrustCurrentDialog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setShowTrustCurrentDialog(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6"
              >
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  Trust This Device
                </h2>

                <p className="text-slate-300 mb-6">
                  How long would you like to trust this device? After this period, you'll need to verify
                  with 2FA again.
                </p>

                <div className="space-y-3 mb-6">
                  {[
                    { days: 7, label: "7 days" },
                    { days: 30, label: "30 days (Recommended)" },
                    { days: 90, label: "90 days" },
                    { days: 0, label: "Forever (Not recommended)" },
                  ].map((option) => (
                    <button
                      key={option.days}
                      onClick={() => setTrustDuration(option.days)}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        trustDuration === option.days
                          ? "border-emerald-500 bg-emerald-500/20"
                          : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                      }`}
                    >
                      <div className="font-medium text-white">{option.label}</div>
                      {option.days === 30 && (
                        <div className="text-xs text-emerald-400 mt-1">Best balance of security & convenience</div>
                      )}
                      {option.days === 0 && (
                        <div className="text-xs text-amber-400 mt-1">Trust will never expire</div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowTrustCurrentDialog(false)}
                    className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleTrustCurrentDevice}
                    disabled={trustDeviceMutation.isPending}
                    className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    {trustDeviceMutation.isPending ? "Trusting..." : "Trust Device"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Untrust Device Dialog */}
        <ConfirmDialog
          isOpen={showUntrustDialog}
          onClose={() => {
            setShowUntrustDialog(false);
            setSelectedDevice(null);
          }}
          onConfirm={handleUntrustDevice}
          title="Remove Trusted Device?"
          message={`Are you sure you want to untrust "${selectedDevice?.device_name}"? You'll need to verify with 2FA the next time you log in from this device.`}
          confirmText="Remove Trust"
          confirmButtonClass="bg-red-600 hover:bg-red-500"
        />
      </div>
    </div>
  );
}
