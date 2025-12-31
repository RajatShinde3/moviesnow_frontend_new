"use client";

import * as React from "react";
import { useToast } from "@/components/feedback/Toasts";
import { useRecoveryCodesList } from "@/features/auth/useRecoveryCodesList";
import { useRecoveryCodesGenerate } from "@/features/auth/useRecoveryCodesGenerate";

// Custom SVG Icons
const ShieldIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const KeyIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
);

const EyeIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const CopyIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const DownloadIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const PrinterIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
);

const RefreshIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

const AlertTriangleIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const ArrowLeftIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const InfoIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const CheckCircleIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

type CodesState =
  | { status: "idle"; codes: string[] | null }
  | { status: "loading"; codes: string[] | null }
  | { status: "ready"; codes: string[] };

function extractCodes(res: any): string[] {
  if (Array.isArray(res)) return res.map((x) => String(x ?? ""));
  const arr = (res?.codes ?? res?.data ?? res?.items ?? []) as unknown;
  return Array.isArray(arr) ? arr.map((x) => String(x ?? "")) : [];
}

function isStepUpRequired(err: unknown): boolean {
  const e = err as any;
  return (
    (e && e.code === "need_step_up") ||
    (e && e.headers && (e.headers["x-reauth"] === "required" || e.headers["X-Reauth"] === "required"))
  );
}

