"use client";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MOVIESNOW - AnimeSuge-Style Homepage
 * ═══════════════════════════════════════════════════════════════════════════
 * Exact replica of AnimeSuge homepage design
 */

import * as React from "react";
import Link from "next/link";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

// Social share buttons icons (using simple colored divs for demonstration)
const SHARE_BUTTONS = [
  { name: "Facebook", color: "#3b5998", count: "10.7k" },
  { name: "Tweet", color: "#000000", icon: "𝕏" },
  { name: "Messenger", color: "#0084ff" },
  { name: "Reddit", color: "#ff4500" },
  { name: "WhatsApp", color: "#25d366" },
  { name: "Telegram", color: "#0088cc" },
  { name: "ShareThis", color: "#95bf47" },
];

// Tabs for Recently Updated section
const TABS = ["All", "Sub", "Dub", "Trending", "Random"];

// Sample content data (will be replaced with real data)
const SAMPLE_CONTENT = Array(12)
  .fill(null)
  .map((_, i) => ({
    id: `content-${i}`,
    title: `Anime Title ${i + 1}`,
    poster: `https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=600&fit=crop&q=80&v=${i}`,
    badge: i % 2 === 0 ? "ONA" : "TV",
    episode: `Episode ${Math.floor(Math.random() * 24) + 1}`,
  }));

export function AnimeSugeHome() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeTab, setActiveTab] = React.useState("All");
  const [scheduleOpen, setScheduleOpen] = React.useState(false);

  return (
    <main className="min-h-screen bg-[#1a1a1a]">
      {/* Schedule Sidebar */}
      <button
        onClick={() => setScheduleOpen(!scheduleOpen)}
        className="fixed left-0 top-1/2 -translate-y-1/2 z-40 bg-red-600 hover:bg-red-700 transition-colors px-3 py-8 text-white font-black text-xs tracking-wider writing-vertical-rl"
        style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
      >
        SCHEDULE
      </button>

      {/* Hero Section with Search */}
      <section className="relative pt-14">
        {/* Blurred Background */}
        <div className="relative h-[400px] md:h-[500px] overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1920&h=1080&fit=crop&q=80"
              alt="Hero Background"
              className="w-full h-full object-cover blur-md scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a]/60 via-[#1a1a1a]/80 to-[#1a1a1a]" />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
            {/* Search Bar */}
            <div className="w-full max-w-3xl mb-8">
              <div className="flex items-center bg-white rounded-lg overflow-hidden shadow-2xl">
                <div className="flex items-center px-4 py-4 flex-1">
                  <Search className="w-5 h-5 text-gray-400 mr-3" strokeWidth={2} />
                  <input
                    type="text"
                    placeholder="Search anime.."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent text-gray-800 text-base placeholder-gray-400 outline-none font-normal"
                  />
                </div>
                <button className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-colors">
                  Filter
                </button>
              </div>
            </div>

            {/* Social Sharing Message */}
            <p className="text-gray-400 text-sm mb-4">
              If you enjoy the website, please consider sharing it with your friends. Thank you!
            </p>

            {/* Share Counter & Buttons */}
            <div className="flex items-center gap-2 mb-4">
              <div className="text-center mr-2">
                <div className="text-gray-400 text-2xl font-bold">10.7k</div>
                <div className="text-gray-500 text-xs">Shares</div>
              </div>

              {/* Share Buttons */}
              <button className="flex items-center gap-2 px-4 py-2 bg-[#3b5998] hover:bg-[#2d4373] text-white text-sm font-semibold rounded transition-colors">
                <span>Share</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-900 text-white text-sm font-semibold rounded transition-colors">
                <span className="text-base">𝕏</span>
                <span>Tweet</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#0084ff] hover:bg-[#0073e6] text-white text-sm font-semibold rounded transition-colors">
                <span>Share</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#ff4500] hover:bg-[#e63e00] text-white text-sm font-semibold rounded transition-colors">
                <span>Share</span>
              </button>
              <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#25d366] hover:bg-[#1faa52] text-white text-sm font-semibold rounded transition-colors">
                <span>Share</span>
              </button>
              <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#0088cc] hover:bg-[#0077b3] text-white text-sm font-semibold rounded transition-colors">
                <span>Share</span>
              </button>
              <button className="hidden lg:flex items-center gap-2 px-4 py-2 bg-[#95bf47] hover:bg-[#7fa838] text-white text-sm font-semibold rounded transition-colors">
                <span>Share</span>
              </button>
            </div>

            {/* Bookmark Notice */}
            <div className="w-full max-w-3xl mt-4">
              <div className="bg-[#2a2a2a] border border-gray-700 rounded px-4 py-3 text-sm text-gray-400">
                <span className="mr-2">ⓘ</span>
                Please bookmark{" "}
                <span className="text-white font-semibold">animesuge.bid</span>{" "}
                to stay updated about our domains. Thank you!
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recently Updated Section */}
      <section className="max-w-[1920px] mx-auto px-4 md:px-6 lg:px-8 py-12">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-white text-xl md:text-2xl font-black tracking-tight">
              RECENTLY UPDATED
            </h2>

            {/* Tabs */}
            <div className="hidden md:flex items-center gap-2">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 text-sm font-semibold rounded transition-colors ${
                    activeTab === tab
                      ? "bg-red-600 text-white"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-2">
            <button className="p-2 bg-[#2a2a2a] hover:bg-[#333333] text-white rounded transition-colors">
              <ChevronLeft className="w-5 h-5" strokeWidth={2} />
            </button>
            <button className="p-2 bg-[#2a2a2a] hover:bg-[#333333] text-white rounded transition-colors">
              <ChevronRight className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Mobile Tabs */}
        <div className="flex md:hidden items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 text-sm font-semibold rounded transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? "bg-red-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {SAMPLE_CONTENT.map((item) => (
            <ContentCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </main>
  );
}

// Content Card Component
function ContentCard({ item }: { item: any }) {
  const [imgLoaded, setImgLoaded] = React.useState(false);

  return (
    <Link href={`/watch/${item.id}`} className="group">
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-[#2a2a2a]">
        {/* Image */}
        {!imgLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse" />
        )}
        <img
          src={item.poster}
          alt={item.title}
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-300 ${
            imgLoaded ? "opacity-100" : "opacity-0"
          } group-hover:scale-110`}
        />

        {/* Badge */}
        <div className="absolute top-2 left-2">
          <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded">
            {item.badge}
          </span>
        </div>

        {/* Episode Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-3">
          <h3 className="text-white text-sm font-semibold line-clamp-2 mb-1">
            {item.title}
          </h3>
          <p className="text-gray-400 text-xs">{item.episode}</p>
        </div>
      </div>
    </Link>
  );
}
