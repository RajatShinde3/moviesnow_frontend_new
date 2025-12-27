"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Ticket,
  Plus,
  Edit2,
  Trash2,
  Copy,
  CheckCircle,
  X,
  Calendar,
  Percent,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { api } from "@/lib/api/services";
import type { Coupon } from "@/lib/api/types";
import { DataTable } from "@/components/ui/data/DataTable";
import { ConfirmDialog } from "@/components/ui/data/ConfirmDialog";

export default function CouponsPage() {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deleteCouponId, setDeleteCouponId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form state
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [maxUses, setMaxUses] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [appliesToPlans, setAppliesToPlans] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);

  // Fetch coupons
  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ["admin", "monetization", "coupons"],
    queryFn: () => api.monetization.listCoupons(),
  });

  // Fetch plans for selection
  const { data: plans = [] } = useQuery({
    queryKey: ["admin", "monetization", "plans"],
    queryFn: () => api.monetization.listPlans(),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: {
      code: string;
      discount_type: "percentage" | "fixed";
      discount_value: number;
      currency?: string;
      max_uses?: number;
      valid_from?: string;
      expires_at?: string;
      applies_to_plans?: string[];
      is_active?: boolean;
    }) => api.monetization.createCoupon(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "monetization", "coupons"] });
      closeModal();
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: {
      couponId: string;
      updates: {
        discount_value?: number;
        max_uses?: number;
        valid_from?: string;
        expires_at?: string;
        applies_to_plans?: string[];
        is_active?: boolean;
      };
    }) => api.monetization.updateCoupon(data.couponId, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "monetization", "coupons"] });
      closeModal();
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (couponId: string) => api.monetization.deleteCoupon(couponId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "monetization", "coupons"] });
      setDeleteCouponId(null);
    },
  });

  const closeModal = () => {
    setIsCreateModalOpen(false);
    setEditingCoupon(null);
    setCode("");
    setDiscountType("percentage");
    setDiscountValue("");
    setCurrency("USD");
    setMaxUses("");
    setValidFrom("");
    setExpiresAt("");
    setAppliesToPlans([]);
    setIsActive(true);
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setCode(coupon.code);
    setDiscountType(coupon.discount_type);
    setDiscountValue(coupon.discount_value.toString());
    setCurrency(coupon.currency || "USD");
    setMaxUses(coupon.max_uses?.toString() || "");
    setValidFrom(coupon.valid_from || "");
    setExpiresAt(coupon.expires_at || "");
    setAppliesToPlans(coupon.applies_to_plans || []);
    setIsActive(coupon.is_active);
    setIsCreateModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const couponData = {
      code: code.toUpperCase(),
      discount_type: discountType,
      discount_value: parseFloat(discountValue),
      currency: discountType === "fixed" ? currency : undefined,
      max_uses: maxUses ? parseInt(maxUses) : undefined,
      valid_from: validFrom || undefined,
      expires_at: expiresAt || undefined,
      applies_to_plans: appliesToPlans.length > 0 ? appliesToPlans : undefined,
      is_active: isActive,
    };

    if (editingCoupon) {
      const { code, discount_type, ...updates } = couponData;
      updateMutation.mutate({ couponId: editingCoupon.id, updates });
    } else {
      createMutation.mutate(couponData);
    }
  };

  const togglePlan = (planId: string) => {
    setAppliesToPlans((prev) =>
      prev.includes(planId) ? prev.filter((id) => id !== planId) : [...prev, planId]
    );
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const generateRandomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCode(result);
  };

  // Calculate stats
  const activeCoupons = coupons.filter((c) => c.is_active);
  const totalUses = coupons.reduce((sum, c) => sum + c.current_uses, 0);
  const expiringSoon = coupons.filter((c) => {
    if (!c.expires_at) return false;
    const daysUntilExpiry = Math.ceil(
      (new Date(c.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry > 0 && daysUntilExpiry <= 7;
  }).length;

  // DataTable columns
  const columns = [
    {
      header: "Code",
      accessor: "code" as keyof Coupon,
      cell: (value: any, row: Coupon) => (
        <div className="flex items-center gap-2">
          <code className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-400 font-mono font-bold rounded">
            {value}
          </code>
          <button
            onClick={() => copyToClipboard(value)}
            className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
          >
            {copiedCode === value ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      ),
    },
    {
      header: "Discount",
      accessor: "discount_value" as keyof Coupon,
      cell: (value: any, row: Coupon) => (
        <div className="flex items-center gap-2">
          {row.discount_type === "percentage" ? (
            <>
              <Percent className="w-4 h-4 text-green-400" />
              <span className="text-white font-bold">{value}%</span>
            </>
          ) : (
            <>
              <DollarSign className="w-4 h-4 text-green-400" />
              <span className="text-white font-bold">
                {row.currency} {value}
              </span>
            </>
          )}
        </div>
      ),
    },
    {
      header: "Uses",
      accessor: "current_uses" as keyof Coupon,
      cell: (value: any, row: Coupon) => (
        <span className="text-white">
          {value} {row.max_uses ? `/ ${row.max_uses}` : "/ ∞"}
        </span>
      ),
    },
    {
      header: "Expires",
      accessor: "expires_at" as keyof Coupon,
      cell: (value: any) => {
        if (!value) return <span className="text-slate-400">Never</span>;
        const isExpired = new Date(value) < new Date();
        const daysUntil = Math.ceil((new Date(value).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return (
          <div>
            <div className={isExpired ? "text-red-400" : "text-white"}>
              {new Date(value).toLocaleDateString()}
            </div>
            {!isExpired && daysUntil <= 7 && (
              <div className="text-xs text-amber-400">Expires in {daysUntil}d</div>
            )}
          </div>
        );
      },
    },
    {
      header: "Status",
      accessor: "is_active" as keyof Coupon,
      cell: (value: any) =>
        value ? (
          <span className="px-2 py-1 bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-medium rounded">
            Active
          </span>
        ) : (
          <span className="px-2 py-1 bg-slate-700/50 border border-slate-600 text-slate-400 text-xs font-medium rounded">
            Inactive
          </span>
        ),
    },
    {
      header: "Actions",
      accessor: "id" as keyof Coupon,
      cell: (value: any, row: Coupon) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEditModal(row)}
            className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteCouponId(value.toString())}
            className="p-2 hover:bg-red-900/20 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-8 w-64 bg-slate-800 animate-pulse rounded" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-slate-800 animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Ticket className="w-8 h-8 text-purple-400" />
              Coupon Manager
            </h1>
            <p className="text-slate-400">
              Create and manage discount coupons for subscriptions
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-medium flex items-center gap-2 transition-all"
          >
            <Plus className="w-5 h-5" />
            Create Coupon
          </button>
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-sm border border-purple-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Ticket className="w-8 h-8 text-purple-400" />
              <span className="text-3xl font-bold text-white">{coupons.length}</span>
            </div>
            <p className="text-slate-400 text-sm">Total Coupons</p>
          </div>

          <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 backdrop-blur-sm border border-green-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <span className="text-3xl font-bold text-white">{activeCoupons.length}</span>
            </div>
            <p className="text-slate-400 text-sm">Active Coupons</p>
          </div>

          <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 backdrop-blur-sm border border-blue-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-blue-400" />
              <span className="text-3xl font-bold text-white">{totalUses}</span>
            </div>
            <p className="text-slate-400 text-sm">Total Redemptions</p>
          </div>

          <div className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 backdrop-blur-sm border border-amber-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-8 h-8 text-amber-400" />
              <span className="text-3xl font-bold text-white">{expiringSoon}</span>
            </div>
            <p className="text-slate-400 text-sm">Expiring Soon</p>
          </div>
        </motion.div>

        {/* Coupons Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden"
        >
          <DataTable
            data={coupons}
            columns={columns}
            searchable
            searchPlaceholder="Search by code..."
            emptyMessage="No coupons found"
          />
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
                      {editingCoupon ? "Edit" : "Create"} Coupon
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
                  {/* Coupon Code */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Coupon Code *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        required
                        disabled={!!editingCoupon}
                        placeholder="e.g., SUMMER2024"
                        className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono uppercase disabled:opacity-50"
                      />
                      {!editingCoupon && (
                        <button
                          type="button"
                          onClick={generateRandomCode}
                          className="px-4 py-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-400 rounded-lg transition-all"
                        >
                          Generate
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Discount Type & Value */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Discount Type *
                      </label>
                      <select
                        value={discountType}
                        onChange={(e) => setDiscountType(e.target.value as any)}
                        disabled={!!editingCoupon}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount ($)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Discount Value *
                      </label>
                      <div className="relative">
                        {discountType === "percentage" ? (
                          <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        ) : (
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        )}
                        <input
                          type="number"
                          value={discountValue}
                          onChange={(e) => setDiscountValue(e.target.value)}
                          required
                          min="0"
                          max={discountType === "percentage" ? "100" : undefined}
                          step={discountType === "percentage" ? "1" : "0.01"}
                          placeholder={discountType === "percentage" ? "e.g., 20" : "e.g., 10.00"}
                          className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Currency (for fixed discounts) */}
                  {discountType === "fixed" && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Currency
                      </label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="JPY">JPY</option>
                        <option value="INR">INR</option>
                      </select>
                    </div>
                  )}

                  {/* Max Uses */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Max Uses (Optional)
                    </label>
                    <input
                      type="number"
                      value={maxUses}
                      onChange={(e) => setMaxUses(e.target.value)}
                      min="1"
                      placeholder="Leave empty for unlimited"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Valid From & Expires At */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Valid From (Optional)
                      </label>
                      <input
                        type="date"
                        value={validFrom}
                        onChange={(e) => setValidFrom(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Expires At (Optional)
                      </label>
                      <input
                        type="date"
                        value={expiresAt}
                        onChange={(e) => setExpiresAt(e.target.value)}
                        min={validFrom || undefined}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  {/* Applies to Plans */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Applies to Plans (Optional - Leave empty for all plans)
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {plans.map((plan) => (
                        <button
                          key={plan.id}
                          type="button"
                          onClick={() => togglePlan(plan.id)}
                          className={`p-3 rounded-lg border text-left transition-all ${
                            appliesToPlans.includes(plan.id)
                              ? "border-purple-500 bg-purple-500/10"
                              : "border-slate-700 hover:border-slate-600"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-white font-medium">{plan.name}</div>
                              <div className="text-sm text-slate-400">
                                ${plan.price}/{plan.interval}
                              </div>
                            </div>
                            {appliesToPlans.includes(plan.id) && (
                              <CheckCircle className="w-5 h-5 text-purple-400" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Active Toggle */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-700 text-purple-500 focus:ring-purple-500"
                    />
                    <span className="text-white">Active Coupon</span>
                  </label>

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
                        !code ||
                        !discountValue ||
                        createMutation.isPending ||
                        updateMutation.isPending
                      }
                      className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {createMutation.isPending || updateMutation.isPending
                        ? "Saving..."
                        : editingCoupon
                          ? "Update Coupon"
                          : "Create Coupon"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={deleteCouponId !== null}
          onClose={() => setDeleteCouponId(null)}
          onConfirm={() => deleteCouponId && deleteMutation.mutate(deleteCouponId)}
          title="Delete Coupon"
          description="Are you sure you want to delete this coupon? Users will no longer be able to redeem it. This action cannot be undone."
          confirmText="Delete Coupon"
          isDestructive
        />
      </div>
    </div>
  );
}
