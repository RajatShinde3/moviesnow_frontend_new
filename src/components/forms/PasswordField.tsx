"use client";

/**
 * PasswordField
 * =============================================================================
 * A production-grade, a11y-friendly password input with a built-in
 * show/hide toggle that works with React Hook Form (RHF) and controlled/uncontrolled usage.
 *
 * Enhancements
 * • Security-minded: sensible `autoComplete` by `kind`; optional reveal disable; press-and-hold reveal.
 * • RHF-ready: forwards `name`, `onChange`, `onBlur`, `ref`; uncontrolled by default.
 * • UX/a11y: Caps Lock hint, merged `aria-describedby`, `aria-invalid`, keyboard-operable toggle.
 * • Extensibility: error & hint, password strength via `renderStrength(value)`, visibility callback.
 */

import * as React from "react";
import { cn } from "@/lib/cn";

export type PasswordKind = "current" | "new" | "confirm";

export type PasswordFieldProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  // Curate these for UX/a11y; we expose safer controls instead.
  "type" | "spellCheck"
> & {
  /** Visible label. If omitted, provide `aria-label` in the rest props. */
  label?: string;
  /** Helper text below the input (shown when no error). */
  hint?: string;
  /** Validation error text; toggles `aria-invalid`. */
  error?: string;
  /**
   * Guides `autoComplete` defaults:
   *  - "current"  → `current-password`
   *  - "new"      → `new-password`
   *  - "confirm"  → `new-password`
   * (You can still override via the `autoComplete` prop.)
   */
  kind?: PasswordKind;
  /** Optional strength UI: receives the current string value. */
  renderStrength?: (value: string) => React.ReactNode;
  /** Called when visibility toggles. */
  onVisibilityChange?: (visible: boolean) => void;
  /** Layout hooks. */
  containerClassName?: string;
  inputClassName?: string;
  toggleClassName?: string;
  /**
   * Block paste/drag-drop (useful for confirm fields to encourage re-entry).
   * Default: false
   */
  preventPaste?: boolean;
  /**
   * Disable the reveal/toggle feature entirely (high-security contexts).
   * Default: false
   */
  disableReveal?: boolean;
  /**
   * Allow press-and-hold to reveal (mouse/touch). Click toggling remains.
   * Ignored when `disableReveal` is true. Default: true
   */
  revealOnHold?: boolean;
};

const INPUT_BASE =
  "w-full rounded border border-gray-300 px-3 py-2 pr-20 outline-none focus:ring-2 focus:ring-black/10";

