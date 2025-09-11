"use client";

/**
 * PasswordStrength
 * =============================================================================
 * Lightweight, dependency-free password strength indicator for production use.
 * Designed to plug directly into `<PasswordField renderStrength/>`.
 *
 * What’s new (future-proofing)
 * -----------------------------------------------------------------------------
 * • Smarter scoring: ascending/descending sequences, keyboard rows (qwerty/asdf/zxcv),
 *   repeated substrings (e.g., "abcabc"), and simple leet (p@ssw0rd → password).
 * • Extensible checks: pass `userInputs` (name/email) and `blockList` to penalize matches.
 * • Policy helpers: `meetsPolicy(minScore)` and `policyMinScore` prop for gating UI.
 * • A11y: proper meter semantics (`role="meter"` with aria values), live label, data attributes.
 * • i18n: override strength labels & criteria labels via props (stable defaults kept).
 *
 * Security note
 * -----------------------------------------------------------------------------
 * This is a client-side heuristic for UX. Enforce the real policy server-side.
 */

import * as React from "react";
import { cn } from "@/lib/cn";

/* -----------------------------------------------------------------------------
 * Types
 * ---------------------------------------------------------------------------*/

export type Score = 0 | 1 | 2 | 3 | 4;

export type StrengthResult = {
  score: Score;
  label: "Very weak" | "Weak" | "Fair" | "Strong" | "Very strong";
  entropy: number; // bits (approx)
  checks: {
    lengthOK: boolean;
    hasLower: boolean;
    hasUpper: boolean;
    hasDigit: boolean;
    hasSymbol: boolean;
    noRepeatRuns: boolean;
    noSequences: boolean;
    noKeyboardRuns: boolean;
    noRepeatSubstrings: boolean;
    notCommon: boolean;
    notInUserInputs: boolean;
  };
  /** Actionable hints to display to the user. */
  suggestions: string[];
};

export type PasswordStrengthProps = {
  /** The password to evaluate. */
  value: string;
  /** Minimum acceptable length (affects hints/penalties). Default: 8. */
  minLength?: number;
  /** Optional additional strings that should not appear in the password (e.g., name/email). */
  userInputs?: string[];
  /** Extra blocked passwords (lowercased, plain or common leet). */
  blockList?: string[];
  /** If provided, called whenever the score changes. */
  onScoreChange?: (score: Score, result: StrengthResult) => void;
  /** Hide the checklist; render only the meter + label. */
  compact?: boolean;
  /** Gate UI with a minimum acceptable score (0-4). Adds a hint if not met. */
  policyMinScore?: Score;
  /** i18n: override strength labels per score. */
  labels?: Partial<Record<Score, string>>;
  /** i18n: override checklist text. */
  criteriaLabels?: Partial<{
    length: string;
    lower: string;
    upper: string;
    digit: string;
    symbol: string;
  }>;
  /** Class names. */
  className?: string;
  meterClassName?: string;
  checklistClassName?: string;
};

/* -----------------------------------------------------------------------------
 * Baselines & utilities
 * ---------------------------------------------------------------------------*/

const DEFAULT_LABELS: Record<Score, StrengthResult["label"]> = {
  0: "Very weak",
  1: "Weak",
  2: "Fair",
  3: "Strong",
  4: "Very strong",
};

const DEFAULT_CRITERIA_LABELS = {
  length: "≥ {n} chars",
  lower: "lowercase",
  upper: "uppercase",
  digit: "number",
  symbol: "symbol",
};

const COMMON_PASSWORDS = new Set([
  "123456",
  "123456789",
  "qwerty",
  "password",
  "111111",
  "12345678",
  "abc123",
  "password1",
  "iloveyou",
  "admin",
]);

const LOWER = /[a-z]/;
const UPPER = /[A-Z]/;
const DIGIT = /\d/;
const SYMBOL = /[^A-Za-z0-9]/;

const KEYBOARD_ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];

/** Simple leet map used before common/user-input checks. */
const LEET: Record<string, string> = {
  "0": "o",
  "1": "l",
  "3": "e",
  "4": "a",
  "5": "s",
  "7": "t",
  "@": "a",
  "$": "s",
  "!": "i",
};

/** Normalize a string for dictionary-ish comparisons. */
function normalizeForDict(s: string): string {
  const lower = s.toLowerCase();
  return lower
    .split("")
    .map((ch) => LEET[ch] ?? ch)
    .join("");
}

/** Detects 3+ repeated characters (e.g., "aaa", "!!!!"). */
function hasLongRepeatRun(s: string): boolean {
  return /(.)\1\1/.test(s);
}

/** Detect repeated short substrings (e.g., "abcabc", "ababab"). */
function hasRepeatSubstrings(s: string): boolean {
  if (s.length < 6) return false;
  for (let size = 2; size <= 3; size++) {
    const chunk = s.slice(0, size);
    if (chunk.repeat(Math.floor(s.length / size)).includes(s)) return true;
  }
  return false;
}

