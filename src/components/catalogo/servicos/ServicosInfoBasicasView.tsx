"use client";

import React, { useState } from "react";
import { 
  Search, 
  Plus, 
  Edit,
  X,
  Check,
  Wrench
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Types & Mocks ---
interface Service {
  id: string;
  sku: string;
  name: string;
  category: string;
  status: "ativo" | "inativo";
  billingUnit: string;
}

const mockServices: Service[] = [
  { id: "s1", sku: "SRV-ARTE-001", name: "Criação de Arte Básica", category: "Design Gráfico", status: "ativo", billingUnit: "Hora (HR)" },
  { id: "s2", sku: "SRV-INST-002", name: "Instalação de Fachada / Lona", category: "Instalação", status: "ativo", billingUnit: "Empreitada (EMP)" },
  { id: "s3", sku: "SRV-MANU-003", name: "Manutenção Preventiva de Totem", category: "Manutenção", status: "inativo", billingUnit: "Diária (DIA)" },
];

export function ServicosInfoBasicasView() {
  const [services] = useState<Service[]>(mockServices);
  const [search, setSearch] = useState("");
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.sku.toLowerCase().includes(search.toLowerCase())
  );

  const openEditor = (service?: Service) => {
    setEditingService(service || { id: "", sku: "", name: "", category: "", status: "ativo", billingUnit: "" });
    setIsSlideOverOpen(true);
  };

  const closeEditor = () => {
    setIsSlideOverOpen(false);
    setTimeout(() => setEditingService(null), 300);
  };

  return (
    <div className="relative animate-fade-in pb-10">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-violet-100 text-violet-600 rounded-lg">
            <Wrench className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Serviços - Informações Básicas</h2>
            <p className="text-sm text-slate-500">Cadastre mãos de obra, instalações e criações intelectuais.</p>
          </div>
        </div>
        <button 
          onClick={() => openEditor()}
          className="flex items-center gap-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded-lg transition-colors w-full sm:w-auto justify-center shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Novo Serviço
        </button>
      </div>

      {/* Data Grid */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por nome ou código..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Código SKU</th>
                <th className="px-6 py-4">Nome do Serviço</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Unidade Base</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredServices.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => openEditor(s)}>
                  <td className="px-6 py-4 font-mono text-slate-500">{s.sku}</td>
                  <td className="px-6 py-4 font-medium text-slate-800">{s.name}</td>
                  <td className="px-6 py-4">{s.category}</td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-semibold">{s.billingUnit}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full",
                      s.status === "ativo" ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-500"
                    )}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={(e) => { e.stopPropagation(); openEditor(s); }}
                      className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-100 rounded transition-colors opacity-0 group-hover:opacity-100"
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

      {/* Slide-over (Painel Lateral) */}
      {isSlideOverOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={closeEditor} />
          
          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10 animate-slide-in-right">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full border-l border-slate-200">
              
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-violet-50/50">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2" id="slide-over-title">
                  <Wrench className="h-5 w-5 text-violet-600" />
                  {editingService?.id ? "Editar Serviço" : "Novo Serviço"}
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
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Serviço</label>
                    <input 
                      type="text" 
                      defaultValue={editingService?.name}
                      placeholder="Ex: Instalação de Fachada"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none text-sm shadow-sm" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Cód. Interno / SKU</label>
                      <input 
                        type="text" 
                        defaultValue={editingService?.sku}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none text-sm shadow-sm font-mono" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                      <select 
                        defaultValue={editingService?.status}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none text-sm shadow-sm"
                      >
                        <option value="ativo">Ativo</option>
                        <option value="inativo">Inativo</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Categoria Pai</label>
                    <select 
                      defaultValue={editingService?.category}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none text-sm shadow-sm"
                    >
                      <option value="">Selecione...</option>
                      <option value="Design Gráfico">Design Gráfico</option>
                      <option value="Instalação">Instalação</option>
                      <option value="Manutenção">Manutenção</option>
                      <option value="Consultoria">Consultoria</option>
                    </select>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Unidade Base de Cobrança</label>
                    <select 
                      defaultValue={editingService?.billingUnit}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none text-sm shadow-sm"
                    >
                      <option value="">Selecione a Métrica...</option>
                      <option value="Hora (HR)">Hora (HR)</option>
                      <option value="Diária (DIA)">Diária (DIA)</option>
                      <option value="Empreitada (EMP)">Empreitada (EMP)</option>
                      <option value="Metro Quadrado (M2)">Metro Quadrado (M2)</option>
                    </select>
                    <p className="text-xs text-slate-500 mt-1">Define como este serviço será multiplicado no orçamento.</p>
                  </div>
                </form>
              </div>

              <div className="border-t border-slate-100 p-4 bg-slate-50 flex justify-end gap-3">
                <button onClick={closeEditor} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors shadow-sm">
                  Cancelar
                </button>
                <button className="px-4 py-2 flex items-center gap-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors shadow-sm">
                  <Check className="h-4 w-4" />
                  Salvar Serviço
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
