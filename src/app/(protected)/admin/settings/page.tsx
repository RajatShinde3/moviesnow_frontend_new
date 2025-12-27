// app/(protected)/admin/settings/page.tsx
/**
 * =============================================================================
 * Admin - System Settings & Configuration
 * =============================================================================
 * Platform configuration, security, integrations, and system preferences
 */

"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Settings,
  Shield,
  Globe,
  Mail,
  Cloud,
  Key,
  Database,
  Zap,
  Bell,
  Palette,
  Users,
  Lock,
  Server,
  Code,
  Video,
  Image as ImageIcon,
  FileText,
  DollarSign,
  Smartphone,
  Monitor,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Info,
  Eye,
  EyeOff,
  ExternalLink,
  Upload,
  Download,
  Trash2,
  Plus,
  Edit,
  X,
  Sparkles,
  Award,
  Target,
  Flame,
  Crown,
  Link as LinkIcon,
} from "lucide-react";
import { fetchJson } from "@/lib/api/client";

interface SystemSettings {
  site_name: string;
  site_description: string;
  site_url: string;
  support_email: string;
  max_upload_size_mb: number;
  allowed_video_formats: string[];
  allowed_image_formats: string[];
  default_video_quality: string;
  enable_downloads: boolean;
  enable_streaming: boolean;
  enable_comments: boolean;
  enable_ratings: boolean;
  enable_watchlist: boolean;
  maintenance_mode: boolean;
  registration_enabled: boolean;
  email_verification_required: boolean;
  mfa_required: boolean;
}

interface SecuritySettings {
  password_min_length: number;
  password_require_uppercase: boolean;
  password_require_lowercase: boolean;
  password_require_numbers: boolean;
  password_require_special: boolean;
  session_timeout_minutes: number;
  max_login_attempts: number;
  lockout_duration_minutes: number;
  enable_ip_whitelist: boolean;
  ip_whitelist: string[];
}

interface StorageSettings {
  storage_provider: "s3" | "local" | "cloudflare";
  s3_bucket: string;
  s3_region: string;
  cdn_enabled: boolean;
  cdn_url: string;
  max_storage_gb: number;
  current_storage_gb: number;
}

