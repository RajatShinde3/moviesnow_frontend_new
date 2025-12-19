"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export function LandingNav() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-b border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center">
              <span className="text-2xl font-black bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                MoviesNow
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link
              href="/"
              className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
            >
              Home
            </Link>
            <Link
              href="#features"
              className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
            >
              Pricing
            </Link>
            <Link
              href="#faq"
              className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
            >
              FAQ
            </Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-gradient-to-r from-red-600 to-pink-600 px-6 py-2 text-sm font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-red-500/50"
            >
              Start Free Trial
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
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
      {isMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-black/95 backdrop-blur-lg">
          <div className="space-y-1 px-4 pb-3 pt-2">
            <Link
              href="/"
              className="block rounded-lg px-3 py-2 text-base font-medium text-gray-300 hover:bg-white/10 hover:text-white"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="#features"
              className="block rounded-lg px-3 py-2 text-base font-medium text-gray-300 hover:bg-white/10 hover:text-white"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="block rounded-lg px-3 py-2 text-base font-medium text-gray-300 hover:bg-white/10 hover:text-white"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="#faq"
              className="block rounded-lg px-3 py-2 text-base font-medium text-gray-300 hover:bg-white/10 hover:text-white"
              onClick={() => setIsMenuOpen(false)}
            >
              FAQ
            </Link>
            <div className="mt-4 space-y-2">
              <Link
                href="/login"
                className="block rounded-lg border border-white/20 px-4 py-2 text-center text-base font-medium text-white hover:bg-white/10"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="block rounded-lg bg-gradient-to-r from-red-600 to-pink-600 px-4 py-2 text-center text-base font-bold text-white shadow-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
