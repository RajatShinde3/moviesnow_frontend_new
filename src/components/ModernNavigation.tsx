/**
 * =============================================================================
 * Modern Navigation - Ultra Premium Netflix/Disney+ Style
 * =============================================================================
 * Perfect alignment, professional icons, best UX practices
 * Based on: Image reference with improved typography and spacing
 * =============================================================================
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/cn';
import { useMe } from '@/lib/useMe';
import { logout as logoutFromStore } from '@/lib/auth_store';
import { ProfileSelector } from './ProfileSelector';

interface NavItem {
  name: string;
  href: string;
  icon?: React.ReactNode;
}

// ============================================================================
// PROFESSIONAL SVG ICONS - Optimized & Clean
// ============================================================================

const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const MovieIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
    <polyline points="17 2 12 7 7 2" />
  </svg>
);

const SeriesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
    <polyline points="17 2 12 7 7 2" />
  </svg>
);

const AnimeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
  </svg>
);

const TrendingIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

const SearchIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const CrownIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M12 2l3.5 7 7.5-3.5-2 12H3L1 5.5l7.5 3.5L12 2z" />
  </svg>
);

const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v6m0 6v6M5.6 5.6l4.2 4.2m4.2 4.2l4.2 4.2M1 12h6m6 0h6M5.6 18.4l4.2-4.2m4.2-4.2l4.2-4.2" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const BillingIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

const SwitchProfileIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <polyline points="17 11 19 13 23 9" />
  </svg>
);

// ============================================================================
// NAVIGATION ITEMS
// ============================================================================

const mainNav: NavItem[] = [
  { name: 'Home', href: '/home', icon: <HomeIcon /> },
  { name: 'Movies', href: '/browse?type=MOVIE', icon: <MovieIcon /> },
  { name: 'Series', href: '/browse?type=SERIES', icon: <SeriesIcon /> },
  { name: 'Anime', href: '/browse?type=ANIME', icon: <AnimeIcon /> },
  { name: 'Trending', href: '/trending', icon: <TrendingIcon /> },
];

// ============================================================================
// MAIN NAVIGATION COMPONENT
// ============================================================================

export function ModernNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [scrolled, setScrolled] = React.useState(false);

  // Get current user data
  const { data: user, isLoading: userLoading } = useMe();

  // Handle scroll effect for navbar background
  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  React.useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      // Call logout API
      await fetch('/api/v1/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear tokens and redirect
      logoutFromStore();
      router.push('/login');
    }
  };

  // Check if nav item is active
  const isActive = (href: string) => {
    const basePath = href.split('?')[0];
    return pathname === href || pathname.startsWith(basePath);
  };

  return (
    <>
      {/* Main Navigation Bar */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          scrolled
            ? 'bg-black/98 backdrop-blur-2xl border-b border-white/5 shadow-2xl shadow-black/50'
            : 'bg-gradient-to-b from-black/90 via-black/50 to-transparent'
        )}
      >
        <div className="mx-auto max-w-[2000px]">
          <div className="flex h-[72px] items-center justify-between px-6 md:px-12 lg:px-16">
            {/* Left Section: Logo + Navigation */}
            <div className="flex items-center gap-10">
              {/* Logo */}
              <Link
                href="/home"
                className="group flex items-center gap-3 transition-transform duration-300 hover:scale-105"
              >
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                  className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 shadow-lg shadow-purple-500/30"
                >
                  <span className="text-white font-black text-xl tracking-tighter">MN</span>
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-300" />
                </motion.div>
                <span className="hidden sm:block text-2xl font-black text-white tracking-tight">
                  MoviesNow
                </span>
              </Link>

              {/* Desktop Navigation Links */}
              <ul className="hidden lg:flex items-center gap-1">
                {mainNav.map((item) => (
                  <li key={item.name}>
                    <Link href={item.href}>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={cn(
                          'relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300',
                          isActive(item.href)
                            ? 'text-white bg-white/15 shadow-lg shadow-white/5'
                            : 'text-white/70 hover:text-white hover:bg-white/10'
                        )}
                      >
                        <span className="flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                          {item.icon}
                        </span>
                        <span className="font-semibold tracking-wide">{item.name}</span>

                        {/* Active Indicator */}
                        {isActive(item.href) && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent rounded-full"
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        )}
                      </motion.div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Section: Actions */}
            <div className="flex items-center gap-3">
              {/* Search Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300"
                aria-label="Search"
              >
                <SearchIcon />
              </motion.button>

              {/* Go Premium Button */}
              <Link href="/subscribe" className="hidden md:block">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(251, 146, 60, 0.5)" }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 via-orange-500 to-orange-600 text-white text-sm font-bold shadow-lg shadow-orange-500/30 transition-all duration-300"
                >
                  <CrownIcon />
                  <span className="tracking-wide">Go Premium</span>
                </motion.button>
              </Link>

              {/* Profile Selector */}
              <ProfileSelector />

              {/* User Avatar with Dropdown */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 text-white font-black text-base shadow-lg shadow-purple-500/30 transition-all duration-300 ring-2 ring-white/10 hover:ring-white/30"
                  aria-label="User menu"
                >
                  {userLoading ? '...' : (user?.email?.[0]?.toUpperCase() || 'U')}
                </motion.button>

                {/* User Menu Dropdown */}
                <AnimatePresence>
                  {userMenuOpen && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setUserMenuOpen(false)}
                      />

                      {/* Dropdown Menu */}
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute right-0 top-14 z-50 w-72 rounded-2xl bg-gray-900/98 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden"
                      >
                        {/* User Info Section */}
                        <div className="border-b border-white/10 p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 text-white font-black text-lg">
                              {user?.email?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-white truncate">
                                {user?.email || 'Guest User'}
                              </p>
                              <p className="text-xs text-white/60">
                                {user?.is_email_verified ? '✓ Verified' : 'Unverified'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="p-2">
                          <Link
                            href="/profiles"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 w-full rounded-xl px-4 py-3 text-sm font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
                          >
                            <SwitchProfileIcon />
                            <span>Switch Profile</span>
                          </Link>

                          <Link
                            href="/settings"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 w-full rounded-xl px-4 py-3 text-sm font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
                          >
                            <SettingsIcon />
                            <span>Account Settings</span>
                          </Link>

                          <Link
                            href="/billing"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 w-full rounded-xl px-4 py-3 text-sm font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
                          >
                            <BillingIcon />
                            <span>Billing & Subscription</span>
                          </Link>

                          <div className="my-2 border-t border-white/10" />

                          <button
                            onClick={() => {
                              setUserMenuOpen(false);
                              handleLogout();
                            }}
                            className="flex items-center gap-3 w-full rounded-xl px-4 py-3 text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
                          >
                            <LogoutIcon />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Toggle */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Search Overlay */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="border-t border-white/5 bg-black/98 backdrop-blur-2xl"
            >
              <div className="mx-auto max-w-[2000px] px-6 py-6 md:px-12 lg:px-16">
                <form onSubmit={handleSearch} className="relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40">
                    <SearchIcon />
                  </div>
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search movies, series, anime..."
                    className="w-full rounded-2xl bg-white/10 border border-white/10 pl-14 pr-6 py-4 text-white text-base placeholder:text-white/40 focus:bg-white/15 focus:border-purple-500/50 focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all duration-300"
                    autoFocus
                  />
                </form>

                {/* Popular Searches */}
                <div className="mt-6">
                  <p className="text-white/60 text-sm font-semibold mb-3 tracking-wide">Popular Searches</p>
                  <div className="flex flex-wrap gap-2">
                    {['Action', 'Comedy', 'Drama', 'Thriller', 'Sci-Fi', 'Horror', 'Romance', 'Anime'].map((genre) => (
                      <button
                        key={genre}
                        onClick={() => {
                          setSearchQuery(genre);
                          handleSearch(new Event('submit') as any);
                        }}
                        className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 text-white text-sm font-medium transition-all duration-300"
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-80 max-w-full bg-gradient-to-br from-gray-900 to-black border-l border-white/10 lg:hidden overflow-y-auto shadow-2xl"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black text-white tracking-tight">Menu</h2>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300"
                    aria-label="Close menu"
                  >
                    <CloseIcon />
                  </motion.button>
                </div>

                <div className="space-y-8">
                  {/* Navigation Links */}
                  <div>
                    <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4">
                      Browse
                    </h3>
                    <ul className="space-y-1">
                      {mainNav.map((item, idx) => (
                        <motion.li
                          key={item.name}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <Link
                            href={item.href}
                            className={cn(
                              'flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-semibold transition-all duration-300',
                              isActive(item.href)
                                ? 'bg-purple-600/20 text-purple-300 shadow-lg shadow-purple-500/10'
                                : 'text-white/70 hover:bg-white/10 hover:text-white'
                            )}
                          >
                            {item.icon}
                            {item.name}
                          </Link>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {/* Premium CTA */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Link
                      href="/subscribe"
                      className="flex items-center justify-center gap-3 w-full rounded-xl bg-gradient-to-r from-yellow-500 via-orange-500 to-orange-600 px-6 py-4 text-white font-bold text-base shadow-xl shadow-orange-500/30 transition-all hover:shadow-2xl hover:shadow-orange-500/40"
                    >
                      <CrownIcon />
                      <span className="tracking-wide">Upgrade to Premium</span>
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
