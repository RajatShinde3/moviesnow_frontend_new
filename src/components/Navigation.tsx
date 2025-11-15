// components/Navigation.tsx
/**
 * =============================================================================
 * Main Navigation - Responsive nav with search and user menu
 * =============================================================================
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { SearchBar } from "./ui/SearchBar";
import { Menu, X, User, Settings, LogOut, Download, History, Star } from "lucide-react";

export function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);

  const navigation = [
    { name: "Home", href: "/home" },
    { name: "Movies", href: "/browse?type=MOVIE" },
    { name: "Series", href: "/browse?type=SERIES" },
    { name: "My List", href: "/watchlist" },
  ];

  const userMenuItems = [
    { name: "Watch History", href: "/history", icon: History },
    { name: "Watchlist", href: "/watchlist", icon: Star },
    { name: "Downloads", href: "/downloads", icon: Download },
    { name: "Settings", href: "/settings/account", icon: Settings },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link href="/home" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">MoviesNow</span>
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden items-center gap-6 md:flex">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    pathname === item.href ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Search & User Menu */}
        <div className="flex items-center gap-4">
          {/* Search - Hidden on mobile */}
          <div className="hidden lg:block">
            <SearchBar className="w-96" />
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
              aria-label="User menu"
            >
              <User className="h-5 w-5" />
            </button>

            {/* User Dropdown */}
            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserMenuOpen(false)}
                  aria-hidden="true"
                />
                <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border bg-background shadow-lg">
                  <div className="p-3 border-b">
                    <p className="text-sm font-medium">Your Account</p>
                    <p className="text-xs text-muted-foreground">user@example.com</p>
                  </div>
                  <ul className="p-1">
                    {userMenuItems.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
                        >
                          <item.icon className="h-4 w-4" />
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t p-1">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        // Handle logout
                      }}
                      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-red-600 transition-colors hover:bg-accent"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden"
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

      {/* Mobile Search & Menu */}
      {mobileMenuOpen && (
        <div className="border-t md:hidden">
          <div className="space-y-4 p-4">
            {/* Mobile Search */}
            <SearchBar />

            {/* Mobile Navigation */}
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </nav>
  );
}
