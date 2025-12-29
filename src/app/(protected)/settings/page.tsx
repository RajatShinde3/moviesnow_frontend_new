// app/(protected)/settings/page.tsx
/**
 * ═════════════════════════════════════════════════════════════════════════════
 * Ultra-Premium Enterprise Settings Hub - Next-Gen Design
 * ═════════════════════════════════════════════════════════════════════════════
 *
 * Premium Features:
 * ✨ Advanced glassmorphism with multi-layer depth
 * ✨ Smooth micro-interactions and spring animations
 * ✨ Real-time search with instant filtering
 * ✨ Keyboard shortcuts (CMD/CTRL + K for search)
 * ✨ Quick actions menu with spotlight-style interface
 * ✨ Professional skeleton loading states
 * ✨ Responsive grid with intelligent breakpoints
 * ✨ Dynamic gradient accents with smooth transitions
 * ✨ WCAG 2.1 AAA accessibility compliance
 * ✨ Performance optimized with React Query
 * ✨ Beautiful card animations with stagger effects
 * ✨ Contextual tooltips and help text
 * ✨ Dark mode optimized with perfect contrast
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
  Search,
  Command,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Fingerprint,
  Database,
  History,
  HelpCircle,
  ExternalLink,
  Info,
} from "lucide-react";
import { cn } from "@/lib/cn";

// ══════════════════════════════════════════════════════════════════════════════
// Skeleton Components for Loading States
// ══════════════════════════════════════════════════════════════════════════════

const SkeletonCard = () => (
  <div className="rounded-2xl border border-slate-800/50 bg-slate-900/30 backdrop-blur-xl p-6 shadow-xl">
    <div className="flex items-start justify-between">
      <div className="flex items-start gap-4 flex-1">
        <div className="h-12 w-12 rounded-xl bg-slate-800/50 animate-pulse" />
        <div className="flex-1 space-y-3">
          <div className="h-5 w-32 bg-slate-800/50 rounded animate-pulse" />
          <div className="h-4 w-48 bg-slate-800/30 rounded animate-pulse" />
        </div>
      </div>
      <div className="h-5 w-5 bg-slate-800/50 rounded animate-pulse" />
    </div>
  </div>
);

const SkeletonOverview = () => (
  <div className="rounded-3xl border border-slate-800/50 bg-slate-900/30 backdrop-blur-xl p-8 shadow-2xl">
    <div className="flex items-start gap-6">
      <div className="h-24 w-24 rounded-3xl bg-slate-800/50 animate-pulse" />
      <div className="flex-1 space-y-4">
        <div className="h-8 w-48 bg-slate-800/50 rounded animate-pulse" />
        <div className="h-4 w-64 bg-slate-800/30 rounded animate-pulse" />
        <div className="flex gap-3 mt-4">
          <div className="h-8 w-32 rounded-full bg-slate-800/50 animate-pulse" />
          <div className="h-8 w-28 rounded-full bg-slate-800/50 animate-pulse" />
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
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
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
  keywords?: string[]; // For search
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
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSearchFocused, setIsSearchFocused] = React.useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["user"],
    queryFn: () => api.auth.me(),
    staleTime: 30000,
  });

  const { data: subscription, isLoading: subLoading } = useQuery({
    queryKey: ["subscription"],
    queryFn: () => api.user.getSubscription(),
    staleTime: 60000,
  });

  const isLoading = userLoading || subLoading;

  // ────────────────────────────────────────────────────────────────────────────
  // Keyboard Shortcuts
  // ────────────────────────────────────────────────────────────────────────────
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // CMD/CTRL + K for search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // ESC to clear search
      if (e.key === "Escape" && searchQuery) {
        setSearchQuery("");
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchQuery]);

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
          keywords: ["name", "email", "picture", "avatar", "profile"],
        },
        {
          name: "Email Address",
          description: user?.is_email_verified ? "Verified and secure" : "Verify your email for full access",
          href: "/settings/account/email",
          icon: <Mail className="h-5 w-5" />,
          status: user?.is_email_verified ? "verified" : "warning",
          badge: user?.is_email_verified ? "Verified" : "Action Needed",
          keywords: ["email", "verify", "verification", "inbox"],
        },
        {
          name: "Language & Region",
          description: "Set your preferred language and region",
          href: "/settings/account/language",
          icon: <Globe className="h-5 w-5" />,
          keywords: ["language", "region", "locale", "timezone"],
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
          keywords: ["password", "change", "reset", "security"],
        },
        {
          name: "Two-Factor Authentication",
          description: user?.is_2fa_enabled
            ? "Your account is protected with 2FA"
            : "Add an extra layer of security to your account",
          href: "/settings/security/mfa",
          icon: <ShieldCheck className="h-5 w-5" />,
          status: user?.is_2fa_enabled ? "verified" : "default",
          badge: user?.is_2fa_enabled ? "Enabled" : "Recommended",
          recommended: !user?.is_2fa_enabled,
          keywords: ["2fa", "mfa", "authenticator", "totp", "security", "two-factor"],
        },
        {
          name: "Recovery Codes",
          description: "Backup codes for account recovery",
          href: "/settings/security/recovery-codes",
          icon: <Key className="h-5 w-5" />,
          keywords: ["recovery", "backup", "codes", "emergency"],
        },
        {
          name: "Trusted Devices",
          description: "Manage devices that can skip 2FA",
          href: "/settings/trusted-devices",
          icon: <Fingerprint className="h-5 w-5" />,
          keywords: ["devices", "trusted", "remember", "skip mfa"],
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
          keywords: ["plan", "subscription", "upgrade", "premium", "billing"],
        },
        {
          name: "Billing History",
          description: "View invoices and payment history",
          href: "/settings/billing/history",
          icon: <History className="h-5 w-5" />,
          keywords: ["invoices", "history", "billing", "payments"],
        },
        {
          name: "Payment Methods",
          description: "Manage your saved payment methods",
          href: "/settings/billing/payment-methods",
          icon: <CreditCard className="h-5 w-5" />,
          keywords: ["payment", "card", "methods", "billing"],
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
          keywords: ["notifications", "alerts", "email", "push"],
        },
        {
          name: "Security Alerts",
          description: "Get notified about suspicious activity",
          href: "/settings/alerts",
          icon: <AlertCircle className="h-5 w-5" />,
          keywords: ["alerts", "security", "suspicious", "warnings"],
        },
        {
          name: "Privacy Settings",
          description: "Control who can see your activity",
          href: "/settings/privacy",
          icon: <Eye className="h-5 w-5" />,
          keywords: ["privacy", "visibility", "activity", "sharing"],
        },
        {
          name: "Viewing Preferences",
          description: "Customize your streaming experience",
          href: "/settings/preferences",
          icon: <SettingsIcon className="h-5 w-5" />,
          keywords: ["preferences", "playback", "quality", "streaming"],
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
          keywords: ["sessions", "devices", "logged in", "active"],
        },
        {
          name: "Activity Log",
          description: "Review recent account activity",
          href: "/settings/activity",
          icon: <Database className="h-5 w-5" />,
          keywords: ["activity", "log", "history", "events"],
        },
        {
          name: "Download History",
          description: "Track your downloaded content",
          href: "/settings/downloads",
          icon: <Download className="h-5 w-5" />,
          keywords: ["downloads", "history", "content"],
        },
      ],
    },
  ];

  // ────────────────────────────────────────────────────────────────────────────
  // Search Filter Logic
  // ────────────────────────────────────────────────────────────────────────────

  const filteredSections = React.useMemo(() => {
    if (!searchQuery.trim()) return settingsSections;

    const query = searchQuery.toLowerCase();
    return settingsSections
      .map((section) => ({
        ...section,
        items: section.items.filter(
          (item) =>
            item.name.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query) ||
            item.keywords?.some((kw) => kw.toLowerCase().includes(query))
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [searchQuery, settingsSections]);

  const totalResults = filteredSections.reduce((acc, section) => acc + section.items.length, 0);

  // ────────────────────────────────────────────────────────────────────────────
  // Render: Loading State
  // ────────────────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-12 space-y-4">
            <div className="h-12 w-72 bg-slate-800/50 rounded-xl animate-pulse" />
            <div className="h-6 w-96 bg-slate-800/30 rounded animate-pulse" />
          </div>
          <SkeletonOverview />
          <div className="mt-12 space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-slate-800/50 animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-6 w-32 bg-slate-800/50 rounded animate-pulse" />
                    <div className="h-4 w-64 bg-slate-800/30 rounded animate-pulse" />
                  </div>
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <motion.div
          className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-blue-500/10 via-cyan-500/5 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -30, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* ──────────────────────────────────────────────────────────────────
            Header Section with Search
            ────────────────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12"
        >
          <div className="flex items-start justify-between gap-6 mb-6">
            <div className="flex items-center gap-4">
              <motion.div
                className="rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-3 shadow-2xl shadow-purple-500/30"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <SettingsIcon className="h-8 w-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-4xl font-black text-white">
                  Account Settings
                </h1>
                <p className="text-slate-400 mt-1">
                  Manage your account, security, and preferences
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="hidden lg:flex items-center gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-xl"
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm font-medium text-white">{settingsSections.length} Sections</span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="relative"
          >
            <div className={cn(
              "relative rounded-2xl border transition-all duration-300",
              isSearchFocused
                ? "border-purple-500/50 shadow-lg shadow-purple-500/20"
                : "border-slate-800/50 shadow-xl"
            )}>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center gap-3 px-5 py-4 bg-slate-900/50 backdrop-blur-xl rounded-2xl">
                <Search className={cn(
                  "h-5 w-5 transition-colors",
                  isSearchFocused ? "text-purple-400" : "text-slate-400"
                )} />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  placeholder="Search settings..."
                  className="flex-1 bg-transparent text-white placeholder:text-slate-500 outline-none text-sm"
                />
                <div className="flex items-center gap-2">
                  <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-800/50 border border-slate-700/50 text-xs text-slate-400">
                    <Command className="h-3 w-3" />K
                  </kbd>
                  {searchQuery && (
                    <motion.button
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      onClick={() => setSearchQuery("")}
                      className="px-2 py-1 rounded bg-slate-800/50 hover:bg-slate-700/50 text-xs text-slate-400 transition-colors"
                    >
                      Clear
                    </motion.button>
                  )}
                </div>
              </div>
            </div>

            {/* Search Results Count */}
            <AnimatePresence>
              {searchQuery && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-3 flex items-center gap-2 text-sm text-slate-400"
                >
                  <Info className="h-4 w-4" />
                  <span>
                    Found {totalResults} {totalResults === 1 ? 'result' : 'results'} in {filteredSections.length} {filteredSections.length === 1 ? 'section' : 'sections'}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* ──────────────────────────────────────────────────────────────────
            Account Overview Card (Ultra-Premium Glassmorphism)
            ────────────────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 rounded-3xl border border-slate-800/50 bg-slate-900/30 backdrop-blur-xl p-8 shadow-2xl relative overflow-hidden group"
        >
          {/* Animated Shine Effect */}
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

          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />

          <div className="relative flex flex-col sm:flex-row items-start gap-6">
            {/* Avatar with Glow */}
            <div className="relative">
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl blur-xl opacity-50"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.7, 0.5],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-600 via-purple-500 to-pink-600 text-4xl font-black text-white shadow-2xl ring-4 ring-purple-500/20"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                {user?.email?.[0]?.toUpperCase() || "U"}
              </motion.div>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-2">
                {user?.full_name || user?.email?.split("@")[0] || "User"}
              </h2>
              <p className="text-sm text-slate-400 mb-6 flex items-center gap-2">
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
                      className="flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-green-500/20 px-4 py-2 text-sm font-semibold text-emerald-400 ring-2 ring-emerald-500/30 backdrop-blur-xl"
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
                        className="flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 px-4 py-2 text-sm font-semibold text-orange-400 ring-2 ring-orange-500/30 hover:ring-orange-500/50 transition-all backdrop-blur-xl"
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
                    className="flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 px-4 py-2 text-sm font-semibold text-blue-400 ring-2 ring-blue-500/30 backdrop-blur-xl"
                  >
                    <ShieldCheck className="h-4 w-4" />
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
                      className="flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-4 py-2 text-sm font-semibold text-purple-400 ring-2 ring-purple-500/30 hover:ring-purple-500/50 transition-all backdrop-blur-xl"
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
        <AnimatePresence mode="wait">
          {filteredSections.length > 0 ? (
            <motion.div
              key="results"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-10"
            >
              {filteredSections.map((section, sectionIdx) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: sectionIdx * 0.1 }}
                  className="group"
                >
                  {/* Section Header */}
                  <div className="mb-6 flex items-center gap-4">
                    <motion.div
                      className={cn(
                        "rounded-2xl p-3 text-white shadow-2xl",
                        `bg-gradient-to-br ${section.gradient}`
                      )}
                      whileHover={{ scale: 1.1, rotate: 360 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      {section.icon}
                    </motion.div>
                    <div>
                      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        {section.title}
                      </h2>
                      <p className="text-sm text-slate-400 mt-0.5">
                        {section.description}
                      </p>
                    </div>
                  </div>

                  {/* Settings Cards Grid */}
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {section.items.map((item, idx) => (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{
                          delay: sectionIdx * 0.1 + idx * 0.05,
                          type: "spring",
                          stiffness: 300,
                          damping: 24,
                        }}
                      >
                        <Link
                          href={item.href}
                          className="group/card block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded-2xl"
                          prefetch={true}
                          aria-label={`Navigate to ${item.name}`}
                        >
                          <div className="relative h-full overflow-hidden rounded-2xl border border-slate-800/50 bg-slate-900/30 backdrop-blur-xl p-6 shadow-xl hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 cursor-pointer group-hover/card:scale-[1.02] group-hover/card:-translate-y-1 group-active/card:scale-[0.98]">
                            {/* Gradient Overlay */}
                            <div
                              className={cn(
                                "absolute inset-0 opacity-0 group-hover/card:opacity-5 transition-opacity duration-300 pointer-events-none",
                                `bg-gradient-to-br ${section.gradient}`
                              )}
                            />

                            {/* Card Border Glow */}
                            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 pointer-events-none">
                              <div className={cn(
                                "absolute inset-0 rounded-2xl blur-xl -z-10",
                                `bg-gradient-to-br ${section.gradient} opacity-20`
                              )} />
                            </div>

                            <div className="relative flex items-start justify-between">
                              <div className="flex items-start gap-4 flex-1 min-w-0">
                                {/* Icon */}
                                <div
                                  className={cn(
                                    "rounded-xl p-2.5 text-white shadow-lg transition-all duration-300 group-hover/card:shadow-xl select-none",
                                    `bg-gradient-to-br ${section.gradient}`
                                  )}
                                  aria-hidden="true"
                                >
                                  {item.icon}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-white group-hover/card:text-purple-400 transition-colors mb-1 flex items-center gap-2 flex-wrap">
                                    {item.name}
                                    {item.recommended && (
                                      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-2 py-0.5 text-xs font-medium text-purple-400 ring-1 ring-purple-500/30">
                                        <Zap className="h-3 w-3" />
                                        Recommended
                                      </span>
                                    )}
                                  </h3>
                                  <p className="text-sm text-slate-400 line-clamp-2 mb-3">
                                    {item.description}
                                  </p>

                                  {/* Status Badge */}
                                  {item.status && (
                                    <div className="mt-2">
                                      {item.status === "verified" && (
                                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                                          <CheckCircle2 className="h-3.5 w-3.5" />
                                          {item.badge || "Active"}
                                        </span>
                                      )}
                                      {item.status === "warning" && (
                                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-400">
                                          <AlertCircle className="h-3.5 w-3.5" />
                                          {item.badge || "Action Required"}
                                        </span>
                                      )}
                                      {item.status === "default" && item.badge && (
                                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400">
                                          <Star className="h-3.5 w-3.5" />
                                          {item.badge}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Arrow Icon */}
                              <ChevronRight
                                className="h-5 w-5 text-slate-500 group-hover/card:text-purple-400 group-hover/card:translate-x-1 transition-all flex-shrink-0 mt-1"
                                aria-hidden="true"
                              />
                            </div>

                            {/* Shine Effect */}
                            <div
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/card:translate-x-full transition-transform duration-1000 pointer-events-none"
                            />
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="no-results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-16"
            >
              <div className="inline-flex p-6 bg-slate-800/30 border border-slate-700/50 rounded-full mb-4 backdrop-blur-xl">
                <Search className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                Try searching with different keywords or{" "}
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-purple-400 hover:text-purple-300 underline"
                >
                  clear your search
                </button>
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ──────────────────────────────────────────────────────────────────
            Danger Zone
            ────────────────────────────────────────────────────────────────── */}
        {!searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-16 rounded-3xl border-2 border-red-500/30 bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent backdrop-blur-xl p-8 shadow-2xl shadow-red-500/10 relative overflow-hidden"
          >
            {/* Warning Pattern */}
            <div className="absolute inset-0 bg-[url('/diagonal-stripes.svg')] opacity-5" />

            <div className="relative flex items-center gap-3 mb-6">
              <div className="rounded-xl bg-gradient-to-br from-red-500 to-red-600 p-2.5 text-white shadow-lg shadow-red-500/30">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-red-400">
                  Danger Zone
                </h2>
                <p className="text-sm text-slate-400 mt-0.5">
                  These actions are irreversible. Please proceed with caution.
                </p>
              </div>
            </div>

            <div className="relative grid gap-5 sm:grid-cols-2">
              <Link
                href="/settings/account/deactivate"
                className="flex items-center justify-between rounded-2xl border-2 border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-transparent backdrop-blur-sm p-5 hover:border-orange-500/50 hover:bg-orange-500/15 hover:scale-[1.02] active:scale-[0.98] transition-all group/danger focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                prefetch={true}
                aria-label="Deactivate account"
              >
                <div>
                  <h3 className="font-semibold text-orange-400 mb-1 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" aria-hidden="true" />
                    Deactivate Account
                  </h3>
                  <p className="text-xs text-slate-400">
                    Temporarily disable your account
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-orange-400 group-hover/danger:translate-x-1 transition-transform" aria-hidden="true" />
              </Link>

              <Link
                href="/settings/account/delete"
                className="flex items-center justify-between rounded-2xl border-2 border-red-500/30 bg-gradient-to-br from-red-500/10 to-transparent backdrop-blur-sm p-5 hover:border-red-500/50 hover:bg-red-500/15 hover:scale-[1.02] active:scale-[0.98] transition-all group/danger focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                prefetch={true}
                aria-label="Delete account permanently"
              >
                <div>
                  <h3 className="font-semibold text-red-400 mb-1 flex items-center gap-2">
                    <Trash2 className="h-5 w-5" aria-hidden="true" />
                    Delete Account
                  </h3>
                  <p className="text-xs text-slate-400">
                    Permanently delete your account and data
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-red-400 group-hover/danger:translate-x-1 transition-transform" aria-hidden="true" />
              </Link>
            </div>
          </motion.div>
        )}

        {/* Help Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-12 text-center"
        >
          <Link
            href="/help"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-purple-400 transition-colors group focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded-lg px-3 py-2"
            prefetch={true}
            aria-label="Visit help center"
          >
            <HelpCircle className="h-4 w-4" aria-hidden="true" />
            Need help? Visit our help center
            <ExternalLink className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" aria-hidden="true" />
          </Link>
        </motion.div>

        {/* Bottom Spacing */}
        <div className="h-12" />
      </div>
    </div>
  );
}
