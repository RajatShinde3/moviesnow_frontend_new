// components/security/SecuritySettings.tsx
/**
 * =============================================================================
 * Security Settings Dashboard
 * =============================================================================
 * Best Practices:
 * - Comprehensive security overview
 * - Actionable insights
 * - Clear status indicators
 * - Easy access to security features
 */

"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/services";
import { cn } from "@/lib/cn";
import {
  Shield,
  Key,
  Smartphone,
  Clock,
  AlertTriangle,
  Check,
  ChevronRight,
} from "lucide-react";
import { MFASetup } from "./MFASetup";

export function SecuritySettingsPage() {
  const [showMFASetup, setShowMFASetup] = React.useState(false);

  const { data: user } = useQuery({
    queryKey: ["user", "me"],
    queryFn: () => api.user.getMe(),
  });

  // Calculate security score
  const securityScore = React.useMemo(() => {
    let score = 0;
    let total = 4;

    if (user?.email_verified) score++;
    if (user?.two_factor_enabled) score++;
    if (user?.password_last_changed) {
      const daysSinceChange = Math.floor(
        (Date.now() - new Date(user.password_last_changed).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceChange < 90) score++;
    }
    // Assume strong password if user exists
    if (user) score++;

    return { score, total, percentage: Math.round((score / total) * 100) };
  }, [user]);

  if (showMFASetup) {
    return (
      <div className="min-h-screen bg-black py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setShowMFASetup(false)}
            className="mb-6 text-gray-400 hover:text-white"
          >
            ← Back to Security Settings
          </button>

          <MFASetup onComplete={() => setShowMFASetup(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Security Settings</h1>
          <p className="mt-2 text-gray-400">
            Protect your account with advanced security features
          </p>
        </div>

        {/* Security Score */}
        <div className="mb-8 rounded-lg bg-gradient-to-br from-blue-900/50 to-purple-900/50 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Security Score</h2>
              <p className="text-sm text-gray-300">
                {securityScore.score} of {securityScore.total} security measures enabled
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-white">{securityScore.percentage}%</div>
              <p className="text-sm text-gray-300">
                {securityScore.percentage >= 75
                  ? "Excellent"
                  : securityScore.percentage >= 50
                  ? "Good"
                  : "Needs Improvement"}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-700">
            <div
              className={cn(
                "h-full transition-all duration-500",
                securityScore.percentage >= 75
                  ? "bg-green-500"
                  : securityScore.percentage >= 50
                  ? "bg-yellow-500"
                  : "bg-red-500"
              )}
              style={{ width: `${securityScore.percentage}%` }}
            />
          </div>
        </div>

        {/* Security Features */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Two-Factor Authentication */}
          <SecurityFeatureCard
            icon={<Shield className="h-6 w-6" />}
            title="Two-Factor Authentication"
            description="Add an extra layer of security to your account"
            status={user?.two_factor_enabled ? "enabled" : "disabled"}
            action={
              <button
                onClick={() => setShowMFASetup(true)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-6 py-2 font-semibold transition-colors",
                  user?.two_factor_enabled
                    ? "bg-gray-800 text-white hover:bg-gray-700"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                )}
              >
                {user?.two_factor_enabled ? "Manage" : "Enable"} 2FA
                <ChevronRight className="h-4 w-4" />
              </button>
            }
          />

          {/* Email Verification */}
          <SecurityFeatureCard
            icon={<Check className="h-6 w-6" />}
            title="Email Verification"
            description="Verify your email address to secure your account"
            status={user?.email_verified ? "enabled" : "disabled"}
            action={
              !user?.email_verified && (
                <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-blue-700">
                  Verify Email
                  <ChevronRight className="h-4 w-4" />
                </button>
              )
            }
          />

          {/* Password */}
          <SecurityFeatureCard
            icon={<Key className="h-6 w-6" />}
            title="Password"
            description="Keep your password strong and unique"
            status={user ? "enabled" : "disabled"}
            metadata={
              user?.password_last_changed && (
                <p className="text-xs text-gray-400">
                  Last changed: {new Date(user.password_last_changed).toLocaleDateString()}
                </p>
              )
            }
            action={
              <button className="flex items-center gap-2 rounded-lg bg-gray-800 px-6 py-2 font-semibold text-white transition-colors hover:bg-gray-700">
                Change Password
                <ChevronRight className="h-4 w-4" />
              </button>
            }
          />

          {/* Active Sessions */}
          <SecurityFeatureCard
            icon={<Smartphone className="h-6 w-6" />}
            title="Active Sessions"
            description="Manage devices where you're signed in"
            action={
              <button
                onClick={() => (window.location.href = "/settings/sessions")}
                className="flex items-center gap-2 rounded-lg bg-gray-800 px-6 py-2 font-semibold text-white transition-colors hover:bg-gray-700"
              >
                Manage Sessions
                <ChevronRight className="h-4 w-4" />
              </button>
            }
          />
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-semibold text-white">Recent Activity</h2>
          <RecentActivity />
        </div>

        {/* Security Tips */}
        <div className="mt-8 rounded-lg bg-gray-900 p-6">
          <h3 className="mb-4 font-semibold text-white">Security Tips</h3>
          <ul className="space-y-3 text-sm text-gray-300">
            <li className="flex items-start gap-3">
              <Check className="h-5 w-5 flex-shrink-0 text-green-500 mt-0.5" />
              <span>
                Use a unique password that you don't use for other accounts
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="h-5 w-5 flex-shrink-0 text-green-500 mt-0.5" />
              <span>Enable two-factor authentication for maximum security</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="h-5 w-5 flex-shrink-0 text-green-500 mt-0.5" />
              <span>Review your active sessions regularly and sign out unused devices</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="h-5 w-5 flex-shrink-0 text-green-500 mt-0.5" />
              <span>Never share your password or 2FA codes with anyone</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/**
 * Security Feature Card Component
 */
function SecurityFeatureCard({
  icon,
  title,
  description,
  status,
  metadata,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  status?: "enabled" | "disabled" | "warning";
  metadata?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg bg-gray-900 p-6">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "rounded-full p-2",
              status === "enabled"
                ? "bg-green-500/20 text-green-500"
                : status === "warning"
                ? "bg-yellow-500/20 text-yellow-500"
                : "bg-gray-700 text-gray-400"
            )}
          >
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-white">{title}</h3>
            <p className="text-sm text-gray-400">{description}</p>
            {metadata && <div className="mt-1">{metadata}</div>}
          </div>
        </div>

        {status && (
          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium",
              status === "enabled"
                ? "bg-green-500/20 text-green-500"
                : status === "warning"
                ? "bg-yellow-500/20 text-yellow-500"
                : "bg-gray-700 text-gray-400"
            )}
          >
            {status === "enabled" ? "Enabled" : status === "warning" ? "Warning" : "Disabled"}
          </span>
        )}
      </div>

      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/**
 * Recent Activity Component
 */
function RecentActivity() {
  const { data: activityData, isLoading } = useQuery({
    queryKey: ["security-activity"],
    queryFn: async () => {
      const response = await fetch("/api/v1/auth/activity");
      if (!response.ok) return [];
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="rounded-lg bg-gray-900 p-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-full bg-gray-800" />
          <div className="flex-1">
            <div className="mb-2 h-4 w-48 animate-pulse rounded bg-gray-800" />
            <div className="h-3 w-32 animate-pulse rounded bg-gray-800" />
          </div>
        </div>
      </div>
    );
  }

  const activities = activityData || [];

  return (
    <div className="space-y-2">
      {activities.length === 0 ? (
        <div className="rounded-lg bg-gray-900 p-6 text-center">
          <Clock className="mx-auto h-12 w-12 text-gray-600" />
          <p className="mt-2 text-gray-400">No recent activity</p>
        </div>
      ) : (
        activities.slice(0, 5).map((activity: any, i: number) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-lg bg-gray-900 p-4 hover:bg-gray-800"
          >
            <div className="rounded-full bg-blue-500/20 p-2">
              <Clock className="h-5 w-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{activity.action}</p>
              <p className="text-xs text-gray-400">
                {activity.location} • {new Date(activity.timestamp).toLocaleString()}
              </p>
            </div>
            {activity.suspicious && (
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            )}
          </div>
        ))
      )}
    </div>
  );
}
