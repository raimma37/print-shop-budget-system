import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";

// ─── Input ────────────────────────────────────────────────────────────────────
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            className={cn(
              "w-full rounded-lg border bg-white text-sm text-slate-900 placeholder:text-slate-400",
              "transition-all duration-150",
              "focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500",
              "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500",
              leftIcon ? "pl-9 pr-3 py-2" : "px-3 py-2",
              error
                ? "border-red-300 focus:ring-red-400 focus:border-red-400"
                : "border-slate-200 hover:border-slate-300",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p id={`${inputId}-error`} role="alert" className="text-xs text-red-600 flex items-center gap-1">
            <span aria-hidden="true">⚠</span> {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-slate-500">
            {hint}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

// ─── Textarea ─────────────────────────────────────────────────────────────────
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          className={cn(
            "w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 resize-y",
            "transition-all duration-150",
            "focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500",
            "disabled:cursor-not-allowed disabled:bg-slate-50",
            error ? "border-red-300" : "border-slate-200 hover:border-slate-300",
            className
          )}
          {...props}
        />
        {error && (
          <p role="alert" className="text-xs text-red-600">⚠ {error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-slate-500">{hint}</p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

// ─── Select ───────────────────────────────────────────────────────────────────
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, id, children, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 appearance-none cursor-pointer",
            "focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500",
            error ? "border-red-300" : "border-slate-200 hover:border-slate-300",
            className
          )}
          {...props}
        >
          {options
            ? options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))
            : children}
        </select>
        {error && <p role="alert" className="text-xs text-red-600">⚠ {error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";
