"use client";

import React, { useState } from "react";
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  Search, 
  Filter, 
  ArrowRight,
  PackageX,
  Clock,
  FileWarning
} from "lucide-react";
import { cn } from "@/lib/utils";

type AlertSeverity = "critical" | "warning" | "info";

interface Alert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  module: string;
  time: string;
  icon: React.ReactNode;
  actionText: string;
  actionLink: string;
}

const mockAlerts: Alert[] = [
  {
    id: "a1",
    title: "Estoque Zerado",
    description: "O produto 'Banner Vinil 440g Fosco' atingiu o estoque zero. Vendas estão bloqueadas.",
    severity: "critical",
    module: "Estoque",
    time: "Há 10 min",
    icon: <PackageX className="h-5 w-5" />,
    actionText: "Repor Estoque",
    actionLink: "#"
  },
  {
    id: "a2",
    title: "Tabela de Preço Expirando",
    description: "A tabela 'Black Friday Antecipada' expira em menos de 24 horas (Amanhã às 23:59).",
    severity: "critical",
    module: "Precificação",
    time: "Há 1 hora",
    icon: <Clock className="h-5 w-5" />,
    actionText: "Ver Tabela",
    actionLink: "#"
  },
  {
    id: "a3",
    title: "Estoque Baixo",
    description: "Atenção: 'Tinta Solvente CMYK 1L' está com 5 unidades restantes (Mínimo configurado: 10).",
    severity: "warning",
    module: "Estoque",
    time: "Hoje, 08:30",
    icon: <AlertTriangle className="h-5 w-5" />,
    actionText: "Gerar Pedido Compra",
    actionLink: "#"
  },
  {
    id: "a4",
    title: "Cadastro Incompleto (NCM)",
    description: "Foram encontrados 12 produtos novos sem a tributação de NCM configurada.",
    severity: "info",
    module: "Fiscal",
    time: "Ontem, 16:45",
    icon: <FileWarning className="h-5 w-5" />,
    actionText: "Completar Cadastros",
    actionLink: "#"
  },
  {
    id: "a5",
    title: "Produtos sem Imagem",
    description: "Há 4 produtos no catálogo principal que não possuem foto cadastrada.",
    severity: "info",
    module: "Catálogo",
    time: "15/07/2026",
    icon: <AlertCircle className="h-5 w-5" />,
    actionText: "Adicionar Fotos",
    actionLink: "#"
  }
];

const severityColors = {
  critical: "bg-red-50 text-red-700 border-red-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  info: "bg-sky-50 text-sky-700 border-sky-200"
};

const severityIcons = {
  critical: <AlertOctagon className="h-4 w-4" />,
  warning: <AlertTriangle className="h-4 w-4" />,
  info: <Info className="h-4 w-4" />
};

// Precisamos do AlertOctagon, mas ele não foi importado, então criamos um fallback
function AlertOctagon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

export function SystemAlertsView() {
  const [filter, setFilter] = useState<AlertSeverity | "all">("all");
  const [search, setSearch] = useState("");

  const filteredAlerts = mockAlerts.filter(alert => {
    const matchesFilter = filter === "all" || alert.severity === filter;
    const matchesSearch = alert.title.toLowerCase().includes(search.toLowerCase()) || 
                          alert.description.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const criticalCount = mockAlerts.filter(a => a.severity === "critical").length;
  const warningCount = mockAlerts.filter(a => a.severity === "warning").length;
  const infoCount = mockAlerts.filter(a => a.severity === "info").length;

  return (
    <div className="space-y-6 animate-fade-in pb-10 max-w-5xl">
      
      {/* Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button 
          onClick={() => setFilter("all")}
          className={cn(
            "p-4 rounded-xl border text-left transition-all",
            filter === "all" ? "bg-slate-800 text-white border-slate-800 shadow-md" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
          )}
        >
          <p className="text-sm font-medium opacity-80 mb-1">Todos os Alertas</p>
          <p className="text-2xl font-bold">{mockAlerts.length}</p>
        </button>
        
        <button 
          onClick={() => setFilter("critical")}
          className={cn(
            "p-4 rounded-xl border text-left transition-all",
            filter === "critical" ? "bg-red-600 text-white border-red-600 shadow-md shadow-red-200" : "bg-white border-slate-200 text-slate-700 hover:bg-red-50"
          )}
        >
          <div className="flex justify-between items-start">
            <p className={cn("text-sm font-medium mb-1", filter === "critical" ? "opacity-90" : "text-red-600")}>Críticos</p>
            <AlertOctagon className={cn("h-5 w-5", filter === "critical" ? "opacity-80" : "text-red-500")} />
          </div>
          <p className="text-2xl font-bold">{criticalCount}</p>
        </button>

        <button 
          onClick={() => setFilter("warning")}
          className={cn(
            "p-4 rounded-xl border text-left transition-all",
            filter === "warning" ? "bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-200" : "bg-white border-slate-200 text-slate-700 hover:bg-amber-50"
          )}
        >
          <div className="flex justify-between items-start">
            <p className={cn("text-sm font-medium mb-1", filter === "warning" ? "opacity-90" : "text-amber-600")}>Avisos</p>
            <AlertTriangle className={cn("h-5 w-5", filter === "warning" ? "opacity-80" : "text-amber-500")} />
          </div>
          <p className="text-2xl font-bold">{warningCount}</p>
        </button>

        <button 
          onClick={() => setFilter("info")}
          className={cn(
            "p-4 rounded-xl border text-left transition-all",
            filter === "info" ? "bg-sky-500 text-white border-sky-500 shadow-md shadow-sky-200" : "bg-white border-slate-200 text-slate-700 hover:bg-sky-50"
          )}
        >
          <div className="flex justify-between items-start">
            <p className={cn("text-sm font-medium mb-1", filter === "info" ? "opacity-90" : "text-sky-600")}>Informações</p>
            <Info className={cn("h-5 w-5", filter === "info" ? "opacity-80" : "text-sky-500")} />
          </div>
          <p className="text-2xl font-bold">{infoCount}</p>
        </button>
      </div>

      {/* Main Panel */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar alertas..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 w-full sm:w-auto justify-center">
              <Filter className="h-4 w-4" />
              Mais Filtros
            </button>
          </div>
        </div>

        {/* List */}
        <div className="divide-y divide-slate-100">
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map(alert => (
              <div key={alert.id} className="p-5 hover:bg-slate-50 transition-colors group flex flex-col sm:flex-row gap-4 sm:items-center">
                
                {/* Icon & Status */}
                <div className="flex-shrink-0 flex items-start gap-4 w-full sm:w-auto">
                  <div className={cn("p-2.5 rounded-full flex-shrink-0 border", severityColors[alert.severity])}>
                    {alert.icon}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-bold text-slate-800 truncate">{alert.title}</h4>
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-slate-100 text-slate-500 border border-slate-200">
                      {alert.module}
                    </span>
                    <span className="text-xs text-slate-400 whitespace-nowrap ml-auto sm:ml-2">
                      {alert.time}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2 sm:line-clamp-1">{alert.description}</p>
                </div>

                {/* Action */}
                <div className="flex-shrink-0 sm:opacity-0 group-hover:opacity-100 transition-opacity mt-2 sm:mt-0">
                  <button className="flex items-center justify-center gap-1.5 w-full sm:w-auto px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
                    {alert.actionText}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <AlertCircle className="h-6 w-6 text-slate-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-800">Nenhum alerta encontrado</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm">
                Não encontramos alertas correspondentes aos filtros selecionados.
              </p>
              <button 
                onClick={() => { setFilter("all"); setSearch(""); }}
                className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
