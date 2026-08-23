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
    "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-teal-700 text-white hover:bg-teal-800",
    secondary: "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50",
    ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    danger: "bg-rose-700 text-white hover:bg-rose-800",
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
      asChild, // Ignored in implementation, but fixes type error if missed
      ...props
    },
    ref
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
  }
);

Button.displayName = "Button";
