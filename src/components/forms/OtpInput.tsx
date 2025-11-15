"use client";

/**
 * OtpInput
 * =============================================================================
 * Accessible, production-grade One-Time-Passcode (OTP) / verification code input.
 *
 * FEATURES
 * - Fixed-length multi-cell input (default length=6).
 * - Controlled or uncontrolled:
 *     • Controlled: pass `value` + `onChange(value)` (single string).
 *     • Uncontrolled: pass `defaultValue` (internal state managed).
 * - UX niceties:
 *     • Auto-advance; Backspace to go back; ←/→; Home/End; Delete behavior.
 *     • Smart paste: pastes entire code and distributes across cells.
 *     • Numeric keypad by default (`inputMode="numeric"`, pattern, filtering).
 *     • Focus selects current character for quick replacement.
 *     • IME-safe: defers filtering while composing (CJK, etc.).
 * - a11y:
 *     • Group semantics with an `aria-label`.
 *     • Custom per-cell label via `cellAriaLabel(index, length)`.
 * - Forms:
 *     • Optional hidden `<input name="…">` carrying the joined value.
 * - Orchestration:
 *     • Imperative handle via forwardRef: `focus`, `blur`, `clear`, `setValue`, `getValue`.
 *
 * SECURITY
 * - No values are logged. For masking, set `type="password"`.
 */

import * as React from "react";
import { cn } from "@/lib/cn";

export type OtpInputHandle = {
  /** Focus a specific cell (default first empty). */
  focus: (index?: number) => void;
  /** Blur the currently focused cell (if any). */
  blur: () => void;
  /** Programmatically clear the code (calls onChange). */
  clear: () => void;
  /** Programmatically set a full code (sanitized to length). */
  setValue: (v: string) => void;
  /** Read the current full value. */
  getValue: () => string;
};

