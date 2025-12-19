"use client";

/**
 * =============================================================================
 * MOVIESNOW - Refined Navigation
 * =============================================================================
 *
 * Modern, clean navigation with perfect spacing
 */

import * as React from "react";
import Link from "next/link";
import {
  Search,
  Menu,
  X,
  Home,
  Film,
  Tv,
  Sparkles,
  User,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
  Bookmark,
  Clock,
} from "lucide-react";

const NAV_LINKS = [
  { name: "Home", href: "/", icon: Home },
  { name: "Movies", href: "/browse/movies", icon: Film },
  { name: "Series", href: "/browse/series", icon: Tv },
  { name: "Anime", href: "/browse/anime", icon: Sparkles },
];

const GENRES = [
  "Action", "Adventure", "Comedy", "Drama", "Fantasy",
  "Horror", "Mystery", "Romance", "Sci-Fi", "Thriller",
  "Animation", "Documentary"
];

export function WorldClassNav() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [isGenreMenuOpen, setIsGenreMenuOpen] = React.useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on outside click
  React.useEffect(() => {
    const handleClickOutside = () => {
      setIsGenreMenuOpen(false);
      setIsUserMenuOpen(false);
    };
    if (isGenreMenuOpen || isUserMenuOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [isGenreMenuOpen, isUserMenuOpen]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-black/98 backdrop-blur-2xl shadow-xl shadow-black/20"
          : "bg-gradient-to-b from-black/80 via-black/40 to-transparent"
      }`}
    >
      <div className="max-w-[1920px] mx-auto px-6 md:px-10 lg:px-16 xl:px-20">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl blur-md opacity-0 group-hover:opacity-70 transition-opacity duration-300" />
              <div className="relative w-11 h-11 bg-gradient-to-br from-red-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <Film className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <span className="text-2xl font-black tracking-tight text-white hidden sm:block">
              MoviesNow
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2 flex-1 mx-12">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2.5 px-5 py-2.5 text-base font-semibold text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
              >
                <link.icon className="w-4 h-4" strokeWidth={2.5} />
                {link.name}
              </Link>
            ))}

            {/* Genres Dropdown */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsGenreMenuOpen(!isGenreMenuOpen);
                }}
                className="flex items-center gap-2.5 px-5 py-2.5 text-base font-semibold text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
              >
                Genres
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isGenreMenuOpen ? "rotate-180" : ""}`} strokeWidth={2.5} />
              </button>

              {/* Genres Menu */}
              {isGenreMenuOpen && (
                <div className="absolute top-full left-0 mt-3 w-[420px] bg-black/98 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-6 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="grid grid-cols-2 gap-2">
                    {GENRES.map((genre) => (
                      <Link
                        key={genre}
                        href={`/browse/genre/${genre.toLowerCase()}`}
                        className="px-4 py-3 text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                      >
                        {genre}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Search Button */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              aria-label="Search"
            >
              <Search className="w-5 h-5" strokeWidth={2.5} />
            </button>

            {/* Notifications */}
            <button className="relative p-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all hidden md:block">
              <Bell className="w-5 h-5" strokeWidth={2.5} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-black" />
            </button>

            {/* User Menu */}
            <div className="relative hidden md:block">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsUserMenuOpen(!isUserMenuOpen);
                }}
                className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                  <User className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isUserMenuOpen ? "rotate-180" : ""}`} strokeWidth={2.5} />
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute top-full right-0 mt-3 w-64 bg-black/98 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Profile Section */}
                  <div className="p-5 border-b border-white/10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" strokeWidth={2.5} />
                      </div>
                      <div>
                        <div className="text-white font-bold text-sm">John Doe</div>
                        <div className="text-gray-400 text-xs">Premium Member</div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-2">
                    <Link href="/watchlist" className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                      <Bookmark className="w-4 h-4" strokeWidth={2.5} />
                      Watchlist
                    </Link>
                    <Link href="/history" className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                      <Clock className="w-4 h-4" strokeWidth={2.5} />
                      Watch History
                    </Link>
                    <Link href="/settings" className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                      <Settings className="w-4 h-4" strokeWidth={2.5} />
                      Settings
                    </Link>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all">
                      <LogOut className="w-4 h-4" strokeWidth={2.5} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" strokeWidth={2.5} /> : <Menu className="w-6 h-6" strokeWidth={2.5} />}
            </button>
          </div>
        </div>

        {/* Search Overlay */}
        {isSearchOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 px-6 md:px-10 lg:px-16 xl:px-20 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="max-w-4xl mx-auto bg-black/98 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center gap-4 p-5">
                <Search className="w-5 h-5 text-gray-400" strokeWidth={2.5} />
                <input
                  type="text"
                  placeholder="Search movies, series, anime..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-white text-lg placeholder-gray-500 outline-none font-medium"
                  autoFocus
                />
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 mt-2 mx-6 md:mx-10 bg-black/98 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="p-4 space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                >
                  <link.icon className="w-5 h-5" strokeWidth={2.5} />
                  {link.name}
                </Link>
              ))}

              {/* Mobile User Menu */}
              <div className="border-t border-white/10 pt-4 mt-4">
                <Link href="/watchlist" className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                  <Bookmark className="w-5 h-5" strokeWidth={2.5} />
                  Watchlist
                </Link>
                <Link href="/settings" className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                  <Settings className="w-5 h-5" strokeWidth={2.5} />
                  Settings
                </Link>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all">
                  <LogOut className="w-5 h-5" strokeWidth={2.5} />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
