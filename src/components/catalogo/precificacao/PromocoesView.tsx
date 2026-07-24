"use client";

import React, { useState } from "react";
import { 
  Search, 
  Plus, 
  Edit,
  X,
  Check,
  Megaphone,
  Calendar,
  Percent,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Promotion {
  id: string;
  name: string;
  discountType: "percentual" | "fixo";
  discountValue: number;
  startDate: string;
  endDate: string;
  status: "ativa" | "agendada" | "expirada";
  target: string;
}

const mockPromos: Promotion[] = [
  { id: "p1", name: "Black Friday Gráfica", discountType: "percentual", discountValue: 20, startDate: "2024-11-01", endDate: "2024-11-30", status: "expirada", target: "Todas Categorias" },
  { id: "p2", name: "Queima de Estoque Lonas", discountType: "percentual", discountValue: 15, startDate: "2026-06-01", endDate: "2026-12-31", status: "ativa", target: "Comunicação Visual" },
  { id: "p3", name: "Dia do Cliente (Brindes)", discountType: "percentual", discountValue: 10, startDate: "2026-09-15", endDate: "2026-09-20", status: "agendada", target: "Brindes" },
];

export function PromocoesView() {
  const [promos] = useState<Promotion[]>(mockPromos);
  const [search, setSearch] = useState("");
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);

  const filteredPromos = promos.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const openEditor = (promo?: Promotion) => {
    setEditingPromo(promo || { id: "", name: "", discountType: "percentual", discountValue: 0, startDate: "", endDate: "", status: "agendada", target: "Todas Categorias" });
    setIsSlideOverOpen(true);
  };

  const closeEditor = () => {
    setIsSlideOverOpen(false);
    setTimeout(() => setEditingPromo(null), 300);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativa": return "border-emerald-200 bg-emerald-50 text-emerald-700";
      case "agendada": return "border-blue-200 bg-blue-50 text-blue-700";
      case "expirada": return "border-slate-200 bg-slate-50 text-slate-500";
      default: return "";
    }
  };

  return (
    <div className="relative animate-fade-in pb-10">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-fuchsia-100 text-fuchsia-600 rounded-lg">
            <Megaphone className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Promoções e Descontos</h2>
            <p className="text-sm text-slate-500">Campanhas sazonais para impulsionar vendas no catálogo.</p>
          </div>
        </div>
        <button 
          onClick={() => openEditor()}
          className="flex items-center gap-2 text-sm font-medium text-white bg-fuchsia-600 hover:bg-fuchsia-700 px-4 py-2 rounded-lg transition-colors w-full sm:w-auto justify-center shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Nova Campanha
        </button>
      </div>

      {/* Toolbar */}
      <div className="mb-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar campanha..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500 bg-white shadow-sm"
          />
        </div>
      </div>

      {/* Cards de Campanhas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPromos.map((promo) => (
          <div 
            key={promo.id} 
            onClick={() => openEditor(promo)}
            className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-fuchsia-300 hover:shadow-md transition-all cursor-pointer group flex flex-col"
          >
            {/* Status Header */}
            <div className={cn("px-4 py-2 border-b flex justify-between items-center", getStatusColor(promo.status))}>
              <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                {promo.status === 'ativa' && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                {promo.status}
              </span>
              <button className="text-current opacity-0 group-hover:opacity-100 transition-opacity">
                <Edit className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="p-5 flex-1 flex flex-col">
              <h3 className="text-lg font-bold text-slate-800 line-clamp-1 mb-1">{promo.name}</h3>
              <p className="text-xs text-slate-500 mb-4">{promo.target}</p>

              <div className="flex items-baseline gap-1 mb-6 mt-auto">
                <span className="text-3xl font-black text-fuchsia-600">
                  {promo.discountType === 'percentual' ? `${promo.discountValue}%` : `R$ ${promo.discountValue.toFixed(2)}`}
                </span>
                <span className="text-sm font-bold text-fuchsia-600/60 uppercase tracking-wider">OFF</span>
              </div>

              <div className="flex items-center gap-4 border-t border-slate-100 pt-4">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Calendar className="h-3.5 w-3.5" /> {promo.startDate}
                </div>
                <div className="text-slate-300 text-xs">até</div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock className="h-3.5 w-3.5" /> {promo.endDate}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Slide-over */}
      {isSlideOverOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={closeEditor} />
          
          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10 animate-slide-in-right">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full border-l border-slate-200">
              
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-fuchsia-50/50">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2" id="slide-over-title">
                  <Megaphone className="h-5 w-5 text-fuchsia-600" />
                  {editingPromo?.id ? "Editar Campanha" : "Nova Campanha"}
                </h2>
                <button 
                  onClick={closeEditor}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors focus:outline-none"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                <form className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Campanha</label>
                    <input 
                      type="text" 
                      defaultValue={editingPromo?.name}
                      placeholder="Ex: Black Friday 2026"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:outline-none text-sm shadow-sm" 
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <Percent className="h-4 w-4 text-fuchsia-600" /> Regra de Desconto
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Desconto</label>
                        <select 
                          defaultValue={editingPromo?.discountType}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:outline-none text-sm shadow-sm"
                        >
                          <option value="percentual">Percentual (%)</option>
                          <option value="fixo">Valor Fixo (R$)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Valor</label>
                        <input 
                          type="number" 
                          defaultValue={editingPromo?.discountValue}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:outline-none text-sm shadow-sm font-mono font-bold text-fuchsia-700" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-fuchsia-600" /> Período de Vigência
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Data de Início</label>
                        <input 
                          type="date" 
                          defaultValue={editingPromo?.startDate}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:outline-none text-sm shadow-sm" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Data Final</label>
                        <input 
                          type="date" 
                          defaultValue={editingPromo?.endDate}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:outline-none text-sm shadow-sm" 
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Público / Categoria Alvo</label>
                    <select 
                      defaultValue={editingPromo?.target}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:outline-none text-sm shadow-sm"
                    >
                      <option value="Todas Categorias">Toda a Loja (Catálogo Global)</option>
                      <option value="Comunicação Visual">Apenas Comunicação Visual</option>
                      <option value="Brindes">Apenas Brindes</option>
                      <option value="Gráfica Rápida">Apenas Gráfica Rápida</option>
                    </select>
                  </div>

                </form>
              </div>

              <div className="border-t border-slate-100 p-4 bg-slate-50 flex justify-end gap-3">
                <button onClick={closeEditor} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors shadow-sm">
                  Cancelar
                </button>
                <button className="px-4 py-2 flex items-center gap-2 text-sm font-medium text-white bg-fuchsia-600 hover:bg-fuchsia-700 rounded-lg transition-colors shadow-sm">
                  <Check className="h-4 w-4" />
                  Salvar Campanha
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
