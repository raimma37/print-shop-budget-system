import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

// ─── Card composable ─────────────────────────────────────────────────────────
interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white shadow-sm",
        hover && "hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
}

export function CardHeader({ children, className, actions }: CardHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between px-5 py-4 border-b border-slate-100", className)}>
      <div className="flex items-center gap-3">{children}</div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

interface CardTitleProps {
  children: ReactNode;
  subtitle?: string;
  className?: string;
}

export function CardTitle({ children, subtitle, className }: CardTitleProps) {
  return (
    <div className={className}>
      <h2 className="text-base font-semibold text-slate-900">{children}</h2>
      {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}

interface CardBodyProps {
  children: ReactNode;
  className?: string;
  padding?: boolean;
}

export function CardBody({ children, className, padding = true }: CardBodyProps) {
  return (
    <div className={cn(padding && "p-5", className)}>
      {children}
    </div>
  );
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn("px-5 py-3 border-t border-slate-100 bg-slate-50/50 rounded-b-xl", className)}>
      {children}
    </div>
  );
}

// ─── Stat Card (KPI) ──────────────────────────────────────────────────────────
interface StatCardProps {
  title: string;
  value: ReactNode;
  subtitle?: string;
  icon: ReactNode;
  iconBg?: string;
  trend?: { value: string; positive: boolean };
}

export function StatCard({ title, value, subtitle, icon, iconBg = "bg-amber-50 text-amber-600", trend }: StatCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", iconBg)}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-900 tabular-nums">{value}</p>
      {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      {trend && (
        <p className={cn("text-xs font-medium mt-2", trend.positive ? "text-emerald-600" : "text-red-500")}>
          {trend.positive ? "↑" : "↓"} {trend.value}
        </p>
      )}
    </Card>
  );
}
