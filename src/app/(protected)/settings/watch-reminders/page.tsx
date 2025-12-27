"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
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
  Search,
  AlertCircle,
} from "lucide-react";
import { api } from "@/lib/api/services";
import { ConfirmDialog } from "@/components/ui/dialogs/ConfirmDialog";

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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<WatchReminder | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Form state
  const [titleId, setTitleId] = useState("");
  const [remindAt, setRemindAt] = useState("");
  const [channels, setChannels] = useState<("email" | "push" | "in_app")[]>(["email", "push"]);

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
      setShowCreateModal(false);
      resetForm();
    },
  });

  // Delete reminder mutation
  const deleteMutation = useMutation({
    mutationFn: (reminderId: string) => api.preferences.deleteWatchReminder(reminderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watch-reminders"] });
      setShowDeleteDialog(false);
      setSelectedReminder(null);
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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/20 to-slate-950 p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="h-8 w-64 bg-slate-800 animate-pulse rounded" />
          <div className="h-96 bg-slate-800 animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/20 to-slate-950 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Bell className="w-8 h-8 text-indigo-500" />
              Watch Reminders
            </h1>
            <p className="text-slate-400">
              Get notified when new episodes or movies are available to watch
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Reminder
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="bg-indigo-900/20 backdrop-blur-sm border border-indigo-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-indigo-400 text-sm">Active Reminders</span>
              <Bell className="w-5 h-5 text-indigo-500" />
            </div>
            <div className="text-3xl font-bold text-white">{activeReminders.length}</div>
          </div>

          <div className="bg-slate-900/20 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Past Reminders</span>
              <Clock className="w-5 h-5 text-slate-500" />
            </div>
            <div className="text-3xl font-bold text-white">{pastReminders.length}</div>
          </div>
        </motion.div>

        {/* Active Reminders */}
        {activeReminders.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-indigo-400" />
              Active Reminders
            </h2>

            <div className="space-y-3">
              {activeReminders.map((reminder, index) => (
                <motion.div
                  key={reminder.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-indigo-700/50 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Film className="w-5 h-5 text-indigo-400" />
                        <h3 className="text-lg font-semibold text-white">{reminder.title_name}</h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-300">
                            {new Date(reminder.remind_at).toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-slate-400" />
                          <div className="flex gap-2">
                            {reminder.notification_channels.map((channel) => {
                              const channelInfo = NOTIFICATION_CHANNELS.find(
                                (c) => c.value === channel
                              );
                              if (!channelInfo) return null;
                              const Icon = channelInfo.icon;
                              return (
                                <div
                                  key={channel}
                                  className="px-2 py-1 rounded text-xs"
                                  style={{
                                    backgroundColor: `${channelInfo.color}20`,
                                    color: channelInfo.color,
                                  }}
                                >
                                  <Icon className="w-3 h-3 inline mr-1" />
                                  {channelInfo.label}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedReminder(reminder);
                        setShowDeleteDialog(true);
                      }}
                      className="p-2 hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5 text-red-400" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-12 text-center"
          >
            <Bell className="w-16 h-16 mx-auto mb-4 text-slate-400" />
            <h3 className="text-xl font-semibold text-white mb-2">No Active Reminders</h3>
            <p className="text-slate-400 mb-6">
              Create reminders to get notified about new content you want to watch
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Your First Reminder
            </button>
          </motion.div>
        )}

        {/* Past Reminders */}
        {pastReminders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <XCircle className="w-6 h-6 text-slate-400" />
              Past Reminders
            </h2>

            <div className="space-y-3 opacity-60">
              {pastReminders.slice(0, 5).map((reminder, index) => (
                <div
                  key={reminder.id}
                  className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 flex items-center justify-between"
                >
                  <div>
                    <div className="text-white font-medium">{reminder.title_name}</div>
                    <div className="text-sm text-slate-400">
                      {new Date(reminder.remind_at).toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedReminder(reminder);
                      setShowDeleteDialog(true);
                    }}
                    className="p-2 hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              ))}
            </div>
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
                className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6"
              >
                <h2 className="text-2xl font-bold text-white mb-6">Create Watch Reminder</h2>

                <div className="space-y-6">
                  {/* Title ID Input */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Title ID
                    </label>
                    <input
                      type="text"
                      value={titleId}
                      onChange={(e) => setTitleId(e.target.value)}
                      placeholder="Enter title ID..."
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="mt-1 text-xs text-slate-400">
                      You can find the title ID in the URL when viewing content
                    </p>
                  </div>

                  {/* Remind At */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Remind Me At
                    </label>
                    <input
                      type="datetime-local"
                      value={remindAt}
                      onChange={(e) => setRemindAt(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Notification Channels */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Notification Channels
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {NOTIFICATION_CHANNELS.map((channel) => {
                        const Icon = channel.icon;
                        const isSelected = channels.includes(channel.value);
                        return (
                          <button
                            key={channel.value}
                            onClick={() => toggleChannel(channel.value)}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              isSelected
                                ? `border-[${channel.color}] bg-[${channel.color}]/20`
                                : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                            }`}
                            style={{
                              borderColor: isSelected ? channel.color : undefined,
                              backgroundColor: isSelected ? `${channel.color}20` : undefined,
                            }}
                          >
                            <Icon
                              className="w-6 h-6 mx-auto mb-2"
                              style={{ color: isSelected ? channel.color : "#94A3B8" }}
                            />
                            <div
                              className="text-sm font-medium"
                              style={{ color: isSelected ? channel.color : "white" }}
                            >
                              {channel.label}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {channels.length === 0 && (
                      <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        Please select at least one notification channel
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={!titleId || !remindAt || channels.length === 0 || createMutation.isPending}
                    className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    {createMutation.isPending ? "Creating..." : "Create Reminder"}
                  </button>
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
          confirmButtonClass="bg-red-600 hover:bg-red-500"
        />
      </div>
    </div>
  );
}
