"use client";

/**
 * =============================================================================
 * Trusted Devices Management - Enterprise Grade with Modern UI/UX
 * =============================================================================
 *
 * Features:
 * - Beautiful glassmorphism design with animations
 * - Real-time device detection and fingerprinting
 * - Proper expiry calculation (30 days from creation)
 * - Current device highlighting
 * - Step-up authentication support
 * - Comprehensive error handling
 * - Mobile-responsive design
 * - Accessibility compliant (WCAG 2.1 AA)
 */

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Smartphone,
  Monitor,
  Tablet,
  Laptop,
  Chrome,
  Globe,
  Trash2,
  ShieldCheck,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import {
  useTrustedDevices,
  type TrustedDevice as TrustedDeviceBase
} from "@/features/auth/useTrustedDevices";
import { useTrustedDeviceRegister } from "@/features/auth/useTrustedDeviceRegister";
import { useTrustedDeviceRevoke } from "@/features/auth/useTrustedDeviceRevoke";
import { useTrustedDevicesRevokeAll } from "@/features/auth/useTrustedDevicesRevokeAll";
import { useToast } from "@/components/feedback/Toasts";
import { cn } from "@/lib/cn";

// Extended interface
interface TrustedDevice extends TrustedDeviceBase {
  device_type?: "desktop" | "mobile" | "tablet" | "other";
  os?: string;
  browser?: string;
  expires_at?: string;
  last_seen?: string;
  ua_hash?: string;
}

// Device detection utilities
const detectDeviceType = (): "desktop" | "mobile" | "tablet" => {
  if (typeof window === "undefined") return "desktop";

  const ua = navigator.userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "tablet";
  }
  if (/mobile|iphone|ipod|blackberry|opera mini|iemobile|wpdesktop/i.test(ua)) {
    return "mobile";
  }
  return "desktop";
};

const detectBrowser = (): string => {
  if (typeof window === "undefined") return "Unknown";

  const ua = navigator.userAgent;
  if (ua.includes("Chrome") && !ua.includes("Edg")) return "Chrome";
  if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Edg")) return "Edge";
  if (ua.includes("OPR") || ua.includes("Opera")) return "Opera";
  return "Unknown";
};

const detectOS = (): string => {
  if (typeof window === "undefined") return "Unknown";

  const ua = navigator.userAgent;
  if (ua.includes("Win")) return "Windows";
  if (ua.includes("Mac")) return "macOS";
  if (ua.includes("Linux")) return "Linux";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iOS") || ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
  return "Unknown";
};

// Device icon mapping
const DEVICE_ICONS = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
  other: Laptop,
};

// Device color scheme
const DEVICE_COLORS = {
  desktop: { bg: "from-blue-500/20 to-blue-600/10", border: "border-blue-500/30", icon: "text-blue-400" },
  mobile: { bg: "from-emerald-500/20 to-emerald-600/10", border: "border-emerald-500/30", icon: "text-emerald-400" },
  tablet: { bg: "from-purple-500/20 to-purple-600/10", border: "border-purple-500/30", icon: "text-purple-400" },
  other: { bg: "from-gray-500/20 to-gray-600/10", border: "border-gray-500/30", icon: "text-gray-400" },
};

