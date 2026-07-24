"use client";

import React, { useState } from "react";
import { 
  Search, 
  Edit,
  X,
  Check,
  Truck,
  Box,
  Scale
} from "lucide-react";

// --- Types & Mocks ---
interface ProductLogistics {
  id: string;
  sku: string;
  name: string;
  weightGross: number;
  weightNet: number;
  dimensions: { w: number; h: number; d: number };
  packaging: string;
  calculateShipping: boolean;
}

const mockLogistics: ProductLogistics[] = [
  { id: "p1", sku: "CV-LONA-B-001", name: "Banner Lona Brilho 440g", weightGross: 1.2, weightNet: 1.0, dimensions: { w: 100, h: 10, d: 10 }, packaging: "Tubo Papelão", calculateShipping: true },
  { id: "p2", sku: "CV-ADES-002", name: "Adesivo Vinil Leitoso", weightGross: 0.5, weightNet: 0.4, dimensions: { w: 50, h: 5, d: 5 }, packaging: "Tubo Plástico", calculateShipping: true },
  { id: "p3", sku: "BR-CAN-003", name: "Caneta Plástica Personalizada", weightGross: 0.05, weightNet: 0.04, dimensions: { w: 15, h: 2, d: 2 }, packaging: "Caixa Padrão", calculateShipping: false },
  { id: "p4", sku: "GR-CART-004", name: "Cartão de Visita Couché 300g", weightGross: 1.5, weightNet: 1.4, dimensions: { w: 20, h: 10, d: 10 }, packaging: "Caixa Kraft", calculateShipping: true },
  { id: "p5", sku: "CV-LONA-F-005", name: "Banner Lona Fosca 340g", weightGross: 0.9, weightNet: 0.8, dimensions: { w: 100, h: 8, d: 8 }, packaging: "Tubo Papelão", calculateShipping: true },
];

export function LogisticaView() {
  const [products] = useState<ProductLogistics[]>(mockLogistics);
  const [search, setSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState<ProductLogistics | null>(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const openEditor = (product: ProductLogistics) => {
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
            <Truck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Logística e Dimensões</h2>
            <p className="text-sm text-slate-500">Configure pesos, embalagens e cálculo de frete por produto.</p>
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
              placeholder="Buscar por nome ou SKU..." 
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
                <th className="px-6 py-4">Peso Bruto</th>
                <th className="px-6 py-4">Dimensões (LxAxP)</th>
                <th className="px-6 py-4">Embalagem</th>
                <th className="px-6 py-4">Calcula Frete</th>
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
                  <td className="px-6 py-4">{p.weightGross} kg</td>
                  <td className="px-6 py-4 text-slate-500">{p.dimensions.w} x {p.dimensions.h} x {p.dimensions.d} cm</td>
                  <td className="px-6 py-4">{p.packaging}</td>
                  <td className="px-6 py-4">
                    {p.calculateShipping ? (
                      <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs font-bold uppercase">Sim</span>
                    ) : (
                      <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-xs font-bold uppercase">Não</span>
                    )}
                  </td>
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
                    Editar Logística
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
                  <Box className="h-8 w-8 text-slate-400" />
                  <div>
                    <h3 className="font-semibold text-slate-800">{editingProduct.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">Configurações de transporte e embalagem.</p>
                  </div>
                </div>

                <form className="space-y-6">
                  {/* Pesos */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <Scale className="h-4 w-4 text-emerald-600" /> Pesos (KG)
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Peso Bruto (Com Embalagem)</label>
                        <input 
                          type="number" 
                          step="0.01"
                          defaultValue={editingProduct.weightGross}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm shadow-sm font-mono" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Peso Líquido</label>
                        <input 
                          type="number" 
                          step="0.01"
                          defaultValue={editingProduct.weightNet}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm shadow-sm font-mono" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dimensões */}
                  <div className="pt-4 border-t border-slate-100">
                    <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <Box className="h-4 w-4 text-emerald-600" /> Dimensões da Caixa (CM)
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Largura</label>
                        <input 
                          type="number" 
                          defaultValue={editingProduct.dimensions.w}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm shadow-sm font-mono" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Altura</label>
                        <input 
                          type="number" 
                          defaultValue={editingProduct.dimensions.h}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm shadow-sm font-mono" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Profundidade</label>
                        <input 
                          type="number" 
                          defaultValue={editingProduct.dimensions.d}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm shadow-sm font-mono" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <Truck className="h-4 w-4 text-emerald-600" /> Configurações de Envio
                    </h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Tipo de Embalagem Padrão</label>
                        <select 
                          defaultValue={editingProduct.packaging}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm shadow-sm"
                        >
                          <option value="Caixa Padrão">Caixa Padrão</option>
                          <option value="Caixa Kraft">Caixa Kraft</option>
                          <option value="Tubo Papelão">Tubo Papelão</option>
                          <option value="Tubo Plástico">Tubo Plástico</option>
                          <option value="Envelope Bolha">Envelope Bolha</option>
                          <option value="Personalizado">Embalagem Personalizada</option>
                        </select>
                      </div>

                      <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                        <div className="flex items-center h-5">
                          <input 
                            type="checkbox" 
                            defaultChecked={editingProduct.calculateShipping}
                            className="h-4 w-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500" 
                          />
                        </div>
                        <div className="flex-1">
                          <span className="block text-sm font-medium text-slate-800">Calcular Frete / Cubagem</span>
                          <span className="block text-xs text-slate-500 mt-0.5">Se desmarcado, este produto será considerado Frete Grátis ou Retirada.</span>
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
                <button className="px-4 py-2 flex items-center gap-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm">
                  <Check className="h-4 w-4" />
                  Salvar Logística
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
