"use client";

import React, { useState } from "react";
import { 
  Search, 
  Edit,
  X,
  Check,
  Receipt,
  FileBadge,
  Percent
} from "lucide-react";

// --- Types & Mocks ---
interface ServiceTax {
  id: string;
  sku: string;
  name: string;
  codigoLC116: string;
  aliquotaISS: number;
  retencaoFonte: boolean;
  cnae: string;
}

const mockTaxes: ServiceTax[] = [
  { id: "s1", sku: "SRV-ARTE-001", name: "Criação de Arte Básica", codigoLC116: "24.01", aliquotaISS: 5.0, retencaoFonte: false, cnae: "7410-2/02" },
  { id: "s2", sku: "SRV-INST-002", name: "Instalação de Fachada / Lona", codigoLC116: "14.06", aliquotaISS: 2.5, retencaoFonte: true, cnae: "4329-1/04" },
  { id: "s3", sku: "SRV-MANU-003", name: "Manutenção Preventiva de Totem", codigoLC116: "14.01", aliquotaISS: 3.0, retencaoFonte: false, cnae: "3319-8/00" },
];

export function ServicosTributarioView() {
  const [services] = useState<ServiceTax[]>(mockTaxes);
  const [search, setSearch] = useState("");
  const [editingService, setEditingService] = useState<ServiceTax | null>(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.sku.toLowerCase().includes(search.toLowerCase()) ||
    s.codigoLC116.includes(search)
  );

  const openEditor = (service: ServiceTax) => {
    setEditingService(service);
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
            <Receipt className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Serviços - Tributário</h2>
            <p className="text-sm text-slate-500">Configurações de ISS, Retenções e enquadramento LC 116 para NFS-e.</p>
          </div>
        </div>
      </div>

      {/* Data Grid */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por nome, SKU ou Cód LC116..." 
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
                <th className="px-6 py-4">Serviço</th>
                <th className="px-6 py-4">Cód. LC 116/03</th>
                <th className="px-6 py-4">CNAE Vinculado</th>
                <th className="px-6 py-4 text-center">Alíquota ISS (%)</th>
                <th className="px-6 py-4">Retém na Fonte?</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredServices.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => openEditor(s)}>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-800">{s.name}</p>
                    <p className="font-mono text-xs text-slate-500 mt-0.5">{s.sku}</p>
                  </td>
                  <td className="px-6 py-4 font-mono font-medium text-violet-700">{s.codigoLC116}</td>
                  <td className="px-6 py-4 font-mono text-slate-500">{s.cnae}</td>
                  <td className="px-6 py-4 text-center font-bold text-slate-700">{s.aliquotaISS.toFixed(2)}%</td>
                  <td className="px-6 py-4">
                    {s.retencaoFonte ? (
                      <span className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded text-xs font-bold uppercase border border-orange-200">Sim</span>
                    ) : (
                      <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-xs font-bold uppercase border border-slate-200">Não</span>
                    )}
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
      {isSlideOverOpen && editingService && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={closeEditor} />
          
          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10 animate-slide-in-right">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full border-l border-slate-200">
              
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-violet-50/50">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800" id="slide-over-title">
                    Editar Tributos do Serviço
                  </h2>
                  <p className="text-xs text-violet-600 font-mono mt-0.5">{editingService.sku}</p>
                </div>
                <button 
                  onClick={closeEditor}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors focus:outline-none"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                
                {/* Visual Header */}
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 mb-6">
                  <Receipt className="h-8 w-8 text-slate-400" />
                  <div>
                    <h3 className="font-semibold text-slate-800">{editingService.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">Parâmetros para emissão de Nota Fiscal de Serviço.</p>
                  </div>
                </div>

                <form className="space-y-6">
                  
                  {/* Enquadramento */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <FileBadge className="h-4 w-4 text-violet-600" /> Enquadramento Fiscal
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Código de Serviço (Lei Complementar 116/2003)</label>
                        <input 
                          type="text" 
                          defaultValue={editingService.codigoLC116}
                          placeholder="Ex: 24.01"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none text-sm shadow-sm font-mono" 
                        />
                        <p className="text-[10px] text-slate-400 mt-1">Item da lista anexa à LC 116.</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">CNAE Vinculado</label>
                        <input 
                          type="text" 
                          defaultValue={editingService.cnae}
                          placeholder="Ex: 7410-2/02"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none text-sm shadow-sm font-mono" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <Percent className="h-4 w-4 text-violet-600" /> Impostos e Retenções
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Alíquota Padrão de ISS (%)</label>
                        <input 
                          type="number"
                          step="0.01" 
                          defaultValue={editingService.aliquotaISS}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none text-sm shadow-sm font-mono text-violet-700 font-bold" 
                        />
                      </div>
                      
                      <label className="flex items-start gap-3 p-3 border border-orange-200 bg-orange-50/50 rounded-lg cursor-pointer hover:bg-orange-50 transition-colors mt-2">
                        <div className="flex items-center h-5">
                          <input 
                            type="checkbox" 
                            defaultChecked={editingService.retencaoFonte}
                            className="h-4 w-4 text-orange-600 border-orange-300 rounded focus:ring-orange-500" 
                          />
                        </div>
                        <div className="flex-1">
                          <span className="block text-sm font-semibold text-orange-800">Sujeito a Retenção de ISS na Fonte</span>
                          <span className="block text-xs text-orange-600/80 mt-0.5">O tomador do serviço será o responsável pelo recolhimento do ISS.</span>
                        </div>
                      </label>
                    </div>
                  </div>

                </form>
              </div>

              <div className="border-t border-slate-100 p-4 bg-slate-50 flex justify-end gap-3">
                <button onClick={closeEditor} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors shadow-sm">
                  Cancelar
                </button>
                <button className="px-4 py-2 flex items-center gap-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors shadow-sm">
                  <Check className="h-4 w-4" />
                  Salvar Regras Fiscais
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
