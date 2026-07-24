"use client";

import React, { useState } from "react";
import { 
  Search,
  ShieldCheck,
  Calendar,
  Filter,
  ArrowRight,
  Database,
  History,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: "create" | "update" | "delete" | "login";
  module: string;
  description: string;
  ip: string;
}

const mockLogs: LogEntry[] = [
  { id: "l1", timestamp: "2026-07-19 14:30:12", user: "Admin", action: "update", module: "Regras de Markup", description: "Alterou 'Margem de Lucro' de 30% para 40%", ip: "192.168.1.100" },
  { id: "l2", timestamp: "2026-07-19 11:15:00", user: "João Vendas", action: "create", module: "Tabelas de Preço", description: "Criou a tabela 'Revenda Ouro'", ip: "192.168.1.102" },
  { id: "l3", timestamp: "2026-07-18 17:45:22", user: "Admin", action: "delete", module: "Produtos", description: "Excluiu o produto SKU 'CV-LONA-008'", ip: "192.168.1.100" },
  { id: "l4", timestamp: "2026-07-18 09:00:01", user: "João Vendas", action: "login", module: "Sistema", description: "Login bem-sucedido", ip: "192.168.1.102" },
  { id: "l5", timestamp: "2026-07-17 15:20:10", user: "Maria Estoque", action: "update", module: "Regras de Estoque", description: "Ajustou estoque máximo do SKU 'BR-CAN-003' para 1000", ip: "192.168.1.105" },
];

export function AuditoriaView() {
  const [logs] = useState<LogEntry[]>(mockLogs);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.description.toLowerCase().includes(search.toLowerCase()) || 
                          log.user.toLowerCase().includes(search.toLowerCase()) ||
                          log.module.toLowerCase().includes(search.toLowerCase());
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const getActionStyles = (action: string) => {
    switch (action) {
      case "create": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "update": return "bg-blue-50 text-blue-700 border-blue-200";
      case "delete": return "bg-red-50 text-red-700 border-red-200";
      case "login": return "bg-slate-100 text-slate-600 border-slate-200";
      default: return "";
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case "create": return "Criação";
      case "update": return "Alteração";
      case "delete": return "Exclusão";
      case "login": return "Acesso";
      default: return action;
    }
  };

  return (
    <div className="relative animate-fade-in pb-10">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-800 text-white rounded-lg">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Logs e Auditoria</h2>
            <p className="text-sm text-slate-500">Rastreamento sistêmico de todas as operações e alterações.</p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 px-4 py-2 rounded-lg transition-colors shadow-sm">
            <Calendar className="h-4 w-4" />
            Últimos 7 dias
          </button>
        </div>
      </div>

      {/* Data Grid */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por usuário, módulo ou descrição..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            <Filter className="h-4 w-4 text-slate-400" />
            <select 
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              <option value="all">Todas as Ações</option>
              <option value="create">Criações</option>
              <option value="update">Alterações</option>
              <option value="delete">Exclusões</option>
              <option value="login">Acessos</option>
            </select>
          </div>
        </div>

        {/* Timeline View / Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 w-48">Data e Hora</th>
                <th className="px-6 py-4 w-48">Usuário</th>
                <th className="px-6 py-4 w-32">Tipo</th>
                <th className="px-6 py-4 w-48">Módulo</th>
                <th className="px-6 py-4">Descrição da Ação</th>
                <th className="px-6 py-4 text-right">IP Origem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-slate-500 font-mono text-xs">
                        <History className="h-3.5 w-3.5" />
                        {log.timestamp}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-medium text-slate-800">
                        <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center border border-slate-300">
                          <User className="h-3 w-3 text-slate-500" />
                        </div>
                        {log.user}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded border",
                        getActionStyles(log.action)
                      )}>
                        {getActionLabel(log.action)}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700 flex items-center gap-2 mt-2">
                      <Database className="h-3.5 w-3.5 text-slate-400" />
                      {log.module}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {log.description}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-xs text-slate-400">
                      {log.ip}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Nenhum registro de auditoria encontrado para estes filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center text-xs text-slate-500">
          <span>Mostrando 50 registros mais recentes.</span>
          <button className="flex items-center gap-1 hover:text-slate-800 transition-colors font-medium">
            Ver Histórico Completo <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>

    </div>
  );
}
