// components/SettingsPage.tsx
/**
 * =============================================================================
 * Settings Page Component
 * =============================================================================
 * Best Practices:
 * - Organized settings sections
 * - Real-time save feedback
 * - Toggle switches
 * - Clear descriptions
 * - Responsive layout
 */

"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/services";
import { cn } from "@/lib/cn";
import {
  User,
  Play,
  Bell,
  Shield,
  Globe,
  Monitor,
  Smartphone,
  ChevronRight,
  Check,
  CreditCard,
  Download,
  Lock,
  Eye,
  Volume2,
  Subtitles,
} from "lucide-react";

interface UserSettings {
  playback: {
    autoplay_next: boolean;
    autoplay_previews: boolean;
    default_quality: "auto" | "low" | "medium" | "high" | "4k";
    default_audio_language: string;
    default_subtitle_language: string;
    subtitles_enabled: boolean;
  };
  notifications: {
    email_new_releases: boolean;
    email_recommendations: boolean;
    email_newsletter: boolean;
    push_enabled: boolean;
    push_new_releases: boolean;
    push_watchlist: boolean;
  };
  privacy: {
    share_viewing_history: boolean;
    personalized_ads: boolean;
    data_collection: boolean;
  };
  display: {
    language: string;
    maturity_level: "all" | "teens" | "adults";
  };
}

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "ja", name: "日本語" },
  { code: "ko", name: "한국어" },
  { code: "hi", name: "हिन्दी" },
];

const QUALITY_OPTIONS = [
  { value: "auto", label: "Auto (Recommended)", description: "Adjusts based on your connection" },
  { value: "low", label: "Low", description: "480p - Uses less data" },
  { value: "medium", label: "Medium", description: "720p - Standard quality" },
  { value: "high", label: "High", description: "1080p - Best picture" },
  { value: "4k", label: "4K Ultra HD", description: "Premium plan required" },
];

