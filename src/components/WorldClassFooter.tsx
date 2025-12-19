"use client";

/**
 * =============================================================================
 * MOVIESNOW - World-Class Footer
 * =============================================================================
 */

import * as React from "react";
import Link from "next/link";
import { Film, Github, Twitter, Facebook, Instagram, Mail, Heart } from "lucide-react";

const FOOTER_LINKS = {
  "Browse": [
    { name: "Movies", href: "/browse/movies" },
    { name: "TV Series", href: "/browse/series" },
    { name: "Anime", href: "/browse/anime" },
    { name: "Documentaries", href: "/browse/documentaries" },
    { name: "New Releases", href: "/browse/new" },
    { name: "Trending", href: "/browse/trending" },
  ],
  "Features": [
    { name: "Premium", href: "/subscribe" },
    { name: "Download", href: "/downloads" },
    { name: "Watchlist", href: "/watchlist" },
    { name: "Continue Watching", href: "/history" },
    { name: "Quality Options", href: "/quality" },
  ],
  "Support": [
    { name: "Help Center", href: "/help" },
    { name: "Contact Us", href: "/contact" },
    { name: "Report Issue", href: "/report" },
    { name: "Request Content", href: "/request" },
    { name: "DMCA", href: "/dmca" },
  ],
  "Legal": [
    { name: "Terms of Service", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Cookie Policy", href: "/cookies" },
    { name: "Disclaimer", href: "/disclaimer" },
  ],
};

export function WorldClassFooter() {
  return (
    <footer className="relative bg-[#0a0a0a] border-t border-white/5">
      {/* Main Footer Content */}
      <div className="max-w-[1920px] mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Brand Column */}
          <div className="col-span-2">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-br from-red-600 to-pink-600 rounded-lg">
                  <Film className="w-5 h-5 text-white" />
                </div>
              </div>
              <span className="text-2xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                MoviesNow
              </span>
            </Link>

            <p className="text-gray-400 text-sm mb-6 max-w-sm">
              Stream and download unlimited movies, TV series, anime, and documentaries in HD quality.
              Premium experience with no ads.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-white/5 hover:bg-white/10 rounded-lg transition-all group"
              >
                <Twitter className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-white/5 hover:bg-white/10 rounded-lg transition-all group"
              >
                <Facebook className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-white/5 hover:bg-white/10 rounded-lg transition-all group"
              >
                <Instagram className="w-5 h-5 text-gray-400 group-hover:text-pink-500 transition-colors" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-white/5 hover:bg-white/10 rounded-lg transition-all group"
              >
                <Github className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
              </a>
              <a
                href="mailto:support@moviesnow.com"
                className="p-2.5 bg-white/5 hover:bg-white/10 rounded-lg transition-all group"
              >
                <Mail className="w-5 h-5 text-gray-400 group-hover:text-green-400 transition-colors" />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-white font-bold text-sm mb-4">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white text-sm transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-8 border-t border-white/5">
          <div className="max-w-md">
            <h3 className="text-white font-bold text-lg mb-2">Stay Updated</h3>
            <p className="text-gray-400 text-sm mb-4">
              Subscribe to get updates on new releases and exclusive content.
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 outline-none focus:border-red-500 transition-colors"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold rounded-lg hover:from-red-700 hover:to-pink-700 transition-all"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5 bg-black/30">
        <div className="max-w-[1920px] mx-auto px-4 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm text-center md:text-left">
              © 2024 MoviesNow. All rights reserved. Made with{" "}
              <Heart className="inline w-4 h-4 text-red-500 fill-current" /> for movie lovers.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/terms" className="text-gray-500 hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="text-gray-500 hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/cookies" className="text-gray-500 hover:text-white transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