export default function RecoveryCodesPage() {
  const toast = useToast();

  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [viewNeedsReauth, setViewNeedsReauth] = React.useState(false);
  const [state, setState] = React.useState<CodesState>({ status: "idle", codes: null });
  const [revealed, setRevealed] = React.useState(false);

  const { data: listData, error: listError, isFetching: isListing, refetch: refetchList } = useRecoveryCodesList();
  const listCodes = React.useCallback(async (..._args: any[]) => {
    const { data } = await refetchList();
    return (data ?? listData) as any;
  }, [refetchList, listData]);
  const { mutateAsync: generateCodes, isPending: isGenerating } = useRecoveryCodesGenerate();

  // Mask codes when the tab is hidden
  React.useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "hidden") setRevealed(false);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // Clear codes + remask on unmount
  React.useEffect(() => {
    return () => {
      setRevealed(false);
      setState({ status: "idle", codes: null });
    };
  }, []);

  // Global shortcut: when revealed, Cmd/Ctrl + C copies all
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.ctrlKey || e.metaKey;
      if (revealed && meta && (e.key === "c" || e.key === "C")) {
        e.preventDefault();
        void copyAll();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed, state]);

  // Initial load
  React.useEffect(() => {
    (async () => {
      setState((s) => ({ ...s, status: "loading" }));
      setErrorMsg(null);
      try {
        const res = await listCodes({} as any);
        const codes = extractCodes(res);
        setState({ status: "ready", codes });
        setViewNeedsReauth(false);
        setRevealed(false);
      } catch (err) {
        if (isStepUpRequired(err)) {
          setViewNeedsReauth(true);
          setState({ status: "idle", codes: null });
          setRevealed(false);
          return;
        }
        setErrorMsg("We couldn't load your recovery codes right now.");
        setState({ status: "idle", codes: null });
        setRevealed(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleRegenerate() {
    setErrorMsg(null);

    const ok = window.confirm(
      "Regenerate recovery codes?\n\nYour existing codes will stop working. Make sure to save the new set immediately."
    );
    if (!ok) return;

    try {
      const res = await generateCodes({} as any);
      const codes = extractCodes(res);
      setState({ status: "ready", codes });
      setRevealed(true);

      toast({
        variant: "success",
        title: "Recovery codes regenerated",
        description: "Save the new codes in a secure place.",
        duration: 2600,
      });
    } catch (err) {
      setErrorMsg("We couldn't regenerate your codes right now. Please try again.");
    }
  }

  async function copyAll() {
    const codes = state.codes ?? [];
    if (!codes.length || !revealed) return;

    const text = codes.join("\n");
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      toast({
        variant: "success",
        title: "Copied",
        description: "All recovery codes copied to clipboard.",
        duration: 1800,
      });
    } catch {
      setErrorMsg("Copy failed. Try selecting the codes and copy manually.");
    }
  }

  function downloadTxt() {
    const codes = state.codes ?? [];
    if (!codes.length || !revealed) return;

    const text = codes.join("\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "recovery-codes.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    toast({
      variant: "success",
      title: "Downloaded",
      description: "Recovery codes saved to recovery-codes.txt",
      duration: 1800,
    });
  }

  function printCodes() {
    const codes = state.codes ?? [];
    if (!codes.length || !revealed) return;

    const text = codes.join("\n");
    const w = window.open("", "print-recovery-codes", "width=600,height=800");
    if (!w) return;
    w.document.write(`
      <!doctype html>
      <title>Recovery codes</title>
      <meta charset="utf-8" />
      <style>
        body { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace; padding: 24px; background: #FAFAFA; }
        h1 { font-size: 20px; margin: 0 0 16px; font-weight: 700; color: #111; }
        pre { font-size: 14px; white-space: pre-wrap; word-break: break-word; background: white; padding: 16px; border-radius: 8px; border: 1px solid #E0E0E0; }
        .note { font-size: 12px; color: #666; margin-top: 16px; padding: 12px; background: #FFF3CD; border-radius: 6px; border: 1px solid #FFE69C; }
      </style>
      <h1>Recovery Codes - MoviesNow</h1>
      <pre>${text.replace(/</g, "&lt;")}</pre>
      <div class="note"><strong>Important:</strong> Keep these codes safe. Each code can be used only once. Store them in a secure location.</div>
    `);
    w.document.close();
    w.focus();
    w.print();
  }

  const isBusy = isListing || isGenerating || state.status === "loading";
  const hasCodes = state.status === "ready" && (state.codes?.length ?? 0) > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D0D0D] via-[#0A0A0A] to-[#050505] relative overflow-hidden">
      {/* Animated background blur orbs */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-full blur-3xl opacity-30 animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-[#151515] to-[#0A0A0A] rounded-full blur-3xl opacity-20 animate-pulse delay-1000" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        {/* Back link */}
        <a
          href="/settings/security"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#888888] hover:text-[#F0F0F0] transition-colors duration-200 mb-8 group"
        >
          <ArrowLeftIcon size={16} className="group-hover:-translate-x-1 transition-transform duration-200" />
          Back to Security
        </a>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="rounded-2xl bg-gradient-to-br from-[#222222] to-[#181818] p-4 border border-[#2F2F2F] shadow-2xl">
              <KeyIcon size={32} className="text-[#F0F0F0]" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-[#F0F0F0] tracking-tight">Recovery Codes</h1>
              <p className="text-base text-[#999999] mt-2 max-w-2xl">
                Recovery codes let you sign in if you lose access to your authenticator. Each code can be used once.
              </p>
            </div>
          </div>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mb-6 rounded-xl border border-[#EF4444]/30 bg-gradient-to-r from-[#2A1515] to-[#1F1010] p-5 shadow-2xl">
            <div className="flex items-start gap-3">
              <AlertTriangleIcon size={20} className="text-[#EF4444] flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-[#EF4444] mb-1">Error</h3>
                <p className="text-sm text-[#D0D0D0]">{errorMsg}</p>
              </div>
            </div>
          </div>
        )}

        {/* Reauth required notice */}
        {viewNeedsReauth && (
          <div className="rounded-2xl border border-[#2A2A2A] bg-gradient-to-br from-[#161616] to-[#111111] p-8 shadow-2xl mb-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="rounded-xl bg-gradient-to-br from-[#222222] to-[#181818] p-3 border border-[#2F2F2F] shadow-lg">
                <ShieldIcon size={24} className="text-[#F0F0F0]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#F0F0F0] mb-2">Confirm it's you</h3>
                <p className="text-sm text-[#999999] max-w-xl">
                  For your security, please confirm your identity to view recovery codes.
                </p>
              </div>
            </div>
            <button
              onClick={() => window.location.reload()}
              disabled={isListing}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#3A3A3A] via-[#323232] to-[#2A2A2A] text-[#F0F0F0] font-bold text-sm border border-[#444444] hover:border-[#555555] shadow-2xl hover:shadow-black/60 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
            >
              <span className="relative z-10">{isListing ? "Opening…" : "Confirm & view codes"}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </button>
          </div>
        )}

        {/* Loading state */}
        {!viewNeedsReauth && state.status !== "ready" && (
          <div className="rounded-2xl border border-[#2A2A2A] bg-gradient-to-br from-[#161616] to-[#111111] p-8 shadow-2xl text-center">
            <div className="text-sm text-[#888888]">
              {isBusy ? "Loading your recovery codes…" : "No codes to display."}
            </div>
          </div>
        )}

        {/* Codes panel */}
        {!viewNeedsReauth && state.status === "ready" && (
          <div className="space-y-6">
            {/* Security notice */}
            <div className="rounded-2xl border border-[#2A2A2A] bg-gradient-to-br from-[#1A1A1A] to-[#131313] p-6 shadow-2xl">
              <div className="flex items-start gap-4">
                <InfoIcon size={20} className="text-[#22C55E] flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-[#22C55E] mb-2">Important Security Information</h3>
                  <ul className="text-sm text-[#D0D0D0] space-y-1.5">
                    <li className="flex items-start gap-2">
                      <span className="text-[#22C55E] mt-1">•</span>
                      <span>Each recovery code can only be used <strong className="text-[#F0F0F0]">once</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#22C55E] mt-1">•</span>
                      <span>Store these codes in a <strong className="text-[#F0F0F0]">secure location</strong> (password manager, safe, etc.)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#22C55E] mt-1">•</span>
                      <span>Use these codes to regain access if you lose your authenticator device</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#22C55E] mt-1">•</span>
                      <span>Regenerating codes will <strong className="text-[#F0F0F0]">invalidate all existing codes</strong></span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Main codes card */}
            <div className="rounded-2xl border border-[#2A2A2A] bg-gradient-to-br from-[#161616] to-[#111111] p-8 shadow-2xl">
              {/* Header with actions */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8 pb-6 border-b border-[#222222]">
                <div>
                  <h2 className="text-xl font-bold text-[#F0F0F0] mb-2">Your Recovery Codes</h2>
                  <p className="text-sm text-[#888888]">
                    {hasCodes ? `You have ${state.codes?.length || 0} recovery codes available` : "No codes generated yet"}
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setRevealed((v) => !v)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#2A2A2A] to-[#222222] text-[#F0F0F0] font-bold text-sm border border-[#333333] hover:border-[#444444] shadow-lg hover:shadow-xl transition-all duration-300 group"
                  >
                    {revealed ? <EyeOffIcon size={16} className="group-hover:scale-110 transition-transform duration-200" /> : <EyeIcon size={16} className="group-hover:scale-110 transition-transform duration-200" />}
                    {revealed ? "Hide" : "Reveal"}
                  </button>
                  <button
                    onClick={copyAll}
                    disabled={!hasCodes || !revealed}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#2A2A2A] to-[#222222] text-[#F0F0F0] font-bold text-sm border border-[#333333] hover:border-[#444444] shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed group"
                  >
                    <CopyIcon size={16} className="group-hover:scale-110 transition-transform duration-200" />
                    Copy All
                  </button>
                  <button
                    onClick={downloadTxt}
                    disabled={!hasCodes || !revealed}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#2A2A2A] to-[#222222] text-[#F0F0F0] font-bold text-sm border border-[#333333] hover:border-[#444444] shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed group"
                  >
                    <DownloadIcon size={16} className="group-hover:scale-110 transition-transform duration-200" />
                    Download
                  </button>
                  <button
                    onClick={printCodes}
                    disabled={!hasCodes || !revealed}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#2A2A2A] to-[#222222] text-[#F0F0F0] font-bold text-sm border border-[#333333] hover:border-[#444444] shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed group"
                  >
                    <PrinterIcon size={16} className="group-hover:scale-110 transition-transform duration-200" />
                    Print
                  </button>
                </div>
              </div>

              {/* Codes grid or empty state */}
              {hasCodes ? (
                <div className="relative">
                  {!revealed && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-br from-[#161616]/95 to-[#111111]/95 backdrop-blur-md rounded-xl border border-[#2A2A2A]">
                      <div className="text-center p-8">
                        <EyeOffIcon size={48} className="text-[#666666] mx-auto mb-4" />
                        <p className="text-sm font-bold text-[#888888] mb-2">Codes hidden for security</p>
                        <p className="text-xs text-[#666666]">Click "Reveal" to view your recovery codes</p>
                      </div>
                    </div>
                  )}
                  <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${!revealed ? "blur-sm select-none" : ""}`}>
                    {state.codes!.map((code, i) => (
                      <div
                        key={`${code}-${i}`}
                        className="group relative rounded-xl border border-[#2A2A2A] bg-gradient-to-br from-[#1C1C1C] to-[#181818] p-5 hover:border-[#3A3A3A] transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-[#666666] uppercase tracking-wider">Code {i + 1}</span>
                          <CheckCircleIcon size={14} className="text-[#22C55E] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </div>
                        <code className="block font-mono text-base font-bold text-[#F0F0F0] tracking-wider break-all">
                          {code}
                        </code>
                      </div>
                    ))}
                  </div>

                  {revealed && (
                    <div className="mt-6 rounded-xl border border-[#2A2A2A] bg-gradient-to-r from-[#1A1A1A] to-[#151515] p-4">
                      <p className="text-xs text-[#888888] text-center">
                        <strong className="text-[#F0F0F0]">Tip:</strong> Press <kbd className="px-2 py-1 rounded bg-[#222222] border border-[#333333] text-[#F0F0F0] font-mono text-xs">Ctrl+C</kbd> or <kbd className="px-2 py-1 rounded bg-[#222222] border border-[#333333] text-[#F0F0F0] font-mono text-xs">⌘C</kbd> to copy all codes
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="rounded-2xl bg-gradient-to-br from-[#1A1A1A] to-[#131313] p-6 border border-[#2A2A2A] inline-block mb-6">
                    <KeyIcon size={48} className="text-[#666666] mx-auto" />
                  </div>
                  <h3 className="text-lg font-bold text-[#F0F0F0] mb-2">No Recovery Codes</h3>
                  <p className="text-sm text-[#888888] mb-6 max-w-md mx-auto">
                    Generate a new set of recovery codes to use in case you lose access to your authenticator app.
                  </p>
                  <button
                    onClick={handleRegenerate}
                    disabled={isGenerating}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#3A3A3A] via-[#323232] to-[#2A2A2A] text-[#F0F0F0] font-bold text-sm border border-[#444444] hover:border-[#555555] shadow-2xl hover:shadow-black/60 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                  >
                    <RefreshIcon size={16} className={isGenerating ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"} />
                    <span className="relative z-10">{isGenerating ? "Generating…" : "Generate Codes"}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </button>
                </div>
              )}
            </div>

            {/* Danger zone: Regenerate */}
            {hasCodes && (
              <div className="rounded-2xl border border-[#EF4444]/30 bg-gradient-to-br from-[#2A1515] to-[#1F1010] p-8 shadow-2xl">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-gradient-to-br from-[#3A1A1A] to-[#2A1010] p-3 border border-[#EF4444]/30 shadow-lg">
                      <AlertTriangleIcon size={24} className="text-[#EF4444]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#EF4444] mb-2">Regenerate Recovery Codes</h3>
                      <p className="text-sm text-[#D0D0D0] max-w-xl">
                        This will invalidate all your existing recovery codes immediately. Make sure to save the new codes in a secure location.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleRegenerate}
                    disabled={isGenerating}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#EF4444] via-[#DC2626] to-[#B91C1C] text-white font-bold text-sm border border-[#EF4444]/50 hover:border-[#EF4444] shadow-2xl hover:shadow-[#EF4444]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group flex-shrink-0"
                  >
                    <RefreshIcon size={16} className={isGenerating ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"} />
                    <span className="relative z-10">{isGenerating ? "Regenerating…" : "Regenerate Codes"}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