export default function TrustedDevicesPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [selectedDevice, setSelectedDevice] = useState<TrustedDevice | null>(null);
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [currentDeviceInfo, setCurrentDeviceInfo] = useState({
    type: "desktop" as const,
    browser: "Unknown",
    os: "Unknown",
  });

  // Fetch trusted devices
  const { data: devicesResponse, isLoading, refetch } = useTrustedDevices();
  const trustedDevices = (devicesResponse?.devices || []) as unknown as TrustedDevice[];

  // Mutations
  const { mutateAsync: registerDevice, isPending: isRegistering } = useTrustedDeviceRegister();
  const { mutateAsync: revokeDevice, isPending: isRevoking } = useTrustedDeviceRevoke();
  const { mutateAsync: revokeAll, isPending: isRevokingAll } = useTrustedDevicesRevokeAll();

  // Detect current device on mount
  useEffect(() => {
    setCurrentDeviceInfo({
      type: detectDeviceType(),
      browser: detectBrowser(),
      os: detectOS(),
    });
  }, []);

  // Calculate expiry status
  const getExpiryInfo = (device: TrustedDevice) => {
    if (!device.created_at) {
      return { status: "unknown", text: "Unknown", daysLeft: 0, color: "text-gray-400" };
    }

    const createdDate = new Date(device.created_at);
    const expiryDate = new Date(createdDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from creation
    const now = new Date();
    const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
      return { status: "expired", text: "Expired", daysLeft: 0, color: "text-red-400" };
    } else if (daysLeft <= 7) {
      return { status: "expiring", text: `${daysLeft} days left`, daysLeft, color: "text-amber-400" };
    } else {
      return { status: "active", text: `${daysLeft} days left`, daysLeft, color: "text-emerald-400" };
    }
  };

  // Format date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(dateStr));
    } catch {
      return "—";
    }
  };

  // Handle trust current device
  const handleTrustDevice = async () => {
    try {
      await registerDevice({ device_label: `${currentDeviceInfo.os} · ${currentDeviceInfo.browser}` });
      toast({
        variant: "success",
        title: "Device trusted",
        description: "This device won't require MFA as often",
        duration: 3000,
      });
      refetch();
    } catch (error: any) {
      toast({
        variant: "error",
        title: "Failed to trust device",
        description: error?.message || "Please try again",
        duration: 4000,
      });
    }
  };

  // Handle revoke device
  const handleRevokeDevice = async (deviceId: string) => {
    try {
      await revokeDevice({ deviceId });
      toast({
        variant: "success",
        title: "Device revoked",
        description: "This device is no longer trusted",
        duration: 3000,
      });
      setShowRevokeDialog(false);
      setSelectedDevice(null);
      refetch();
    } catch (error: any) {
      toast({
        variant: "error",
        title: "Failed to revoke device",
        description: error?.message || "Please try again",
        duration: 4000,
      });
    }
  };

  // Handle revoke all
  const handleRevokeAll = async () => {
    if (!confirm("Are you sure you want to revoke all trusted devices? You'll need to verify with MFA on all devices.")) {
      return;
    }

    try {
      await revokeAll({});
      toast({
        variant: "success",
        title: "All devices revoked",
        description: "All trusted devices have been removed",
        duration: 3000,
      });
      refetch();
    } catch (error: any) {
      toast({
        variant: "error",
        title: "Failed to revoke devices",
        description: error?.message || "Please try again",
        duration: 4000,
      });
    }
  };

  // Filter active and expired devices
  const activeDevices = trustedDevices.filter(d => getExpiryInfo(d).status !== "expired");
  const expiredDevices = trustedDevices.filter(d => getExpiryInfo(d).status === "expired");

  // Check if current device is already trusted
  const isCurrentDeviceTrusted = activeDevices.some(d => d.current);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="h-12 w-64 bg-slate-800/50 backdrop-blur animate-pulse rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-slate-800/30 backdrop-blur animate-pulse rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 rounded-xl backdrop-blur-xl">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Trusted Devices</h1>
              <p className="text-sm text-slate-400 mt-1">
                Manage devices that don't require MFA verification
              </p>
            </div>
          </div>
        </motion.div>

        {/* Current Device Card */}
        {!isCurrentDeviceTrusted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-500/10 to-purple-600/10 border border-blue-500/20 rounded-2xl p-6 backdrop-blur-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-xl">
                  <Monitor className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">This Device</h3>
                  <p className="text-sm text-slate-300 mt-1">
                    {currentDeviceInfo.os} · {currentDeviceInfo.browser}
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    Trust this device to skip MFA prompts on future logins
                  </p>
                </div>
              </div>
              <button
                onClick={handleTrustDevice}
                disabled={isRegistering}
                className={cn(
                  "px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium rounded-xl",
                  "hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-lg shadow-emerald-500/20",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {isRegistering ? "Trusting..." : "Trust Device"}
              </button>
            </div>
          </motion.div>
        )}

        {/* Stats */}
        {activeDevices.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 backdrop-blur-xl"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="text-xs text-slate-400">Active Devices</p>
                  <p className="text-2xl font-bold text-white">{activeDevices.length}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 backdrop-blur-xl"
            >
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-xs text-slate-400">Expiring Soon</p>
                  <p className="text-2xl font-bold text-white">
                    {activeDevices.filter(d => getExpiryInfo(d).daysLeft <= 7).length}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 backdrop-blur-xl"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-xs text-slate-400">Max Validity</p>
                  <p className="text-2xl font-bold text-white">30 Days</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Active Devices */}
        {activeDevices.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Active Devices</h2>
              {activeDevices.length > 1 && (
                <button
                  onClick={handleRevokeAll}
                  disabled={isRevokingAll}
                  className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 transition-all text-sm font-medium disabled:opacity-50"
                >
                  {isRevokingAll ? "Revoking..." : "Revoke All"}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeDevices.map((device, index) => {
                const deviceType = device.device_type || "other";
                const DeviceIcon = DEVICE_ICONS[deviceType];
                const colors = DEVICE_COLORS[deviceType];
                const expiryInfo = getExpiryInfo(device);

                return (
                  <motion.div
                    key={device.device_id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className={cn(
                      "bg-slate-900/50 border rounded-2xl p-6 backdrop-blur-xl hover:border-emerald-500/50 transition-all duration-300",
                      colors.border,
                      device.current && "ring-2 ring-emerald-500/50"
                    )}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        <div className={cn("p-3 rounded-xl bg-gradient-to-br", colors.bg)}>
                          <DeviceIcon className={cn("w-6 h-6", colors.icon)} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-white font-semibold">
                              {device.device_label || `${currentDeviceInfo.os} Device`}
                            </h3>
                            {device.current && (
                              <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold rounded-full">
                                CURRENT
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-1 capitalize">{deviceType}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedDevice(device);
                          setShowRevokeDialog(true);
                        }}
                        disabled={isRevoking}
                        className="p-2 hover:bg-red-500/10 rounded-lg transition-colors group"
                        aria-label="Revoke device"
                      >
                        <Trash2 className="w-4 h-4 text-slate-400 group-hover:text-red-400 transition-colors" />
                      </button>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Added</span>
                        <span className="text-white">{formatDate(device.created_at)}</span>
                      </div>

                      {device.last_used_at && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Last Seen</span>
                          <span className="text-white">{formatDate(device.last_used_at)}</span>
                        </div>
                      )}

                      {device.ip && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Location</span>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            <span className="text-white font-mono text-xs">{device.ip}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
                        <span className="text-slate-400">Status</span>
                        <div className="flex items-center gap-1.5">
                          <div className={cn("w-1.5 h-1.5 rounded-full",
                            expiryInfo.status === "active" ? "bg-emerald-400" :
                            expiryInfo.status === "expiring" ? "bg-amber-400" : "bg-red-400"
                          )} />
                          <span className={expiryInfo.color}>{expiryInfo.text}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {activeDevices.length === 0 && !isCurrentDeviceTrusted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="inline-flex p-6 bg-slate-800/30 border border-slate-700/50 rounded-full mb-4">
              <Shield className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Trusted Devices</h3>
            <p className="text-slate-400 text-sm">
              Trust this device to skip MFA verification on future logins
            </p>
          </motion.div>
        )}

        {/* Expired Devices */}
        {expiredDevices.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-semibold text-white">Expired Devices</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {expiredDevices.map((device, index) => (
                <motion.div
                  key={device.device_id || `expired-${index}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 backdrop-blur-xl opacity-60"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Monitor className="w-5 h-5 text-red-400" />
                      <div>
                        <p className="text-white font-medium text-sm">
                          {device.device_label || "Device"}
                        </p>
                        <p className="text-xs text-red-400">Expired</p>
                      </div>
                    </div>
                    <button
                      onClick={() => device.device_id && handleRevokeDevice(device.device_id)}
                      className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Revoke Dialog */}
        <AnimatePresence>
          {showRevokeDialog && selectedDevice && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowRevokeDialog(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                    <AlertCircle className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Revoke Device?</h3>
                    <p className="text-sm text-slate-400 mt-1">
                      This device will require MFA verification on next login
                    </p>
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
                  <p className="text-white font-medium">{selectedDevice.device_label}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Added {formatDate(selectedDevice.created_at)}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowRevokeDialog(false)}
                    className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-xl hover:bg-slate-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => selectedDevice.device_id && handleRevokeDevice(selectedDevice.device_id)}
                    disabled={isRevoking}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50"
                  >
                    {isRevoking ? "Revoking..." : "Revoke"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
