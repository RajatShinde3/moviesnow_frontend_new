"use client";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Enhanced Settings Navigation - Enterprise Grade
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Premium Features:
 * - Glassmorphism design with backdrop blur
 * - Smooth animations and micro-interactions
 * - Smart active state detection
 * - Keyboard navigation support
 * - Mobile-first responsive design
 * - Visual feedback for all interactions
 * - Accessibility-first approach
 */

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";
import {
  Shield,
  Smartphone,
  Activity,
  Bell,
  User,
  CreditCard,
  ChevronDown,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number | string;
  description?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// Default Navigation Items
// ═══════════════════════════════════════════════════════════════════════════

const DEFAULT_NAV_ITEMS: NavItem[] = [
  {
    href: "/settings/security",
    label: "Security",
    icon: <Shield className="h-4 w-4" />,
    description: "Password, 2FA, and recovery",
  },
  {
    href: "/settings/sessions",
    label: "Sessions",
    icon: <Activity className="h-4 w-4" />,
    description: "View active login sessions",
  },
  {
    href: "/settings/devices",
    label: "Devices",
    icon: <Smartphone className="h-4 w-4" />,
    description: "Manage trusted devices",
  },
  {
    href: "/settings/alerts",
    label: "Alerts",
    icon: <Bell className="h-4 w-4" />,
    description: "Security notifications",
  },
  {
    href: "/settings/activity",
    label: "Activity",
    icon: <Activity className="h-4 w-4" />,
    description: "Account history",
  },
  {
    href: "/settings/account",
    label: "Account",
    icon: <User className="h-4 w-4" />,
    description: "Profile settings",
  },
  {
    href: "/settings/subscription",
    label: "Subscription",
    icon: <CreditCard className="h-4 w-4" />,
    description: "Billing & plans",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// Enhanced Settings Navigation Component
// ═══════════════════════════════════════════════════════════════════════════

export function EnhancedSettingsNav({
  items = DEFAULT_NAV_ITEMS,
}: {
  items?: NavItem[];
}) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);

  // Determine active item
  const activeItem = items.find((item) =>
    pathname === item.href || pathname.startsWith(item.href + "/")
  ) || items[0];

  // Close dropdown when clicking outside
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Close on navigation
  React.useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <nav className="sticky top-0 z-40 w-full">
      {/* Glassmorphism Background */}
      <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-r from-white/95 via-white/90 to-white/95 backdrop-blur-xl dark:from-gray-900/95 dark:via-gray-900/90 dark:to-gray-900/95 shadow-lg shadow-black/5">
        {/* Subtle animated gradient */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-transparent"
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            backgroundSize: "200% 100%",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Mobile Navigation (Dropdown) */}
          <div className="relative md:hidden py-3" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex w-full items-center justify-between rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 p-2 text-white shadow-lg">
                  {activeItem?.icon}
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-foreground">
                    {activeItem?.label}
                  </div>
                  {activeItem?.description && (
                    <div className="text-xs text-muted-foreground">
                      {activeItem.description}
                    </div>
                  )}
                </div>
              </div>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              </motion.div>
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 right-0 top-full mt-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-2xl overflow-hidden"
                >
                  {items.map((item, idx) => {
                    const isActive = item.href === activeItem?.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 transition-all border-l-4",
                          isActive
                            ? "border-l-purple-500 bg-purple-50 dark:bg-purple-900/20"
                            : "border-l-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        )}
                      >
                        <div
                          className={cn(
                            "rounded-lg p-2 shadow-sm transition-all",
                            isActive
                              ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white"
                              : "bg-gray-100 dark:bg-gray-700 text-muted-foreground"
                          )}
                        >
                          {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div
                            className={cn(
                              "text-sm font-medium",
                              isActive
                                ? "text-purple-700 dark:text-purple-300"
                                : "text-foreground"
                            )}
                          >
                            {item.label}
                            {item.badge && (
                              <span className="ml-2 inline-flex items-center rounded-full bg-red-100 dark:bg-red-900/30 px-2 py-0.5 text-xs font-medium text-red-700 dark:text-red-300">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <div className="text-xs text-muted-foreground truncate">
                              {item.description}
                            </div>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Desktop Navigation (Horizontal Pills) */}
          <div className="hidden md:block py-4">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              {items.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(item.href + "/");

                return (
                  <Link key={item.href} href={item.href}>
                    <motion.div
                      className={cn(
                        "relative group flex items-center gap-2.5 rounded-xl px-4 py-2.5 transition-all cursor-pointer",
                        "border border-transparent",
                        isActive
                          ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30"
                          : "text-foreground hover:bg-white/60 dark:hover:bg-gray-800/60 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-md"
                      )}
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      {/* Active indicator line */}
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute -bottom-[17px] left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}

                      {/* Icon */}
                      <motion.div
                        className={cn(
                          "flex-shrink-0 transition-transform",
                          isActive ? "text-white" : "text-muted-foreground"
                        )}
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        {item.icon}
                      </motion.div>

                      {/* Label */}
                      <span className="text-sm font-medium whitespace-nowrap">
                        {item.label}
                      </span>

                      {/* Badge */}
                      {item.badge && (
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                          )}
                        >
                          {item.badge}
                        </span>
                      )}

                      {/* Tooltip on hover (desktop only) */}
                      {!isActive && item.description && (
                        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-1.5 rounded-lg bg-gray-900 dark:bg-gray-700 text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg z-50">
                          {item.description}
                          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-gray-900 dark:bg-gray-700" />
                        </div>
                      )}
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

// Export as default for easy importing
export default EnhancedSettingsNav;
