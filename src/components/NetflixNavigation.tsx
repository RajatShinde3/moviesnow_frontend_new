// components/NetflixNavigation.tsx
/**
 * =============================================================================
 * Netflix-Style Navigation - Premium UX
 * =============================================================================
 * Features:
 * - Real user avatar integration
 * - Notification bell with unread badge
 * - Browse dropdown with categories
 * - Profile quick switcher
 * - Mobile-optimized with bottom nav
 * - Smooth animations
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { SearchBar } from "./ui/SearchBar";
import {
  Menu,
  X,
  User,
  Settings,
  LogOut,
  Download,
  History,
  Star,
  Bell,
  ChevronDown,
  Play,
  TrendingUp,
  Flame,
  Grid3x3,
  Home as HomeIcon,
  Film,
  Tv,
  Heart,
} from "lucide-react";
import { api } from "@/lib/api/services";
import { useQuery } from "@tanstack/react-query";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationCenter } from "./NotificationCenter";

interface NetflixNavigationProps {
  onProfileSwitch?: () => void;
}

export function NetflixNavigation({ onProfileSwitch }: NetflixNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [browseMenuOpen, setBrowseMenuOpen] = React.useState(false);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  // Fetch current user
  const { data: user } = useQuery({
    queryKey: ["user", "me"],
    queryFn: () => api.user.getMe(),
  });

  // Fetch active profile (if multi-profile enabled)
  const { data: profiles } = useQuery({
    queryKey: ["profiles"],
    queryFn: () => api.profiles.list(),
  });

  const activeProfile = profiles?.find(p => p.is_active) || profiles?.[0];

  // Scroll effect for navbar background
  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const mainNavigation = [
    { name: "Home", href: "/home", icon: HomeIcon },
    { name: "Movies", href: "/browse?type=MOVIE", icon: Film },
    { name: "Series", href: "/browse?type=SERIES", icon: Tv },
    { name: "My List", href: "/watchlist", icon: Heart },
  ];

  const browseCategories = [
    {
      name: "New & Hot",
      href: "/browse?sort_by=release_date&sort_order=desc",
      icon: Flame,
    },
    { name: "Trending Now", href: "/browse?sort_by=popularity&sort_order=desc", icon: TrendingUp },
    { name: "Top 10", href: "/top-10", icon: Star },
    { name: "Browse by Genre", href: "/browse", icon: Grid3x3 },
  ];

  const userMenuItems = [
    { name: "Manage Profiles", href: "/profiles", icon: User },
    { name: "Watch History", href: "/history", icon: History },
    { name: "Watchlist", href: "/watchlist", icon: Star },
    { name: "Downloads", href: "/downloads", icon: Download },
    { name: "My Stats", href: "/stats", icon: TrendingUp },
    { name: "Notifications", href: "/settings/notifications", icon: Bell },
    { name: "Account Settings", href: "/settings/account", icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await api.auth.logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      {/* Desktop & Tablet Navigation */}
      <nav
        className={cn(
          "fixed top-0 z-50 w-full transition-all duration-300",
          scrolled
            ? "bg-black/95 backdrop-blur-md shadow-lg"
            : "bg-gradient-to-b from-black/80 to-transparent"
        )}
      >
        <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left: Logo + Nav Links */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link href="/home" className="flex items-center gap-2">
              <span className="text-2xl font-bold text-red-600">MoviesNow</span>
            </Link>

            {/* Desktop Navigation Links */}
            <ul className="hidden items-center gap-5 lg:flex">
              {mainNavigation.slice(0, 3).map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-white",
                      pathname === item.href || pathname?.startsWith(item.href.split("?")[0])
                        ? "text-white"
                        : "text-gray-300"
                    )}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}

              {/* Browse Dropdown */}
              <li className="relative">
                <button
                  onClick={() => setBrowseMenuOpen(!browseMenuOpen)}
                  className="flex items-center gap-1 text-sm font-medium text-gray-300 transition-colors hover:text-white"
                >
                  Browse
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      browseMenuOpen && "rotate-180"
                    )}
                  />
                </button>

                {/* Browse Dropdown Menu */}
                {browseMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setBrowseMenuOpen(false)}
                    />
                    <div className="absolute left-0 top-full z-50 mt-2 w-56 rounded-md border border-white/10 bg-black/95 py-2 shadow-2xl backdrop-blur-xl">
                      {browseCategories.map((category) => (
                        <Link
                          key={category.name}
                          href={category.href}
                          onClick={() => setBrowseMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
                        >
                          <category.icon className="h-4 w-4" />
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </li>

              <li>
                <Link
                  href="/watchlist"
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-white",
                    pathname === "/watchlist" ? "text-white" : "text-gray-300"
                  )}
                >
                  My List
                </Link>
              </li>
            </ul>
          </div>

          {/* Right: Search, Notifications, Profile */}
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="hidden lg:block">
              <SearchBar className="w-64" />
            </div>

            {/* Notifications Bell */}
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative rounded-full p-2 text-gray-300 transition-colors hover:text-white"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {/* Unread Badge */}
              <span className="absolute right-1 top-1 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
            </button>

            {/* User Avatar & Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-md transition-opacity hover:opacity-80"
                aria-label="User menu"
              >
                {activeProfile?.avatar_url ? (
                  <img
                    src={activeProfile.avatar_url}
                    alt={activeProfile.name}
                    className="h-8 w-8 rounded-md object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-purple-600 text-xs font-bold text-white">
                    {user?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </div>
                )}
                <ChevronDown
                  className={cn(
                    "hidden h-4 w-4 text-white transition-transform sm:block",
                    userMenuOpen && "rotate-180"
                  )}
                />
              </button>

              {/* User Dropdown */}
              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-md border border-white/10 bg-black/95 shadow-2xl backdrop-blur-xl">
                    {/* Profile Info */}
                    <div className="border-b border-white/10 p-4">
                      <div className="flex items-center gap-3">
                        {activeProfile?.avatar_url ? (
                          <img
                            src={activeProfile.avatar_url}
                            alt={activeProfile.name}
                            className="h-10 w-10 rounded-md object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-bold text-white">
                            {user?.full_name?.charAt(0) || "U"}
                          </div>
                        )}
                        <div className="flex-1 overflow-hidden">
                          <p className="truncate text-sm font-medium text-white">
                            {activeProfile?.name || user?.full_name || "User"}
                          </p>
                          <p className="truncate text-xs text-gray-400">
                            {user?.email}
                          </p>
                        </div>
                      </div>

                      {/* Switch Profile Button */}
                      {profiles && profiles.length > 1 && (
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            onProfileSwitch?.();
                          }}
                          className="mt-3 w-full rounded-md border border-white/20 py-2 text-xs font-medium text-white transition-colors hover:bg-white/10"
                        >
                          Switch Profile
                        </button>
                      )}
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      {userMenuItems.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
                        >
                          <item.icon className="h-4 w-4" />
                          {item.name}
                        </Link>
                      ))}
                    </div>

                    {/* Theme Toggle */}
                    <div className="border-t border-white/10 px-4 py-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Theme</span>
                        <ThemeToggle />
                      </div>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-white/10 p-2">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-md px-4 py-2.5 text-sm text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-md p-2 text-gray-300 hover:text-white lg:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-white/10 bg-black/95 backdrop-blur-xl lg:hidden">
            <div className="space-y-1 px-4 py-4">
              {/* Search on mobile */}
              <div className="mb-4">
                <SearchBar />
              </div>

              {/* Nav Links */}
              {mainNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    pathname === item.href || pathname?.startsWith(item.href.split("?")[0])
                      ? "bg-white/10 text-white"
                      : "text-gray-300 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              ))}

              {/* Browse Categories */}
              <div className="pt-2">
                <p className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Browse
                </p>
                {browseCategories.map((category) => (
                  <Link
                    key={category.name}
                    href={category.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <category.icon className="h-5 w-5" />
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-black/95 backdrop-blur-xl lg:hidden">
        <div className="grid grid-cols-5 gap-1 px-2 py-2">
          {[
            { name: "Home", href: "/home", icon: HomeIcon },
            { name: "Movies", href: "/browse?type=MOVIE", icon: Film },
            { name: "Series", href: "/browse?type=SERIES", icon: Tv },
            { name: "Downloads", href: "/downloads", icon: Download },
            { name: "More", href: "/watchlist", icon: Star },
          ].map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg py-2 transition-colors",
                pathname === item.href || pathname?.startsWith(item.href.split("?")[0])
                  ? "text-white"
                  : "text-gray-400 hover:text-gray-200"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Notification Center Modal */}
      {notificationsOpen && (
        <NotificationCenter onClose={() => setNotificationsOpen(false)} />
      )}
    </>
  );
}
