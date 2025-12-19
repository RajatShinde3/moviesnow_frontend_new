'use client';

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 🧭 MODERN NAVIGATION
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * Premium navigation bar for streaming platform.
 *
 * Features:
 * • Glassmorphism sticky header
 * • Integrated search bar
 * • User menu with profile switching
 * • Mobile-responsive hamburger menu
 * • Smooth scroll-based transparency
 * • Notification bell
 */

import * as React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Menu, X, Bell, User, Settings, LogOut, Film, Tv, Sparkles, Download } from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { SearchBar } from './SearchBar';
import { colors, shadows, glassmorph, zIndex } from '@/lib/design-system';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface ModernNavProps {
  user?: {
    name?: string;
    email?: string;
    avatar_url?: string;
    has_active_subscription?: boolean;
  };
  onLogout?: () => void;
}

interface NavLink {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function ModernNav({ user, onLogout }: ModernNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { scrollY } = useScroll();

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [showSearch, setShowSearch] = React.useState(false);

  // Scroll-based background opacity
  const navOpacity = useTransform(scrollY, [0, 100], [0.7, 0.95]);
  const navBlur = useTransform(scrollY, [0, 100], [10, 20]);

  // Navigation links
  const navLinks: NavLink[] = [
    { label: 'Home', href: '/home', icon: <Sparkles size={18} /> },
    { label: 'Movies', href: '/browse?type=MOVIE', icon: <Film size={18} /> },
    { label: 'Series', href: '/browse?type=SERIES', icon: <Tv size={18} /> },
    { label: 'My List', href: '/watchlist' },
    { label: 'Downloads', href: '/downloads', icon: <Download size={18} /> },
  ];

  // User menu items
  const userMenuItems = [
    { label: 'Profiles', href: '/profiles', icon: <User size={16} /> },
    { label: 'Settings', href: '/settings', icon: <Settings size={16} /> },
    ...(user?.has_active_subscription
      ? [{ label: 'Subscription', href: '/settings/subscription', icon: <Sparkles size={16} /> }]
      : [{ label: 'Upgrade to Premium', href: '/subscribe', icon: <Sparkles size={16} /> }]
    ),
  ];

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href);

  return (
    <motion.nav
      className="fixed left-0 right-0 top-0 z-50"
      style={{
        ...glassmorph(0.9, 15),
        boxShadow: shadows.lg,
        zIndex: zIndex.sticky,
      }}
    >
      <div className="mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/home" className="flex-shrink-0">
            <motion.div
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg font-black text-xl"
                style={{
                  background: `linear-gradient(135deg, ${colors.accent.primary} 0%, ${colors.accent.tertiary} 100%)`,
                  color: colors.text.inverse,
                  boxShadow: shadows.glow.pink,
                }}
              >
                M
              </div>
              <span
                className="hidden text-xl font-black tracking-tight sm:block"
                style={{ color: colors.text.primary }}
              >
                MoviesNow
              </span>
            </motion.div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <motion.div
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
                  style={{
                    color: isActive(link.href) ? colors.text.primary : colors.text.secondary,
                    background: isActive(link.href) ? colors.bg.elevated : 'transparent',
                  }}
                  whileHover={{
                    color: colors.text.primary,
                    background: colors.bg.elevated,
                  }}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </motion.div>
              </Link>
            ))}
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden flex-1 max-w-md lg:block">
            <SearchBar />
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Search Toggle (Mobile/Tablet) */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="lg:hidden"
              aria-label="Toggle search"
            >
              <motion.div
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{
                  background: colors.bg.glass,
                  color: colors.text.secondary,
                }}
                whileHover={{ scale: 1.1, color: colors.text.primary }}
                whileTap={{ scale: 0.9 }}
              >
                <Menu size={20} />
              </motion.div>
            </button>

            {/* Notifications */}
            <motion.button
              className="relative hidden sm:flex h-10 w-10 items-center justify-center rounded-full"
              style={{
                background: colors.bg.glass,
                color: colors.text.secondary,
              }}
              whileHover={{ scale: 1.1, color: colors.text.primary }}
              whileTap={{ scale: 0.9 }}
              aria-label="Notifications"
            >
              <Bell size={20} />
              {/* Notification Badge */}
              <span
                className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold"
                style={{
                  background: colors.accent.primary,
                  color: colors.text.inverse,
                }}
              >
                3
              </span>
            </motion.button>

            {/* User Menu */}
            <div className="relative">
              <motion.button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full"
                style={{
                  background: user?.avatar_url ? 'transparent' : colors.accent.secondary,
                  border: `2px solid ${userMenuOpen ? colors.accent.primary : 'transparent'}`,
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="User menu"
              >
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt={user.name || 'User'} className="h-full w-full object-cover" />
                ) : (
                  <User size={20} style={{ color: colors.text.inverse }} />
                )}
              </motion.button>

              {/* User Dropdown */}
              {userMenuOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                  />

                  {/* Menu */}
                  <motion.div
                    className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-lg"
                    style={{
                      background: colors.bg.secondary,
                      border: `1px solid ${colors.border.default}`,
                      boxShadow: shadows.xl,
                      zIndex: zIndex.dropdown,
                    }}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    {/* User Info */}
                    <div className="border-b px-4 py-3" style={{ borderColor: colors.border.default }}>
                      <div className="font-semibold" style={{ color: colors.text.primary }}>
                        {user?.name || 'User'}
                      </div>
                      <div className="text-sm" style={{ color: colors.text.tertiary }}>
                        {user?.email}
                      </div>
                      {user?.has_active_subscription && (
                        <div
                          className="mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold"
                          style={{
                            background: colors.gradient.premium,
                            color: colors.text.inverse,
                          }}
                        >
                          <Sparkles size={12} />
                          Premium
                        </div>
                      )}
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      {userMenuItems.map((item) => (
                        <Link key={item.href} href={item.href} onClick={() => setUserMenuOpen(false)}>
                          <motion.div
                            className="flex items-center gap-3 px-4 py-2 text-sm transition-colors"
                            style={{ color: colors.text.primary }}
                            whileHover={{ background: colors.bg.elevated }}
                          >
                            {item.icon}
                            <span>{item.label}</span>
                          </motion.div>
                        </Link>
                      ))}

                      {/* Logout */}
                      <motion.button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onLogout?.();
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2 text-sm"
                        style={{ color: colors.accent.error }}
                        whileHover={{ background: colors.bg.elevated }}
                      >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                      </motion.button>
                    </div>
                  </motion.div>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden"
              aria-label="Toggle menu"
            >
              <motion.div
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{
                  background: colors.bg.glass,
                  color: colors.text.secondary,
                }}
                whileHover={{ scale: 1.1, color: colors.text.primary }}
                whileTap={{ scale: 0.9 }}
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </motion.div>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {showSearch && (
          <motion.div
            className="pb-4 lg:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <SearchBar />
          </motion.div>
        )}

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <motion.div
            className="border-t py-4 lg:hidden"
            style={{ borderColor: colors.border.default }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)}>
                  <motion.div
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-semibold"
                    style={{
                      color: isActive(link.href) ? colors.text.primary : colors.text.secondary,
                      background: isActive(link.href) ? colors.bg.elevated : 'transparent',
                    }}
                    whileHover={{ background: colors.bg.elevated, color: colors.text.primary }}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}
