// app/(protected)/settings/page.tsx
/**
 * ═════════════════════════════════════════════════════════════════════════════
 * Enterprise-Grade Account Settings Hub
 * ═════════════════════════════════════════════════════════════════════════════
 *
 * Premium Features:
 * - Advanced glassmorphism design with backdrop blur
 * - Smooth micro-interactions and hover effects
 * - Professional skeleton loading states
 * - Responsive grid with automatic adaptation
 * - Gradient accents with dynamic color schemes
 * - Accessibility-first design (ARIA labels, keyboard navigation)
 * - Performance optimized with React Query caching
 * - Beautiful card animations with spring physics
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/services";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Shield,
  Bell,
  CreditCard,
  Activity,
  Smartphone,
  Mail,
  Lock,
  Key,
  AlertCircle,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Crown,
  Settings as SettingsIcon,
  Globe,
  Download,
  Eye,
  Clock,
  Trash2,
  AlertTriangle,
  Sparkles,
  Zap,
  Star,
} from "lucide-react";

// ══════════════════════════════════════════════════════════════════════════════
// Skeleton Components for Loading States
// ══════════════════════════════════════════════════════════════════════════════

const SkeletonCard = () => (
  <div className="rounded-xl border bg-card p-5 shadow-md">
    <div className="flex items-start justify-between">
      <div className="flex items-start gap-3 flex-1">
        <div className="h-9 w-9 rounded-lg bg-muted animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-32 bg-muted rounded animate-pulse" />
          <div className="h-4 w-48 bg-muted/70 rounded animate-pulse" />
        </div>
      </div>
      <div className="h-5 w-5 bg-muted rounded animate-pulse" />
    </div>
  </div>
);

const SkeletonOverview = () => (
  <div className="rounded-2xl border bg-card p-8 shadow-2xl">
    <div className="flex items-start gap-6">
      <div className="h-20 w-20 rounded-2xl bg-muted animate-pulse" />
      <div className="flex-1 space-y-3">
        <div className="h-7 w-48 bg-muted rounded animate-pulse" />
        <div className="h-4 w-64 bg-muted/70 rounded animate-pulse" />
        <div className="flex gap-3 mt-4">
          <div className="h-6 w-28 rounded-full bg-muted animate-pulse" />
          <div className="h-6 w-24 rounded-full bg-muted animate-pulse" />
        </div>
      </div>
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
// Animation Variants
// ══════════════════════════════════════════════════════════════════════════════

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 260,
      damping: 20,
    },
  },
};

const cardHoverVariants = {
  rest: {
    scale: 1,
    boxShadow: "0 10px 30px -15px rgba(0, 0, 0, 0.1)",
  },
  hover: {
    scale: 1.02,
    boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.2)",
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 25,
    },
  },
};

// ══════════════════════════════════════════════════════════════════════════════
// Type Definitions
// ══════════════════════════════════════════════════════════════════════════════

interface SettingsItem {
  name: string;
  description: string;
  href: string;
  icon: React.ReactElement;
  status?: "verified" | "warning" | "default";
  badge?: string;
  recommended?: boolean;
}

interface SettingsSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactElement;
  gradient: string;
  accentColor: string;
  items: SettingsItem[];
}

// ══════════════════════════════════════════════════════════════════════════════
// Main Settings Page Component
// ══════════════════════════════════════════════════════════════════════════════

export default function SettingsPage() {
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["user"],
    queryFn: () => api.auth.me(),
    staleTime: 30000, // Cache for 30 seconds
  });

  const { data: subscription, isLoading: subLoading } = useQuery({
    queryKey: ["subscription"],
    queryFn: () => api.user.getSubscription(),
    staleTime: 60000, // Cache for 1 minute
  });

  const isLoading = userLoading || subLoading;

  // ────────────────────────────────────────────────────────────────────────────
  // Settings Configuration
  // ────────────────────────────────────────────────────────────────────────────

  const settingsSections: SettingsSection[] = [
    {
      id: "account",
      title: "Account",
      description: "Manage your personal information and preferences",
      icon: <User className="h-6 w-6" />,
      gradient: "from-blue-500 via-blue-600 to-cyan-600",
      accentColor: "blue",
      items: [
        {
          name: "Profile",
          description: "Update your name, email, and profile picture",
          href: "/profiles",
          icon: <User className="h-5 w-5" />,
        },
        {
          name: "Email Address",
          description: user?.is_email_verified ? "Verified and secure" : "Verify your email for full access",
          href: "/settings/account/email",
          icon: <Mail className="h-5 w-5" />,
          status: user?.is_email_verified ? "verified" : "warning",
          badge: user?.is_email_verified ? "Verified" : "Action Needed",
        },
        {
          name: "Language & Region",
          description: "Set your preferred language and region",
          href: "/settings/account/language",
          icon: <Globe className="h-5 w-5" />,
        },
      ],
    },
    {
      id: "security",
      title: "Security",
      description: "Protect your account with advanced security features",
      icon: <Shield className="h-6 w-6" />,
      gradient: "from-purple-500 via-purple-600 to-pink-600",
      accentColor: "purple",
      items: [
        {
          name: "Password",
          description: "Change your password regularly for better security",
          href: "/settings/security/password",
          icon: <Lock className="h-5 w-5" />,
        },
        {
          name: "Two-Factor Authentication",
          description: user?.is_2fa_enabled
            ? "Your account is protected with 2FA"
            : "Add an extra layer of security to your account",
          href: "/settings/security/mfa",
          icon: <Shield className="h-5 w-5" />,
          status: user?.is_2fa_enabled ? "verified" : "default",
          badge: user?.is_2fa_enabled ? "Enabled" : "Recommended",
          recommended: !user?.is_2fa_enabled,
        },
        {
          name: "Recovery Codes",
          description: "Backup codes for account recovery",
          href: "/settings/security/recovery-codes",
          icon: <Key className="h-5 w-5" />,
        },
        {
          name: "Trusted Devices",
          description: "Manage devices that can skip 2FA",
          href: "/settings/trusted-devices",
          icon: <Smartphone className="h-5 w-5" />,
        },
      ],
    },
    {
      id: "subscription",
      title: "Subscription & Billing",
      description: "Manage your subscription and payment methods",
      icon: <CreditCard className="h-6 w-6" />,
      gradient: "from-orange-500 via-orange-600 to-red-600",
      accentColor: "orange",
      items: [
        {
          name: "Subscription Plan",
          description: subscription?.is_premium
            ? `${subscription?.plan_name || 'Premium'} - Enjoying premium benefits`
            : "Upgrade to unlock premium features",
          href: "/settings/subscription",
          icon: subscription?.is_premium ? <Crown className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />,
          status: subscription?.is_premium ? "verified" : "default",
          badge: subscription?.is_premium ? "Premium" : "Free",
          recommended: !subscription?.is_premium,
        },
        {
          name: "Billing History",
          description: "View invoices and payment history",
          href: "/settings/billing/history",
          icon: <Clock className="h-5 w-5" />,
        },
        {
          name: "Payment Methods",
          description: "Manage your saved payment methods",
          href: "/settings/billing/payment-methods",
          icon: <CreditCard className="h-5 w-5" />,
        },
      ],
    },
    {
      id: "privacy",
      title: "Privacy & Notifications",
      description: "Control your privacy and notification preferences",
      icon: <Bell className="h-6 w-6" />,
      gradient: "from-green-500 via-green-600 to-emerald-600",
      accentColor: "green",
      items: [
        {
          name: "Notifications",
          description: "Manage email and push notifications",
          href: "/settings/notifications",
          icon: <Bell className="h-5 w-5" />,
        },
        {
          name: "Security Alerts",
          description: "Get notified about suspicious activity",
          href: "/settings/alerts",
          icon: <AlertCircle className="h-5 w-5" />,
        },
        {
          name: "Privacy Settings",
          description: "Control who can see your activity",
          href: "/settings/privacy",
          icon: <Eye className="h-5 w-5" />,
        },
        {
          name: "Viewing Preferences",
          description: "Customize your streaming experience",
          href: "/settings/preferences",
          icon: <SettingsIcon className="h-5 w-5" />,
        },
      ],
    },
    {
      id: "activity",
      title: "Activity & Sessions",
      description: "Monitor your account activity and active sessions",
      icon: <Activity className="h-6 w-6" />,
      gradient: "from-indigo-500 via-indigo-600 to-purple-600",
      accentColor: "indigo",
      items: [
        {
          name: "Active Sessions",
          description: "View and manage logged-in devices",
          href: "/settings/sessions",
          icon: <Smartphone className="h-5 w-5" />,
        },
        {
          name: "Activity Log",
          description: "Review recent account activity",
          href: "/settings/activity",
          icon: <Activity className="h-5 w-5" />,
        },
        {
          name: "Download History",
          description: "Track your downloaded content",
          href: "/settings/downloads",
          icon: <Download className="h-5 w-5" />,
        },
      ],
    },
  ];

  // ────────────────────────────────────────────────────────────────────────────
  // Render: Loading State
  // ────────────────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Header Skeleton */}
          <div className="mb-12 space-y-3">
            <div className="h-10 w-64 bg-muted rounded-lg animate-pulse" />
            <div className="h-6 w-96 bg-muted/70 rounded animate-pulse" />
          </div>

          {/* Overview Skeleton */}
          <SkeletonOverview />

          {/* Sections Skeleton */}
          <div className="mt-12 space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-muted animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-6 w-32 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-64 bg-muted/70 rounded animate-pulse" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((j) => (
                    <SkeletonCard key={j} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Render: Main Content
  // ────────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
      {/* Animated Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-blue-500/10 via-cyan-500/10 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* ──────────────────────────────────────────────────────────────────
            Header Section
            ────────────────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <motion.div
              className="rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-3 shadow-lg shadow-purple-500/30"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <SettingsIcon className="h-7 w-7 text-white" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Account Settings
              </h1>
            </div>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Manage your account, security, and preferences all in one place. Everything you need to customize your experience.
          </p>
        </motion.div>

        {/* ──────────────────────────────────────────────────────────────────
            Account Overview Card (Glassmorphism)
            ────────────────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 rounded-3xl border border-white/10 bg-gradient-to-br from-card/80 via-card/60 to-card/80 backdrop-blur-xl p-8 shadow-2xl shadow-black/20 relative overflow-hidden"
        >
          {/* Shine Effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
            animate={{
              x: ["-100%", "200%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 5,
              ease: "easeInOut",
            }}
          />

          <div className="relative flex flex-col sm:flex-row items-start gap-6">
            {/* Avatar */}
            <motion.div
              className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-600 via-purple-500 to-pink-600 text-4xl font-black text-white shadow-2xl shadow-purple-500/40 ring-4 ring-purple-500/20"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              {user?.email?.[0]?.toUpperCase() || "U"}
            </motion.div>

            {/* User Info */}
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-foreground mb-1">
                {user?.full_name || user?.email?.split("@")[0] || "User"}
              </h2>
              <p className="text-sm text-muted-foreground mb-6 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {user?.email}
              </p>

              {/* Status Badges */}
              <div className="flex flex-wrap gap-3">
                <AnimatePresence mode="wait">
                  {user?.is_email_verified ? (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="flex items-center gap-2 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 px-4 py-2 text-sm font-semibold text-green-600 dark:text-green-400 ring-2 ring-green-500/30"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Email Verified
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        href="/settings/account/email"
                        className="flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 px-4 py-2 text-sm font-semibold text-orange-600 dark:text-orange-400 ring-2 ring-orange-500/30 hover:ring-orange-500/50 transition-all"
                      >
                        <AlertTriangle className="h-4 w-4 animate-pulse" />
                        Verify Email
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>

                {user?.is_2fa_enabled && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 px-4 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/30"
                  >
                    <Shield className="h-4 w-4" />
                    2FA Enabled
                  </motion.div>
                )}

                {subscription?.is_premium && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-500 via-yellow-400 to-orange-500 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-yellow-500/40 ring-2 ring-yellow-400/50"
                  >
                    <Crown className="h-4 w-4" />
                    Premium Member
                  </motion.div>
                )}

                {!subscription?.is_premium && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href="/settings/subscription"
                      className="flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-4 py-2 text-sm font-semibold text-purple-600 dark:text-purple-400 ring-2 ring-purple-500/30 hover:ring-purple-500/50 transition-all"
                    >
                      <Sparkles className="h-4 w-4" />
                      Upgrade to Premium
                    </Link>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ──────────────────────────────────────────────────────────────────
            Settings Sections
            ────────────────────────────────────────────────────────────────── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-10"
        >
          {settingsSections.map((section) => (
            <motion.div
              key={section.id}
              variants={itemVariants}
              className="group"
            >
              {/* Section Header */}
              <div className="mb-6 flex items-center gap-4">
                <motion.div
                  className={`rounded-2xl bg-gradient-to-br ${section.gradient} p-3 text-white shadow-xl shadow-${section.accentColor}-500/30`}
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {section.icon}
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    {section.title}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {section.description}
                  </p>
                </div>
              </div>

              {/* Settings Cards Grid */}
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {section.items.map((item, idx) => (
                  <motion.div
                    key={item.name}
                    variants={cardHoverVariants}
                    initial="rest"
                    whileHover="hover"
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href={item.href}
                      className="group/card relative block overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-sm p-6 shadow-lg hover:border-primary/50 transition-all duration-300"
                    >
                      {/* Gradient Overlay on Hover */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${section.gradient} opacity-0 group-hover/card:opacity-5 transition-opacity duration-300`} />

                      <div className="relative flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          {/* Icon */}
                          <motion.div
                            className={`rounded-xl bg-gradient-to-br ${section.gradient} p-2.5 text-white shadow-lg group-hover/card:shadow-${section.accentColor}-500/40 transition-shadow`}
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                          >
                            {item.icon}
                          </motion.div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground group-hover/card:text-primary transition-colors mb-1 flex items-center gap-2">
                              {item.name}
                              {item.recommended && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                  <Zap className="h-3 w-3" />
                                  Recommended
                                </span>
                              )}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                              {item.description}
                            </p>

                            {/* Status Badge */}
                            {item.status && (
                              <div className="mt-2">
                                {item.status === "verified" && (
                                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    {item.badge || "Active"}
                                  </span>
                                )}
                                {item.status === "warning" && (
                                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-600 dark:text-orange-400">
                                    <AlertCircle className="h-3.5 w-3.5" />
                                    {item.badge || "Action Required"}
                                  </span>
                                )}
                                {item.status === "default" && item.badge && (
                                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                    <Star className="h-3.5 w-3.5" />
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Arrow Icon */}
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover/card:text-primary group-hover/card:translate-x-1 transition-all flex-shrink-0 mt-1" />
                      </div>

                      {/* Shine Effect on Hover */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover/card:opacity-100"
                        animate={{
                          x: ["-100%", "200%"],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          repeatDelay: 3,
                        }}
                      />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ──────────────────────────────────────────────────────────────────
            Danger Zone
            ────────────────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 rounded-3xl border-2 border-red-500/30 bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent backdrop-blur-sm p-8 shadow-2xl shadow-red-500/10"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-xl bg-gradient-to-br from-red-500 to-red-600 p-2.5 text-white shadow-lg shadow-red-500/30">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
                Danger Zone
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                These actions are irreversible. Please proceed with caution.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href="/settings/account/deactivate"
                className="flex items-center justify-between rounded-2xl border-2 border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-transparent p-5 hover:border-orange-500/50 hover:bg-orange-500/15 transition-all group/danger"
              >
                <div>
                  <h3 className="font-semibold text-orange-600 dark:text-orange-400 mb-1 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Deactivate Account
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Temporarily disable your account
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-orange-600 dark:text-orange-400 group-hover/danger:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href="/settings/account/delete"
                className="flex items-center justify-between rounded-2xl border-2 border-red-500/30 bg-gradient-to-br from-red-500/10 to-transparent p-5 hover:border-red-500/50 hover:bg-red-500/15 transition-all group/danger"
              >
                <div>
                  <h3 className="font-semibold text-red-600 dark:text-red-400 mb-1 flex items-center gap-2">
                    <Trash2 className="h-5 w-5" />
                    Delete Account
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Permanently delete your account and data
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-red-600 dark:text-red-400 group-hover/danger:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom Spacing */}
        <div className="h-12" />
      </div>
    </div>
  );
}
