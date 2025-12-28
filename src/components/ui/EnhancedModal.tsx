"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { type ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";

/**
 * Enhanced Modal Component with Advanced Animations
 *
 * Features:
 * - Beautiful glassmorphism design
 * - Multiple sizes (sm, md, lg, xl, full)
 * - Smooth animations (fade, scale, slide)
 * - Backdrop blur
 * - Close on backdrop click
 * - Close on Escape key
 * - Scroll lock when open
 * - Keyboard accessible
 * - Portal rendering
 *
 * @example
 * ```tsx
 * <EnhancedModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Confirm Action"
 *   icon={AlertTriangle}
 * >
 *   <p>Are you sure?</p>
 * </EnhancedModal>
 * ```
 */

interface EnhancedModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  icon?: LucideIcon;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  animation?: "fade" | "scale" | "slideUp" | "slideDown";
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  footer?: ReactNode;
}

export function EnhancedModal({
  isOpen,
  onClose,
  children,
  title,
  icon: Icon,
  size = "md",
  animation = "scale",
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  className,
  headerClassName,
  bodyClassName,
  footerClassName,
  footer,
}: EnhancedModalProps) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose, closeOnEscape]);

  // Size styles
  const sizeStyles = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
    full: "max-w-[95vw] max-h-[95vh]",
  };

  // Animation variants
  const animations = {
    fade: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
      exit: { opacity: 0 },
    },
    scale: {
      hidden: { opacity: 0, scale: 0.9 },
      visible: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.9 },
    },
    slideUp: {
      hidden: { opacity: 0, y: 50 },
      visible: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 50 },
    },
    slideDown: {
      hidden: { opacity: 0, y: -50 },
      visible: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -50 },
    },
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? "modal-title" : undefined}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeOnBackdrop ? onClose : undefined}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            variants={animations[animation]}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "relative w-full bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden",
              sizeStyles[size],
              className
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {(title || Icon || showCloseButton) && (
              <div
                className={cn(
                  "flex items-center justify-between p-6 border-b border-slate-700/50 bg-slate-800/30",
                  headerClassName
                )}
              >
                <div className="flex items-center gap-3">
                  {Icon && (
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-emerald-400" />
                    </div>
                  )}
                  {title && (
                    <h2
                      id="modal-title"
                      className="text-xl font-bold text-white"
                    >
                      {title}
                    </h2>
                  )}
                </div>

                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white transition-all duration-200 flex items-center justify-center"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}

            {/* Body */}
            <div className={cn("p-6 overflow-y-auto max-h-[70vh]", bodyClassName)}>
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div
                className={cn(
                  "p-6 border-t border-slate-700/50 bg-slate-800/30",
                  footerClassName
                )}
              >
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  // Render in portal
  if (typeof window === "undefined") return null;
  return createPortal(modalContent, document.body);
}

/**
 * Confirm Dialog Component (specialized modal)
 */
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "info",
  isLoading = false,
}: ConfirmDialogProps) {
  const icons = {
    danger: require("lucide-react").AlertTriangle,
    warning: require("lucide-react").AlertCircle,
    info: require("lucide-react").Info,
  };

  const Icon = icons[variant];

  const handleConfirm = () => {
    onConfirm();
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <EnhancedModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon={Icon}
      size="sm"
      footer={
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={cn(
              "px-6 py-3 font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2",
              variant === "danger" && "bg-red-600 hover:bg-red-500 text-white",
              variant === "warning" && "bg-amber-600 hover:bg-amber-500 text-white",
              variant === "info" && "bg-emerald-600 hover:bg-emerald-500 text-white"
            )}
          >
            {isLoading && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
              />
            )}
            {confirmText}
          </button>
        </div>
      }
    >
      <div className="text-slate-300 leading-relaxed">
        {typeof message === "string" ? <p>{message}</p> : message}
      </div>
    </EnhancedModal>
  );
}

/**
 * Drawer Component (slide-in from side)
 */
interface DrawerProps extends Omit<EnhancedModalProps, "animation" | "size"> {
  position?: "left" | "right";
  width?: string;
}

export function Drawer({
  isOpen,
  onClose,
  children,
  position = "right",
  width = "400px",
  className,
  ...props
}: DrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const drawerContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: position === "right" ? "100%" : "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: position === "right" ? "100%" : "-100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={cn(
              "absolute top-0 bottom-0 bg-slate-900 border-slate-700/50 shadow-2xl",
              position === "right" ? "right-0 border-l" : "left-0 border-r",
              className
            )}
            style={{ width }}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (typeof window === "undefined") return null;
  return createPortal(drawerContent, document.body);
}
