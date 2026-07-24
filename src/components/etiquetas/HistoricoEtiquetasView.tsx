"use client";

import React, { useState } from "react";
import { 
  Search, 
  History,
  RotateCcw,
  Calendar,
  Printer,
  User,
  Filter
} from "lucide-react";

interface PrintLog {
  id: string;
  batchId: string;
  timestamp: string;
  user: string;
  totalLabels: number;
  templateName: string;
  status: "sucesso" | "falha";
}

const mockLogs: PrintLog[] = [
  { id: "log1", batchId: "LOTE-240719-01", timestamp: "2026-07-19 10:15:22", user: "João Operador", totalLabels: 45, templateName: "Etiqueta Gôndola Padrão", status: "sucesso" },
  { id: "log2", batchId: "LOTE-240718-03", timestamp: "2026-07-18 16:40:05", user: "Maria Gerente", totalLabels: 120, templateName: "Etiqueta Código de Barras", status: "sucesso" },
  { id: "log3", batchId: "LOTE-240718-02", timestamp: "2026-07-18 14:20:00", user: "Sistema Automático", totalLabels: 15, templateName: "Etiqueta Promocional Amarela", status: "falha" },
  { id: "log4", batchId: "LOTE-240717-05", timestamp: "2026-07-17 09:10:10", user: "João Operador", totalLabels: 5, templateName: "Etiqueta Gôndola Padrão", status: "sucesso" },
];

export function HistoricoEtiquetasView() {
  const [logs] = useState<PrintLog[]>(mockLogs);
  const [search, setSearch] = useState("");

  const filteredLogs = logs.filter(log => 
    log.batchId.toLowerCase().includes(search.toLowerCase()) ||
    log.user.toLowerCase().includes(search.toLowerCase()) ||
    log.templateName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative animate-fade-in pb-10">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-800 text-white rounded-lg">
            <History className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Histórico de Impressão</h2>
            <p className="text-sm text-slate-500">Audite todos os lotes gerados e reimprima se houver falha de papel.</p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 px-4 py-2 rounded-lg transition-colors shadow-sm">
            <Calendar className="h-4 w-4" />
            Hoje
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
              placeholder="Buscar por lote, usuário ou template..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-slate-400" />
            <select className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-slate-500">
              <option value="all">Todos os Status</option>
              <option value="sucesso">Sucesso</option>
              <option value="falha">Falhas</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Data e Hora</th>
                <th className="px-6 py-4">Lote (ID)</th>
                <th className="px-6 py-4">Operador</th>
                <th className="px-6 py-4">Template Utilizado</th>
                <th className="px-6 py-4 text-center">Qtd. Total</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-mono text-xs">
                    {log.timestamp}
                  </td>
                  <td className="px-6 py-4 font-mono font-medium text-slate-700">
                    {log.batchId}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-slate-400" />
                      <span className="font-medium text-slate-800">{log.user}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {log.templateName}
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-slate-800">
                    {log.totalLabels}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {log.status === 'sucesso' ? (
                      <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Sucesso</span>
                    ) : (
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Falha</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      title="Reimprimir Lote"
                      className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors opacity-0 group-hover:opacity-100 flex items-center gap-1.5 ml-auto text-xs font-bold"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reimprimir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
