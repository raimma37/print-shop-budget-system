import { cn } from "@/lib/utils";
import {
  FileText,
  Send,
  CheckCircle2,
  XCircle,
  Ban,
  type LucideIcon,
} from "lucide-react";

type Status = "rascunho" | "enviado" | "aprovado" | "reprovado" | "cancelado";

const STATUS_CONFIG: Record<
  Status,
  { label: string; icon: LucideIcon; className: string }
> = {
  rascunho: {
    label: "Rascunho",
    icon: FileText,
    className: "bg-slate-100 text-slate-600 ring-slate-200",
  },
  enviado: {
    label: "Enviado",
    icon: Send,
    className: "bg-sky-50 text-sky-700 ring-sky-200",
  },
  aprovado: {
    label: "Aprovado",
    icon: CheckCircle2,
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  reprovado: {
    label: "Reprovado",
    icon: XCircle,
    className: "bg-red-50 text-red-700 ring-red-200",
  },
  cancelado: {
    label: "Cancelado",
    icon: Ban,
    className: "bg-orange-50 text-orange-700 ring-orange-200",
  },
};

export function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as Status] ?? {
    label: status,
    icon: FileText,
    className: "bg-slate-100 text-slate-600 ring-slate-200",
  };

  const Icon = cfg.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        cfg.className
      )}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {cfg.label}
    </span>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

const BADGE_VARIANTS: Record<string, string> = {
  default: "bg-slate-100 text-slate-700 ring-slate-200",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  warning: "bg-amber-50 text-amber-700 ring-amber-200",
  danger:  "bg-red-50 text-red-700 ring-red-200",
  info:    "bg-sky-50 text-sky-700 ring-sky-200",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        BADGE_VARIANTS[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