export const PasswordField = React.forwardRef<HTMLInputElement, PasswordFieldProps>(
  (
    {
      id,
      label,
      hint,
      error,
      kind = "current",
      className,
      containerClassName,
      inputClassName,
      toggleClassName,
      renderStrength,
      onVisibilityChange,
      autoComplete: autoCompleteOverride,
      preventPaste = false,
      disableReveal = false,
      revealOnHold = true,
      // Carefully extract these to manage controlled/uncontrolled safely
      value: valueProp,
      defaultValue,
      onChange: onChangeProp,
      onPaste: onPasteProp,
      onDrop: onDropProp,
      onKeyDown,
      onKeyUp,
      onBlur,
      "aria-describedby": ariaDescribedByFromRest,
      ...rest
    },
    ref
  ) => {
    const reactId = React.useId();
    const inputId = id ?? `pwd-${reactId}`;
    const hintId = hint ? `hint-${reactId}` : undefined;
    const errorId = error ? `err-${reactId}` : undefined;
    const strengthId = renderStrength ? `strength-${reactId}` : undefined;

    const [visible, setVisible] = React.useState(false);
    const [capsOn, setCapsOn] = React.useState(false);
    const holdActiveRef = React.useRef(false);

    // Uncontrolled shadow state so strength UI works while typing
    const [internalValue, setInternalValue] = React.useState(
      typeof defaultValue === "string" || typeof defaultValue === "number"
        ? String(defaultValue)
        : ""
    );

    const isControlled = valueProp !== undefined;
    const strengthValue = isControlled ? String(valueProp ?? "") : internalValue;

    const setVisibility = (next: boolean) => {
      if (disableReveal) return;
      setVisible(next);
      onVisibilityChange?.(next);
    };

    const toggle = () => setVisibility(!visible);

    // Sensible default auto-complete; allow explicit override
    const ac =
      autoCompleteOverride ?? (kind === "current" ? "current-password" : "new-password");

    // Keep shadow state in sync if defaultValue changes while uncontrolled (for strength UI only)
    React.useEffect(() => {
      if (!isControlled && (defaultValue || defaultValue === "")) {
        setInternalValue(String(defaultValue));
      }
    }, [defaultValue, isControlled]);

    // Compose described-by with any incoming value (prefer error > hint > strength)
    const describedBy = [ariaDescribedByFromRest, errorId || hintId, strengthId]
      .filter(Boolean)
      .join(" ") || undefined;

    const handleUncontrolledChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInternalValue(e.target.value);
      onChangeProp?.(e); // bubble if parent listens (RHF register)
    };

    const handlePaste: React.ClipboardEventHandler<HTMLInputElement> = (e) => {
      if (preventPaste) {
        e.preventDefault();
        return;
      }
      onPasteProp?.(e);
    };

    const handleDrop: React.DragEventHandler<HTMLInputElement> = (e) => {
      if (preventPaste) {
        e.preventDefault();
        return;
      }
      onDropProp?.(e);
    };

    const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
      try {
        const state = (e as any).getModifierState?.("CapsLock");
        if (typeof state === "boolean") setCapsOn(state);
      } catch {/* no-op */}
      onKeyDown?.(e);
    };

    const handleKeyUp: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
      try {
        const state = (e as any).getModifierState?.("CapsLock");
        if (typeof state === "boolean") setCapsOn(state);
      } catch {/* no-op */}
      onKeyUp?.(e);
    };

    const handleBlur: React.FocusEventHandler<HTMLInputElement> = (e) => {
      setCapsOn(false);
      onBlur?.(e);
    };

    // Press-and-hold reveal (mouse + touch)
    const onHoldStart: React.PointerEventHandler<HTMLButtonElement> = (e) => {
      if (disableReveal || !revealOnHold) return;
      if (e.pointerType === "mouse" && e.button !== 0) return; // left click only
      holdActiveRef.current = true;
      // prevent the subsequent click from toggling
      e.preventDefault();
      setVisibility(true);
      // capture pointer to ensure end events are received even if pointer leaves
      (e.currentTarget as HTMLButtonElement).setPointerCapture?.(e.pointerId);
    };
    const onHoldEnd: React.PointerEventHandler<HTMLButtonElement> = (e) => {
      if (!holdActiveRef.current) return;
      holdActiveRef.current = false;
      e.preventDefault();
      setVisibility(false);
      (e.currentTarget as HTMLButtonElement).releasePointerCapture?.(e.pointerId);
    };

    return (
      <div className={cn("space-y-1", containerClassName)}>
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium">
            {label}
          </label>
        )}

        <div className={cn("relative", className)}>
          <input
            id={inputId}
            ref={ref}
            type={visible ? "text" : "password"}
            autoComplete={ac}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            inputMode="text"
            enterKeyHint="done"
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={cn(INPUT_BASE, inputClassName)}
            // room for the toggle; keep utility class pr-20 in INPUT_BASE as well
            style={{ paddingRight: "5.5rem" }}
            onPaste={handlePaste}
            onDrop={handleDrop}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            onBlur={handleBlur}
            {...rest}
            {...(isControlled
              ? {
                  value: String(valueProp ?? ""),
                  onChange: onChangeProp, // parent owns value
                }
              : {
                  defaultValue,
                  onChange: handleUncontrolledChange,
                })}
          />

          {/* Show/Hide toggle (keyboard & screen-reader friendly) */}
          {!disableReveal && (
            <button
              type="button"
              onClick={() => {
                // if a hold gesture is active, ignore click
                if (holdActiveRef.current) return;
                toggle();
              }}
              onPointerDown={onHoldStart}
              onPointerUp={onHoldEnd}
              onPointerCancel={onHoldEnd}
              onPointerLeave={onHoldEnd}
              aria-pressed={visible}
              aria-label={visible ? "Hide password" : "Show password"}
              aria-controls={inputId}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs",
                "text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black/10",
                "disabled:pointer-events-none disabled:opacity-60",
                toggleClassName
              )}
              disabled={rest.disabled}
            >
              {visible ? "Hide" : "Show"}
            </button>
          )}
        </div>

        {/* Error / hint / Caps Lock notice / Strength */}
        {error ? (
          <p id={errorId} role="alert" className="text-xs text-red-600">
            {error}
          </p>
        ) : hint ? (
          <p id={hintId} className="text-xs text-muted-foreground">
            {hint}
          </p>
        ) : null}

        {capsOn && !visible && (
          <p className="text-[11px] text-amber-700">Caps Lock is on.</p>
        )}

        {renderStrength ? (
          <div id={strengthId} aria-live="polite" className="pt-1">
            {renderStrength(strengthValue)}
          </div>
        ) : null}
      </div>
    );
  }
);

PasswordField.displayName = "PasswordField";
export default PasswordField;
