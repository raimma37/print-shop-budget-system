"use client";

import React, { useState } from "react";
import { 
  Search, 
  Edit,
  X,
  Check,
  FileText,
  Landmark,
  Percent
} from "lucide-react";

// --- Types & Mocks ---
interface ProductFiscal {
  id: string;
  sku: string;
  name: string;
  ncm: string;
  cest: string;
  origem: string;
  icms: string;
}

const mockFiscal: ProductFiscal[] = [
  { id: "p1", sku: "CV-LONA-B-001", name: "Banner Lona Brilho 440g", ncm: "4911.10.90", cest: "28.061.00", origem: "0 - Nacional", icms: "00 - Tributada Integralmente" },
  { id: "p2", sku: "CV-ADES-002", name: "Adesivo Vinil Leitoso", ncm: "3919.90.00", cest: "", origem: "1 - Estrangeira", icms: "00 - Tributada Integralmente" },
  { id: "p3", sku: "BR-CAN-003", name: "Caneta Plástica Personalizada", ncm: "9608.10.00", cest: "21.085.00", origem: "2 - Estrangeira", icms: "10 - Tributada com ICMS ST" },
  { id: "p4", sku: "GR-CART-004", name: "Cartão de Visita Couché 300g", ncm: "4911.10.90", cest: "", origem: "0 - Nacional", icms: "00 - Tributada Integralmente" },
  { id: "p5", sku: "CV-LONA-F-005", name: "Banner Lona Fosca 340g", ncm: "4911.10.90", cest: "28.061.00", origem: "0 - Nacional", icms: "00 - Tributada Integralmente" },
];

export function TributarioView() {
  const [products] = useState<ProductFiscal[]>(mockFiscal);
  const [search, setSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState<ProductFiscal | null>(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    p.ncm.includes(search)
  );

  const openEditor = (product: ProductFiscal) => {
    setEditingProduct(product);
    setIsSlideOverOpen(true);
  };

  const closeEditor = () => {
    setIsSlideOverOpen(false);
    setTimeout(() => setEditingProduct(null), 300);
  };

  return (
    <div className="relative animate-fade-in pb-10">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Tributário e Fiscal</h2>
            <p className="text-sm text-slate-500">Classificação fiscal, NCM, CEST e regras de impostos para faturamento.</p>
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
              placeholder="Buscar por nome, SKU ou NCM..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Produto</th>
                <th className="px-6 py-4">NCM</th>
                <th className="px-6 py-4">CEST</th>
                <th className="px-6 py-4">Origem</th>
                <th className="px-6 py-4">Situação ICMS (CSOSN/CST)</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => openEditor(p)}>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-800">{p.name}</p>
                    <p className="font-mono text-xs text-slate-500 mt-0.5">{p.sku}</p>
                  </td>
                  <td className="px-6 py-4 font-mono text-emerald-700 font-medium">{p.ncm}</td>
                  <td className="px-6 py-4 font-mono text-slate-500">{p.cest || "-"}</td>
                  <td className="px-6 py-4 text-xs">{p.origem}</td>
                  <td className="px-6 py-4 text-xs truncate max-w-[200px]" title={p.icms}>{p.icms}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={(e) => { e.stopPropagation(); openEditor(p); }}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-100 rounded transition-colors opacity-0 group-hover:opacity-100"
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
      {isSlideOverOpen && editingProduct && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={closeEditor} />
          
          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10 animate-slide-in-right">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full">
              
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-emerald-50/50">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800" id="slide-over-title">
                    Editar Tributos
                  </h2>
                  <p className="text-xs text-emerald-600 font-mono mt-0.5">{editingProduct.sku}</p>
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
                  <Landmark className="h-8 w-8 text-slate-400" />
                  <div>
                    <h3 className="font-semibold text-slate-800">{editingProduct.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">Impostos incidentes neste produto.</p>
                  </div>
                </div>

                <form className="space-y-6">
                  
                  {/* NCM e CEST */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-emerald-600" /> Classificação Base
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">NCM (Nomenclatura Comum do Mercosul)</label>
                        <input 
                          type="text" 
                          defaultValue={editingProduct.ncm}
                          placeholder="0000.00.00"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm shadow-sm font-mono" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">CEST (Código Especificador da ST)</label>
                        <input 
                          type="text" 
                          defaultValue={editingProduct.cest}
                          placeholder="00.000.00"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm shadow-sm font-mono" 
                        />
                        <p className="text-[10px] text-slate-400 mt-1">Obrigatório para produtos sujeitos a Substituição Tributária.</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Origem da Mercadoria</label>
                        <select 
                          defaultValue={editingProduct.origem}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm shadow-sm"
                        >
                          <option value="0 - Nacional">0 - Nacional</option>
                          <option value="1 - Estrangeira">1 - Estrangeira - Importação Direta</option>
                          <option value="2 - Estrangeira">2 - Estrangeira - Adquirida no Mercado Interno</option>
                          <option value="3 - Nacional">3 - Nacional - Conteúdo de Importação superior a 40%</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <Percent className="h-4 w-4 text-emerald-600" /> Situação Tributária
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Situação ICMS (CST ou CSOSN)</label>
                        <select 
                          defaultValue={editingProduct.icms}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm shadow-sm"
                        >
                          <option value="101 - Tributada pelo Simples Nacional">101 - Tributada pelo Simples Nacional com permissão de crédito</option>
                          <option value="102 - Tributada pelo Simples Nacional sem permissão">102 - Tributada pelo Simples Nacional sem permissão de crédito</option>
                          <option value="00 - Tributada Integralmente">00 - Tributada Integralmente</option>
                          <option value="10 - Tributada com ICMS ST">10 - Tributada e com cobrança de ICMS por ST</option>
                          <option value="40 - Isenta">40 - Isenta</option>
                          <option value="41 - Não Tributada">41 - Não Tributada</option>
                        </select>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">PIS/COFINS (CST)</label>
                          <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm shadow-sm">
                            <option value="01">01 - Operação Tributável</option>
                            <option value="04">04 - Monofásica</option>
                            <option value="06">06 - Alíquota Zero</option>
                            <option value="07">07 - Operação Isenta</option>
                            <option value="49">49 - Outras Operações de Saída</option>
                            <option value="99">99 - Outras Operações</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">% IPI</label>
                          <input 
                            type="number" 
                            step="0.1"
                            defaultValue={0}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm shadow-sm font-mono" 
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
                <button className="px-4 py-2 flex items-center gap-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm">
                  <Check className="h-4 w-4" />
                  Salvar Fiscal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
