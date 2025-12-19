"use client";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MOVIESNOW - AnimeSuge-Style Navigation
 * ═══════════════════════════════════════════════════════════════════════════
 * Exact replica of AnimeSuge navigation design
 */

import * as React from "react";
import Link from "next/link";
import { Menu, X, User } from "lucide-react";

const NAV_ITEMS = [
  { name: "GENRES", href: "/browse/genres" },
  { name: "MOVIES", href: "/browse/movies" },
  { name: "SERIES", href: "/browse/series" },
  { name: "ANIME", href: "/browse/anime" },
  { name: "POPULAR", href: "/browse/popular" },
  { name: "TRENDING", href: "/browse/trending" },
  { name: "NEW RELEASES", href: "/browse/new" },
  { name: "DOCUMENTARIES", href: "/browse/documentaries" },
  { name: "SCHEDULE", href: "/schedule" },
  { name: "RANDOM", href: "/random" },
];

export function AnimeSugeNav() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [language, setLanguage] = React.useState<"EN" | "JP">("EN");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1a1a1a] border-b border-white/5">
      <div className="max-w-[1920px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <span className="text-xl md:text-2xl font-black tracking-tight text-white">
              Movies
            </span>
            <span className="text-xl md:text-2xl font-black tracking-tight text-white bg-red-600 px-2 py-0.5 ml-0.5 rounded">
              Now
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex items-center gap-1 flex-1 mx-8">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors duration-150"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="hidden md:flex items-center gap-1 bg-[#0f0f0f] rounded overflow-hidden">
              <button
                onClick={() => setLanguage("EN")}
                className={`px-3 py-1.5 text-xs font-bold transition-colors ${
                  language === "EN"
                    ? "bg-red-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage("JP")}
                className={`px-3 py-1.5 text-xs font-bold transition-colors ${
                  language === "JP"
                    ? "bg-red-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                JP
              </button>
            </div>

            {/* Sign In Button */}
            <Link
              href="/signin"
              className="hidden md:flex items-center gap-2 px-4 py-1.5 text-sm font-semibold text-white hover:text-gray-300 transition-colors"
            >
              <User className="w-4 h-4" strokeWidth={2} />
              <span>Sign In</span>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden p-2 text-gray-300 hover:text-white transition-colors"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" strokeWidth={2} />
              ) : (
                <Menu className="w-6 h-6" strokeWidth={2} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="xl:hidden border-t border-white/5 py-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="space-y-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/5 transition-all rounded"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Mobile Language & Sign In */}
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between px-4">
              <div className="flex items-center gap-1 bg-[#0f0f0f] rounded overflow-hidden">
                <button
                  onClick={() => setLanguage("EN")}
                  className={`px-3 py-1.5 text-xs font-bold transition-colors ${
                    language === "EN"
                      ? "bg-red-600 text-white"
                      : "text-gray-400"
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage("JP")}
                  className={`px-3 py-1.5 text-xs font-bold transition-colors ${
                    language === "JP"
                      ? "bg-red-600 text-white"
                      : "text-gray-400"
                  }`}
                >
                  JP
                </button>
              </div>
              <Link
                href="/signin"
                className="flex items-center gap-2 text-sm font-semibold text-white"
              >
                <User className="w-4 h-4" strokeWidth={2} />
                <span>Sign In</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
