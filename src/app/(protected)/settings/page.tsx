'use client';

/**
 * Settings Index Page - ENHANCED ENTERPRISE GRADE
 * Premium navigation hub with sophisticated design
 * Professional cards, animations, and visual hierarchy
 */

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mb-10"
      >
        <div className="flex items-center gap-4 mb-3">
          <motion.div
            className="rounded-2xl bg-gradient-to-br from-[#242424] to-[#1A1A1A] border border-[#3A3A3A]/50 p-4 shadow-xl shadow-black/20"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ duration: 0.3 }}
          >
            <Icon name="settings" className="text-[#F0F0F0]" size={32} />
          </motion.div>
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-br from-[#F0F0F0] to-[#B0B0B0] bg-clip-text text-transparent">
              Settings
            </h1>
          </div>
        </div>
        <p className="text-base text-[#808080] leading-relaxed ml-20">
          Manage your account settings and preferences
        </p>
      </motion.div>

      {/* User Overview Card */}
      {user && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#1A1A1A] via-[#1A1A1A] to-[#1F1F1F] border border-[#3A3A3A]/60 p-7 mb-10 shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/20 hover:border-[#4A4A4A]/80 transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#E5E5E5]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex items-center gap-5">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.2 }}
              className="h-20 w-20 rounded-2xl bg-gradient-to-br from-[#2D2D2D] to-[#242424] border border-[#3A3A3A]/50 flex items-center justify-center shadow-lg"
            >
              <Icon name="user" className="text-[#E5E5E5]" size={36} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-[#F0F0F0] mb-1">
                {user.email}
              </h2>
              <p className="text-sm text-[#808080]">
                Account created on {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Settings Sections */}
      <div className="space-y-14">
        {sections.map((section, sectionIndex) => (
          <motion.div
            key={sectionIndex}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + sectionIndex * 0.1 }}
          >
            {/* Section Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-br from-[#F0F0F0] to-[#B0B0B0] bg-clip-text text-transparent">
                {section.title}
              </h2>
              <p className="text-sm text-[#808080] mt-2 leading-relaxed">
                {section.description}
              </p>
            </div>

            {/* Section Items */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {section.items.map((item, itemIndex) => (
                <motion.div
                  key={itemIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 + itemIndex * 0.05 }}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      'group relative block rounded-2xl overflow-hidden',
                      'bg-gradient-to-br from-[#1A1A1A] via-[#1A1A1A] to-[#1F1F1F]',
                      'border border-[#3A3A3A]/60 p-6',
                      'shadow-lg shadow-black/10',
                      'hover:border-[#4A4A4A]/80 hover:shadow-xl hover:shadow-black/20',
                      'transition-all duration-300 ease-out'
                    )}
                  >
                    {/* Hover gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#E5E5E5]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Content */}
                    <div className="relative flex items-start gap-4">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.2 }}
                        className="flex-shrink-0 rounded-xl bg-gradient-to-br from-[#2D2D2D] to-[#242424] p-3 border border-[#3A3A3A]/50 shadow-md"
                      >
                        <Icon
                          name={item.icon}
                          className="text-[#B0B0B0] group-hover:text-[#E5E5E5] transition-colors duration-200"
                          size={22}
                        />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-base font-bold text-[#F0F0F0] group-hover:text-white transition-colors">
                            {item.label}
                          </h3>
                          {item.badge && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs bg-gradient-to-br from-[#E5E5E5] to-[#D0D0D0] text-[#0F0F0F] font-bold shadow-md">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#808080] leading-relaxed line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                      <Icon
                        name="chevron-right"
                        className="text-[#808080] group-hover:text-[#E5E5E5] group-hover:translate-x-1 transition-all duration-200 flex-shrink-0 mt-1"
                        size={18}
                      />
                    </div>

                    {/* Bottom accent */}
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E5E5E5]/10 to-transparent" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="mt-16 pt-10"
      >
        <div className="h-px bg-gradient-to-r from-transparent via-[#EF4444]/30 to-transparent mb-8" />

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#EF4444] flex items-center gap-3">
            <Icon name="alert" size={28} />
            Danger Zone
          </h2>
          <p className="text-sm text-[#808080] mt-2 leading-relaxed">
            Irreversible account actions - proceed with caution
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <Link
              href="/settings/account/deactivate"
              className="group relative block rounded-2xl overflow-hidden border border-[#EF4444]/40 bg-gradient-to-br from-[#EF4444]/8 to-[#EF4444]/3 p-6 hover:border-[#EF4444]/60 hover:bg-[#EF4444]/12 transition-all duration-300 shadow-lg shadow-[#EF4444]/5 hover:shadow-xl hover:shadow-[#EF4444]/10"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#EF4444]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-start gap-4">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0 rounded-xl bg-gradient-to-br from-[#EF4444]/15 to-[#EF4444]/5 p-3 border border-[#EF4444]/40 shadow-md"
                >
                  <Icon name="alert" className="text-[#EF4444]" size={24} />
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-[#EF4444] mb-2 group-hover:text-[#FF5555] transition-colors">
                    Deactivate Account
                  </h3>
                  <p className="text-xs text-[#808080] leading-relaxed">
                    Temporarily disable your account and pause all services
                  </p>
                </div>
                <Icon
                  name="chevron-right"
                  className="text-[#EF4444]/50 group-hover:text-[#EF4444] group-hover:translate-x-1 transition-all duration-200 flex-shrink-0 mt-1"
                  size={18}
                />
              </div>
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <Link
              href="/settings/account/delete"
              className="group relative block rounded-2xl overflow-hidden border border-[#EF4444]/40 bg-gradient-to-br from-[#EF4444]/8 to-[#EF4444]/3 p-6 hover:border-[#EF4444]/60 hover:bg-[#EF4444]/12 transition-all duration-300 shadow-lg shadow-[#EF4444]/5 hover:shadow-xl hover:shadow-[#EF4444]/10"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#EF4444]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-start gap-4">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0 rounded-xl bg-gradient-to-br from-[#EF4444]/15 to-[#EF4444]/5 p-3 border border-[#EF4444]/40 shadow-md"
                >
                  <Icon name="trash" className="text-[#EF4444]" size={24} />
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-[#EF4444] mb-2 group-hover:text-[#FF5555] transition-colors">
                    Delete Account
                  </h3>
                  <p className="text-xs text-[#808080] leading-relaxed">
                    Permanently delete your account and all associated data
                  </p>
                </div>
                <Icon
                  name="chevron-right"
                  className="text-[#EF4444]/50 group-hover:text-[#EF4444] group-hover:translate-x-1 transition-all duration-200 flex-shrink-0 mt-1"
                  size={18}
                />
              </div>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom Spacing */}
      <div className="h-12" />
    </SettingsLayout>
  );
}
