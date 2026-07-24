"use client";

import React, { useState } from "react";
import { 
  Search, 
  Plus, 
  Edit,
  X,
  Check,
  TableProperties,
  Calendar,
  DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PriceTable {
  id: string;
  name: string;
  type: "Varejo" | "Atacado" | "Revenda" | "Especial";
  status: "ativo" | "inativo" | "expirado";
  validUntil?: string;
  markupMultiplier: number;
}

const mockTables: PriceTable[] = [
  { id: "t1", name: "Tabela Balcão (Padrão)", type: "Varejo", status: "ativo", markupMultiplier: 1.0 },
  { id: "t2", name: "Tabela Revendedores Ouro", type: "Revenda", status: "ativo", markupMultiplier: 0.8 },
  { id: "t3", name: "Atacado (> 100un)", type: "Atacado", status: "ativo", validUntil: "2026-12-31", markupMultiplier: 0.85 },
  { id: "t4", name: "Campanha Prefeituras 2024", type: "Especial", status: "expirado", validUntil: "2024-12-31", markupMultiplier: 0.9 },
];

export function TabelasPrecoView() {
  const [tables] = useState<PriceTable[]>(mockTables);
  const [search, setSearch] = useState("");
  const [editingTable, setEditingTable] = useState<PriceTable | null>(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);

  const filteredTables = tables.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const openEditor = (table?: PriceTable) => {
    setEditingTable(table || { id: "", name: "", type: "Varejo", status: "ativo", markupMultiplier: 1.0 });
    setIsSlideOverOpen(true);
  };

  const closeEditor = () => {
    setIsSlideOverOpen(false);
    setTimeout(() => setEditingTable(null), 300);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ativo": return <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full bg-emerald-100 text-emerald-700">Ativo</span>;
      case "inativo": return <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full bg-slate-100 text-slate-500">Inativo</span>;
      case "expirado": return <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full bg-red-100 text-red-700">Expirado</span>;
    }
  };

  return (
    <div className="relative animate-fade-in pb-10">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <TableProperties className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Tabelas de Preços</h2>
            <p className="text-sm text-slate-500">Gerencie múltiplas listas de preços e públicos-alvo.</p>
          </div>
        </div>
        <button 
          onClick={() => openEditor()}
          className="flex items-center gap-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors w-full sm:w-auto justify-center shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Nova Tabela
        </button>
      </div>

      {/* Data Grid */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar tabela..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Nome da Tabela</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4 text-center">Multiplicador Base</th>
                <th className="px-6 py-4">Validade</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTables.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => openEditor(t)}>
                  <td className="px-6 py-4 font-medium text-slate-800">{t.name}</td>
                  <td className="px-6 py-4">{t.type}</td>
                  <td className="px-6 py-4 text-center font-mono font-medium text-blue-700">
                    {t.markupMultiplier === 1.0 ? "Padrão (1x)" : `${t.markupMultiplier}x`}
                  </td>
                  <td className="px-6 py-4">
                    {t.validUntil ? (
                      <span className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Calendar className="h-3.5 w-3.5" /> {t.validUntil}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Sem validade</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(t.status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={(e) => { e.stopPropagation(); openEditor(t); }}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over */}
      {isSlideOverOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={closeEditor} />
          
          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10 animate-slide-in-right">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full border-l border-slate-200">
              
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-blue-50/50">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2" id="slide-over-title">
                  <TableProperties className="h-5 w-5 text-blue-600" />
                  {editingTable?.id ? "Editar Tabela" : "Nova Tabela"}
                </h2>
                <button 
                  onClick={closeEditor}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors focus:outline-none"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                <form className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Tabela Comercial</label>
                    <input 
                      type="text" 
                      defaultValue={editingTable?.name}
                      placeholder="Ex: Tabela Representantes 2024"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm shadow-sm" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Público</label>
                      <select 
                        defaultValue={editingTable?.type}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm shadow-sm"
                      >
                        <option value="Varejo">Varejo (Balcão)</option>
                        <option value="Atacado">Atacado</option>
                        <option value="Revenda">Revenda (B2B)</option>
                        <option value="Especial">Especial</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                      <select 
                        defaultValue={editingTable?.status}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm shadow-sm"
                      >
                        <option value="ativo">Ativo</option>
                        <option value="inativo">Inativo</option>
                        <option value="expirado">Expirado</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-blue-600" /> Parâmetros de Preço
                    </h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Multiplicador de Preço Base (Fator)</label>
                        <input 
                          type="number" 
                          step="0.01"
                          defaultValue={editingTable?.markupMultiplier}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm shadow-sm font-mono text-blue-700 font-bold" 
                        />
                        <p className="text-xs text-slate-500 mt-1">Ex: 0.85 aplica 15% de desconto sobre o preço de custo geral para quem usar esta tabela.</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Validade da Tabela (Opcional)</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <input 
                            type="date" 
                            defaultValue={editingTable?.validUntil}
                            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm shadow-sm" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              <div className="border-t border-slate-100 p-4 bg-slate-50 flex justify-end gap-3">
                <button onClick={closeEditor} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors shadow-sm">
                  Cancelar
                </button>
                <button className="px-4 py-2 flex items-center gap-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm">
                  <Check className="h-4 w-4" />
                  Salvar Tabela
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
