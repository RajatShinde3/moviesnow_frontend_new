"use client";

/**
 * EmptyState
 * =============================================================================
 * A production-grade, accessible “empty state” component for list/details pages,
 * dashboards, and settings. Communicates “nothing here yet” or “action required”
 * with clear calls to action.
 *
 * ✨ Highlights
 * - Flexible: illustration or icon, title, description, extra children, actions.
 * - A11y: dynamic heading level, aria-labelledby/aria-describedby, aria-live,
 *   proper link/btn semantics, focus-visible rings, reduced-motion friendly.
 * - Variants: "subtle" (default), "panel" (card), "ghost" (bare).
 * - Sizes: "sm" | "md" | "lg" affect spacing & type scale.
 * - Actions: per-action disabled/loading, primary/secondary/ghost styles.
 * - ForwardRef: access the root <section> for measurement or scrolling.
 *
 * Usage
 * -----------------------------------------------------------------------------
 * <EmptyState
 *   icon="📄"
 *   title="No documents yet"
 *   description="Get started by creating your first document."
 *   actions={[
 *     { label: "Create document", onClick: openCreate, variant: "primary" },
 *     { label: "Learn more", href: "/docs", variant: "secondary", target: "_blank" },
 *   ]}
 * />
 *
 * Notes
 * - Do not put secrets/PII in `title`/`description`.
 * - This component is presentational; server remains source of truth.
 */

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

/** Visual treatment of action buttons. */
type ButtonVariant = "primary" | "secondary" | "ghost";

/** Common fields for all actions. */
type BaseAction = {
  /** Visible label of the action. */
  label: string;
  /** Visual treatment. Defaults to "secondary". */
  variant?: ButtonVariant;
  /** Optional leading icon (emoji or element). */
  icon?: React.ReactNode;
  /** Accessible alternative to `label` for assistive tech. */
  ariaLabel?: string;
  /** Additional class names for the action element. */
  className?: string;
  /** Disable the action. */
  disabled?: boolean;
  /**
   * Show a progress affordance. If onClick returns a Promise and `autoLoading`
   * isn’t false, loading will be managed automatically.
   */
  loading?: boolean;
};

/** Action that triggers a callback. `href` disallowed to keep the union clean. */
type ClickAction = BaseAction & {
  onClick: () => void | Promise<void>;
  href?: never;
  target?: never;
  rel?: never;
  prefetch?: never;
  /** Enable auto-loading when onClick returns a Promise (default: true). */
  autoLoading?: boolean;
};

/** Action that navigates. `onClick` disallowed to avoid ambiguity. */
type LinkAction = BaseAction & {
  /** Destination URL for navigation. */
  href: string;
  /** Anchor target; e.g., "_blank". */
  target?: React.HTMLAttributeAnchorTarget;
  /** Link `rel`; auto-augmented for `target="_blank"`. */
  rel?: string;
  /** Next.js prefetch (default true in Next; override as needed). */
  prefetch?: boolean;
  onClick?: never;
  autoLoading?: never;
};

/** Public action type consumed by the component. */
export type EmptyAction = ClickAction | LinkAction;

