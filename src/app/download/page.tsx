"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Check, Loader2, AlertCircle, Crown, Sparkles, ArrowRight, Shield, Zap, Star } from "lucide-react";
import Image from "next/image";
import { requestDownload, getDownloadUrl, type DownloadLink } from "@/lib/api/downloads";
import { api } from "@/lib/api/services";

// ============================================================================
// ULTRA-MODERN DOWNLOAD PAGE WITH PREMIUM UX
// ============================================================================

export default function DownloadsPage() {
  const [downloads, setDownloads] = React.useState<DownloadLink[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [isPremium, setIsPremium] = React.useState(false);

  // Fetch user subscription status
  React.useEffect(() => {
    const checkSubscription = async () => {
      try {
        const subscription = await api.user.getSubscription();
        const hasPremium = subscription?.status === 'active' &&
                          (subscription?.plan_name === 'premium' || subscription?.plan_name === 'premium_yearly');
        setIsPremium(hasPremium);
      } catch (error) {
        console.error('Failed to check subscription:', error);
        setIsPremium(false); // Default to free on error
      }
    };
    checkSubscription();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Animated Background Gradient */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 md:py-20">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-red-600/20 to-purple-600/20 border border-red-500/30 mb-6">
            <Download className="w-5 h-5 text-red-500" />
            <span className="text-white font-semibold text-sm uppercase tracking-wider">Download Center</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-100 to-gray-300">
            Download Movies & Shows
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            Watch your favorite content offline, anytime, anywhere
          </p>
        </motion.div>

        {/* Premium vs Free Comparison */}
        <div className="grid md:grid-cols-2 gap-6 mb-12 max-w-5xl mx-auto">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="relative p-8 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 backdrop-blur-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gray-700 flex items-center justify-center">
                <Download className="w-6 h-6 text-gray-300" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Free Plan</h3>
                <p className="text-sm text-gray-400">Ad-supported downloads</p>
              </div>
            </div>

            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">All quality options</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">480p, 720p, 1080p</span>
              </li>
              <li className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">Ad redirect (30-60s wait)</span>
              </li>
              <li className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">View ads before download</span>
              </li>
            </ul>

            <div className="text-center">
              <p className="text-2xl font-bold text-white mb-1">$0</p>
              <p className="text-sm text-gray-400">Forever free</p>
            </div>
          </motion.div>

          {/* Premium Plan */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="relative p-8 rounded-2xl bg-gradient-to-br from-red-600/20 to-purple-600/20 border-2 border-red-500/50 backdrop-blur-sm overflow-hidden"
          >
            {/* Premium Badge */}
            <div className="absolute top-4 right-4">
              <div className="px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-white" />
                <span className="text-xs font-bold text-white uppercase">Premium</span>
              </div>
            </div>

            {/* Sparkle Effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-yellow-500/20 to-transparent rounded-full blur-2xl" />

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-purple-600 flex items-center justify-center shadow-lg shadow-red-500/50">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Premium Plan</h3>
                <p className="text-sm text-gray-300">Instant downloads</p>
              </div>
            </div>

            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <span className="text-white font-medium">One-click instant downloads</span>
              </li>
              <li className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-white font-medium">No ads, no waiting</span>
              </li>
              <li className="flex items-start gap-3">
                <Star className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <span className="text-white font-medium">All formats & qualities</span>
              </li>
              <li className="flex items-start gap-3">
                <Download className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <span className="text-white font-medium">Unlimited downloads</span>
              </li>
            </ul>

            <div className="text-center mb-4">
              <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-1">
                $9.99
              </p>
              <p className="text-sm text-gray-300">per month</p>
            </div>

            <a href="/subscribe">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-6 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white font-bold text-lg shadow-xl shadow-red-500/50 transition-all flex items-center justify-center gap-2"
              >
                <span>Upgrade to Premium</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </a>
          </motion.div>
        </div>

        {/* Download Demo Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-4xl mx-auto"
        >
          <div className="p-8 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Download className="w-7 h-7 text-red-500" />
              How It Works
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  step: "1",
                  title: "Select Quality",
                  description: "Choose your preferred video quality: 480p, 720p, or 1080p",
                  icon: "🎬",
                },
                {
                  step: "2",
                  title: isPremium ? "Instant Download" : "View Short Ad",
                  description: isPremium
                    ? "Premium users get direct download links instantly"
                    : "Free users watch a short ad (30-60 seconds)",
                  icon: isPremium ? "⚡" : "📺",
                },
                {
                  step: "3",
                  title: "Enjoy Offline",
                  description: "Watch your downloaded content anytime, anywhere, no internet needed",
                  icon: "🎉",
                },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-600/20 to-purple-600/20 border border-red-500/30 flex items-center justify-center mx-auto mb-4 text-3xl">
                    {item.icon}
                  </div>
                  <div className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2">
                    Step {item.step}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-400">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        {!isPremium && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 max-w-4xl mx-auto p-8 rounded-2xl bg-gradient-to-r from-red-600/10 to-purple-600/10 border border-red-500/20 backdrop-blur-sm text-center"
          >
            <Crown className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Ready for Ad-Free Downloads?
            </h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Join Premium and enjoy instant, unlimited downloads without any ads or waiting time.
            </p>
            <a href="/subscribe">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white font-bold text-lg shadow-2xl shadow-red-500/50 transition-all inline-flex items-center gap-3"
              >
                <Sparkles className="w-6 h-6" />
                <span>Start Your Premium Journey</span>
                <ArrowRight className="w-6 h-6" />
              </motion.button>
            </a>
          </motion.div>
        )}
      </div>
    </div>
  );
}
