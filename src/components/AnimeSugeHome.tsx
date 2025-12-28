"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

/**
 * AnimeSuge-Style Homepage
 * Content-focused design as per CLAUDE.md:
 * - Hero section with featured content
 * - Content rows (Trending, New Releases, etc.)
 * - NO pricing tables
 * - NO FAQ section
 * - Transparent cards with poster images
 */
export function AnimeSugeHome() {
  return (
    <div className="min-h-screen bg-[#161616]">
      {/* Hero Section */}
      <section className="relative h-[70vh] overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#161616]/50 to-[#161616]" />

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-6xl md:text-7xl font-black text-white mb-6 leading-tight"
            >
              Stream Unlimited
              <span className="block text-[#FF3D41]">Movies & Series</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-[#CCCCCC] mb-8 leading-relaxed"
            >
              Watch anywhere. Download for offline viewing. High-quality streaming in 480p, 720p, and 1080p.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex gap-4"
            >
              <Link
                href="/signup"
                className="px-8 py-4 bg-[#FF3D41] hover:bg-[#FF6366] text-white font-bold rounded-lg transition-all duration-300 shadow-lg shadow-[#FF3D41]/30 hover:shadow-xl hover:shadow-[#FF6366]/40 hover:scale-105"
              >
                Get Started Free
              </Link>

              <Link
                href="/login"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg transition-all duration-300 border border-white/20"
              >
                Sign In
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content Rows Section */}
      <section className="relative z-10 pb-20">
        <div className="container mx-auto px-4 space-y-12">
          {/* Trending Now */}
          <ContentRow title="Trending Now" />

          {/* New Releases */}
          <ContentRow title="New Releases" />

          {/* Popular Movies */}
          <ContentRow title="Popular Movies" />

          {/* Top Web Series */}
          <ContentRow title="Top Web Series" />

          {/* Anime Corner */}
          <ContentRow title="Anime Corner" />

          {/* Documentary Collection */}
          <ContentRow title="Documentary Collection" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-[#202020]">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-black text-white text-center mb-16">
            Why Choose MoviesNow?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="📺"
              title="HD Quality Streaming"
              description="Watch in 480p, 720p, or 1080p quality. Crystal clear video on any device."
            />
            <FeatureCard
              icon="⬇️"
              title="Offline Downloads"
              description="Download content to watch anywhere, anytime. No internet required."
            />
            <FeatureCard
              icon="🎬"
              title="Huge Library"
              description="Thousands of movies, series, anime, and documentaries to explore."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Ready to Start Watching?
          </h2>
          <p className="text-xl text-[#CCCCCC] mb-8 max-w-2xl mx-auto">
            Join millions of users streaming the best content. Free to start, upgrade anytime.
          </p>
          <Link
            href="/signup"
            className="inline-block px-10 py-5 bg-[#FF3D41] hover:bg-[#FF6366] text-white font-bold text-lg rounded-lg transition-all duration-300 shadow-lg shadow-[#FF3D41]/30 hover:shadow-xl hover:shadow-[#FF6366]/40 hover:scale-105"
          >
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  );
}

// Content Row Component (Placeholder for now)
function ContentRow({ title }: { title: string }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <ContentCard key={item} />
        ))}
      </div>
    </div>
  );
}

// Content Card Component (Placeholder)
function ContentCard() {
  return (
    <div className="group relative aspect-[2/3] rounded-lg overflow-hidden bg-[#202020] cursor-pointer transition-transform duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,61,65,0.3)]">
      {/* Placeholder for poster image */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900" />

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
        <div>
          <h3 className="text-white font-bold text-sm mb-1">Content Title</h3>
          <div className="flex items-center gap-2 text-xs text-[#CCCCCC]">
            <span>2024</span>
            <span>•</span>
            <span className="px-2 py-0.5 bg-[#FF3D41] text-white rounded">1080p</span>
          </div>
        </div>
      </div>

      {/* Play Button */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-12 h-12 rounded-full bg-[#FF3D41] flex items-center justify-center shadow-lg shadow-[#FF3D41]/50 hover:bg-[#FF6366] hover:scale-110 transition-all">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </div>
      </div>
    </div>
  );
}

// Feature Card Component
function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-[#CCCCCC]">{description}</p>
    </div>
  );
}
