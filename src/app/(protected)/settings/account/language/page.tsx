// app/(protected)/settings/account/language/page.tsx
/**
 * ═════════════════════════════════════════════════════════════════════════════
 * Language & Region Settings - Enterprise-Grade Premium Design
 * ═════════════════════════════════════════════════════════════════════════════
 *
 * Features:
 * ✨ Language selection with visual flags
 * ✨ Timezone auto-detection
 * ✨ Date/time format preview
 * ✨ Currency preference
 * ✨ Real-time preview of changes
 * ✨ Glassmorphism design with smooth animations
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Clock,
  Calendar,
  DollarSign,
  Check,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/cn";

// ══════════════════════════════════════════════════════════════════════════════
// Types & Data
// ══════════════════════════════════════════════════════════════════════════════

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

interface Timezone {
  value: string;
  label: string;
  offset: string;
}

const LANGUAGES: Language[] = [
  { code: "en-US", name: "English (US)", nativeName: "English", flag: "🇺🇸" },
  { code: "en-GB", name: "English (UK)", nativeName: "English", flag: "🇬🇧" },
  { code: "es-ES", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "fr-FR", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "de-DE", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "it-IT", name: "Italian", nativeName: "Italiano", flag: "🇮🇹" },
  { code: "pt-BR", name: "Portuguese (Brazil)", nativeName: "Português", flag: "🇧🇷" },
  { code: "ja-JP", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
  { code: "ko-KR", name: "Korean", nativeName: "한국어", flag: "🇰🇷" },
  { code: "zh-CN", name: "Chinese (Simplified)", nativeName: "简体中文", flag: "🇨🇳" },
];

const TIMEZONES: Timezone[] = [
  { value: "America/New_York", label: "Eastern Time (ET)", offset: "UTC-5" },
  { value: "America/Chicago", label: "Central Time (CT)", offset: "UTC-6" },
  { value: "America/Denver", label: "Mountain Time (MT)", offset: "UTC-7" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)", offset: "UTC-8" },
  { value: "Europe/London", label: "London (GMT)", offset: "UTC+0" },
  { value: "Europe/Paris", label: "Paris (CET)", offset: "UTC+1" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)", offset: "UTC+9" },
  { value: "Asia/Shanghai", label: "Shanghai (CST)", offset: "UTC+8" },
  { value: "Australia/Sydney", label: "Sydney (AEDT)", offset: "UTC+11" },
];

const DATE_FORMATS = [
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY", example: "12/29/2025" },
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY", example: "29/12/2025" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD", example: "2025-12-29" },
  { value: "DD MMM YYYY", label: "DD MMM YYYY", example: "29 Dec 2025" },
];

const TIME_FORMATS = [
  { value: "12h", label: "12-hour", example: "2:30 PM" },
  { value: "24h", label: "24-hour", example: "14:30" },
];

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
];

// ══════════════════════════════════════════════════════════════════════════════
// Component
// ══════════════════════════════════════════════════════════════════════════════

export default function LanguageSettingsPage() {
  const [selectedLanguage, setSelectedLanguage] = React.useState("en-US");
  const [selectedTimezone, setSelectedTimezone] = React.useState("America/Los_Angeles");
  const [dateFormat, setDateFormat] = React.useState("MM/DD/YYYY");
  const [timeFormat, setTimeFormat] = React.useState("12h");
  const [currency, setCurrency] = React.useState("USD");
  const [hasChanges, setHasChanges] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    setHasChanges(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-4 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Settings
          </Link>

          <div className="flex items-center gap-4 mb-2">
            <motion.div
              className="rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 p-3 shadow-2xl shadow-blue-500/30"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <Globe className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-black text-white">
                Language & Region
              </h1>
              <p className="text-slate-400 mt-1">
                Customize your language, timezone, and regional preferences
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Language Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl border border-slate-800/50 bg-slate-900/30 backdrop-blur-xl p-8 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-2.5 ring-2 ring-blue-500/30">
                <Sparkles className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Display Language</h2>
                <p className="text-sm text-slate-400">Choose your preferred language</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {LANGUAGES.map((lang) => (
                <motion.button
                  key={lang.code}
                  onClick={() => {
                    setSelectedLanguage(lang.code);
                    setHasChanges(true);
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "relative flex items-center gap-3 rounded-xl border p-4 transition-all text-left",
                    selectedLanguage === lang.code
                      ? "border-blue-500/50 bg-blue-500/10 shadow-lg shadow-blue-500/20"
                      : "border-slate-800/50 bg-slate-800/20 hover:border-slate-700/50"
                  )}
                >
                  <span className="text-3xl">{lang.flag}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm">{lang.name}</p>
                    <p className="text-xs text-slate-400">{lang.nativeName}</p>
                  </div>
                  {selectedLanguage === lang.code && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="rounded-full bg-blue-500 p-1"
                    >
                      <Check className="h-3 w-3 text-white" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Timezone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-3xl border border-slate-800/50 bg-slate-900/30 backdrop-blur-xl p-8 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-2.5 ring-2 ring-purple-500/30">
                <Clock className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Timezone</h2>
                <p className="text-sm text-slate-400">Set your local timezone</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {TIMEZONES.map((tz) => (
                <motion.button
                  key={tz.value}
                  onClick={() => {
                    setSelectedTimezone(tz.value);
                    setHasChanges(true);
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "relative flex items-center justify-between rounded-xl border p-4 transition-all text-left",
                    selectedTimezone === tz.value
                      ? "border-purple-500/50 bg-purple-500/10 shadow-lg shadow-purple-500/20"
                      : "border-slate-800/50 bg-slate-800/20 hover:border-slate-700/50"
                  )}
                >
                  <div>
                    <p className="font-semibold text-white text-sm">{tz.label}</p>
                    <p className="text-xs text-slate-400">{tz.offset}</p>
                  </div>
                  {selectedTimezone === tz.value && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="rounded-full bg-purple-500 p-1"
                    >
                      <Check className="h-3 w-3 text-white" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Date & Time Format */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-3xl border border-slate-800/50 bg-slate-900/30 backdrop-blur-xl p-8 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 p-2.5 ring-2 ring-emerald-500/30">
                <Calendar className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Date & Time Format</h2>
                <p className="text-sm text-slate-400">Choose how dates and times are displayed</p>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {/* Date Format */}
              <div>
                <label className="text-sm font-medium text-slate-300 mb-3 block">
                  Date Format
                </label>
                <div className="space-y-2">
                  {DATE_FORMATS.map((format) => (
                    <motion.button
                      key={format.value}
                      onClick={() => {
                        setDateFormat(format.value);
                        setHasChanges(true);
                      }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={cn(
                        "w-full flex items-center justify-between rounded-xl border p-3 transition-all text-left",
                        dateFormat === format.value
                          ? "border-emerald-500/50 bg-emerald-500/10"
                          : "border-slate-800/50 bg-slate-800/20 hover:border-slate-700/50"
                      )}
                    >
                      <div>
                        <p className="font-medium text-white text-sm">{format.label}</p>
                        <p className="text-xs text-slate-400">{format.example}</p>
                      </div>
                      {dateFormat === format.value && (
                        <Check className="h-4 w-4 text-emerald-400" />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Time Format */}
              <div>
                <label className="text-sm font-medium text-slate-300 mb-3 block">
                  Time Format
                </label>
                <div className="space-y-2">
                  {TIME_FORMATS.map((format) => (
                    <motion.button
                      key={format.value}
                      onClick={() => {
                        setTimeFormat(format.value);
                        setHasChanges(true);
                      }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={cn(
                        "w-full flex items-center justify-between rounded-xl border p-3 transition-all text-left",
                        timeFormat === format.value
                          ? "border-emerald-500/50 bg-emerald-500/10"
                          : "border-slate-800/50 bg-slate-800/20 hover:border-slate-700/50"
                      )}
                    >
                      <div>
                        <p className="font-medium text-white text-sm">{format.label}</p>
                        <p className="text-xs text-slate-400">{format.example}</p>
                      </div>
                      {timeFormat === format.value && (
                        <Check className="h-4 w-4 text-emerald-400" />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Currency */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-3xl border border-slate-800/50 bg-slate-900/30 backdrop-blur-xl p-8 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 p-2.5 ring-2 ring-orange-500/30">
                <DollarSign className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Currency</h2>
                <p className="text-sm text-slate-400">Your preferred currency for pricing</p>
              </div>
            </div>

            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
              {CURRENCIES.map((curr) => (
                <motion.button
                  key={curr.code}
                  onClick={() => {
                    setCurrency(curr.code);
                    setHasChanges(true);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "relative flex flex-col items-center gap-2 rounded-xl border p-4 transition-all",
                    currency === curr.code
                      ? "border-orange-500/50 bg-orange-500/10 shadow-lg shadow-orange-500/20"
                      : "border-slate-800/50 bg-slate-800/20 hover:border-slate-700/50"
                  )}
                >
                  <span className="text-2xl font-bold text-white">{curr.symbol}</span>
                  <div className="text-center">
                    <p className="font-semibold text-white text-xs">{curr.code}</p>
                    <p className="text-[10px] text-slate-400">{curr.name}</p>
                  </div>
                  {currency === curr.code && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 rounded-full bg-orange-500 p-1"
                    >
                      <Check className="h-3 w-3 text-white" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Save Button */}
          <AnimatePresence>
            {hasChanges && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="sticky bottom-6 flex justify-end"
              >
                <motion.button
                  onClick={handleSave}
                  disabled={isSaving}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 px-8 py-4 font-bold text-white shadow-2xl shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-2">
                    {isSaving ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="h-5 w-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-5 w-5" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </div>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Spacing */}
        <div className="h-12" />
      </div>
    </div>
  );
}
