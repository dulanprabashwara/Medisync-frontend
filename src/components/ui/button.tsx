import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  loadingText?: string;
  asChild?: boolean; // Type added to fix TS errors, but since we're removing usages, it's just a fallback
}

export const buttonVariants = (variant: ButtonVariant = "primary") => {
  const baseStyles =
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 active:translate-y-px disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none";

  const variants = {
    primary: "bg-teal-700 text-white shadow-[0_6px_16px_rgba(15,118,110,0.18)] hover:-translate-y-0.5 hover:bg-teal-800 hover:shadow-[0_9px_22px_rgba(15,118,110,0.24)]",
    secondary:
      "border border-slate-300 bg-white text-slate-800 shadow-sm hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50 hover:shadow-md",
    ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
    danger: "bg-rose-700 text-white shadow-[0_6px_16px_rgba(190,24,93,0.16)] hover:-translate-y-0.5 hover:bg-rose-800 hover:shadow-lg",
  };

  const sizeStyles = "px-4 py-2.5";

  return `${baseStyles} ${variants[variant]} ${sizeStyles}`;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      loading = false,
      loadingText,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${buttonVariants(variant)} ${className}`}
        {...props}
      >
        {loading && <Loader2 className="size-4 animate-spin shrink-0" />}
        {loading && loadingText ? loadingText : children}
      </button>
    );
  },
);

Button.displayName = "Button";
