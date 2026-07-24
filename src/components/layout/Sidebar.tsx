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
  Printer,
  ChevronRight,
  ChevronDown,
  X,
  Settings,
  UserCog,
  Wallet,
  BarChart3,
  CreditCard,
  Receipt,
  BookOpen,
  AlertTriangle,
  DollarSign,
  Store,
  Network,
  Wrench,
  Tags,
  ShieldCheck,
  ListRestart,
  LayoutTemplate,
  History,
  KanbanSquare,
  Zap,
  Activity,
  FileSignature
} from "lucide-react";

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  adminOnly?: boolean;
}

interface NavGroup {
  key: string;
  icon: React.ReactNode;
  label: string;
  items: NavItem[];
}

const orcamentoGroup: NavGroup = {
  key: "orcamento",
  icon: <FileText className="h-4.5 w-4.5" />,
  label: "Orçamento",
  items: [
    { href: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" />, label: "Dashboard" },
    { href: "/orcamentos", icon: <FileText className="h-4 w-4" />, label: "Orçamentos" },
    { href: "/clientes", icon: <Users className="h-4 w-4" />, label: "Clientes" },
  ],
};

const contratosGroup: NavGroup = {
  key: "contratos",
  icon: <FileSignature className="h-4.5 w-4.5" />,
  label: "Contratos e Docs",
  items: [
    { href: "/contratos", icon: <LayoutDashboard className="h-4 w-4" />, label: "Visão Geral" },
    { href: "/contratos/novo", icon: <FileSignature className="h-4 w-4" />, label: "Novo Contrato" },
    { href: "/contratos/templates", icon: <LayoutTemplate className="h-4 w-4" />, label: "Gestão de Modelos" },
    { href: "/contratos/log", icon: <History className="h-4 w-4" />, label: "Histórico e Log" },
  ],
};

const adminItems: NavItem[] = [
  { href: "/usuarios", icon: <UserCog className="h-4.5 w-4.5" />, label: "Usuários", adminOnly: true },
  { href: "/configuracoes", icon: <Settings className="h-4.5 w-4.5" />, label: "Configurações", adminOnly: true },
];

const etiquetasGroup: NavGroup = {
  key: "etiquetas",
  icon: <Printer className="h-4.5 w-4.5" />,
  label: "Etiquetas",
  items: [
    { href: "/etiquetas/fila", icon: <ListRestart className="h-4 w-4" />, label: "Fila de Impressão" },
    { href: "/etiquetas/templates", icon: <LayoutTemplate className="h-4 w-4" />, label: "Meus Templates" },
    { href: "/etiquetas/historico", icon: <History className="h-4 w-4" />, label: "Histórico e Log" },
  ],
};

const kanbanGroup: NavGroup = {
  key: "kanban",
  icon: <KanbanSquare className="h-4.5 w-4.5" />,
  label: "Gestão Kanban",
  items: [
    { href: "/kanban/quadros", icon: <KanbanSquare className="h-4 w-4" />, label: "Meus Quadros" },
    { href: "/kanban/automacoes", icon: <Zap className="h-4 w-4" />, label: "Regras e Automações" },
    { href: "/kanban/analytics", icon: <Activity className="h-4 w-4" />, label: "Métricas Ágeis" },
  ],
};

const financeiroGroup: NavGroup = {
  key: "financeiro",
  icon: <Wallet className="h-4.5 w-4.5" />,
  label: "Finanças",
  items: [
    { href: "/financeiro/visao-geral", icon: <BarChart3 className="h-4 w-4" />, label: "Visão Geral" },
    { href: "/financeiro/contas", icon: <CreditCard className="h-4 w-4" />, label: "Contas de Clientes" },
    { href: "/financeiro/faturamento", icon: <BookOpen className="h-4 w-4" />, label: "Faturamento" },
    { href: "/financeiro/recebimentos", icon: <Receipt className="h-4 w-4" />, label: "Recebimentos" },
    { href: "/financeiro/despesas", icon: <DollarSign className="h-4 w-4" />, label: "Despesas" },
    { href: "/financeiro/relatorios", icon: <AlertTriangle className="h-4 w-4" />, label: "Relatórios" },
  ],
};

const catalogoGroups = [
  {
    id: "visao-geral",
    label: "Visão Geral",
    icon: <LayoutDashboard className="h-4 w-4" />,
    items: [
      { href: "/catalogo/visao-geral/kpis-metricas", label: "KPIs e Métricas" },
      { href: "/catalogo/visao-geral/alertas", label: "Alertas do Sistema" },
    ]
  },
  {
    id: "estrutura",
    label: "Estrutura do Catálogo",
    icon: <Network className="h-4 w-4" />,
    items: [
      { href: "/catalogo/estrutura/categorias", label: "Árvore de Categorias" },
      { href: "/catalogo/estrutura/grade-variacoes", label: "Grade de Variações" },
      { href: "/catalogo/estrutura/unidades-medida", label: "Unidades de Medida" },
    ]
  },
  {
    id: "produtos",
    label: "Gestão de Produtos",
    icon: <Package className="h-4 w-4" />,
    items: [
      { href: "/catalogo/produtos/informacoes-basicas", label: "Informações Básicas" },
      { href: "/catalogo/produtos/logistica-dimensoes", label: "Logística e Dimensões" },
      { href: "/catalogo/produtos/tributario-fiscal", label: "Tributário e Fiscal" },
      { href: "/catalogo/produtos/multimidia", label: "Multimídia" },
      { href: "/catalogo/produtos/regras-estoque", label: "Regras de Estoque" },
    ]
  },
  {
    id: "servicos",
    label: "Gestão de Serviços",
    icon: <Wrench className="h-4 w-4" />,
    items: [
      { href: "/catalogo/servicos/informacoes-basicas", label: "Informações Básicas" },
      { href: "/catalogo/servicos/tributario-servicos", label: "Tributário de Serviços" },
      { href: "/catalogo/servicos/recursos-alocacao", label: "Recursos e Alocação" },
    ]
  },
  {
    id: "precificacao",
    label: "Precificação",
    icon: <Tags className="h-4 w-4" />,
    items: [
      { href: "/catalogo/precificacao/gestao-tabelas", label: "Gestão de Tabelas" },
      { href: "/catalogo/precificacao/composicao-precos", label: "Composição de Preços" },
      { href: "/catalogo/precificacao/regras-comerciais", label: "Regras Comerciais" },
    ]
  },
  {
    id: "utilitarios",
    label: "Utilitários e Auditoria",
    icon: <ShieldCheck className="h-4 w-4" />,
    items: [
      { href: "/catalogo/utilitarios/importacao-exportacao", label: "Importação e Exportação" },
      { href: "/catalogo/utilitarios/log-auditoria", label: "Log de Auditoria" },
    ]
  }
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

function Collapsible({ open, children, className }: { open: boolean, children: React.ReactNode, className?: string }) {
  return (
    <div
      className={cn(
        "grid transition-all duration-300 ease-in-out",
        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      )}
    >
      <div className="overflow-hidden">
        <div className={className}>
          {children}
        </div>
      </div>
    </div>
  );
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [settings, setSettings] = useState({
    appName: "GráfikaORC",
    logoUrl: "",
    themeColor: "amber",
  });

  // Auto-expand groups
  const isOnEtiquetas = pathname.startsWith("/etiquetas");
  const [etiquetasOpen, setEtiquetasOpen] = useState(isOnEtiquetas);

  const isOnKanban = pathname.startsWith("/kanban");
  const [kanbanOpen, setKanbanOpen] = useState(isOnKanban);

  const isOnFinanceiro = pathname.startsWith("/financeiro");
  const [financeiroOpen, setFinanceiroOpen] = useState(isOnFinanceiro);

  const isOnOrcamento = ["/dashboard", "/orcamentos", "/clientes"].some(p => pathname === p || pathname.startsWith(p + "/"));
  const [orcamentoOpen, setOrcamentoOpen] = useState(isOnOrcamento);

  const isOnContratos = pathname.startsWith("/contratos");
  const [contratosOpen, setContratosOpen] = useState(isOnContratos);

  const isOnCatalogo = pathname.startsWith("/catalogo");
  const [catalogoOpen, setCatalogoOpen] = useState(isOnCatalogo);
  const [catalogoSubOpen, setCatalogoSubOpen] = useState<string | null>(
    pathname.split("/")[2] || null
  );

  useEffect(() => {
    if (isOnEtiquetas) setEtiquetasOpen(true);
  }, [isOnEtiquetas]);

  useEffect(() => {
    if (isOnKanban) setKanbanOpen(true);
  }, [isOnKanban]);

  useEffect(() => {
    if (isOnFinanceiro) setFinanceiroOpen(true);
  }, [isOnFinanceiro]);

  useEffect(() => {
    if (isOnOrcamento) setOrcamentoOpen(true);
  }, [isOnOrcamento]);

  useEffect(() => {
    if (isOnContratos) setContratosOpen(true);
  }, [isOnContratos]);

  useEffect(() => {
    if (isOnCatalogo) {
      setCatalogoOpen(true);
      setCatalogoSubOpen(pathname.split("/")[2] || null);
    }
  }, [isOnCatalogo, pathname]);

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
  }, [pathname]);

  const initials = user?.name
    ? user.name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()
    : "?";

  const filteredAdmin = adminItems.filter((item) => !item.adminOnly || user?.role === "admin");
  const theme = THEME_CLASSES[settings.themeColor] ?? THEME_CLASSES.amber;

  const renderNavLink = (item: NavItem) => {
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
  };

  const sidebarContent = (
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
        
        {/* PDV no Topo */}
        <div className="pb-1">
          <p className="px-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Frente de Caixa</p>
        </div>
        <div className="px-3 mb-4">
          <Link
            href="/pdv"
            onClick={onMobileClose}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 group text-emerald-400 bg-emerald-900/20 hover:bg-emerald-900/40 border border-emerald-900/50"
          >
            <span className="flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
            </span>
            <span className="flex-1 truncate">Abrir PDV</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </Link>
        </div>

        {/* Separador + Grupo Orçamento */}
        <div className="pb-1">
          <p className={cn("px-3 text-xs font-semibold uppercase tracking-wider opacity-80", theme.textActive)}>Orçamentário</p>
        </div>

        {/* Cabeçalho do grupo Orçamento */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setOrcamentoOpen((o) => !o);
          }}
          className={cn(
            "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 group border mb-1",
            isOnOrcamento
              ? `${theme.bgActive} ${theme.textActive} ${theme.borderActive}`
              : "text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 border-transparent"
          )}
        >
          <span className={cn("transition-colors flex-shrink-0", isOnOrcamento ? theme.textActive : `${theme.textActive} opacity-60 group-hover:opacity-100`)}>
            <FileText className="h-4.5 w-4.5" />
          </span>
          <span className="flex-1 text-left truncate">Orçamento</span>
          <div className={cn("transition-transform duration-300", orcamentoOpen ? "rotate-90" : "")}>
            <ChevronRight className="h-3.5 w-3.5 opacity-50 flex-shrink-0" />
          </div>
        </button>

        {/* Sub-itens colapsáveis Orçamento */}
        <Collapsible open={orcamentoOpen} className="pl-3 space-y-0.5 mb-2">
          {orcamentoGroup.items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150 group border",
                  active
                    ? `${theme.bgActive} ${theme.textActive} ${theme.borderActive}`
                    : "text-slate-500 hover:bg-slate-700/30 hover:text-slate-300 border-transparent"
                )}
              >
                <span className={cn("transition-colors flex-shrink-0", active ? theme.textActive : "text-slate-600 group-hover:text-slate-400")}>
                  {item.icon}
                </span>
                <span className="flex-1 truncate">{item.label}</span>
              </Link>
            );
          })}
        </Collapsible>

        {/* Separador + Grupo Contratos */}
        <div className="pt-2 pb-1">
          <p className="px-3 text-xs font-semibold text-sky-400/80 uppercase tracking-wider">Documentos</p>
        </div>

        {/* Cabeçalho do grupo Contratos */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setContratosOpen((o) => !o);
          }}
          className={cn(
            "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 group border",
            isOnContratos
              ? `bg-sky-500/20 text-sky-400 border-sky-500/30`
              : "text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 border-transparent"
          )}
        >
          <span className={cn("transition-colors flex-shrink-0", isOnContratos ? "text-sky-400" : "text-sky-500 group-hover:text-sky-400")}>
            <FileSignature className="h-4.5 w-4.5" />
          </span>
          <span className="flex-1 text-left truncate">Contratos</span>
          <div className={cn("transition-transform duration-300", contratosOpen ? "rotate-90" : "")}>
            <ChevronRight className="h-3.5 w-3.5 opacity-50 flex-shrink-0" />
          </div>
        </button>

        {/* Sub-itens colapsáveis Contratos */}
        <Collapsible open={contratosOpen} className="pl-3 space-y-0.5 mt-1 mb-2">
          {contratosGroup.items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150 group border",
                  active
                    ? `bg-sky-900/30 text-sky-300 border-sky-800/50`
                    : "text-slate-500 hover:bg-slate-700/30 hover:text-slate-300 border-transparent"
                )}
              >
                <span className={cn("transition-colors flex-shrink-0", active ? "text-sky-400" : "text-slate-600 group-hover:text-slate-400")}>
                  {item.icon}
                </span>
                <span className="flex-1 truncate">{item.label}</span>
              </Link>
            );
          })}
        </Collapsible>

        {/* Grupo Catálogo (Produtos e Serviços) */}
        <div className="pt-2 pb-1">
          <p className="px-3 text-xs font-semibold text-indigo-400/80 uppercase tracking-wider">Produtos e Serviços</p>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setCatalogoOpen((o) => !o);
          }}
          className={cn(
            "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 group border",
            isOnCatalogo
              ? `bg-indigo-500/20 text-indigo-400 border-indigo-500/30`
              : "text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 border-transparent"
          )}
        >
          <span className={cn("transition-colors flex-shrink-0", isOnCatalogo ? "text-indigo-400" : "text-indigo-500 group-hover:text-indigo-400")}>
            <Store className="h-4.5 w-4.5" />
          </span>
          <span className="flex-1 text-left truncate">Catálogo</span>
          <div className={cn("transition-transform duration-300", catalogoOpen ? "rotate-90" : "")}>
            <ChevronRight className="h-3.5 w-3.5 opacity-50 flex-shrink-0" />
          </div>
        </button>

        <Collapsible open={catalogoOpen} className="pl-3 space-y-1 mt-1 mb-2">
          {catalogoGroups.map((group) => {
            const isGroupOpen = catalogoSubOpen === group.id;
            const isGroupActive = pathname.startsWith(`/catalogo/${group.id}`);

            return (
              <div key={group.id} className="space-y-0.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setCatalogoSubOpen(isGroupOpen ? null : group.id);
                  }}
                  className={cn(
                    "w-full flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150 group border",
                    isGroupActive
                      ? `bg-indigo-900/30 text-indigo-300 border-indigo-800/50`
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-300 border-transparent"
                  )}
                >
                  <span className={cn("transition-colors flex-shrink-0", isGroupActive ? "text-indigo-400" : "text-slate-500 group-hover:text-indigo-300")}>
                    {group.icon}
                  </span>
                  <span className="flex-1 text-left truncate">{group.label}</span>
                  <div className={cn("transition-transform duration-300", isGroupOpen ? "rotate-90" : "")}>
                    <ChevronRight className="h-3 w-3 opacity-50 flex-shrink-0" />
                  </div>
                </button>

                <Collapsible open={isGroupOpen} className="pl-6 space-y-0.5 py-0.5">
                  {group.items.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onMobileClose}
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-3 py-1 text-[11px] font-medium transition-all duration-150 border",
                          active
                            ? `bg-indigo-500/20 text-indigo-300 border-indigo-500/30`
                            : "text-slate-500 hover:text-indigo-300 border-transparent hover:bg-indigo-900/10"
                        )}
                      >
                        <span className="flex-1 truncate relative pl-2 before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-1 before:rounded-full before:bg-current opacity-90">{item.label}</span>
                      </Link>
                    );
                  })}
                </Collapsible>
              </div>
            );
          })}
        </Collapsible>

        {/* Separador + Grupo Etiquetas */}
        <div className="pt-2 pb-1">
          <p className="px-3 text-xs font-semibold text-rose-400/80 uppercase tracking-wider">Gestão e Automação</p>
        </div>

        {/* Cabeçalho do grupo Etiquetas */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setEtiquetasOpen((o) => !o);
          }}
          className={cn(
            "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 group border",
            isOnEtiquetas
              ? `bg-rose-500/20 text-rose-400 border-rose-500/30`
              : "text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 border-transparent"
          )}
        >
          <span className={cn("transition-colors flex-shrink-0", isOnEtiquetas ? "text-rose-400" : "text-rose-500 group-hover:text-rose-400")}>
            <Printer className="h-4.5 w-4.5" />
          </span>
          <span className="flex-1 text-left truncate">Impressão e Etiquetas</span>
          <div className={cn("transition-transform duration-300", etiquetasOpen ? "rotate-90" : "")}>
            <ChevronRight className="h-3.5 w-3.5 opacity-50 flex-shrink-0" />
          </div>
        </button>

        {/* Sub-itens colapsáveis Etiquetas */}
        <Collapsible open={etiquetasOpen} className="pl-3 space-y-0.5 mt-1 mb-2">
          {etiquetasGroup.items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150 group border",
                  active
                    ? `bg-rose-900/30 text-rose-300 border-rose-800/50`
                    : "text-slate-500 hover:bg-slate-700/30 hover:text-slate-300 border-transparent"
                )}
              >
                <span className={cn("transition-colors flex-shrink-0", active ? "text-rose-400" : "text-slate-600 group-hover:text-slate-400")}>
                  {item.icon}
                </span>
                <span className="flex-1 truncate">{item.label}</span>
              </Link>
            );
          })}
        </Collapsible>

        {/* Separador + Grupo Kanban */}
        <div className="pt-2 pb-1">
          <p className="px-3 text-xs font-semibold text-fuchsia-400/80 uppercase tracking-wider">Produção Ágil</p>
        </div>

        {/* Cabeçalho do grupo Kanban */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setKanbanOpen((o) => !o);
          }}
          className={cn(
            "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 group border",
            isOnKanban
              ? `bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30`
              : "text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 border-transparent"
          )}
        >
          <span className={cn("transition-colors flex-shrink-0", isOnKanban ? "text-fuchsia-400" : "text-fuchsia-500 group-hover:text-fuchsia-400")}>
            <KanbanSquare className="h-4.5 w-4.5" />
          </span>
          <span className="flex-1 text-left truncate">Kanban (Produção)</span>
          <div className={cn("transition-transform duration-300", kanbanOpen ? "rotate-90" : "")}>
            <ChevronRight className="h-3.5 w-3.5 opacity-50 flex-shrink-0" />
          </div>
        </button>

        {/* Sub-itens colapsáveis Kanban */}
        <Collapsible open={kanbanOpen} className="pl-3 space-y-0.5 mt-1 mb-2">
          {kanbanGroup.items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150 group border",
                  active
                    ? `bg-fuchsia-900/30 text-fuchsia-300 border-fuchsia-800/50`
                    : "text-slate-500 hover:bg-slate-700/30 hover:text-slate-300 border-transparent"
                )}
              >
                <span className={cn("transition-colors flex-shrink-0", active ? "text-fuchsia-400" : "text-slate-600 group-hover:text-slate-400")}>
                  {item.icon}
                </span>
                <span className="flex-1 truncate">{item.label}</span>
              </Link>
            );
          })}
        </Collapsible>

        {/* Separador + Grupo Finanças */}
        <div className="pt-2 pb-1">
          <p className="px-3 text-xs font-semibold text-amber-400/80 uppercase tracking-wider">Financeiro</p>
        </div>

        {/* Cabeçalho do grupo */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setFinanceiroOpen((o) => !o);
          }}
          className={cn(
            "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 group border",
            isOnFinanceiro
              ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
              : "text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 border-transparent"
          )}
        >
          <span className={cn("transition-colors flex-shrink-0", isOnFinanceiro ? "text-amber-400" : "text-amber-500 group-hover:text-amber-400")}>
            <Wallet className="h-4.5 w-4.5" />
          </span>
          <span className="flex-1 text-left truncate">Finanças</span>
          <div className={cn("transition-transform duration-300", financeiroOpen ? "rotate-90" : "")}>
            <ChevronRight className="h-3.5 w-3.5 opacity-50 flex-shrink-0" />
          </div>
        </button>

        {/* Sub-itens colapsáveis */}
        <Collapsible open={financeiroOpen} className="pl-3 space-y-0.5 mt-1 mb-2">
          {financeiroGroup.items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150 group border",
                  active
                    ? "bg-amber-900/30 text-amber-300 border-amber-800/50"
                    : "text-slate-500 hover:bg-slate-700/30 hover:text-slate-300 border-transparent"
                )}
              >
                <span className={cn("transition-colors flex-shrink-0", active ? "text-amber-400" : "text-slate-600 group-hover:text-slate-400")}>
                  {item.icon}
                </span>
                <span className="flex-1 truncate">{item.label}</span>
              </Link>
            );
          })}
        </Collapsible>

        {/* Separador + Admin */}
        {filteredAdmin.length > 0 && (
          <>
            <div className="pt-2 pb-1">
              <p className="px-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Administração</p>
            </div>
            {filteredAdmin.map((item) => renderNavLink(item))}
          </>
        )}
      </nav>

      {/* User footer */}
      <div className="px-3 py-3 border-t border-slate-700/50">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className={cn("flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white flex-shrink-0", theme.avatarBg)}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">{user?.name ?? "—"}</p>
            <p className="text-xs text-slate-500 truncate capitalize">{user?.role ?? "—"}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-slate-900 flex-shrink-0 fixed inset-y-0 left-0 z-30 shadow-xl">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      <div 
        className={cn(
          "lg:hidden fixed inset-0 z-40 flex transition-all duration-300",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none delay-300"
        )} 
        role="dialog" aria-modal="true" aria-label="Menu de navegação"
      >
        <div
          className={cn(
            "fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
            mobileOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={onMobileClose}
        />
        <aside 
          className={cn(
            "relative z-50 flex w-72 flex-col bg-slate-900 shadow-2xl transition-transform duration-300 ease-in-out",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {sidebarContent}
        </aside>
      </div>
    </>
  );
}