/** Detect simple ascending/descending sequences like "abc", "CBA", "1234" (3+). */
function hasSimpleSequence(s: string): boolean {
  if (s.length < 3) return false;
  const inc = "abcdefghijklmnopqrstuvwxyz";
  const INC = inc.toUpperCase();
  const nums = "0123456789";
  const dec = [...inc].reverse().join("");
  const DEC = dec.toUpperCase();
  const numsDec = [...nums].reverse().join("");

  const pools = [inc, INC, nums, dec, DEC, numsDec];
  for (let i = 0; i <= s.length - 3; i++) {
    const tri = s.slice(i, i + 3);
    if (pools.some((p) => p.includes(tri))) return true;
  }
  return false;
}

/** Detect adjacent keyboard sequences (qwerty rows), asc or desc (3+). */
function hasKeyboardRun(s: string): boolean {
  if (s.length < 3) return false;
  const rows = KEYBOARD_ROWS;
  const rowsRev = rows.map((r) => [...r].reverse().join(""));
  const pools = [...rows, ...rowsRev, ...rows.map((r) => r.toUpperCase()), ...rowsRev.map((r) => r.toUpperCase())];
  for (let i = 0; i <= s.length - 3; i++) {
    const tri = s.slice(i, i + 3);
    if (pools.some((p) => p.includes(tri))) return true;
  }
  return false;
}

/** Approximate entropy in bits assuming union of character sets used. */
function estimateEntropyBits(s: string): number {
  let charset = 0;
  if (LOWER.test(s)) charset += 26;
  if (UPPER.test(s)) charset += 26;
  if (DIGIT.test(s)) charset += 10;
  if (SYMBOL.test(s)) charset += 33; // rough printable symbol bucket
  if (charset === 0) return 0;
  const bits = s.length * Math.log2(charset);
  return Math.round(bits * 10) / 10;
}

const clampScore = (n: number): Score => (n < 0 ? 0 : n > 4 ? 4 : (n as Score));
const minScore = (a: Score, b: Score): Score => (a <= b ? a : b);

/* -----------------------------------------------------------------------------
 * Public: computation & helpers
 * ---------------------------------------------------------------------------*/

export function computePasswordStrength(
  value: string,
  opts?: {
    minLength?: number;
    userInputs?: string[];
    blockList?: string[];
  }
): StrengthResult {
  const minLength = Math.max(1, opts?.minLength ?? 8);
  const normalized = normalizeForDict(value);

  const normalizedBlock = new Set<string>(
    (opts?.blockList ?? []).map((s) => normalizeForDict(s))
  );

  const userInputs = (opts?.userInputs ?? [])
    .filter(Boolean)
    .map((s) => normalizeForDict(s));

  const checks = {
    lengthOK: value.length >= minLength,
    hasLower: LOWER.test(value),
    hasUpper: UPPER.test(value),
    hasDigit: DIGIT.test(value),
    hasSymbol: SYMBOL.test(value),
    noRepeatRuns: !hasLongRepeatRun(value),
    noSequences: !hasSimpleSequence(value),
    noKeyboardRuns: !hasKeyboardRun(value),
    noRepeatSubstrings: !hasRepeatSubstrings(value),
    notCommon: !COMMON_PASSWORDS.has(normalized) && !normalizedBlock.has(normalized),
    notInUserInputs: !userInputs.some((u) => !!u && u.length >= 3 && normalized.includes(u)),
  };

  const entropy = estimateEntropyBits(value);

  // Base score by entropy buckets
  let score: Score =
    entropy >= 128 ? 4 :
    entropy >= 60  ? 3 :
    entropy >= 36  ? 2 :
    entropy >= 28  ? 1 : 0;

  // Enforce minimum length & common-password penalty
  if (!checks.lengthOK || !checks.notCommon) {
    score = minScore(score, 1);
  }

  // Penalize patterns and user input matches
  if (!checks.noRepeatRuns || !checks.noSequences || !checks.noKeyboardRuns || !checks.noRepeatSubstrings) {
    score = minScore(score, 2);
  }
  if (!checks.notInUserInputs) {
    score = minScore(score, 1);
  }

  // Variety boost for mid-tier entropy
  const varietyCount =
    (checks.hasLower ? 1 : 0) +
    (checks.hasUpper ? 1 : 0) +
    (checks.hasDigit ? 1 : 0) +
    (checks.hasSymbol ? 1 : 0);
  if (score === 2 && varietyCount >= 3 && value.length >= minLength + 2) {
    score = 3;
  }

  const label = DEFAULT_LABELS[score];

  const suggestions: string[] = [];
  if (!checks.lengthOK) suggestions.push(`Use at least ${minLength} characters.`);
  if (varietyCount < 3) suggestions.push("Mix upper/lowercase letters, numbers, and symbols.");
  if (!checks.noRepeatRuns) suggestions.push("Avoid long runs of the same character.");
  if (!checks.noRepeatSubstrings) suggestions.push("Avoid repeated patterns (e.g., abcabc).");
  if (!checks.noSequences) suggestions.push("Avoid obvious sequences (e.g., abc, 321).");
  if (!checks.noKeyboardRuns) suggestions.push("Avoid keyboard runs (e.g., qwe, asd).");
  if (!checks.notCommon) suggestions.push("Avoid common or breached passwords.");
  if (!checks.notInUserInputs) suggestions.push("Don’t include your name, email, or personal info.");
  if (score < 4 && value.length >= minLength) suggestions.push("Longer is stronger—aim for 12–16+ characters.");

  return { score, label, entropy, checks, suggestions };
}

