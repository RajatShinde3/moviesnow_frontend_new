"use client";

/**
 * ConfirmDialog - Confirmation modal for destructive actions
 * Features:
 * - Warning/danger/info variants
 * - Custom actions
 * - Async confirmation support
 * - Keyboard shortcuts (Enter/Escape)
 * - Beautiful animations
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, Info, CheckCircle, XCircle, Loader2 } from "lucide-react";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "warning" | "danger" | "info" | "success";
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "warning",
  isLoading = false,
}: ConfirmDialogProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Confirmation error:", error);
    } finally {
      setIsConfirming(false);
    }
  };

  // Keyboard shortcuts
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "Enter" && !isConfirming) {
        handleConfirm();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isConfirming, onClose]);

  // Variant styles
  const variantStyles = {
    warning: {
      icon: AlertTriangle,
      iconColor: "text-amber-400",
      iconBg: "bg-amber-500/10",
      buttonColor: "bg-amber-600 hover:bg-amber-700",
    },
    danger: {
      icon: XCircle,
      iconColor: "text-red-400",
      iconBg: "bg-red-500/10",
      buttonColor: "bg-red-600 hover:bg-red-700",
    },
    info: {
      icon: Info,
      iconColor: "text-blue-400",
      iconBg: "bg-blue-500/10",
      buttonColor: "bg-blue-600 hover:bg-blue-700",
    },
    success: {
      icon: CheckCircle,
      iconColor: "text-green-400",
      iconBg: "bg-green-500/10",
      buttonColor: "bg-green-600 hover:bg-green-700",
    },
  };

  const style = variantStyles[variant];
  const Icon = style.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-start justify-between p-6 pb-4">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${style.iconBg}`}>
                    <Icon className={`w-6 h-6 ${style.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white">{title}</h2>
                    {description && (
                      <p className="mt-2 text-sm text-slate-400">{description}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 px-6 py-4 bg-slate-800/50 border-t border-slate-700">
                <button
                  onClick={onClose}
                  disabled={isConfirming || isLoading}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isConfirming || isLoading}
                  className={`flex-1 px-4 py-2 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${style.buttonColor}`}
                >
                  {(isConfirming || isLoading) && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  {confirmLabel}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ConfirmDialog;
