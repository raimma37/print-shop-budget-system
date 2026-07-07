import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { type ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 focus-ring disabled:pointer-events-none disabled:opacity-50 select-none";

    const variants: Record<string, string> = {
      primary:
        "bg-amber-500 text-white hover:bg-amber-600 active:bg-amber-700 shadow-sm",
      secondary:
        "bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300",
      ghost:
        "bg-transparent text-slate-600 hover:bg-slate-100 active:bg-slate-200",
      danger:
        "bg-red-50 text-red-600 hover:bg-red-100 active:bg-red-200 ring-1 ring-inset ring-red-200",
      outline:
        "bg-white text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 active:bg-slate-100",
    };

    const sizes: Record<string, string> = {
      sm: "text-xs px-3 py-1.5 h-8",
      md: "text-sm px-4 py-2 h-9",
      lg: "text-sm px-5 py-2.5 h-11",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
