"use client";

/**
 * =============================================================================
 * MOVIESNOW - Modern Navigation Component
 * =============================================================================
 *
 * Features:
 * - Glassmorphism design
 * - Smooth scroll behavior
 * - Mobile-responsive hamburger menu
 * - Animated transitions
 * - Sticky header with backdrop blur
 */

import * as React from "react";
import Link from "next/link";
import { Menu, X, Play } from "lucide-react";

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function ModernNav() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-2xl"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
              <div className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-r from-red-600 to-pink-600 rounded-lg shadow-lg">
                <Play className="w-5 h-5 text-white fill-current" />
              </div>
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              MoviesNow
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            {[
              { href: "/", label: "Home" },
              { href: "#features", label: "Features" },
              { href: "#pricing", label: "Pricing" },
              { href: "#faq", label: "FAQ" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 text-sm font-medium text-gray-300 rounded-lg hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link
              href="/login"
              className="px-6 py-2.5 text-sm font-medium text-white rounded-lg hover:bg-white/10 transition-all duration-200"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="group relative px-6 py-2.5 text-sm font-bold text-white rounded-lg bg-gradient-to-r from-red-600 to-pink-600 shadow-lg shadow-red-500/50 hover:shadow-xl hover:shadow-red-500/70 transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative">Start Free Trial</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300",
          isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="border-t border-white/10 bg-black/95 backdrop-blur-xl px-4 py-6 space-y-2">
          {[
            { href: "/", label: "Home" },
            { href: "#features", label: "Features" },
            { href: "#pricing", label: "Pricing" },
            { href: "#faq", label: "FAQ" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-4 py-3 text-base font-medium text-gray-300 rounded-lg hover:text-white hover:bg-white/10 transition-all duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          <div className="pt-4 space-y-2">
            <Link
              href="/login"
              className="block px-4 py-3 text-base font-medium text-white text-center rounded-lg border border-white/20 hover:bg-white/10 transition-all duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="block px-4 py-3 text-base font-bold text-white text-center rounded-lg bg-gradient-to-r from-red-600 to-pink-600 shadow-lg shadow-red-500/50 hover:shadow-xl hover:shadow-red-500/70 transition-all duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
