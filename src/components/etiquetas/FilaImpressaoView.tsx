"use client";

import React, { useState } from "react";
import { 
  Search, 
  Printer, 
  Trash2,
  AlertCircle,
  CheckSquare,
  MinusSquare,
  PackageSearch,
  Settings2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SpoolerItem {
  id: string;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  autoAdded: boolean; // Se entrou por alteração de preço
}

const mockFila: SpoolerItem[] = [
  { id: "f1", sku: "LONA-440", name: "Lona Brilho 440g - Rolo 50m", price: 450.00, quantity: 2, autoAdded: true },
  { id: "f2", sku: "TINTA-CMYK-C", name: "Tinta Solvente Cyan 1L", price: 120.00, quantity: 10, autoAdded: false },
  { id: "f3", sku: "CV-BANN-01", name: "Banner Promocional 90x120", price: 85.00, quantity: 1, autoAdded: true },
];

export function FilaImpressaoView() {
  const [items, setItems] = useState<SpoolerItem[]>(mockFila);
  const [search, setSearch] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>(mockFila.map(i => i.id));

  const toggleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map(i => i.id));
    }
  };

  const toggleItem = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(i => i !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const newQtd = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQtd };
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
    setSelectedItems(selectedItems.filter(i => i !== id));
  };

  const totalEtiquetas = items.filter(i => selectedItems.includes(i.id)).reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <div className="max-w-6xl mx-auto pb-10 animate-fade-in">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-100 text-rose-600 rounded-lg">
            <Printer className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Fila de Impressão (Spooler)</h2>
            <p className="text-sm text-slate-500">Gerencie e imprima etiquetas de produtos atualizados.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 px-4 py-2 rounded-lg transition-colors shadow-sm">
            <PackageSearch className="h-4 w-4" />
            Adicionar Itens
          </button>
          <button 
            disabled={selectedItems.length === 0}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2 rounded-lg transition-colors shadow-sm"
          >
            <Printer className="h-4 w-4" />
            Imprimir ({totalEtiquetas})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Lado Esquerdo: Tabela */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
          
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar na fila..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
              />
            </div>
            <div className="flex gap-2 text-sm text-slate-500 font-medium">
              <span>{items.length} itens na fila</span>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 w-10 text-center">
                    <button onClick={toggleSelectAll} className="text-slate-400 hover:text-rose-600 transition-colors">
                      {selectedItems.length === items.length && items.length > 0 ? (
                        <CheckSquare className="h-5 w-5 text-rose-600" />
                      ) : selectedItems.length > 0 ? (
                        <MinusSquare className="h-5 w-5 text-rose-600" />
                      ) : (
                        <div className="h-5 w-5 border-2 border-slate-300 rounded" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3">Produto</th>
                  <th className="px-4 py-3 text-center">Preço</th>
                  <th className="px-4 py-3 text-center">Qtd. Etiquetas</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.filter(i => i.name.toLowerCase().includes(search.toLowerCase())).map((item) => {
                  const isSelected = selectedItems.includes(item.id);
                  return (
                    <tr 
                      key={item.id} 
                      className={cn("transition-colors", isSelected ? "bg-rose-50/30" : "hover:bg-slate-50")}
                    >
                      <td className="px-4 py-4 text-center cursor-pointer" onClick={() => toggleItem(item.id)}>
                        {isSelected ? (
                          <CheckSquare className="h-5 w-5 text-rose-600 inline-block" />
                        ) : (
                          <div className="h-5 w-5 border-2 border-slate-300 rounded inline-block" />
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-800 flex items-center gap-2">
                            {item.name}
                            {item.autoAdded && (
                              <span title="Adicionado automaticamente por mudança de preço" className="flex h-4 w-4 bg-amber-100 text-amber-600 rounded-full items-center justify-center">
                                <AlertCircle className="h-3 w-3" />
                              </span>
                            )}
                          </span>
                          <span className="font-mono text-xs text-slate-400">{item.sku}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center font-medium text-slate-700">
                        R$ {item.price.toFixed(2)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-3">
                          <button onClick={() => updateQuantity(item.id, -1)} className="w-7 h-7 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold transition-colors">-</button>
                          <span className="font-mono font-bold w-6 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="w-7 h-7 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold transition-colors">+</button>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {items.length === 0 && (
              <div className="p-12 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <Printer className="h-8 w-8 text-slate-300" />
                </div>
                <p className="text-slate-500 font-medium">A fila de impressão está vazia.</p>
                <p className="text-slate-400 text-sm mt-1">Os produtos alterados aparecerão aqui automaticamente.</p>
              </div>
            )}
          </div>
        </div>

        {/* Lado Direito: Configurações */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-slate-400" /> Configuração Atual
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Template de Etiqueta</label>
                <select className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-rose-500">
                  <option>Gôndola Padrão (10x5cm)</option>
                  <option>Código de Barras Pequena</option>
                  <option>Etiqueta Promocional Amarela</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Motor de Impressão</label>
                <select className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-rose-500">
                  <option>Exportar para PDF (A4 Pimaco)</option>
                  <option>Impressora Térmica (ZPL Raw)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-slate-600">Total Selecionado:</span>
                  <span className="text-lg font-black text-rose-600">{totalEtiquetas} un</span>
                </div>
                <p className="text-[10px] text-slate-400 text-right">O equivalente a {(totalEtiquetas / 30).toFixed(1)} folhas A4 (Pimaco).</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
