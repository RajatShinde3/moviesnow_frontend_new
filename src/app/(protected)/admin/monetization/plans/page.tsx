"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign,
  Plus,
  Edit2,
  Trash2,
  Star,
  Check,
  X,
  Calendar,
  CreditCard,
  TrendingUp,
} from "lucide-react";
import { api } from "@/lib/api/services";
import type { SubscriptionPlan } from "@/lib/api/types";
import { ConfirmDialog } from "@/components/ui/data/ConfirmDialog";

export default function SubscriptionPlansPage() {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [deletePlanId, setDeletePlanId] = useState<string | null>(null);

  // Form state
  const [planName, setPlanName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [interval, setInterval] = useState<"month" | "year">("month");
  const [intervalCount, setIntervalCount] = useState("1");
  const [trialDays, setTrialDays] = useState("");
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState("");
  const [isPopular, setIsPopular] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Fetch plans
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["admin", "monetization", "plans"],
    queryFn: () => api.monetization.listPlans(),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: {
      name: string;
      description?: string;
      price: number;
      currency?: string;
      interval: "month" | "year";
      interval_count?: number;
      trial_period_days?: number;
      features?: string[];
      is_active?: boolean;
      is_popular?: boolean;
    }) => api.monetization.createPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "monetization", "plans"] });
      closeModal();
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: {
      planId: string;
      updates: {
        name?: string;
        description?: string;
        price?: number;
        trial_period_days?: number;
        features?: string[];
        is_active?: boolean;
        is_popular?: boolean;
      };
    }) => api.monetization.updatePlan(data.planId, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "monetization", "plans"] });
      closeModal();
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (planId: string) => api.monetization.deletePlan(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "monetization", "plans"] });
      setDeletePlanId(null);
    },
  });

  const closeModal = () => {
    setIsCreateModalOpen(false);
    setEditingPlan(null);
    setPlanName("");
    setDescription("");
    setPrice("");
    setCurrency("USD");
    setInterval("month");
    setIntervalCount("1");
    setTrialDays("");
    setFeatures([]);
    setIsPopular(false);
    setIsActive(true);
  };

  const openEditModal = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setPlanName(plan.name);
    setDescription(plan.description || "");
    setPrice(plan.price.toString());
    setCurrency(plan.currency);
    setInterval(plan.interval);
    setIntervalCount(plan.interval_count.toString());
    setTrialDays(plan.trial_period_days?.toString() || "");
    setFeatures(plan.features || []);
    setIsPopular(plan.is_popular || false);
    setIsActive(plan.is_active);
    setIsCreateModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const planData = {
      name: planName,
      description: description || undefined,
      price: parseFloat(price),
      currency,
      interval,
      interval_count: parseInt(intervalCount),
      trial_period_days: trialDays ? parseInt(trialDays) : undefined,
      features: features.length > 0 ? features : undefined,
      is_active: isActive,
      is_popular: isPopular,
    };

    if (editingPlan) {
      updateMutation.mutate({ planId: editingPlan.id, updates: planData });
    } else {
      createMutation.mutate(planData);
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-green-950/20 to-slate-950 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-8 w-64 bg-slate-800 animate-pulse rounded" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-slate-800 animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-green-950/20 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-green-400" />
              Subscription Plans Manager
            </h1>
            <p className="text-slate-400">
              Manage subscription plans and pricing with Stripe integration
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg font-medium flex items-center gap-2 transition-all"
          >
            <Plus className="w-5 h-5" />
            Create Plan
          </button>
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 backdrop-blur-sm border border-green-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <CreditCard className="w-8 h-8 text-green-400" />
              <span className="text-3xl font-bold text-white">{plans.length}</span>
            </div>
            <p className="text-slate-400 text-sm">Total Plans</p>
          </div>

          <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 backdrop-blur-sm border border-blue-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-blue-400" />
              <span className="text-3xl font-bold text-white">
                {plans.filter((p) => p.is_active).length}
              </span>
            </div>
            <p className="text-slate-400 text-sm">Active Plans</p>
          </div>

          <div className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 backdrop-blur-sm border border-amber-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Star className="w-8 h-8 text-amber-400" />
              <span className="text-3xl font-bold text-white">
                {plans.filter((p) => p.is_popular).length}
              </span>
            </div>
            <p className="text-slate-400 text-sm">Popular Plans</p>
          </div>

          <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-sm border border-purple-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-8 h-8 text-purple-400" />
              <span className="text-3xl font-bold text-white">
                {plans.filter((p) => p.trial_period_days && p.trial_period_days > 0).length}
              </span>
            </div>
            <p className="text-slate-400 text-sm">With Trials</p>
          </div>
        </motion.div>

        {/* Plans Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className={`relative bg-slate-900/50 backdrop-blur-sm border rounded-xl p-6 hover:border-green-500/50 transition-all ${
                plan.is_popular
                  ? "border-green-500/50 ring-2 ring-green-500/20"
                  : "border-slate-700"
              }`}
            >
              {/* Popular Badge */}
              {plan.is_popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    POPULAR
                  </span>
                </div>
              )}

              {/* Status & Actions */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  {plan.is_active ? (
                    <span className="px-2 py-1 bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-medium rounded">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-slate-700/50 border border-slate-600 text-slate-400 text-xs font-medium rounded">
                      Inactive
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(plan)}
                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletePlanId(plan.id)}
                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Plan Name */}
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              {plan.description && (
                <p className="text-sm text-slate-400 mb-6">{plan.description}</p>
              )}

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">
                    {plan.currency === "USD" ? "$" : plan.currency}
                    {plan.price.toFixed(2)}
                  </span>
                  <span className="text-slate-400">
                    /{plan.interval_count > 1 ? `${plan.interval_count} ` : ""}
                    {plan.interval}
                    {plan.interval_count > 1 ? "s" : ""}
                  </span>
                </div>
                {plan.trial_period_days && plan.trial_period_days > 0 && (
                  <p className="text-sm text-green-400 mt-1">
                    {plan.trial_period_days}-day free trial
                  </p>
                )}
              </div>

              {/* Features */}
              {plan.features && plan.features.length > 0 && (
                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-300">{feature}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Stripe Info */}
              <div className="pt-4 border-t border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Stripe Price ID</span>
                  <span className="text-slate-500 font-mono">
                    {plan.stripe_price_id.slice(0, 12)}...
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Stripe Product ID</span>
                  <span className="text-slate-500 font-mono">
                    {plan.stripe_product_id.slice(0, 12)}...
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Create/Edit Modal */}
        <AnimatePresence>
          {isCreateModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
              onClick={closeModal}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 z-10">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">
                      {editingPlan ? "Edit" : "Create"} Subscription Plan
                    </h2>
                    <button
                      onClick={closeModal}
                      className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Plan Name & Description */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Plan Name *
                      </label>
                      <input
                        type="text"
                        value={planName}
                        onChange={(e) => setPlanName(e.target.value)}
                        required
                        placeholder="e.g., Premium Monthly"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Description
                      </label>
                      <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Brief description"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  {/* Price & Currency */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Price *
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="number"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          required
                          min="0"
                          step="0.01"
                          placeholder="9.99"
                          className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Currency
                      </label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="JPY">JPY</option>
                        <option value="INR">INR</option>
                      </select>
                    </div>
                  </div>

                  {/* Interval & Interval Count */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Billing Interval *
                      </label>
                      <select
                        value={interval}
                        onChange={(e) => setInterval(e.target.value as "month" | "year")}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="month">Monthly</option>
                        <option value="year">Yearly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Interval Count
                      </label>
                      <input
                        type="number"
                        value={intervalCount}
                        onChange={(e) => setIntervalCount(e.target.value)}
                        min="1"
                        placeholder="1"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <p className="mt-1 text-xs text-slate-500">
                        Bill every {intervalCount || "1"} {interval}
                        {(parseInt(intervalCount) || 1) > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  {/* Trial Period */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Trial Period (Days)
                    </label>
                    <input
                      type="number"
                      value={trialDays}
                      onChange={(e) => setTrialDays(e.target.value)}
                      min="0"
                      placeholder="e.g., 7, 14, 30"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  {/* Features */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Features
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                        placeholder="Add a feature..."
                        className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <button
                        type="button"
                        onClick={addFeature}
                        className="px-4 py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 rounded-lg transition-all"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    {features.length > 0 && (
                      <div className="space-y-2">
                        {features.map((feature, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-green-400" />
                              <span className="text-white">{feature}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFeature(idx)}
                              className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-red-400 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Toggles */}
                  <div className="grid grid-cols-2 gap-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="w-5 h-5 rounded border-slate-700 text-green-500 focus:ring-green-500"
                      />
                      <span className="text-white">Active Plan</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPopular}
                        onChange={(e) => setIsPopular(e.target.checked)}
                        className="w-5 h-5 rounded border-slate-700 text-green-500 focus:ring-green-500"
                      />
                      <span className="text-white">Mark as Popular</span>
                    </label>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={
                        !planName ||
                        !price ||
                        createMutation.isPending ||
                        updateMutation.isPending
                      }
                      className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {createMutation.isPending || updateMutation.isPending
                        ? "Saving..."
                        : editingPlan
                          ? "Update Plan"
                          : "Create Plan"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={deletePlanId !== null}
          onClose={() => setDeletePlanId(null)}
          onConfirm={() => deletePlanId && deleteMutation.mutate(deletePlanId)}
          title="Delete Subscription Plan"
          description="Are you sure you want to delete this plan? Users subscribed to this plan will need to be migrated. This action cannot be undone."
          confirmText="Delete Plan"
          isDestructive
        />
      </div>
    </div>
  );
}
