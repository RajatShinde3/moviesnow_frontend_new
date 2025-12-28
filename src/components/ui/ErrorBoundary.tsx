"use client";

import { Component, type ReactNode } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCcw, Home, Bug } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Enhanced Error Boundary Component
 *
 * Features:
 * - Beautiful error UI with glassmorphism
 * - Automatic error reporting
 * - Retry functionality
 * - Error details (dev mode)
 * - Navigation options
 * - Smooth animations
 *
 * @example
 * ```tsx
 * <ErrorBoundary onError={(error) => console.error(error)}>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // TODO: Send error to error reporting service (Sentry, etc.)
    // Example: Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = "/home";
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950/20 to-slate-950 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="max-w-2xl w-full"
          >
            {/* Error Card */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-red-700/50 rounded-2xl overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="bg-gradient-to-r from-red-900/40 to-red-800/40 p-6 border-b border-red-700/30">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-red-500/20 border-2 border-red-500/50 flex items-center justify-center">
                    <AlertTriangle className="w-7 h-7 text-red-400" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">
                      Oops! Something went wrong
                    </h1>
                    <p className="text-red-300 text-sm mt-1">
                      Don't worry, we're on it!
                    </p>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              <div className="p-6 space-y-4">
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <p className="text-slate-300 leading-relaxed">
                    {this.state.error?.message ||
                      "An unexpected error occurred while loading this page."}
                  </p>
                </div>

                {/* Error Details (Development Mode) */}
                {process.env.NODE_ENV === "development" && this.state.errorInfo && (
                  <details className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
                    <summary className="cursor-pointer text-slate-400 hover:text-slate-300 transition-colors flex items-center gap-2">
                      <Bug className="w-4 h-4" />
                      <span className="font-medium">Error Details (Dev Mode)</span>
                    </summary>
                    <div className="mt-4 space-y-2">
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                          Stack Trace:
                        </p>
                        <pre className="text-xs text-red-400 bg-slate-950 p-3 rounded overflow-x-auto">
                          {this.state.error?.stack}
                        </pre>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                          Component Stack:
                        </p>
                        <pre className="text-xs text-slate-400 bg-slate-950 p-3 rounded overflow-x-auto">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    </div>
                  </details>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={this.handleReset}
                    className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-medium rounded-lg transition-all duration-200 shadow-lg shadow-emerald-500/30"
                  >
                    <RefreshCcw className="w-4 h-4" />
                    Try Again
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={this.handleGoHome}
                    className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-all duration-200"
                  >
                    <Home className="w-4 h-4" />
                    Go Home
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={this.handleReload}
                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium rounded-lg transition-all duration-200 border border-slate-700"
                  >
                    Reload Page
                  </motion.button>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-slate-800/30 px-6 py-4 border-t border-slate-700/30">
                <p className="text-xs text-slate-500 text-center">
                  If this problem persists, please{" "}
                  <a href="/help" className="text-emerald-400 hover:text-emerald-300 underline">
                    contact support
                  </a>{" "}
                  with the error details above.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-based Error Boundary Wrapper
 *
 * @example
 * ```tsx
 * <ErrorBoundaryWrapper>
 *   <YourComponent />
 * </ErrorBoundaryWrapper>
 * ```
 */
export function ErrorBoundaryWrapper({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // TODO: Send to error tracking service
        console.error("Application Error:", {
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
        });
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
