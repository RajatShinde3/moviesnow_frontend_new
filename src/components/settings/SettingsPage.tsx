/**
 * =============================================================================
 * SettingsPage Component
 * =============================================================================
 * Comprehensive user settings with tabs for different sections
 */

'use client';

import { useState } from 'react';
import {
  User,
  Bell,
  Shield,
  Smartphone,
  Activity,
  Lock,
  Download,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  useSettings,
  useUpdateSettings,
  usePrivacySettings,
  useUpdatePrivacySettings,
  useDevices,
  useRemoveDevice,
  useSignOutAllDevices,
  useChangePassword,
  useChangeEmail,
  useDeleteAccount,
  useExportData,
} from '@/lib/api/hooks/useSettings';
import { format } from 'date-fns';

type SettingsTab = 'account' | 'notifications' | 'privacy' | 'devices' | 'security';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');

  const TABS = [
    { id: 'account' as const, label: 'Account', icon: User },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'privacy' as const, label: 'Privacy', icon: Shield },
    { id: 'devices' as const, label: 'Devices', icon: Smartphone },
    { id: 'security' as const, label: 'Security', icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Manage your account preferences and settings</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-8">
          {activeTab === 'account' && <AccountSettings />}
          {activeTab === 'notifications' && <NotificationSettings />}
          {activeTab === 'privacy' && <PrivacySettings />}
          {activeTab === 'devices' && <DeviceSettings />}
          {activeTab === 'security' && <SecuritySettings />}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Account Settings
// ─────────────────────────────────────────────────────────────────────────────

function AccountSettings() {
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');

  const { data: settings } = useSettings();
  const updateSettings = useUpdateSettings();
  const changeEmail = useChangeEmail();
  const exportData = useExportData();
  const deleteAccount = useDeleteAccount();

  const handleEmailChange = (e: React.FormEvent) => {
    e.preventDefault();
    changeEmail.mutate({ new_email: newEmail, password });
  };

  return (
    <div className="space-y-8">
      {/* Playback Settings */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4">Playback Settings</h3>

        <div className="space-y-4">
          <ToggleSetting
            label="Auto-play next episode"
            description="Automatically play the next episode in a series"
            checked={settings?.auto_play_next_episode || false}
            onChange={(checked) =>
              updateSettings.mutate({ auto_play_next_episode: checked })
            }
          />

          <ToggleSetting
            label="Auto-play previews"
            description="Play video previews while browsing"
            checked={settings?.auto_play_previews || false}
            onChange={(checked) =>
              updateSettings.mutate({ auto_play_previews: checked })
            }
          />

          <SelectSetting
            label="Data usage per screen"
            description="Amount of data used while streaming"
            value={settings?.data_usage || 'auto'}
            onChange={(value) => updateSettings.mutate({ data_usage: value })}
            options={[
              { value: 'low', label: 'Low (saves data)' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High (best quality)' },
              { value: 'auto', label: 'Auto' },
            ]}
          />
        </div>
      </div>

      {/* Email Change */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4">Change Email</h3>
        <form onSubmit={handleEmailChange} className="space-y-4 max-w-md">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="New email address"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Current password"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
          />
          <button
            type="submit"
            disabled={changeEmail.isPending}
            className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium disabled:opacity-50"
          >
            {changeEmail.isPending ? 'Updating...' : 'Update Email'}
          </button>
        </form>
      </div>

      {/* Data Export */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4">Export Your Data</h3>
        <p className="text-gray-400 mb-4">Download all your data in JSON format</p>
        <button
          onClick={() => exportData.mutate()}
          disabled={exportData.isPending}
          className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50"
        >
          <Download className="h-5 w-5" />
          {exportData.isPending ? 'Exporting...' : 'Export Data'}
        </button>
      </div>

      {/* Delete Account */}
      <div>
        <h3 className="text-xl font-bold text-red-400 mb-4">Danger Zone</h3>
        <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400 mb-4">
            Once you delete your account, there is no going back. This action is permanent.
          </p>
          <button
            onClick={() => {
              const pwd = prompt('Enter your password to confirm account deletion:');
              if (pwd) deleteAccount.mutate(pwd);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium"
          >
            <Trash2 className="h-5 w-5" />
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Notification Settings
// ─────────────────────────────────────────────────────────────────────────────

function NotificationSettings() {
  const { data: settings } = useSettings();
  const updateSettings = useUpdateSettings();

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white">Notification Preferences</h3>

      <ToggleSetting
        label="Email notifications"
        description="Receive email about account activity"
        checked={settings?.email_notifications || false}
        onChange={(checked) => updateSettings.mutate({ email_notifications: checked })}
      />

      <ToggleSetting
        label="Push notifications"
        description="Receive push notifications in browser"
        checked={settings?.push_notifications || false}
        onChange={(checked) => updateSettings.mutate({ push_notifications: checked })}
      />

      <ToggleSetting
        label="New release notifications"
        description="Get notified when new content is added"
        checked={settings?.new_release_notifications || false}
        onChange={(checked) =>
          updateSettings.mutate({ new_release_notifications: checked })
        }
      />

      <ToggleSetting
        label="Watchlist notifications"
        description="Get notified about updates to your watchlist"
        checked={settings?.watchlist_notifications || false}
        onChange={(checked) =>
          updateSettings.mutate({ watchlist_notifications: checked })
        }
      />

      <ToggleSetting
        label="Marketing emails"
        description="Receive emails about new features and offers"
        checked={settings?.marketing_emails || false}
        onChange={(checked) => updateSettings.mutate({ marketing_emails: checked })}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Privacy Settings
// ─────────────────────────────────────────────────────────────────────────────

function PrivacySettings() {
  const { data: privacy } = usePrivacySettings();
  const updatePrivacy = useUpdatePrivacySettings();

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white">Privacy Controls</h3>

      <ToggleSetting
        label="Show watch history"
        description="Allow others to see what you've watched"
        checked={privacy?.show_watch_history || false}
        onChange={(checked) => updatePrivacy.mutate({ show_watch_history: checked })}
      />

      <ToggleSetting
        label="Share watching activity"
        description="Share what you're watching with friends"
        checked={privacy?.share_watching_activity || false}
        onChange={(checked) => updatePrivacy.mutate({ share_watching_activity: checked })}
      />

      <ToggleSetting
        label="Personalized recommendations"
        description="Use watch history for better recommendations"
        checked={privacy?.personalized_recommendations || false}
        onChange={(checked) =>
          updatePrivacy.mutate({ personalized_recommendations: checked })
        }
      />

      <ToggleSetting
        label="Analytics"
        description="Allow anonymous usage analytics"
        checked={privacy?.allow_analytics || false}
        onChange={(checked) => updatePrivacy.mutate({ allow_analytics: checked })}
      />

      <ToggleSetting
        label="Adult content"
        description="Show adult/mature content"
        checked={privacy?.adult_content || false}
        onChange={(checked) => updatePrivacy.mutate({ adult_content: checked })}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Device Settings
// ─────────────────────────────────────────────────────────────────────────────

function DeviceSettings() {
  const { data } = useDevices();
  const removeDevice = useRemoveDevice();
  const signOutAll = useSignOutAllDevices();

  const devices = data?.devices || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Logged In Devices</h3>
        <button
          onClick={() => {
            if (window.confirm('Sign out from all devices except this one?')) {
              signOutAll.mutate();
            }
          }}
          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-medium border border-red-500/30"
        >
          Sign Out All
        </button>
      </div>

      <div className="space-y-3">
        {devices.map((device) => (
          <div
            key={device.id}
            className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg"
          >
            <div>
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-white font-medium">{device.device_name}</p>
                  <p className="text-sm text-gray-400">
                    {device.browser} • {device.os}
                  </p>
                  <p className="text-xs text-gray-500">
                    Last active: {format(new Date(device.last_active), 'PPp')}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {device.is_current ? (
                <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full">
                  Current Device
                </span>
              ) : (
                <button
                  onClick={() => removeDevice.mutate(device.id)}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Security Settings
// ─────────────────────────────────────────────────────────────────────────────

function SecuritySettings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  const changePassword = useChangePassword();

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    changePassword.mutate(
      { current_password: currentPassword, new_password: newPassword },
      {
        onSuccess: () => {
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        },
      }
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-bold text-white mb-4">Change Password</h3>
        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div className="relative">
            <input
              type={showPasswords ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
              required
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPasswords(!showPasswords)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2"
            >
              {showPasswords ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>

          <input
            type={showPasswords ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password"
            required
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
          />

          <input
            type={showPasswords ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            required
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
          />

          <button
            type="submit"
            disabled={changePassword.isPending}
            className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium disabled:opacity-50"
          >
            {changePassword.isPending ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Components
// ─────────────────────────────────────────────────────────────────────────────

function ToggleSetting({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
      <div>
        <p className="text-white font-medium">{label}</p>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-14 h-7 rounded-full transition-colors ${
          checked ? 'bg-purple-500' : 'bg-gray-700'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-6 w-6 bg-white rounded-full transition-transform ${
            checked ? 'translate-x-7' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

function SelectSetting({
  label,
  description,
  value,
  onChange,
  options,
}: {
  label: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="p-4 bg-gray-800/30 rounded-lg">
      <label className="block text-white font-medium mb-1">{label}</label>
      <p className="text-sm text-gray-400 mb-3">{description}</p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function toast(options: any) {
  // Placeholder - will be replaced by sonner
}