export function SettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch user settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["user-settings"],
    queryFn: async () => {
      const response = await fetch("/api/v1/users/settings", { credentials: "include" });
      if (!response.ok) {
        // Return defaults
        return {
          playback: {
            autoplay_next: true,
            autoplay_previews: true,
            default_quality: "auto",
            default_audio_language: "en",
            default_subtitle_language: "en",
            subtitles_enabled: false,
          },
          notifications: {
            email_new_releases: true,
            email_recommendations: true,
            email_newsletter: false,
            push_enabled: true,
            push_new_releases: true,
            push_watchlist: true,
          },
          privacy: {
            share_viewing_history: true,
            personalized_ads: true,
            data_collection: true,
          },
          display: {
            language: "en",
            maturity_level: "all",
          },
        } as UserSettings;
      }
      return response.json();
    },
  });

  // Update settings mutation
  const updateMutation = useMutation({
    mutationFn: async (newSettings: Partial<UserSettings>) => {
      const response = await fetch("/api/v1/users/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newSettings),
      });
      if (!response.ok) throw new Error("Failed to update settings");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-settings"] });
    },
  });

  const updateSetting = (path: string, value: any) => {
    const [section, key] = path.split(".");
    updateMutation.mutate({
      [section]: { ...settings?.[section as keyof UserSettings], [key]: value },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black py-8">
        <div className="mx-auto max-w-4xl px-4">
          <div className="h-96 animate-pulse rounded-lg bg-gray-900" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold text-white">Settings</h1>

        {/* Quick Links */}
        <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickLinkCard
            icon={<User className="h-5 w-5" />}
            label="Account"
            href="/settings/account"
          />
          <QuickLinkCard
            icon={<CreditCard className="h-5 w-5" />}
            label="Billing"
            href="/billing"
          />
          <QuickLinkCard
            icon={<Shield className="h-5 w-5" />}
            label="Security"
            href="/settings/security"
          />
          <QuickLinkCard
            icon={<Monitor className="h-5 w-5" />}
            label="Devices"
            href="/settings/devices"
          />
        </div>

        {/* Playback Settings */}
        <SettingsSection
          icon={<Play className="h-5 w-5" />}
          title="Playback"
          description="Control how content plays"
        >
          <SettingToggle
            label="Autoplay next episode"
            description="Automatically play the next episode in a series"
            checked={settings?.playback.autoplay_next ?? true}
            onChange={(v) => updateSetting("playback.autoplay_next", v)}
          />
          <SettingToggle
            label="Autoplay previews"
            description="Play previews while browsing"
            checked={settings?.playback.autoplay_previews ?? true}
            onChange={(v) => updateSetting("playback.autoplay_previews", v)}
          />

          <div className="border-t border-gray-800 pt-4">
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Video Quality
            </label>
            <select
              value={settings?.playback.default_quality ?? "auto"}
              onChange={(e) => updateSetting("playback.default_quality", e.target.value)}
              className="w-full rounded-lg bg-gray-800 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              {QUALITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <SettingToggle
            label="Enable subtitles by default"
            description="Show subtitles when available"
            checked={settings?.playback.subtitles_enabled ?? false}
            onChange={(v) => updateSetting("playback.subtitles_enabled", v)}
          />

          <div className="grid gap-4 border-t border-gray-800 pt-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Audio Language
              </label>
              <select
                value={settings?.playback.default_audio_language ?? "en"}
                onChange={(e) =>
                  updateSetting("playback.default_audio_language", e.target.value)
                }
                className="w-full rounded-lg bg-gray-800 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Subtitle Language
              </label>
              <select
                value={settings?.playback.default_subtitle_language ?? "en"}
                onChange={(e) =>
                  updateSetting("playback.default_subtitle_language", e.target.value)
                }
                className="w-full rounded-lg bg-gray-800 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </SettingsSection>

        {/* Notification Settings */}
        <SettingsSection
          icon={<Bell className="h-5 w-5" />}
          title="Notifications"
          description="Manage your notification preferences"
        >
          <div className="mb-4">
            <h4 className="mb-2 font-medium text-gray-300">Email</h4>
            <div className="space-y-3">
              <SettingToggle
                label="New releases"
                description="Get notified about new content"
                checked={settings?.notifications.email_new_releases ?? true}
                onChange={(v) => updateSetting("notifications.email_new_releases", v)}
              />
              <SettingToggle
                label="Recommendations"
                description="Personalized content suggestions"
                checked={settings?.notifications.email_recommendations ?? true}
                onChange={(v) => updateSetting("notifications.email_recommendations", v)}
              />
              <SettingToggle
                label="Newsletter"
                description="Weekly updates and news"
                checked={settings?.notifications.email_newsletter ?? false}
                onChange={(v) => updateSetting("notifications.email_newsletter", v)}
              />
            </div>
          </div>

          <div className="border-t border-gray-800 pt-4">
            <h4 className="mb-2 font-medium text-gray-300">Push Notifications</h4>
            <div className="space-y-3">
              <SettingToggle
                label="Enable push notifications"
                description="Receive notifications on this device"
                checked={settings?.notifications.push_enabled ?? true}
                onChange={(v) => updateSetting("notifications.push_enabled", v)}
              />
              {settings?.notifications.push_enabled && (
                <>
                  <SettingToggle
                    label="New releases"
                    checked={settings?.notifications.push_new_releases ?? true}
                    onChange={(v) => updateSetting("notifications.push_new_releases", v)}
                  />
                  <SettingToggle
                    label="Watchlist updates"
                    checked={settings?.notifications.push_watchlist ?? true}
                    onChange={(v) => updateSetting("notifications.push_watchlist", v)}
                  />
                </>
              )}
            </div>
          </div>
        </SettingsSection>

        {/* Privacy Settings */}
        <SettingsSection
          icon={<Lock className="h-5 w-5" />}
          title="Privacy"
          description="Control your data and privacy"
        >
          <SettingToggle
            label="Share viewing history"
            description="Allow friends to see what you're watching"
            checked={settings?.privacy.share_viewing_history ?? true}
            onChange={(v) => updateSetting("privacy.share_viewing_history", v)}
          />
          <SettingToggle
            label="Personalized advertising"
            description="Receive ads based on your interests"
            checked={settings?.privacy.personalized_ads ?? true}
            onChange={(v) => updateSetting("privacy.personalized_ads", v)}
          />
          <SettingToggle
            label="Usage data collection"
            description="Help us improve by sharing usage data"
            checked={settings?.privacy.data_collection ?? true}
            onChange={(v) => updateSetting("privacy.data_collection", v)}
          />

          <div className="mt-4 border-t border-gray-800 pt-4">
            <button
              onClick={() => router.push("/settings/privacy/data-export")}
              className="text-blue-400 hover:text-blue-300"
            >
              Request data export
            </button>
          </div>
        </SettingsSection>

        {/* Display Settings */}
        <SettingsSection
          icon={<Globe className="h-5 w-5" />}
          title="Language & Region"
          description="Display preferences"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Display Language
              </label>
              <select
                value={settings?.display.language ?? "en"}
                onChange={(e) => updateSetting("display.language", e.target.value)}
                className="w-full rounded-lg bg-gray-800 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Maturity Rating
              </label>
              <select
                value={settings?.display.maturity_level ?? "all"}
                onChange={(e) => updateSetting("display.maturity_level", e.target.value)}
                className="w-full rounded-lg bg-gray-800 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="all">All Ages</option>
                <option value="teens">Teen and below</option>
                <option value="adults">Adults Only</option>
              </select>
            </div>
          </div>
        </SettingsSection>

        {/* Downloads */}
        <SettingsSection
          icon={<Download className="h-5 w-5" />}
          title="Downloads"
          description="Manage offline content"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Download Quality</p>
              <p className="text-sm text-gray-400">Standard - Uses less storage</p>
            </div>
            <button
              onClick={() => router.push("/settings/downloads")}
              className="rounded-lg bg-gray-800 px-4 py-2 text-white hover:bg-gray-700"
            >
              Change
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-gray-800 pt-4">
            <div>
              <p className="font-medium text-white">Storage Used</p>
              <p className="text-sm text-gray-400">2.3 GB of 10 GB</p>
            </div>
            <button
              onClick={() => router.push("/settings/devices")}
              className="text-blue-400 hover:text-blue-300"
            >
              Manage
            </button>
          </div>
        </SettingsSection>
      </div>
    </div>
  );
}

function QuickLinkCard({
  icon,
  label,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
}) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(href)}
      className="flex items-center gap-3 rounded-lg bg-gray-900 p-4 text-left transition-colors hover:bg-gray-800"
    >
      <div className="rounded-full bg-gray-800 p-2 text-gray-400">{icon}</div>
      <span className="font-medium text-white">{label}</span>
      <ChevronRight className="ml-auto h-5 w-5 text-gray-600" />
    </button>
  );
}

function SettingsSection({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8 rounded-lg bg-gray-900 p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-full bg-gray-800 p-2 text-gray-400">{icon}</div>
        <div>
          <h2 className="font-semibold text-white">{title}</h2>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function SettingToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium text-white">{label}</p>
        {description && <p className="text-sm text-gray-400">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 rounded-full transition-colors",
          checked ? "bg-blue-600" : "bg-gray-700"
        )}
      >
        <span
          className={cn(
            "absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform",
            checked && "translate-x-5"
          )}
        />
      </button>
    </div>
  );
}