/** Return true if the computed score meets a minimum policy. */
export function meetsPolicy(score: Score, min: Score = 3): boolean {
  return score >= min;
}

/** Map score to a utility class (or use in your theme). */
export function strengthToColor(score: Score): string {
  switch (score) {
    case 0: return "bg-red-500";
    case 1: return "bg-orange-500";
    case 2: return "bg-amber-500";
    case 3: return "bg-green-500";
    case 4: return "bg-emerald-600";
  }
}

/* -----------------------------------------------------------------------------
 * Component
 * ---------------------------------------------------------------------------*/

export default function PasswordStrength({
  value,
  minLength = 8,
  userInputs,
  blockList,
  onScoreChange,
  compact = false,
  policyMinScore,
  labels,
  criteriaLabels,
  className,
  meterClassName,
  checklistClassName,
}: PasswordStrengthProps) {
  const result = React.useMemo(
    () => computePasswordStrength(value, { minLength, userInputs, blockList }),
    [value, minLength, userInputs, blockList]
  );

  // Emit score changes (debounced by memoization above)
  const lastScoreRef = React.useRef<Score>(result.score);
  React.useEffect(() => {
    if (onScoreChange && result.score !== lastScoreRef.current) {
      lastScoreRef.current = result.score;
      onScoreChange(result.score, result);
    }
  }, [result.score, result, onScoreChange]);

  const { score, suggestions, checks } = result;

  // Meter colors by score
  const color = strengthToColor(score);
  const labelText =
    (labels?.[score] as StrengthResult["label"] | undefined) ?? DEFAULT_LABELS[score];

  const crit = {
    length: (criteriaLabels?.length ?? DEFAULT_CRITERIA_LABELS.length).replace("{n}", String(minLength)),
    lower: criteriaLabels?.lower ?? DEFAULT_CRITERIA_LABELS.lower,
    upper: criteriaLabels?.upper ?? DEFAULT_CRITERIA_LABELS.upper,
    digit: criteriaLabels?.digit ?? DEFAULT_CRITERIA_LABELS.digit,
    symbol: criteriaLabels?.symbol ?? DEFAULT_CRITERIA_LABELS.symbol,
  };

  // Policy gate hint
  const showPolicyHint =
    typeof policyMinScore === "number" && !meetsPolicy(score, policyMinScore);

  return (
    <div className={cn("select-none", className)} data-score={score}>
      {/* Meter */}
      <div className={cn("mb-1", meterClassName)}>
        <div
          role="meter"
          aria-valuemin={0}
          aria-valuemax={4}
          aria-valuenow={score}
          aria-label="Password strength"
          className="flex h-1.5 gap-1"
          data-score={score}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={cn("flex-1 rounded", i <= score - 1 ? color : "bg-gray-200")}
              aria-hidden="true"
            />
          ))}
        </div>
        <div className="mt-1 text-xs text-muted-foreground" aria-live="polite" aria-atomic="true">
          {labelText}
        </div>
        {showPolicyHint && (
          <div className="mt-0.5 text-[11px] text-amber-700">
            Choose a stronger password (minimum {policyMinScore} of 4).
          </div>
        )}
      </div>

      {/* Checklist & hints */}
      {!compact && (
        <div className={cn("space-y-1 text-xs", checklistClassName)}>
          <div className="flex flex-wrap gap-3">
            <Criterion ok={checks.lengthOK} text={crit.length} />
            <Criterion ok={checks.hasLower} text={crit.lower} />
            <Criterion ok={checks.hasUpper} text={crit.upper} />
            <Criterion ok={checks.hasDigit} text={crit.digit} />
            <Criterion ok={checks.hasSymbol} text={crit.symbol} />
          </div>

          {!!suggestions.length && (
            <ul className="mt-1 list-disc space-y-0.5 pl-4 text-muted-foreground">
              {suggestions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function Criterion({ ok, text }: { ok: boolean; text: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded px-2 py-0.5",
        ok ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"
      )}
      aria-label={`${text}: ${ok ? "ok" : "missing"}`}
    >
      <span aria-hidden="true">{ok ? "✓" : "•"}</span>
      {text}
    </span>
  );
}
