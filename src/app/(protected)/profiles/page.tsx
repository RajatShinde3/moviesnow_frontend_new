// app/(protected)/profiles/page.tsx
/**
 * =============================================================================
 * Profile Management - Multi-Profile Support
 * =============================================================================
 * Users can create and manage multiple viewing profiles
 */

"use client";

import * as React from "react";
import { api } from "@/lib/api/services";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { Plus, Edit, Trash2, User, Users } from "lucide-react";
import type { Profile } from "@/lib/api/types";

export default function ProfilesPage() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [editingProfile, setEditingProfile] = React.useState<Profile | null>(null);
  const [newProfileName, setNewProfileName] = React.useState("");
  const [newProfileAvatar, setNewProfileAvatar] = React.useState("");

  const { data: profiles, isLoading } = useQuery({
    queryKey: ["profiles"],
    queryFn: () => api.user.getProfiles(),
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; avatar_url?: string }) =>
      api.user.createProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      setIsCreateOpen(false);
      setNewProfileName("");
      setNewProfileAvatar("");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { name: string; avatar_url?: string };
    }) => api.profiles.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      setEditingProfile(null);
      setNewProfileName("");
      setNewProfileAvatar("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.profiles.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });

  const handleCreate = () => {
    if (!newProfileName.trim()) return;
    createMutation.mutate({
      name: newProfileName.trim(),
      avatar_url: newProfileAvatar || undefined,
    });
  };

  const handleUpdate = () => {
    if (!editingProfile || !newProfileName.trim()) return;
    updateMutation.mutate({
      id: editingProfile.id,
      data: {
        name: newProfileName.trim(),
        avatar_url: newProfileAvatar || undefined,
      },
    });
  };

  const handleDelete = (profile: Profile) => {
    if (confirm(`Are you sure you want to delete "${profile.name}"?`)) {
      deleteMutation.mutate(profile.id);
    }
  };

  const openCreateDialog = () => {
    setEditingProfile(null);
    setNewProfileName("");
    setNewProfileAvatar("");
    setIsCreateOpen(true);
  };

  const openEditDialog = (profile: Profile) => {
    setEditingProfile(profile);
    setNewProfileName(profile.name);
    setNewProfileAvatar(profile.avatar_url || "");
    setIsCreateOpen(true);
  };

  const avatarOptions = [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucy",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Max",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie",
  ];

  return (
    <div className="min-h-screen">
      <div className="space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-xl space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold">Who&apos;s watching?</h1>
            <p className="mt-2 text-muted-foreground">
              Manage profiles for personalized recommendations
            </p>
          </div>

          {/* Profiles Grid */}
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-48 animate-pulse rounded-lg bg-muted"
                />
              ))}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {/* Existing Profiles */}
              {profiles?.map((profile) => (
                <div
                  key={profile.id}
                  className="group relative flex flex-col items-center gap-4 rounded-lg border bg-card p-6 transition-all hover:border-primary"
                >
                  {/* Avatar */}
                  <div className="relative">
                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-muted bg-muted transition-all group-hover:border-primary">
                      {profile.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-12 w-12 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {/* Name */}
                  <div className="text-center">
                    <p className="font-medium">{profile.name}</p>
                    {profile.is_primary && (
                      <p className="mt-1 text-xs text-muted-foreground">Primary</p>
                    )}
                  </div>

                  {/* Actions */}
                  {!profile.is_primary && (
                    <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditDialog(profile)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(profile)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}

              {/* Add New Profile */}
              <button
                onClick={openCreateDialog}
                className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed bg-card p-6 transition-all hover:border-primary hover:bg-muted/50"
              >
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed bg-muted">
                  <Plus className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="font-medium">Add Profile</p>
              </button>
            </div>
          )}

          {/* Info */}
          <div className="rounded-lg border bg-muted/50 p-6">
            <div className="flex gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <h3 className="font-semibold">About Profiles</h3>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>• Create up to 5 profiles for different viewers</li>
                  <li>• Each profile has its own watchlist and recommendations</li>
                  <li>• Watch history is tracked separately per profile</li>
                  <li>• The primary profile cannot be deleted</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProfile ? "Edit Profile" : "Create Profile"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
          {/* Avatar Selection */}
          <div>
            <label className="mb-3 block text-sm font-medium">
              Choose an avatar
            </label>
            <div className="grid grid-cols-3 gap-3">
              {avatarOptions.map((avatar) => (
                <button
                  key={avatar}
                  onClick={() => setNewProfileAvatar(avatar)}
                  className={`overflow-hidden rounded-lg border-2 transition-all hover:border-primary ${
                    newProfileAvatar === avatar
                      ? "border-primary"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={avatar}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Name Input */}
          <div>
            <label className="mb-2 block text-sm font-medium">Profile Name</label>
            <Input
              value={newProfileName}
              onChange={(e) => setNewProfileName(e.target.value)}
              placeholder="Enter profile name"
              maxLength={20}
              autoFocus
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={editingProfile ? handleUpdate : handleCreate}
              disabled={
                !newProfileName.trim() ||
                createMutation.isPending ||
                updateMutation.isPending
              }
            >
              {editingProfile ? "Save Changes" : "Create Profile"}
            </Button>
          </div>
        </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
