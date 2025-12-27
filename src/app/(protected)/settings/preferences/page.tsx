"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Settings,
  Play,
  Monitor,
  Download,
  Globe,
  Eye,
  Save,
  RotateCcw,
  CheckCircle,
  Film,
  Volume2,
  Subtitles,
  Gauge,
  Moon,
  Sun,
  Languages,
  Filter,
  Bell,
  Lock,
  Accessibility,
  Zap,
  Wifi,
  HardDrive,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api/services";

interface UserPreferences {
  // Playback
  default_quality: "480p" | "720p" | "1080p" | "4k" | "auto";
  auto_play_next_episode: boolean;
  skip_intro: boolean;
  skip_recap: boolean;
  skip_credits: boolean;
  playback_speed: number;
  subtitle_language: string | null;
  audio_language: string | null;

  // Display
  theme: "dark" | "light" | "auto";
  language: string;
  timezone: string;
  date_format: string;

  // Content
  mature_content: boolean;
  content_filters: string[];
  preferred_genres: string[];

  // Notifications
  email_notifications: boolean;
  push_notifications: boolean;
  new_episode_alerts: boolean;
  recommendation_alerts: boolean;
  newsletter_subscription: boolean;

  // Privacy
  watch_history_enabled: boolean;
  share_watch_activity: boolean;
  personalized_recommendations: boolean;

  // Downloads
  default_download_quality: "480p" | "720p" | "1080p";
  default_download_format: "mp4" | "mkv" | "avi";
  wifi_only_downloads: boolean;
  auto_delete_watched: boolean;

  // Accessibility
  high_contrast: boolean;
  reduce_motion: boolean;
  closed_captions_default: boolean;
  audio_descriptions: boolean;
}

const QUALITY_OPTIONS = [
  { value: "auto", label: "Auto (Recommended)", icon: Zap },
  { value: "480p", label: "480p - Data Saver", icon: Wifi },
  { value: "720p", label: "720p - Standard HD", icon: Monitor },
  { value: "1080p", label: "1080p - Full HD", icon: Film },
  { value: "4k", label: "4K - Ultra HD", icon: Sparkles },
];

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

const THEMES = [
  { value: "dark", label: "Dark", icon: Moon },
  { value: "light", label: "Light", icon: Sun },
  { value: "auto", label: "Auto", icon: Settings },
];

const LANGUAGES = [
  { code: "en", name: "English", native: "English" },
  { code: "es", name: "Spanish", native: "Español" },
  { code: "fr", name: "French", native: "Français" },
  { code: "de", name: "German", native: "Deutsch" },
  { code: "ja", name: "Japanese", native: "日本語" },
  { code: "ko", name: "Korean", native: "한국어" },
  { code: "zh", name: "Chinese", native: "中文" },
  { code: "hi", name: "Hindi", native: "हिन्दी" },
];

const DOWNLOAD_FORMATS = [
  { value: "mp4", label: "MP4 (Most Compatible)" },
  { value: "mkv", label: "MKV (High Quality)" },
  { value: "avi", label: "AVI (Legacy)" },
];

