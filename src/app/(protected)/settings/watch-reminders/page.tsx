"use client";

/**
 * Watch Reminders Page - ENHANCED ENTERPRISE GRADE
 * Premium reminder management with:
 * - Active and past reminder tracking
 * - Multi-channel notification selection
 * - Beautiful modal with staggered animations
 * - Professional statistics display
 * - Smooth transitions and micro-interactions
 * Professional animations and visual hierarchy
 */

import * as React from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from 'sonner';
import {
  Bell,
  Plus,
  Trash2,
  Calendar,
  Film,
  Mail,
  Smartphone,
  Monitor,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { api } from "@/lib/api/services";
import { ConfirmDialog } from "@/components/ui";
import {
  SettingsLayout,
  PageHeader,
  SettingCard,
  Button,
} from '@/components/settings';
import { Icon } from '@/components/icons/Icon';

interface WatchReminder {
  id: string;
  title_id: string;
  title_name: string;
  remind_at: string;
  notification_channels: ("email" | "push" | "in_app")[];
  is_active: boolean;
  created_at: string;
}

const NOTIFICATION_CHANNELS = [
  { value: "email" as const, label: "Email", icon: Mail, color: "#3B82F6" },
  { value: "push" as const, label: "Push", icon: Smartphone, color: "#10B981" },
  { value: "in_app" as const, label: "In-App", icon: Monitor, color: "#8B5CF6" },
];

export default function WatchRemindersPage() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [selectedReminder, setSelectedReminder] = React.useState<WatchReminder | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  // Form state
  const [titleId, setTitleId] = React.useState("");
  const [remindAt, setRemindAt] = React.useState("");
  const [channels, setChannels] = React.useState<("email" | "push" | "in_app")[]>(["email", "push"]);

  // Fetch reminders
  const { data: reminders = [], isLoading } = useQuery({
    queryKey: ["watch-reminders"],
    queryFn: () => api.preferences.getWatchReminders(),
  });

  // Create reminder mutation
  const createMutation = useMutation({
    mutationFn: (data: {
      title_id: string;
      remind_at: string;
      notification_channels: ("email" | "push" | "in_app")[];
    }) => api.preferences.createWatchReminder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watch-reminders"] });
      toast.success('Reminder created successfully');
      setShowCreateModal(false);
      resetForm();
    },
    onError: () => {
      toast.error('Failed to create reminder');
    },
  });

  // Delete reminder mutation
  const deleteMutation = useMutation({
    mutationFn: (reminderId: string) => api.preferences.deleteWatchReminder(reminderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watch-reminders"] });
      toast.success('Reminder deleted successfully');
      setShowDeleteDialog(false);
      setSelectedReminder(null);
    },
    onError: () => {
      toast.error('Failed to delete reminder');
    },
  });

  const resetForm = () => {
    setTitleId("");
    setRemindAt("");
    setChannels(["email", "push"]);
  };

  const handleCreate = () => {
    if (titleId && remindAt && channels.length > 0) {
      createMutation.mutate({
        title_id: titleId,
        remind_at: remindAt,
        notification_channels: channels,
      });
    }
  };

  const handleDelete = () => {
    if (selectedReminder) {
      deleteMutation.mutate(selectedReminder.id);
    }
  };

  const toggleChannel = (channel: "email" | "push" | "in_app") => {
    setChannels((prev) =>
      prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel]
    );
  };

  // Separate active and past reminders
  const now = new Date();
  const activeReminders = reminders.filter((r) => new Date(r.remind_at) > now && r.is_active);
  const pastReminders = reminders.filter((r) => new Date(r.remind_at) <= now || !r.is_active);

  if (isLoading) {
    return (
      <SettingsLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#3A3A3A] border-t-[#E5E5E5]"></div>
        </div>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-start justify-between mb-2"
        >
          <PageHeader
            title="Watch Reminders"
            description="Get notified when new episodes or movies are available to watch"
            icon="bell"
          />
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
          >
            <Icon name="plus" size={16} />
            Create Reminder
          </Button>
        </motion.div>

        {/* Statistics Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="group relative rounded-2xl border border-[#3A3A3A]/60 bg-gradient-to-br from-[#1A1A1A] via-[#1A1A1A] to-[#1F1F1F] p-8 mb-6 shadow-lg shadow-black/10 hover:border-[#4A4A4A]/80 hover:shadow-xl hover:shadow-black/20 transition-all duration-300 overflow-hidden"
        >
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#E5E5E5]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Bottom accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E5E5E5]/10 to-transparent" />

          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Active Reminders Stat */}
            <div className="flex items-start gap-4">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.2 }}
                className="flex-shrink-0 rounded-xl bg-gradient-to-br from-[#10B981]/20 to-[#10B981]/10 p-3 border border-[#10B981]/40"
              >
                <Bell className="w-6 h-6 text-[#10B981]" />
              </motion.div>
              <div>
                <div className="text-4xl font-bold bg-gradient-to-br from-[#F0F0F0] to-[#E5E5E5] bg-clip-text text-transparent mb-1">
                  {activeReminders.length}
                </div>
                <div className="text-sm font-medium text-[#B0B0B0]">Active Reminders</div>
                <p className="text-xs text-[#808080] mt-1">Notifications scheduled</p>
              </div>
            </div>

            {/* Past Reminders Stat */}
            <div className="flex items-start gap-4">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.2 }}
                className="flex-shrink-0 rounded-xl bg-gradient-to-br from-[#808080]/20 to-[#808080]/10 p-3 border border-[#808080]/40"
              >
                <Clock className="w-6 h-6 text-[#808080]" />
              </motion.div>
              <div>
                <div className="text-4xl font-bold bg-gradient-to-br from-[#F0F0F0] to-[#B0B0B0] bg-clip-text text-transparent mb-1">
                  {pastReminders.length}
                </div>
                <div className="text-sm font-medium text-[#B0B0B0]">Past Reminders</div>
                <p className="text-xs text-[#808080] mt-1">Completed or expired</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Active Reminders */}
        {activeReminders.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          >
            <SettingCard
              title="Active Reminders"
              description={`You have ${activeReminders.length} active reminder${activeReminders.length !== 1 ? 's' : ''} scheduled`}
              icon="bell-ring"
              className="mb-6"
            >

            <div className="space-y-4">
              {activeReminders.map((reminder, index) => (
                <motion.div
                  key={reminder.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  className="group relative rounded-2xl border border-[#3A3A3A]/60 bg-gradient-to-br from-[#1A1A1A] via-[#1A1A1A] to-[#1F1F1F] p-8 shadow-lg shadow-black/10 hover:border-[#4A4A4A]/80 hover:shadow-xl hover:shadow-black/20 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#E5E5E5]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E5E5E5]/10 to-transparent" />
                  <div className="relative flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="rounded-lg bg-gradient-to-br from-[#2D2D2D] to-[#242424] p-2 border border-[#3A3A3A]/50"
                        >
                          <Film className="w-5 h-5 text-[#E5E5E5]" />
                        </motion.div>
                        <h3 className="text-lg font-semibold bg-gradient-to-br from-[#F0F0F0] to-[#E5E5E5] bg-clip-text text-transparent">
                          {reminder.title_name}
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#B0B0B0]" />
                          <span className="text-sm text-[#E5E5E5] font-medium">
                            {new Date(reminder.remind_at).toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-[#B0B0B0]" />
                          <div className="flex gap-2">
                            {reminder.notification_channels.map((channel) => {
                              const channelInfo = NOTIFICATION_CHANNELS.find(
                                (c) => c.value === channel
                              );
                              if (!channelInfo) return null;
                              const Icon = channelInfo.icon;
                              return (
                                <motion.div
                                  key={channel}
                                  whileHover={{ scale: 1.05 }}
                                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border"
                                  style={{
                                    backgroundColor: `${channelInfo.color}15`,
                                    color: channelInfo.color,
                                    borderColor: `${channelInfo.color}40`,
                                  }}
                                >
                                  <Icon className="w-3 h-3 inline mr-1" />
                                  {channelInfo.label}
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
      //@ts-expect-error
                        setSelectedReminder(reminder);
                        setShowDeleteDialog(true);
                      }}
                      className="p-3 rounded-xl bg-gradient-to-br from-[#EF4444]/15 to-[#EF4444]/5 border border-[#EF4444]/30 hover:border-[#EF4444]/50 transition-all duration-200"
                    >
                      <Trash2 className="w-5 h-5 text-[#EF4444]" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
            </SettingCard>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          >
            <SettingCard
              title="Active Reminders"
              description="No active reminders scheduled"
              icon="bell"
              className="mb-6"
            >
              <div className="flex flex-col items-center justify-center py-12">
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="inline-flex p-6 rounded-2xl bg-gradient-to-br from-[#2D2D2D] to-[#242424] border border-[#3A3A3A]/50 mb-6"
                >
                  <Bell className="w-16 h-16 text-[#808080]" />
                </motion.div>
                <h3 className="text-xl font-bold bg-gradient-to-br from-[#F0F0F0] to-[#B0B0B0] bg-clip-text text-transparent mb-3">
                  No Active Reminders
                </h3>
                <p className="text-[#B0B0B0] mb-6 max-w-md mx-auto leading-relaxed text-center text-sm">
                  Create reminders to get notified about new content you want to watch
                </p>
                <Button
                  variant="primary"
                  onClick={() => setShowCreateModal(true)}
                >
                  <Icon name="plus" size={16} />
                  Create Your First Reminder
                </Button>
              </div>
            </SettingCard>
          </motion.div>
        )}

        {/* Past Reminders */}
        {pastReminders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          >
            <SettingCard
              title="Past Reminders"
              description={`${pastReminders.length} completed or expired reminder${pastReminders.length !== 1 ? 's' : ''}`}
              icon="clock"
              className="mb-6"
            >
              <div className="space-y-3 opacity-70">
              {pastReminders.slice(0, 5).map((reminder, index) => (
                <motion.div
                  key={reminder.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.03 }}
                  className="group relative rounded-xl border border-[#3A3A3A]/40 bg-gradient-to-br from-[#1A1A1A]/50 to-[#1F1F1F]/50 p-5 shadow-md shadow-black/5 hover:border-[#4A4A4A]/60 transition-all duration-200 overflow-hidden"
                >
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#808080]/10 to-transparent" />

                  <div className="relative flex items-center justify-between">
                    <div>
                      <div className="text-[#E5E5E5] font-medium mb-1">{reminder.title_name}</div>
                      <div className="text-sm text-[#808080] flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {new Date(reminder.remind_at).toLocaleString()}
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedReminder(reminder as any);
                        setShowDeleteDialog(true);
                      }}
                      className="p-2 rounded-lg bg-gradient-to-br from-[#EF4444]/10 to-[#EF4444]/5 border border-[#EF4444]/20 hover:border-[#EF4444]/40 transition-all duration-200"
                    >
                      <Trash2 className="w-4 h-4 text-[#EF4444]" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
              </div>
            </SettingCard>
          </motion.div>
        )}

        {/* Create Reminder Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setShowCreateModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="group relative rounded-2xl border border-[#3A3A3A]/60 bg-gradient-to-br from-[#1A1A1A] via-[#1A1A1A] to-[#1F1F1F] shadow-2xl shadow-black/30 max-w-2xl w-full p-8 overflow-hidden"
              >
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#E5E5E5]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E5E5E5]/10 to-transparent" />

                <div className="relative">
                  <h2 className="text-3xl font-bold bg-gradient-to-br from-[#F0F0F0] to-[#B0B0B0] bg-clip-text text-transparent mb-8">
                    Create Watch Reminder
                  </h2>

                  <div className="space-y-6">
                    {/* Title ID Input */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <label className="block text-sm font-semibold text-[#E5E5E5] mb-2">
                        Title ID
                      </label>
                      <input
                        type="text"
                        value={titleId}
                        onChange={(e) => setTitleId(e.target.value)}
                        placeholder="Enter title ID..."
                        className="w-full px-4 py-3 bg-[#242424] border border-[#3A3A3A] rounded-xl text-[#F0F0F0] placeholder-[#808080] focus:outline-none focus:border-[#E5E5E5] focus:ring-2 focus:ring-[#E5E5E5]/10 transition-all"
                      />
                      <p className="mt-2 text-xs text-[#B0B0B0]">
                        You can find the title ID in the URL when viewing content
                      </p>
                    </motion.div>

                    {/* Remind At */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                    >
                      <label className="block text-sm font-semibold text-[#E5E5E5] mb-2">
                        Remind Me At
                      </label>
                      <input
                        type="datetime-local"
                        value={remindAt}
                        onChange={(e) => setRemindAt(e.target.value)}
                        className="w-full px-4 py-3 bg-[#242424] border border-[#3A3A3A] rounded-xl text-[#F0F0F0] focus:outline-none focus:border-[#E5E5E5] focus:ring-2 focus:ring-[#E5E5E5]/10 transition-all [color-scheme:dark]"
                      />
                    </motion.div>

                    {/* Notification Channels */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <label className="block text-sm font-semibold text-[#E5E5E5] mb-3">
                        Notification Channels
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {NOTIFICATION_CHANNELS.map((channel, index) => {
                          const Icon = channel.icon;
                          const isSelected = channels.includes(channel.value);
                          return (
                            <motion.button
                              key={channel.value}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.25 + index * 0.05 }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => toggleChannel(channel.value)}
                              className={`group/btn relative p-4 rounded-xl border-2 transition-all overflow-hidden ${
                                isSelected
                                  ? "border-[#E5E5E5]/40"
                                  : "border-[#3A3A3A]/60 hover:border-[#4A4A4A]/80"
                              }`}
                              style={{
                                borderColor: isSelected ? `${channel.color}40` : undefined,
                                backgroundColor: isSelected ? `${channel.color}15` : "#1A1A1A",
                              }}
                            >
                              {isSelected && (
                                <div
                                  className="absolute inset-0 opacity-10"
                                  style={{
                                    background: `radial-gradient(circle at center, ${channel.color}40, transparent)`
                                  }}
                                />
                              )}
                              <Icon
                                className="w-6 h-6 mx-auto mb-2 transition-transform duration-300 group-hover/btn:scale-110"
                                style={{ color: isSelected ? channel.color : "#B0B0B0" }}
                              />
                              <div
                                className="text-sm font-semibold transition-colors"
                                style={{ color: isSelected ? channel.color : "#E5E5E5" }}
                              >
                                {channel.label}
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                      {channels.length === 0 && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-3 text-sm text-[#EF4444] flex items-center gap-2 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 p-3"
                        >
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          Please select at least one notification channel
                        </motion.p>
                      )}
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex gap-3 mt-8"
                  >
                    <button
                      onClick={() => {
                        setShowCreateModal(false);
                        resetForm();
                      }}
                      className="flex-1 px-6 py-3 bg-gradient-to-br from-[#2D2D2D] to-[#242424] hover:from-[#3A3A3A] hover:to-[#2D2D2D] text-[#E5E5E5] font-semibold rounded-xl border border-[#3A3A3A]/50 transition-all duration-300 shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/20"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreate}
                      disabled={!titleId || !remindAt || channels.length === 0 || createMutation.isPending}
                      className="relative group/btn flex-1 px-6 py-3 bg-gradient-to-br from-[#F0F0F0] to-[#E5E5E5] hover:from-[#FFFFFF] hover:to-[#F0F0F0] disabled:from-[#3A3A3A] disabled:to-[#2D2D2D] disabled:cursor-not-allowed text-[#0F0F0F] disabled:text-[#808080] font-bold rounded-xl transition-all duration-300 shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 disabled:shadow-none overflow-hidden"
                    >
                      {/* Shimmer effect */}
                      {!(!titleId || !remindAt || channels.length === 0 || createMutation.isPending) && (
                        <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                      )}
                      <span className="relative">
                        {createMutation.isPending ? "Creating..." : "Create Reminder"}
                      </span>
                    </button>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Dialog */}
        <ConfirmDialog
          isOpen={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
            setSelectedReminder(null);
          }}
          onConfirm={handleDelete}
          title="Delete Reminder?"
          message={`Are you sure you want to delete the reminder for "${selectedReminder?.title_name}"?`}
          confirmText="Delete"
          variant="danger"
          isLoading={deleteMutation.isPending}
        />

        {/* Bottom Spacing */}
        <div className="h-12" />
      </div>
    </SettingsLayout>
  );
}