interface EmailSettings {
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_use_tls: boolean;
  from_email: string;
  from_name: string;
  enable_welcome_email: boolean;
  enable_notification_emails: boolean;
}

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState<"general" | "security" | "storage" | "email" | "integrations">("general");
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);

  const { data: systemSettings, isLoading: loadingSystem } = useQuery({
    queryKey: ["admin", "settings", "system"],
    queryFn: () => fetchJson<SystemSettings>("/api/v1/admin/settings/system"),
  });

  const { data: securitySettings, isLoading: loadingSecurity } = useQuery({
    queryKey: ["admin", "settings", "security"],
    queryFn: () => fetchJson<SecuritySettings>("/api/v1/admin/settings/security"),
  });

  const { data: storageSettings, isLoading: loadingStorage } = useQuery({
    queryKey: ["admin", "settings", "storage"],
    queryFn: () => fetchJson<StorageSettings>("/api/v1/admin/settings/storage"),
  });

  const { data: emailSettings, isLoading: loadingEmail } = useQuery({
    queryKey: ["admin", "settings", "email"],
    queryFn: () => fetchJson<EmailSettings>("/api/v1/admin/settings/email"),
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      await fetchJson(`/api/v1/admin/settings/${activeTab}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
      setHasUnsavedChanges(false);
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 p-3 shadow-lg shadow-blue-500/30">
                <Settings className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">System Settings</h1>
                <p className="mt-1 text-gray-400">Configure platform behavior and integrations</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {hasUnsavedChanges && (
                <div className="flex items-center gap-2 rounded-lg border border-yellow-500/50 bg-yellow-500/10 px-4 py-2 text-sm text-yellow-400">
                  <AlertCircle className="h-4 w-4" />
                  Unsaved changes
                </div>
              )}
              <button
                onClick={() => saveSettingsMutation.mutate({})}
                disabled={!hasUnsavedChanges}
                className={`flex items-center gap-2 rounded-lg px-4 py-2.5 font-medium transition-all ${
                  hasUnsavedChanges
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700"
                    : "bg-gray-800/50 text-gray-500 cursor-not-allowed"
                }`}
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex items-center gap-2 overflow-x-auto rounded-lg border border-gray-800 bg-gray-900/50 p-1">
          <TabButton
            active={activeTab === "general"}
            onClick={() => setActiveTab("general")}
            icon={<Settings className="h-4 w-4" />}
            label="General"
          />
          <TabButton
            active={activeTab === "security"}
            onClick={() => setActiveTab("security")}
            icon={<Shield className="h-4 w-4" />}
            label="Security"
          />
          <TabButton
            active={activeTab === "storage"}
            onClick={() => setActiveTab("storage")}
            icon={<Cloud className="h-4 w-4" />}
            label="Storage & CDN"
          />
          <TabButton
            active={activeTab === "email"}
            onClick={() => setActiveTab("email")}
            icon={<Mail className="h-4 w-4" />}
            label="Email"
          />
          <TabButton
            active={activeTab === "integrations"}
            onClick={() => setActiveTab("integrations")}
            icon={<Zap className="h-4 w-4" />}
            label="Integrations"
          />
        </div>

        {/* Content */}
        {activeTab === "general" && (
          <GeneralTab
            settings={systemSettings}
            isLoading={loadingSystem}
            onChange={() => setHasUnsavedChanges(true)}
          />
        )}

        {activeTab === "security" && (
          <SecurityTab
            settings={securitySettings}
            isLoading={loadingSecurity}
            onChange={() => setHasUnsavedChanges(true)}
          />
        )}

        {activeTab === "storage" && (
          <StorageTab
            settings={storageSettings}
            isLoading={loadingStorage}
            onChange={() => setHasUnsavedChanges(true)}
          />
        )}

        {activeTab === "email" && (
          <EmailTab
            settings={emailSettings}
            isLoading={loadingEmail}
            onChange={() => setHasUnsavedChanges(true)}
          />
        )}

        {activeTab === "integrations" && (
          <IntegrationsTab onChange={() => setHasUnsavedChanges(true)} />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// General Settings Tab
// ============================================================================

function GeneralTab({
  settings,
  isLoading,
  onChange,
}: {
  settings?: SystemSettings;
  isLoading: boolean;
  onChange: () => void;
}) {
  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      {/* Site Information */}
      <SettingsSection title="Site Information" icon={<Globe className="h-5 w-5" />}>
        <div className="grid gap-6 lg:grid-cols-2">
          <FormField label="Site Name" description="Your platform's name">
            <input
              type="text"
              defaultValue={settings?.site_name}
              onChange={onChange}
              className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-white placeholder-gray-500 transition-all focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </FormField>

          <FormField label="Site URL" description="Your platform's primary URL">
            <input
              type="url"
              defaultValue={settings?.site_url}
              onChange={onChange}
              className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-white placeholder-gray-500 transition-all focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </FormField>
        </div>

        <FormField label="Site Description" description="Brief description for SEO">
          <textarea
            defaultValue={settings?.site_description}
            onChange={onChange}
            rows={3}
            className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-white placeholder-gray-500 transition-all focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </FormField>

        <FormField label="Support Email" description="Contact email for users">
          <input
            type="email"
            defaultValue={settings?.support_email}
            onChange={onChange}
            className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-white placeholder-gray-500 transition-all focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </FormField>
      </SettingsSection>

      {/* Content Settings */}
      <SettingsSection title="Content Settings" icon={<Video className="h-5 w-5" />}>
        <div className="grid gap-6 lg:grid-cols-2">
          <FormField label="Max Upload Size (MB)" description="Maximum file upload size">
            <input
              type="number"
              defaultValue={settings?.max_upload_size_mb}
              onChange={onChange}
              className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-white placeholder-gray-500 transition-all focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </FormField>

          <FormField label="Default Video Quality" description="Default streaming quality">
            <select
              defaultValue={settings?.default_video_quality}
              onChange={onChange}
              className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-white transition-all focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              <option value="480p">480p</option>
              <option value="720p">720p</option>
              <option value="1080p">1080p</option>
            </select>
          </FormField>
        </div>

        <div className="space-y-3">
          <ToggleSwitch
            label="Enable Downloads"
            description="Allow users to download content"
            checked={settings?.enable_downloads || false}
            onChange={onChange}
          />
          <ToggleSwitch
            label="Enable Streaming"
            description="Allow users to stream content"
            checked={settings?.enable_streaming || false}
            onChange={onChange}
          />
          <ToggleSwitch
            label="Enable Comments"
            description="Allow users to comment on titles"
            checked={settings?.enable_comments || false}
            onChange={onChange}
          />
          <ToggleSwitch
            label="Enable Ratings"
            description="Allow users to rate content"
            checked={settings?.enable_ratings || false}
            onChange={onChange}
          />
        </div>
      </SettingsSection>

      {/* User Settings */}
      <SettingsSection title="User Settings" icon={<Users className="h-5 w-5" />}>
        <div className="space-y-3">
          <ToggleSwitch
            label="Registration Enabled"
            description="Allow new user registrations"
            checked={settings?.registration_enabled || false}
            onChange={onChange}
          />
          <ToggleSwitch
            label="Email Verification Required"
            description="Require email verification for new users"
            checked={settings?.email_verification_required || false}
            onChange={onChange}
          />
          <ToggleSwitch
            label="MFA Required"
            description="Require multi-factor authentication"
            checked={settings?.mfa_required || false}
            onChange={onChange}
          />
          <ToggleSwitch
            label="Maintenance Mode"
            description="Put site in maintenance mode"
            checked={settings?.maintenance_mode || false}
            onChange={onChange}
            danger={true}
          />
        </div>
      </SettingsSection>
    </div>
  );
}

// ============================================================================
// Security Settings Tab
// ============================================================================

function SecurityTab({
  settings,
  isLoading,
  onChange,
}: {
  settings?: SecuritySettings;
  isLoading: boolean;
  onChange: () => void;
}) {
  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      {/* Password Policy */}
      <SettingsSection title="Password Policy" icon={<Lock className="h-5 w-5" />}>
        <FormField label="Minimum Password Length" description="Minimum characters required">
          <input
            type="number"
            defaultValue={settings?.password_min_length}
            onChange={onChange}
            min={8}
            max={128}
            className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-white placeholder-gray-500 transition-all focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </FormField>

        <div className="space-y-3">
          <ToggleSwitch
            label="Require Uppercase"
            description="At least one uppercase letter"
            checked={settings?.password_require_uppercase || false}
            onChange={onChange}
          />
          <ToggleSwitch
            label="Require Lowercase"
            description="At least one lowercase letter"
            checked={settings?.password_require_lowercase || false}
            onChange={onChange}
          />
          <ToggleSwitch
            label="Require Numbers"
            description="At least one number"
            checked={settings?.password_require_numbers || false}
            onChange={onChange}
          />
          <ToggleSwitch
            label="Require Special Characters"
            description="At least one special character"
            checked={settings?.password_require_special || false}
            onChange={onChange}
          />
        </div>
      </SettingsSection>

      {/* Session Security */}
      <SettingsSection title="Session Security" icon={<Key className="h-5 w-5" />}>
        <div className="grid gap-6 lg:grid-cols-2">
          <FormField label="Session Timeout (minutes)" description="Auto logout after inactivity">
            <input
              type="number"
              defaultValue={settings?.session_timeout_minutes}
              onChange={onChange}
              className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-white placeholder-gray-500 transition-all focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </FormField>

          <FormField label="Max Login Attempts" description="Failed login attempts before lockout">
            <input
              type="number"
              defaultValue={settings?.max_login_attempts}
              onChange={onChange}
              className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-white placeholder-gray-500 transition-all focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </FormField>

          <FormField label="Lockout Duration (minutes)" description="Account lockout duration">
            <input
              type="number"
              defaultValue={settings?.lockout_duration_minutes}
              onChange={onChange}
              className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-white placeholder-gray-500 transition-all focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </FormField>
        </div>
      </SettingsSection>

      {/* IP Whitelist */}
      <SettingsSection title="IP Whitelist" icon={<Shield className="h-5 w-5" />}>
        <ToggleSwitch
          label="Enable IP Whitelist"
          description="Restrict admin access to specific IP addresses"
          checked={settings?.enable_ip_whitelist || false}
          onChange={onChange}
        />

        {settings?.enable_ip_whitelist && (
          <FormField label="Allowed IP Addresses" description="One IP per line">
            <textarea
              defaultValue={settings?.ip_whitelist?.join("\n")}
              onChange={onChange}
              rows={5}
              placeholder="192.168.1.1&#10;10.0.0.1"
              className="font-mono w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-white placeholder-gray-500 transition-all focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </FormField>
        )}
      </SettingsSection>
    </div>
  );
}

// ============================================================================
// Storage Settings Tab
// ============================================================================

function StorageTab({
  settings,
  isLoading,
  onChange,
}: {
  settings?: StorageSettings;
  isLoading: boolean;
  onChange: () => void;
}) {
  if (isLoading) {
    return <LoadingState />;
  }

  const storagePercentage = ((settings?.current_storage_gb || 0) / (settings?.max_storage_gb || 1)) * 100;

  return (
    <div className="space-y-6">
      {/* Storage Usage */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-full bg-blue-500/20 p-2">
            <Database className="h-5 w-5 text-blue-400" />
          </div>
          <h3 className="text-lg font-bold text-white">Storage Usage</h3>
        </div>

        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-gray-400">Used Storage</span>
            <span className="text-sm font-bold text-white">
              {settings?.current_storage_gb} GB / {settings?.max_storage_gb} GB
            </span>
          </div>
          <div className="h-4 overflow-hidden rounded-full bg-gray-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500"
              style={{ width: `${Math.min(storagePercentage, 100)}%` }}
            />
          </div>
        </div>

        {storagePercentage > 80 && (
          <div className="flex items-center gap-2 rounded-lg bg-yellow-500/10 border border-yellow-500/50 px-4 py-3 text-sm text-yellow-400">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>Storage usage is above 80%. Consider upgrading your storage plan.</span>
          </div>
        )}
      </div>

      {/* Storage Provider */}
      <SettingsSection title="Storage Provider" icon={<Cloud className="h-5 w-5" />}>
        <FormField label="Provider" description="Cloud storage provider">
          <select
            defaultValue={settings?.storage_provider}
            onChange={onChange}
            className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-white transition-all focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          >
            <option value="s3">Amazon S3</option>
            <option value="cloudflare">Cloudflare R2</option>
            <option value="local">Local Storage</option>
          </select>
        </FormField>

        {settings?.storage_provider === "s3" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <FormField label="S3 Bucket" description="Bucket name">
              <input
                type="text"
                defaultValue={settings?.s3_bucket}
                onChange={onChange}
                className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-white placeholder-gray-500 transition-all focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </FormField>

            <FormField label="S3 Region" description="AWS region">
              <input
                type="text"
                defaultValue={settings?.s3_region}
                onChange={onChange}
                className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-white placeholder-gray-500 transition-all focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </FormField>
          </div>
        )}
      </SettingsSection>

      {/* CDN Settings */}
      <SettingsSection title="CDN Settings" icon={<Zap className="h-5 w-5" />}>
        <ToggleSwitch
          label="Enable CDN"
          description="Use CDN for faster content delivery"
          checked={settings?.cdn_enabled || false}
          onChange={onChange}
        />

        {settings?.cdn_enabled && (
          <FormField label="CDN URL" description="CloudFront or custom CDN URL">
            <input
              type="url"
              defaultValue={settings?.cdn_url}
              onChange={onChange}
              placeholder="https://cdn.example.com"
              className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-white placeholder-gray-500 transition-all focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </FormField>
        )}
      </SettingsSection>
    </div>
  );
}

// ============================================================================
// Email Settings Tab
// ============================================================================

function EmailTab({
  settings,
  isLoading,
  onChange,
}: {
  settings?: EmailSettings;
  isLoading: boolean;
  onChange: () => void;
}) {
  const [showPassword, setShowPassword] = React.useState(false);

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      {/* SMTP Configuration */}
      <SettingsSection title="SMTP Configuration" icon={<Mail className="h-5 w-5" />}>
        <div className="grid gap-6 lg:grid-cols-2">
          <FormField label="SMTP Host" description="Mail server hostname">
            <input
              type="text"
              defaultValue={settings?.smtp_host}
              onChange={onChange}
              placeholder="smtp.gmail.com"
              className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-white placeholder-gray-500 transition-all focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </FormField>

          <FormField label="SMTP Port" description="Mail server port">
            <input
              type="number"
              defaultValue={settings?.smtp_port}
              onChange={onChange}
              placeholder="587"
              className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-white placeholder-gray-500 transition-all focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </FormField>

          <FormField label="SMTP Username" description="Authentication username">
            <input
              type="text"
              defaultValue={settings?.smtp_username}
              onChange={onChange}
              className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-white placeholder-gray-500 transition-all focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </FormField>

          <FormField label="SMTP Password" description="Authentication password">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                onChange={onChange}
                className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2.5 pr-12 text-white placeholder-gray-500 transition-all focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </FormField>
        </div>

        <ToggleSwitch
          label="Use TLS"
          description="Enable TLS encryption for SMTP"
          checked={settings?.smtp_use_tls || false}
          onChange={onChange}
        />
      </SettingsSection>

      {/* Email Sender */}
      <SettingsSection title="Email Sender" icon={<Users className="h-5 w-5" />}>
        <div className="grid gap-6 lg:grid-cols-2">
          <FormField label="From Email" description="Sender email address">
            <input
              type="email"
              defaultValue={settings?.from_email}
              onChange={onChange}
              placeholder="noreply@example.com"
              className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-white placeholder-gray-500 transition-all focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </FormField>

          <FormField label="From Name" description="Sender display name">
            <input
              type="text"
              defaultValue={settings?.from_name}
              onChange={onChange}
              placeholder="MoviesNow"
              className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-white placeholder-gray-500 transition-all focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </FormField>
        </div>
      </SettingsSection>

      {/* Email Notifications */}
      <SettingsSection title="Email Notifications" icon={<Bell className="h-5 w-5" />}>
        <div className="space-y-3">
          <ToggleSwitch
            label="Welcome Email"
            description="Send welcome email to new users"
            checked={settings?.enable_welcome_email || false}
            onChange={onChange}
          />
          <ToggleSwitch
            label="Notification Emails"
            description="Send notification emails to users"
            checked={settings?.enable_notification_emails || false}
            onChange={onChange}
          />
        </div>
      </SettingsSection>
    </div>
  );
}

// ============================================================================
// Integrations Tab
// ============================================================================

function IntegrationsTab({ onChange }: { onChange: () => void }) {
  const integrations = [
    {
      name: "Stripe",
      description: "Payment processing for subscriptions",
      icon: DollarSign,
      color: "from-purple-600 to-indigo-600",
      connected: true,
    },
    {
      name: "AWS S3",
      description: "Cloud storage for media files",
      icon: Cloud,
      color: "from-orange-600 to-yellow-600",
      connected: true,
    },
    {
      name: "CloudFront",
      description: "CDN for fast content delivery",
      icon: Zap,
      color: "from-blue-600 to-cyan-600",
      connected: true,
    },
    {
      name: "Redis",
      description: "Caching and session storage",
      icon: Database,
      color: "from-red-600 to-pink-600",
      connected: true,
    },
    {
      name: "Analytics",
      description: "Track user behavior and metrics",
      icon: Target,
      color: "from-green-600 to-emerald-600",
      connected: false,
    },
    {
      name: "Push Notifications",
      description: "Send push notifications to users",
      icon: Bell,
      color: "from-purple-600 to-pink-600",
      connected: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">Third-Party Integrations</h2>
        <p className="text-sm text-gray-400">Connect external services to enhance functionality</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration) => (
          <div
            key={integration.name}
            className="group rounded-xl border border-gray-800 bg-gray-900/50 p-6 backdrop-blur-xl transition-all hover:border-gray-700"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className={`rounded-full bg-gradient-to-br ${integration.color} p-3 text-white shadow-lg`}>
                <integration.icon className="h-6 w-6" />
              </div>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${integration.connected ? "bg-green-400 animate-pulse" : "bg-gray-600"}`} />
                <span className={`text-xs font-medium ${integration.connected ? "text-green-400" : "text-gray-500"}`}>
                  {integration.connected ? "Connected" : "Not Connected"}
                </span>
              </div>
            </div>

            <h3 className="mb-2 text-lg font-bold text-white">{integration.name}</h3>
            <p className="mb-4 text-sm text-gray-400">{integration.description}</p>

            <button
              onClick={onChange}
              className={`w-full rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                integration.connected
                  ? "bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
              }`}
            >
              {integration.connected ? "Configure" : "Connect"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Sub-Components
// ============================================================================

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 whitespace-nowrap rounded-md px-4 py-2.5 text-sm font-medium transition-all ${
        active ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function SettingsSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 backdrop-blur-xl">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-full bg-purple-500/20 p-2 text-purple-400">{icon}</div>
        <h2 className="text-xl font-bold text-white">{title}</h2>
      </div>
      <div className="space-y-6">{children}</div>
    </div>
  );
}

function FormField({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block">
        <span className="font-medium text-white">{label}</span>
        {description && <span className="ml-2 text-sm text-gray-400">- {description}</span>}
      </label>
      {children}
    </div>
  );
}

function ToggleSwitch({
  label,
  description,
  checked,
  onChange,
  danger,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: () => void;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-gray-800/30 p-4">
      <div>
        <p className="font-medium text-white">{label}</p>
        {description && <p className="text-sm text-gray-400">{description}</p>}
      </div>
      <button
        onClick={onChange}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          checked ? (danger ? "bg-red-600" : "bg-green-600") : "bg-gray-700"
        }`}
      >
        <div
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-lg transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-12">
      <div className="flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    </div>
  );
}