/** Props for the EmptyState component. */
export type EmptyStateProps = {
  /** Large visual; e.g., SVG illustration. If provided, overrides `icon`. */
  illustration?: React.ReactNode;
  /** Small emoji or icon element; used when `illustration` isn’t provided. */
  icon?: React.ReactNode | string;
  /** Main heading content. */
  title?: React.ReactNode;
  /** Heading level element (defaults to h2). */
  titleAs?: keyof JSX.IntrinsicElements;
  /** Supporting text under the title. Accepts string or any React content. */
  description?: React.ReactNode;
  /** Primary/secondary actions (preferred). */
  actions?: EmptyAction[];
  /** Back-compat: single primary action via label + onClick or label + href. */
  actionLabel?: string;
  onAction?: () => void | Promise<void>;
  actionHref?: string;
  /**
   * Visual style:
   * - "subtle": padded container with light background (default)
   * - "panel": bordered card-like surface
   * - "ghost": no background/border, just content stack
   */
  variant?: "subtle" | "panel" | "ghost";
  /** Content alignment: centered (default) or start (left). */
  align?: "center" | "start";
  /** Affects spacing and type scale. */
  size?: "sm" | "md" | "lg";
  /** Optional ARIA role. Use "status" if representing current content state. */
  role?: React.AriaRole;
  /** Test id for E2E tests. */
  "data-testid"?: string;
  /** Extra class on the outer container. */
  className?: string;
  /** Children render below description (e.g., extra help, examples). */
  children?: React.ReactNode;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "title">;

const SIZE_STYLES = {
  sm: {
    wrap: "p-4",
    gap: "gap-2",
    icon: "text-2xl",
    title: "text-sm font-semibold",
    desc: "text-xs text-muted-foreground",
    actions: "mt-2",
    illo: "h-24",
  },
  md: {
    wrap: "p-6",
    gap: "gap-3",
    icon: "text-3xl",
    title: "text-base font-semibold",
    desc: "text-sm text-muted-foreground",
    actions: "mt-3",
    illo: "h-28",
  },
  lg: {
    wrap: "p-8",
    gap: "gap-3.5",
    icon: "text-4xl",
    title: "text-lg font-semibold",
    desc: "text-sm text-muted-foreground",
    actions: "mt-4",
    illo: "h-32",
  },
} as const;

/** Map button variants to Tailwind utility classes. */
function buttonClasses(variant: ButtonVariant) {
  switch (variant) {
    case "primary":
      return "bg-black text-white hover:opacity-90 focus-visible:ring-2 focus-visible:ring-black";
    case "secondary":
      return "border bg-white hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-gray-300";
    default:
      return "hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-gray-200";
  }
}

/** Runtime type guard to narrow an `EmptyAction` to `LinkAction`. */
function isLinkAction(a: EmptyAction): a is LinkAction {
  return typeof (a as any).href === "string";
}

/** Small, inline progress dot (avoids forcing specific colors). */
function LoadingDot() {
  return (
    <span
      aria-hidden
      className="ml-2 inline-block h-1.5 w-1.5 animate-pulse rounded-full"
      style={{ boxShadow: "0 0 0.01px currentColor" }}
    />
  );
}

/**
 * Renders a single action as either a `<Link>` or `<button>`,
 * preserving accessible labeling, disabled/loading states and variant styling.
 */
function ActionButton({ a }: { a: EmptyAction }) {
  const [autoLoading, setAutoLoading] = React.useState(false);
  const isBtn = !isLinkAction(a);
  const isLoading = isBtn ? Boolean(a.loading ?? autoLoading) : Boolean(a.loading);
  const disabled = Boolean(a.disabled || isLoading);

  const base = cn(
    "inline-flex items-center justify-center rounded px-3 py-2 text-sm transition",
    "focus:outline-none focus-visible:outline-none",
    "disabled:opacity-60 disabled:pointer-events-none",
    buttonClasses(a.variant ?? "secondary"),
    a.className
  );

  const content = (
    <>
      {a.icon && <span aria-hidden className="mr-1.5 inline-flex">{a.icon}</span>}
      <span>{a.label}</span>
      {isLoading && <LoadingDot />}
    </>
  );

  if (isLinkAction(a)) {
    const rel = a.rel ?? (a.target === "_blank" ? "noopener noreferrer" : undefined);
    return (
      <Link
        href={a.href}
        target={a.target}
        rel={rel}
        aria-label={a.ariaLabel || a.label}
        className={base}
        prefetch={a.prefetch}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : 0}
      >
        {content}
      </Link>
    );
  }

  async function handleClick() {
    if (!a.onClick || disabled) return;
    const shouldAuto = a.autoLoading !== false;
    try {
      const r = a.onClick();
      if (shouldAuto && r && typeof (r as Promise<void>).then === "function") {
        setAutoLoading(true);
        await r;
      }
    } finally {
      if (shouldAuto) setAutoLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={a.ariaLabel || a.label}
      className={base}
      disabled={disabled}
      aria-busy={isLoading || undefined}
    >
      {content}
    </button>
  );
}

/**
 * EmptyState component
 *
 * Presents an illustration or icon, a heading, optional description,
 * optional custom content, and an actions row. Useful for empty lists,
 * onboarding panels, and error/permission states.
 */
const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      illustration,
      icon = "🌱",
      title = "Nothing here yet",
      titleAs = "h2",
      description,
      actions,
      actionLabel,
      onAction,
      actionHref,
      variant = "subtle",
      align = "center",
      size = "md",
      role,
      className,
      children,
      ...rest
    },
    ref
  ) => {
    const s = SIZE_STYLES[size];
    const isCenter = align === "center";
    const titleId = React.useId();
    const descId = React.useId();

    const TitleTag = titleAs as keyof JSX.IntrinsicElements;

    return (
      <section
        ref={ref}
        role={role}
        className={cn(
          "w-full",
          variant === "panel" && "rounded border bg-white",
          variant === "subtle" && "rounded bg-gray-50/60",
          // ghost has no frame
          s.wrap,
          className
        )}
        aria-live={role === "status" ? "polite" : undefined}
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
        data-variant={variant}
        data-size={size}
        data-align={align}
        {...rest}
      >
        <div
          className={cn(
            "mx-auto flex max-w-2xl flex-col",
            isCenter ? "items-center text-center" : "items-start text-left",
            s.gap
          )}
        >
          {/* Illustration or icon */}
          {illustration ? (
            <div className={cn("select-none", isCenter ? "" : "self-start")} aria-hidden="true">
              {/* Constrain height without squishing aspect ratio */}
              <div className={cn("flex items-center justify-center", s.illo)}>{illustration}</div>
            </div>
          ) : icon ? (
            <div
              className={cn("select-none", s.icon, isCenter ? "" : "self-start")}
              aria-hidden="true"
            >
              {typeof icon === "string" ? <span>{icon}</span> : icon}
            </div>
          ) : null}

          {/* Title */}
          {title && <TitleTag id={titleId} className={cn(s.title)}>{title}</TitleTag>}

          {/* Description */}
          {description && (
            <p id={descId} className={cn(s.desc, "max-w-prose")}>
              {description}
            </p>
          )}

          {/* Extra content slot */}
          {children ? <div className="max-w-prose">{children}</div> : null}

          {/* Actions */}
          {(actions && actions.length > 0) || actionLabel ? (
            <div
              className={cn(
                "flex flex-wrap items-center gap-2",
                s.actions,
                isCenter ? "justify-center" : "justify-start"
              )}
            >
              {(actions && actions.length > 0
                ? actions
                : [
                    actionHref
                      ? { label: actionLabel!, href: actionHref, variant: "primary" }
                      : { label: actionLabel!, onClick: onAction!, variant: "primary" },
                  ]
              ).map((a, i) => (
                <ActionButton key={`${a.label}-${i}`} a={a as EmptyAction} />
              ))}
            </div>
          ) : null}
        </div>
      </section>
    );
  }
);

EmptyState.displayName = "EmptyState";
export default EmptyState;