export default function PreferencesPage() {
  const queryClient = useQueryClient();
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch preferences
  const { data: preferences, isLoading } = useQuery({
    queryKey: ["user", "preferences"],
    queryFn: () => api.preferences.getPreferences(),
  });

  // Local state for form
  const [formData, setFormData] = useState<UserPreferences | null>(null);

  // Initialize form data when preferences load
  useState(() => {
    if (preferences && !formData) {
      setFormData(preferences);
    }
  });

  // Update preferences mutation
  const updateMutation = useMutation({
    mutationFn: (data: Partial<UserPreferences>) =>
      api.preferences.updatePreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "preferences"] });
      setHasChanges(false);
    },
  });

  // Reset preferences mutation
  const resetMutation = useMutation({
    mutationFn: () => api.preferences.resetPreferences(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user", "preferences"] });
      setFormData(data);
      setHasChanges(false);
    },
  });

  const handleChange = (field: keyof UserPreferences, value: any) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : null));
    setHasChanges(true);
  };

  const handleSave = () => {
    if (formData) {
      updateMutation.mutate(formData);
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all preferences to default?")) {
      resetMutation.mutate();
    }
  };

  if (isLoading || !formData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="h-8 w-64 bg-slate-800 animate-pulse rounded" />
          <div className="h-96 bg-slate-800 animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Settings className="w-8 h-8 text-purple-500" />
              Preferences
            </h1>
            <p className="text-slate-400">
              Customize your viewing experience and app settings
            </p>
          </div>

          <div className="flex gap-3">
            {hasChanges && (
              <motion.button
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={handleReset}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset All
              </motion.button>
            )}
            <button
              onClick={handleSave}
              disabled={!hasChanges || updateMutation.isPending}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
            >
              {updateMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : hasChanges ? (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Saved
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Playback Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Play className="w-6 h-6 text-purple-400" />
            Playback Settings
          </h2>

          <div className="space-y-6">
            {/* Default Quality */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Default Video Quality
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {QUALITY_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleChange("default_quality", option.value)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.default_quality === option.value
                          ? "border-purple-500 bg-purple-500/20"
                          : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                      }`}
                    >
                      <Icon
                        className={`w-6 h-6 mx-auto mb-2 ${
                          formData.default_quality === option.value
                            ? "text-purple-400"
                            : "text-slate-400"
                        }`}
                      />
                      <div className="text-sm font-medium text-white">{option.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Playback Speed */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Default Playback Speed
              </label>
              <div className="flex gap-2">
                {PLAYBACK_SPEEDS.map((speed) => (
                  <button
                    key={speed}
                    onClick={() => handleChange("playback_speed", speed)}
                    className={`flex-1 px-4 py-2 rounded-lg border transition-all ${
                      formData.playback_speed === speed
                        ? "border-purple-500 bg-purple-500/20 text-purple-400"
                        : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>

            {/* Toggle Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: "auto_play_next_episode", label: "Auto-play Next Episode", icon: Play },
                { key: "skip_intro", label: "Skip Intro", icon: Zap },
                { key: "skip_recap", label: "Skip Recap", icon: Zap },
                { key: "skip_credits", label: "Skip Credits", icon: Zap },
              ].map((option) => {
                const Icon = option.icon;
                return (
                  <label
                    key={option.key}
                    className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors"
                  >
                    <span className="flex items-center gap-3 text-white">
                      <Icon className="w-5 h-5 text-purple-400" />
                      {option.label}
                    </span>
                    <input
                      type="checkbox"
                      checked={formData[option.key as keyof UserPreferences] as boolean}
                      onChange={(e) => handleChange(option.key as keyof UserPreferences, e.target.checked)}
                      className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-purple-600 focus:ring-purple-500"
                    />
                  </label>
                );
              })}
            </div>

            {/* Language Preferences */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Subtitle Language
                </label>
                <select
                  value={formData.subtitle_language || ""}
                  onChange={(e) => handleChange("subtitle_language", e.target.value || null)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">None</option>
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name} ({lang.native})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Audio Language
                </label>
                <select
                  value={formData.audio_language || ""}
                  onChange={(e) => handleChange("audio_language", e.target.value || null)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Default</option>
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name} ({lang.native})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Display Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Monitor className="w-6 h-6 text-blue-400" />
            Display & Interface
          </h2>

          <div className="space-y-6">
            {/* Theme */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">Theme</label>
              <div className="grid grid-cols-3 gap-3">
                {THEMES.map((theme) => {
                  const Icon = theme.icon;
                  return (
                    <button
                      key={theme.value}
                      onClick={() => handleChange("theme", theme.value)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.theme === theme.value
                          ? "border-blue-500 bg-blue-500/20"
                          : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                      }`}
                    >
                      <Icon
                        className={`w-6 h-6 mx-auto mb-2 ${
                          formData.theme === theme.value ? "text-blue-400" : "text-slate-400"
                        }`}
                      />
                      <div className="text-sm font-medium text-white">{theme.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Language & Timezone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Interface Language
                </label>
                <select
                  value={formData.language}
                  onChange={(e) => handleChange("language", e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name} ({lang.native})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Timezone
                </label>
                <input
                  type="text"
                  value={formData.timezone}
                  onChange={(e) => handleChange("timezone", e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="America/New_York"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Download Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Download className="w-6 h-6 text-green-400" />
            Download Settings
          </h2>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Default Download Quality
                </label>
                <select
                  value={formData.default_download_quality}
                  onChange={(e) => handleChange("default_download_quality", e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="480p">480p - Data Saver</option>
                  <option value="720p">720p - Standard HD</option>
                  <option value="1080p">1080p - Full HD</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Default Format
                </label>
                <select
                  value={formData.default_download_format}
                  onChange={(e) => handleChange("default_download_format", e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {DOWNLOAD_FORMATS.map((format) => (
                    <option key={format.value} value={format.value}>
                      {format.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors">
                <span className="flex items-center gap-3 text-white">
                  <Wifi className="w-5 h-5 text-green-400" />
                  WiFi Only Downloads
                </span>
                <input
                  type="checkbox"
                  checked={formData.wifi_only_downloads}
                  onChange={(e) => handleChange("wifi_only_downloads", e.target.checked)}
                  className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-green-600 focus:ring-green-500"
                />
              </label>
              <label className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors">
                <span className="flex items-center gap-3 text-white">
                  <HardDrive className="w-5 h-5 text-green-400" />
                  Auto-delete Watched
                </span>
                <input
                  type="checkbox"
                  checked={formData.auto_delete_watched}
                  onChange={(e) => handleChange("auto_delete_watched", e.target.checked)}
                  className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-green-600 focus:ring-green-500"
                />
              </label>
            </div>
          </div>
        </motion.div>

        {/* Privacy Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Lock className="w-6 h-6 text-amber-400" />
            Privacy & Data
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: "watch_history_enabled", label: "Enable Watch History", icon: Eye },
              { key: "share_watch_activity", label: "Share Watch Activity", icon: Globe },
              { key: "personalized_recommendations", label: "Personalized Recommendations", icon: Sparkles },
            ].map((option) => {
              const Icon = option.icon;
              return (
                <label
                  key={option.key}
                  className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors"
                >
                  <span className="flex items-center gap-3 text-white">
                    <Icon className="w-5 h-5 text-amber-400" />
                    {option.label}
                  </span>
                  <input
                    type="checkbox"
                    checked={formData[option.key as keyof UserPreferences] as boolean}
                    onChange={(e) => handleChange(option.key as keyof UserPreferences, e.target.checked)}
                    className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-amber-600 focus:ring-amber-500"
                  />
                </label>
              );
            })}
          </div>
        </motion.div>

        {/* Accessibility */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Accessibility className="w-6 h-6 text-cyan-400" />
            Accessibility
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: "high_contrast", label: "High Contrast Mode", icon: Eye },
              { key: "reduce_motion", label: "Reduce Motion", icon: Gauge },
              { key: "closed_captions_default", label: "Closed Captions by Default", icon: Subtitles },
              { key: "audio_descriptions", label: "Audio Descriptions", icon: Volume2 },
            ].map((option) => {
              const Icon = option.icon;
              return (
                <label
                  key={option.key}
                  className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors"
                >
                  <span className="flex items-center gap-3 text-white">
                    <Icon className="w-5 h-5 text-cyan-400" />
                    {option.label}
                  </span>
                  <input
                    type="checkbox"
                    checked={formData[option.key as keyof UserPreferences] as boolean}
                    onChange={(e) => handleChange(option.key as keyof UserPreferences, e.target.checked)}
                    className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-cyan-600 focus:ring-cyan-500"
                  />
                </label>
              );
            })}
          </div>
        </motion.div>

        {/* Success Message */}
        {updateMutation.isSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-900/20 border border-green-700/50 rounded-xl p-4 flex items-center gap-3"
          >
            <CheckCircle className="w-6 h-6 text-green-400" />
            <div>
              <div className="text-white font-semibold">Preferences Updated</div>
              <div className="text-sm text-green-400">
                Your changes have been saved successfully
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
