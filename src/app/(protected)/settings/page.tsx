'use client';

/**
 * Settings Index Page
 * Professional eye-comfortable navigation hub
 */

import * as React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/services';
import { SettingsLayout } from '@/components/settings';
import { Icon, type IconName } from '@/components/icons/Icon';
import { cn } from '@/lib/cn';

interface SettingSection {
  title: string;
  description: string;
  items: SettingLink[];
}

interface SettingLink {
  icon: IconName;
  label: string;
  description: string;
  href: string;
  badge?: string;
}

export default function SettingsPage() {
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      return await api.auth.getCurrentUser();
    },
  });

  const sections: SettingSection[] = [
    {
      title: 'Account',
      description: 'Manage your account settings and preferences',
      items: [
        {
          icon: 'user',
          label: 'Profile',
          description: 'Update your personal information',
          href: '/settings/account',
        },
        {
          icon: 'mail',
          label: 'Email',
          description: 'Change your email address',
          href: '/settings/account/email',
        },
        {
          icon: 'globe',
          label: 'Language',
          description: 'Set your preferred language',
          href: '/settings/account/language',
        },
      ],
    },
    {
      title: 'Security',
      description: 'Protect your account with security settings',
      items: [
        {
          icon: 'lock',
          label: 'Password',
          description: 'Change your password',
          href: '/settings/security/password',
        },
        {
          icon: 'shield-check',
          label: 'Two-Factor Authentication',
          description: 'Add an extra layer of security',
          href: '/settings/security/mfa',
        },
        {
          icon: 'key',
          label: 'Recovery Codes',
          description: 'Backup codes for account recovery',
          href: '/settings/security/recovery-codes',
        },
      ],
    },
    {
      title: 'Privacy',
      description: 'Control your privacy and data settings',
      items: [
        {
          icon: 'shield',
          label: 'Privacy Settings',
          description: 'Manage your privacy preferences',
          href: '/settings/privacy',
        },
        {
          icon: 'eye',
          label: 'Activity',
          description: 'View and manage your activity',
          href: '/settings/activity',
        },
      ],
    },
    {
      title: 'Notifications',
      description: 'Manage how you receive notifications',
      items: [
        {
          icon: 'bell',
          label: 'Notification Preferences',
          description: 'Choose what you want to be notified about',
          href: '/settings/notifications',
        },
        {
          icon: 'alert',
          label: 'Alerts',
          description: 'Manage alert settings',
          href: '/settings/alerts',
        },
      ],
    },
    {
      title: 'Devices & Sessions',
      description: 'Manage your devices and active sessions',
      items: [
        {
          icon: 'smartphone',
          label: 'Devices',
          description: 'Manage your connected devices',
          href: '/settings/devices',
        },
        {
          icon: 'activity',
          label: 'Sessions',
          description: 'View active login sessions',
          href: '/settings/sessions',
        },
        {
          icon: 'monitor',
          label: 'Trusted Devices',
          description: 'Manage trusted devices',
          href: '/settings/trusted-devices',
        },
      ],
    },
    {
      title: 'Subscription & Billing',
      description: 'Manage your subscription and payment methods',
      items: [
        {
          icon: 'crown',
          label: 'Subscription',
          description: 'View and manage your subscription',
          href: '/settings/subscription',
        },
        {
          icon: 'credit-card',
          label: 'Payment Methods',
          description: 'Manage your payment methods',
          href: '/settings/billing/payment-methods',
        },
        {
          icon: 'invoice',
          label: 'Billing History',
          description: 'View your billing history',
          href: '/settings/billing/history',
        },
      ],
    },
    {
      title: 'Preferences',
      description: 'Customize your viewing experience',
      items: [
        {
          icon: 'settings',
          label: 'Preferences',
          description: 'General app preferences',
          href: '/settings/preferences',
        },
        {
          icon: 'download',
          label: 'Downloads',
          description: 'Manage download settings',
          href: '/settings/downloads',
        },
        {
          icon: 'clock',
          label: 'Watch Reminders',
          description: 'Set reminders for new episodes',
          href: '/settings/watch-reminders',
        },
      ],
    },
  ];

  return (
    <SettingsLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#F0F0F0]">Settings</h1>
        <p className="text-[#808080] mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      {/* User Overview Card */}
      {user && (
        <div className="rounded-xl border border-[#3A3A3A] bg-[#1A1A1A] p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-[#242424] border border-[#3A3A3A] flex items-center justify-center">
              <Icon name="user" className="text-[#B0B0B0]" size={32} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#F0F0F0]">
                {user.email}
              </h2>
              <p className="text-sm text-[#808080] mt-1">
                Account created on {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Settings Sections */}
      <div className="space-y-12">
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            {/* Section Header */}
            <div className="mb-4">
              <h2 className="text-xl font-bold text-[#F0F0F0]">
                {section.title}
              </h2>
              <p className="text-sm text-[#808080] mt-1">
                {section.description}
              </p>
            </div>

            {/* Section Items */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {section.items.map((item, itemIndex) => (
                <Link
                  key={itemIndex}
                  href={item.href}
                  className={cn(
                    'group relative rounded-xl border border-[#3A3A3A] bg-[#1A1A1A] p-5',
                    'hover:border-[#4A4A4A] hover:bg-[#242424]',
                    'transition-all duration-200'
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-[#242424] p-2.5 border border-[#3A3A3A] group-hover:border-[#4A4A4A] transition-colors">
                      <Icon
                        name={item.icon}
                        className="text-[#B0B0B0] group-hover:text-[#F0F0F0] transition-colors"
                        size={20}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-[#F0F0F0] group-hover:text-[#FFFFFF] transition-colors">
                          {item.label}
                        </h3>
                        {item.badge && (
                          <span className="px-2 py-0.5 rounded text-xs bg-[#E5E5E5] text-[#0F0F0F] font-medium">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#808080] line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                    <Icon
                      name="chevron-right"
                      className="text-[#808080] group-hover:text-[#B0B0B0] group-hover:translate-x-1 transition-all flex-shrink-0"
                      size={16}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Danger Zone */}
      <div className="mt-12 pt-8 border-t border-[#3A3A3A]">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-[#F0F0F0]">Danger Zone</h2>
          <p className="text-sm text-[#808080] mt-1">
            Irreversible account actions
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/settings/account/deactivate"
            className="rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/5 p-5 hover:bg-[#EF4444]/10 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-[#EF4444]/10 p-2.5 border border-[#EF4444]/30">
                <Icon name="alert" className="text-[#EF4444]" size={20} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#EF4444] mb-1">
                  Deactivate Account
                </h3>
                <p className="text-xs text-[#808080]">
                  Temporarily disable your account
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/settings/account/delete"
            className="rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/5 p-5 hover:bg-[#EF4444]/10 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-[#EF4444]/10 p-2.5 border border-[#EF4444]/30">
                <Icon name="trash" className="text-[#EF4444]" size={20} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#EF4444] mb-1">
                  Delete Account
                </h3>
                <p className="text-xs text-[#808080]">
                  Permanently delete your account and data
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Bottom Spacing */}
      <div className="h-12" />
    </SettingsLayout>
  );
}
