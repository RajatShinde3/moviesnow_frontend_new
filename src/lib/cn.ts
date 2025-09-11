// lib/cn.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * =============================================================================
 *  Class name utilities (Tailwind-aware)
 * =============================================================================
 *
 *  What this provides
 *  ------------------
 *  • `cn`  → merge arbitrary class values and resolve Tailwind conflicts
 *  • `cx`  → like `cn` but **without** Tailwind conflict resolution
 *  • `cnIf` → readable conditional builder you can pass into `cn`/`cx`
 *  • `mergeClassName` → merge component props.className with extra classes
 *  • `ensureClassName` → coerce any supported inputs to a `string`
 *
 *  Behavior & safety
 *  -----------------
 *  • Falsy inputs (`false`, `null`, `undefined`, `0`, `""`) are ignored.
 *  • Arrays and objects are supported:
 *      - arrays are flattened recursively
 *      - objects include the key when its value is truthy
 *  • `cn` first flattens with `clsx`, then resolves Tailwind conflicts with
 *    `tailwind-merge` (e.g., `"p-2 p-4"` → `"p-4"`, `"text-left text-center"` → `"text-center"`).
 *
 *  Examples
 *  --------
 *    cn("p-2", isActive && "bg-blue-500", ["text-sm", disabled && "opacity-50"]);
 *    // → "p-2 bg-blue-500 text-sm opacity-50"
 *
 *    cx("p-2", condition && "p-4"); // may yield "p-2 p-4"
 */

/** Merge class names and intelligently resolve Tailwind conflicts. */
export function cn(...inputs: ClassValue[]): string {
  // `clsx` flattens arrays/objects and ignores falsy;
  // `twMerge` resolves Tailwind utility conflicts (e.g., "p-2 p-4" => "p-4").
  return twMerge(clsx(...inputs));
}

/**
 * Compose class names like `cn` but **without** Tailwind conflict resolution.
 * Useful when you intentionally want to preserve duplicates for specificity
 * or for non-Tailwind class systems.
 */
export function cx(...inputs: ClassValue[]): string {
  return clsx(...inputs);
}

/**
 * Conditional builder for readable class lists.
 * Returns an object you can pass into `cn()/cx()` directly.
 *
 * @example
 *   cn(
 *     "px-3 py-2 rounded",
 *     cnIf({
 *       "bg-black text-white": isPrimary,
 *       "bg-gray-100": !isPrimary,
 *       "opacity-50 cursor-not-allowed": disabled,
 *     })
 *   );
 */
export function cnIf(
  map: Record<string, boolean | undefined | null>
): Record<string, boolean> {
  // Filter out undefined/null so devtools output is cleaner.
  const out: Record<string, boolean> = {};
  for (const k in map) {
    if (Object.prototype.hasOwnProperty.call(map, k) && !!map[k]) out[k] = true;
  }
  return out;
}

/**
 * Merge a component's `className` prop (if any) with extra class values using `cn`.
 * Great for component wrappers/HOCs and prop forwarding. Preserves other props.
 *
 * @example
 *   function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
 *     const p = mergeClassName(props, "inline-flex items-center rounded px-3 py-2");
 *     return <button {...p} />;
 *   }
 */
export function mergeClassName<T extends { className?: string }>(
  props: T,
  ...extra: ClassValue[]
): T & { className: string } {
  const className = cn(props.className, ...extra);
  return { ...props, className };
}

/**
 * Coerce any supported `ClassValue` (or list of them) to a **string**.
 * Useful when interoperating with libraries that only accept `string`.
 *
 * @example
 *   const className = ensureClassName(["p-2", isOpen && "block"]);
 *   el.setAttribute("class", className);
 */
export function ensureClassName(...inputs: ClassValue[]): string {
  return cn(...inputs);
}

/** Re-exports so consumers can opt into raw `clsx` or its types. */
export { clsx };
export type { ClassValue };