export type OtpInputProps = {
  /** Optional id for the OTP group container. */
  id?: string;
  /** Number of code cells. */
  length?: number;

  /** Controlled value (single string). */
  value?: string;
  /** Uncontrolled initial value. Ignored when `value` is provided. */
  defaultValue?: string;

  /** Called on any change (joined string). */
  onChange?: (value: string) => void;
  /** Called once when all digits are filled (first transition to full). */
  onComplete?: (value: string) => void;

  /** Only allow digits 0–9 (default: true). */
  numericOnly?: boolean;

  /** Auto focus the first cell on mount (default: false). */
  autoFocus?: boolean;

  /** Disable all inputs. */
  disabled?: boolean;
  /** Make inputs read-only (useful during async submit). */
  readOnly?: boolean;

  /** Input type: "text" (default) or "password" to mask characters. */
  type?: "text" | "password";

  /** Placeholder character(s) per cell (visual only). */
  placeholder?: string;

  /** aria-label for the entire OTP group (default: "One-time code"). */
  ariaLabel?: string;

  /** Custom per-cell aria-label; receives (index, length). */
  cellAriaLabel?: (index: number, length: number) => string;

  /** Mark cells as invalid (sets aria-invalid). */
  invalid?: boolean;

  /** Adds a hidden input carrying the full joined value (for HTML forms). */
  name?: string;

  /** Class names. */
  containerClassName?: string;
  inputClassName?: string;

  /** Extra props spread to each cell (safe subset). */
  inputProps?: Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    | "value" | "defaultValue" | "onChange" | "onPaste" | "onKeyDown"
    | "onInput" | "onFocus" | "ref" | "type" | "inputMode" | "pattern" | "maxLength"
  >;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
function isDigit(ch: string) {
  return /^[0-9]$/.test(ch);
}
function cleanCode(input: string, numericOnly: boolean, maxLen: number) {
  const arr = input.split("").filter((c) => (numericOnly ? isDigit(c) : c.length > 0));
  return arr.join("").slice(0, maxLen);
}

const OtpInput = React.forwardRef<OtpInputHandle, OtpInputProps>(function OtpInput(
  {
    id,
    length = 6,
    value,
    defaultValue,
    onChange,
    onComplete,
    numericOnly = true,
    autoFocus = false,
    disabled,
    readOnly,
    type = "text",
    placeholder = "",
    ariaLabel = "One-time code",
    cellAriaLabel,
    invalid = false,
    name,
    containerClassName,
    inputClassName,
    inputProps,
  },
  ref
) {
  // Controlled vs uncontrolled
  const isControlled = typeof value === "string";
  const [internal, setInternal] = React.useState<string>(() =>
    cleanCode(defaultValue ?? "", numericOnly, length)
  );

  // IME state (global for simplicity; OTP is short)
  const composingRef = React.useRef(false);

  // Mirror controlled prop into a sanitized, fixed-length string
  const rendered = React.useMemo(
    () => cleanCode(isControlled ? (value as string) : internal, numericOnly, length),
    [isControlled, value, internal, numericOnly, length]
  );

  // Split into array for cell rendering (pad with empty strings)
  const chars = React.useMemo(() => {
    const arr = rendered.split("");
    while (arr.length < length) arr.push("");
    return arr.slice(0, length);
  }, [rendered, length]);

  // Refs for focusing (one per cell)
  const refs = React.useRef<Array<HTMLInputElement | null>>([]);
  refs.current = Array.from({ length }, (_, i) => refs.current[i] ?? null);

  // Stable ref setters (return void — important for React)
  const setRefHandlers = React.useMemo<Array<(el: HTMLInputElement | null) => void>>(
    () =>
      Array.from({ length }, (_, i) => (el: HTMLInputElement | null) => {
        refs.current[i] = el;
      }),
    [length]
  );

  // Auto-focus first cell on mount
  React.useEffect(() => {
    if (!autoFocus || disabled) return;
    const t = window.setTimeout(() => refs.current[0]?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [autoFocus, disabled]);

  // Notify when code becomes "complete" (first time it reaches full length)
  const wasCompleteRef = React.useRef(false);
  React.useEffect(() => {
    const complete = rendered.length === length;
    if (complete && !wasCompleteRef.current) {
      wasCompleteRef.current = true;
      onComplete?.(rendered);
    } else if (!complete) {
      wasCompleteRef.current = false;
    }
  }, [rendered, length, onComplete]);

  // Helpers
  const update = React.useCallback(
    (next: string) => {
      const cleaned = cleanCode(next, numericOnly, length);
      if (!isControlled) setInternal(cleaned);
      onChange?.(cleaned);
    },
    [isControlled, length, numericOnly, onChange]
  );

  const setAtIndex = React.useCallback(
    (idx: number, char: string) => {
      const current = rendered.split("");
      current[idx] = char;
      update(current.join(""));
    },
    [rendered, update]
  );

  function focusIndex(i?: number) {
    // If index omitted: focus the first empty, else 0
    let idx =
      typeof i === "number"
        ? clamp(i, 0, length - 1)
        : Math.max(0, Math.min(rendered.length, length - 1));
    refs.current[idx]?.focus();
    refs.current[idx]?.select?.();
  }
  function blur() {
    const el = document.activeElement as HTMLElement | null;
    if (el && refs.current.includes(el as HTMLInputElement)) el.blur();
  }

  // Imperative handle
  React.useImperativeHandle(
    ref,
    (): OtpInputHandle => ({
      focus: focusIndex,
      blur,
      clear: () => update(""),
      setValue: (v: string) => update(v),
      getValue: () => rendered,
    }),
    [rendered, update]
  );

  // Handlers per cell
  function handleInput(e: React.FormEvent<HTMLInputElement>, i: number) {
    if (composingRef.current) return; // ignore intermediate composition
    const el = e.currentTarget;
    let val = el.value;

    // Some keyboards can insert multiple chars; keep last allowed char
    if (val.length > 1) {
      val = cleanCode(val, numericOnly, 1);
    } else if (numericOnly && val && !isDigit(val)) {
      val = "";
    }

    setAtIndex(i, val);

    if (val) {
      if (i < length - 1) focusIndex(i + 1);
      else el.blur(); // last cell filled
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>, i: number) {
    const key = e.key;

    // Navigation
    if (key === "ArrowLeft") {
      e.preventDefault();
      focusIndex(i - 1);
      return;
    }
    if (key === "ArrowRight") {
      e.preventDefault();
      focusIndex(i + 1);
      return;
    }
    if (key === "Home") {
      e.preventDefault();
      focusIndex(0);
      return;
    }
    if (key === "End") {
      e.preventDefault();
      focusIndex(length - 1);
      return;
    }

    // Editing
    if (key === "Backspace") {
      const hasChar = !!chars[i];
      if (hasChar) {
        setAtIndex(i, "");
      } else if (i > 0) {
        e.preventDefault();
        setAtIndex(i - 1, "");
        focusIndex(i - 1);
      }
      return;
    }
    if (key === "Delete") {
      e.preventDefault();
      setAtIndex(i, "");
      focusIndex(i + 1);
      return;
    }

    // Prevent non-digit input when numericOnly
    if (numericOnly && key.length === 1 && !isDigit(key)) {
      e.preventDefault();
    }
    // Block space for OTP
    if (key === " " && numericOnly) e.preventDefault();
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>, i: number) {
    e.preventDefault();
    const text = e.clipboardData.getData("text") || "";
    const cleaned = cleanCode(text, numericOnly, length);
    if (!cleaned) return;

    const current = rendered.split("");
    for (let k = 0; k < cleaned.length && i + k < length; k++) {
      current[i + k] = cleaned[k];
    }
    update(current.join(""));

    // Focus the last filled or blur at the end
    const last = Math.min(i + cleaned.length - 1, length - 1);
    if (last < length - 1) focusIndex(last + 1);
  }

  function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
    e.currentTarget.select?.();
  }

  // Composition for IME (CJK etc.)
  function handleCompositionStart() {
    composingRef.current = true;
  }
  function handleCompositionEnd(e: React.CompositionEvent<HTMLInputElement>, i: number) {
    composingRef.current = false;
    // Commit composed text (filter to one allowed char)
    const val = cleanCode(e.currentTarget.value, numericOnly, 1);
    setAtIndex(i, val);
    if (val) {
      if (i < length - 1) focusIndex(i + 1);
      else e.currentTarget.blur();
    }
  }

  return (
    <div
      role="group"
      id={id}
      aria-label={ariaLabel}
      className={cn("flex items-center gap-2", containerClassName)}
    >
      {name && <input type="hidden" name={name} value={rendered} aria-hidden="true" />}

      {chars.map((ch, i) => (
        <input
          key={i}
          ref={setRefHandlers[i]}
          // visual
          className={cn(
            "h-10 w-10 rounded border border-gray-300 bg-white text-center text-base outline-none",
            "focus:ring-2 focus:ring-black/10",
            "disabled:cursor-not-allowed disabled:opacity-60",
            inputClassName
          )}
          // behavior
          type={type}
          value={ch}
          placeholder={placeholder}
          inputMode={numericOnly ? "numeric" : "text"}
          autoComplete="one-time-code"
          enterKeyHint="done"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          pattern={numericOnly ? "[0-9]*" : undefined}
          maxLength={1}
          // accessibility
          aria-label={cellAriaLabel ? cellAriaLabel(i + 1, length) : `Digit ${i + 1} of ${length}`}
          aria-disabled={disabled || undefined}
          aria-invalid={invalid || undefined}
          // state
          disabled={disabled}
          readOnly={readOnly}
          // events
          onFocus={handleFocus}
          onInput={(e) => handleInput(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={(e) => handlePaste(e, i)}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={(e) => handleCompositionEnd(e, i)}
          // allow extra props (after our controlled ones)
          {...inputProps}
        />
      ))}
    </div>
  );
});

export default OtpInput;
