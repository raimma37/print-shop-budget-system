"use client";

import React, { useState } from "react";
import { 
  Scale, 
  Search, 
  Plus, 
  MoreHorizontal, 
  Package, 
  Wrench,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Unidade {
  id: string;
  sigla: string;
  descricao: string;
  tipo: "produto" | "servico" | "ambos";
  casasDecimais: number;
}

const mockUnidades: Unidade[] = [
  { id: "u1", sigla: "UN", descricao: "Unidade", tipo: "ambos", casasDecimais: 0 },
  { id: "u2", sigla: "M2", descricao: "Metro Quadrado", tipo: "produto", casasDecimais: 4 },
  { id: "u3", sigla: "KG", descricao: "Quilograma", tipo: "produto", casasDecimais: 3 },
  { id: "u4", sigla: "CX", descricao: "Caixa", tipo: "produto", casasDecimais: 0 },
  { id: "u5", sigla: "HR", descricao: "Hora", tipo: "servico", casasDecimais: 1 },
  { id: "u6", sigla: "DIA", descricao: "Diária", tipo: "servico", casasDecimais: 0 },
  { id: "u7", sigla: "EMP", descricao: "Empreitada", tipo: "servico", casasDecimais: 0 },
];

export function UnidadesMedidaView() {
  const [unidades] = useState<Unidade[]>(mockUnidades);
  const [filterType, setFilterType] = useState<"todos" | "produto" | "servico">("todos");
  const [search, setSearch] = useState("");

  const filteredUnidades = unidades.filter(u => {
    const matchesFilter = filterType === "todos" || u.tipo === filterType || u.tipo === "ambos";
    const matchesSearch = u.sigla.toLowerCase().includes(search.toLowerCase()) || 
                          u.descricao.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getTipoBadge = (tipo: Unidade["tipo"]) => {
    switch (tipo) {
      case "produto":
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider"><Package className="h-3 w-3" /> Produto</span>;
      case "servico":
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-violet-100 text-violet-700 text-xs font-bold uppercase tracking-wider"><Wrench className="h-3 w-3" /> Serviço</span>;
      case "ambos":
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider"><CheckCircle2 className="h-3 w-3" /> Ambos</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-10">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-sky-100 text-sky-600 rounded-lg">
            <Scale className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Unidades de Medida</h2>
            <p className="text-sm text-slate-500">Métricas utilizadas para precificar e controlar estoque.</p>
          </div>
        </div>
        <button className="flex items-center gap-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 px-4 py-2 rounded-lg transition-colors w-full sm:w-auto justify-center shadow-sm">
          <Plus className="h-4 w-4" />
          Nova Unidade
        </button>
      </div>

      {/* Tabela de Cadastros */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
          
          {/* Filtros em Tabs */}
          <div className="flex p-1 bg-slate-200/50 rounded-lg w-full sm:w-auto overflow-x-auto">
            <button 
              onClick={() => setFilterType("todos")}
              className={cn("px-4 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors", filterType === "todos" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700")}
            >
              Todas
            </button>
            <button 
              onClick={() => setFilterType("produto")}
              className={cn("px-4 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5", filterType === "produto" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-700")}
            >
              <Package className="h-4 w-4" /> Produtos
            </button>
            <button 
              onClick={() => setFilterType("servico")}
              className={cn("px-4 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5", filterType === "servico" ? "bg-white text-violet-700 shadow-sm" : "text-slate-500 hover:text-slate-700")}
            >
              <Wrench className="h-4 w-4" /> Serviços
            </button>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar unidade (ex: KG, M2)..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Sigla</th>
                <th className="px-6 py-4">Descrição</th>
                <th className="px-6 py-4">Aplicação (Tipo)</th>
                <th className="px-6 py-4 text-center">Casas Decimais</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUnidades.length > 0 ? (
                filteredUnidades.map((unidade) => (
                  <tr key={unidade.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {unidade.sigla}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {unidade.descricao}
                    </td>
                    <td className="px-6 py-4">
                      {getTipoBadge(unidade.tipo)}
                    </td>
                    <td className="px-6 py-4 text-center font-mono">
                      {unidade.casasDecimais}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-100 rounded transition-colors opacity-0 group-hover:opacity-100">
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Scale className="h-10 w-10 text-slate-300 mb-3" />
                      <p className="text-base font-semibold text-slate-800">Nenhuma unidade encontrada</p>
                      <p className="text-sm text-slate-500 mt-1">Sua busca não retornou resultados.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
