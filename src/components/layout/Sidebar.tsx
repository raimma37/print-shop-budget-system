"use client";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  LogOut,
  Printer,
  ChevronRight,
  X,
  Settings,
  UserCog,
} from "lucide-react";

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { href: "/dashboard", icon: <LayoutDashboard className="h-4.5 w-4.5" />, label: "Dashboard" },
  { href: "/orcamentos", icon: <FileText className="h-4.5 w-4.5" />, label: "Orçamentos" },
  { href: "/clientes", icon: <Users className="h-4.5 w-4.5" />, label: "Clientes" },
  { href: "/produtos", icon: <Package className="h-4.5 w-4.5" />, label: "Produtos & Serviços" },
  { href: "/usuarios", icon: <UserCog className="h-4.5 w-4.5" />, label: "Usuários", adminOnly: true },
  { href: "/configuracoes", icon: <Settings className="h-4.5 w-4.5" />, label: "Configurações", adminOnly: true },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const THEME_CLASSES: Record<string, { logoBg: string; textActive: string; borderActive: string; bgActive: string; avatarBg: string }> = {
  amber: {
    logoBg: "bg-amber-500",
    textActive: "text-amber-400",
    borderActive: "border-amber-500/30",
    bgActive: "bg-amber-500/20",
    avatarBg: "bg-amber-500",
  },
  indigo: {
    logoBg: "bg-indigo-600",
    textActive: "text-indigo-400",
    borderActive: "border-indigo-500/30",
    bgActive: "bg-indigo-500/20",
    avatarBg: "bg-indigo-600",
  },
  emerald: {
    logoBg: "bg-emerald-600",
    textActive: "text-emerald-400",
    borderActive: "border-emerald-500/30",
    bgActive: "bg-emerald-600/20",
    avatarBg: "bg-emerald-600",
  },
  violet: {
    logoBg: "bg-violet-600",
    textActive: "text-violet-400",
    borderActive: "border-violet-500/30",
    bgActive: "bg-violet-500/20",
    avatarBg: "bg-violet-600",
  },
  slate: {
    logoBg: "bg-slate-600",
    textActive: "text-slate-400",
    borderActive: "border-slate-500/30",
    bgActive: "bg-slate-500/20",
    avatarBg: "bg-slate-600",
  },
};


export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [settings, setSettings] = useState({
    appName: "GráfikaORC",
    logoUrl: "",
    themeColor: "amber",
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          setSettings({
            appName: data.appName ?? "GráfikaORC",
            logoUrl: data.logoUrl ?? "",
            themeColor: data.themeColor ?? "amber",
          });
        }
      })
      .catch((err) => console.error("Erro ao carregar configurações na Sidebar:", err));
  }, [pathname]); // Recarregar ao mudar de rota para atualizar caso mude na tela de config

  const initials = user?.name
    ? user.name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()
    : "?";

  const filteredItems = navItems.filter((item) => !item.adminOnly || user?.role === "admin");
  const theme = THEME_CLASSES[settings.themeColor] ?? THEME_CLASSES.amber;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-14 border-b border-slate-700/50 flex-shrink-0">
        {settings.logoUrl ? (
          <img src={settings.logoUrl} alt={settings.appName} className="h-8 w-auto max-w-10 object-contain rounded-lg" />
        ) : (
          <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg shadow-sm", theme.logoBg)}>
            <Printer className="h-4 w-4 text-white" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white leading-tight truncate">{settings.appName}</p>
          <p className="text-xs text-slate-400 leading-tight">Comunicação Visual</p>
        </div>
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 lg:hidden transition-colors focus-ring"
            aria-label="Fechar menu"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav aria-label="Navegação principal" className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {filteredItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 group",
                active
                  ? `${theme.bgActive} ${theme.textActive} border ${theme.borderActive}`
                  : "text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 border border-transparent"
              )}
              aria-current={active ? "page" : undefined}
            >
              <span className={cn("transition-colors flex-shrink-0", active ? theme.textActive : "text-slate-500 group-hover:text-slate-300")}>
                {item.icon}
              </span>
              <span className="flex-1 truncate">{item.label}</span>
              {active && <ChevronRight className="h-3.5 w-3.5 opacity-50 flex-shrink-0" />}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 py-3 border-t border-slate-700/50 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2">
          {/* Avatar */}
          <div className={cn("flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white flex-shrink-0", theme.avatarBg)}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">{user?.name ?? "—"}</p>
            <p className="text-xs text-slate-500 truncate capitalize">{user?.role ?? "—"}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:bg-red-500/15 hover:text-red-400 transition-all duration-150 focus-ring"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Sair da conta
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-slate-900 flex-shrink-0 fixed inset-y-0 left-0 z-30 shadow-xl">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex" role="dialog" aria-modal="true" aria-label="Menu de navegação">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={onMobileClose}
          />
          <aside className="relative z-50 flex w-72 flex-col bg-slate-900 shadow-2xl animate-slide-up">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
