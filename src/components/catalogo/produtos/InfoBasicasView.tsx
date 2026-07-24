"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, Plus, Edit, X, Check, Package, Image as ImageIcon, Trash
} from "lucide-react";
import { cn } from "@/lib/utils";

export function InfoBasicasView() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch(e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const openEditor = (product?: any) => {
    if (product) {
      setEditingProduct({
        ...product,
        packagings: product.packagings?.length ? [...product.packagings] : [
          { id: '', name: 'Unidade', conversionFactor: '1', barcode: '', costPrice: '0', sellPrice: '0', isBase: true }
        ]
      });
    } else {
      setEditingProduct({ 
        id: "", name: "", category: "", active: true, stockQuantity: "0", costPrice: "0", basePrice: "0",
        packagings: [
          { id: '', name: 'Unidade', conversionFactor: '1', barcode: '', costPrice: '0', sellPrice: '0', isBase: true }
        ]
      });
    }
    setIsSlideOverOpen(true);
  };

  const closeEditor = () => {
    setIsSlideOverOpen(false);
    setTimeout(() => setEditingProduct(null), 300);
  };

  const addPackaging = () => {
    setEditingProduct({
      ...editingProduct,
      packagings: [
        ...editingProduct.packagings,
        { id: '', name: '', conversionFactor: '1', barcode: '', costPrice: '0', sellPrice: '0', isBase: false }
      ]
    });
  };

  const updatePackaging = (index: number, field: string, value: any) => {
    const newPackagings = [...editingProduct.packagings];
    newPackagings[index] = { ...newPackagings[index], [field]: value };

    // Auto-calculate costPrice Se a base for preenchida
    if (field === 'conversionFactor' && editingProduct.packagings[0]?.costPrice) {
      const baseCost = parseFloat(editingProduct.packagings[0].costPrice) || 0;
      const factor = parseFloat(value) || 1;
      newPackagings[index].costPrice = (baseCost * factor).toFixed(2);
    }

    setEditingProduct({ ...editingProduct, packagings: newPackagings });
  };

  const removePackaging = (index: number) => {
    const newPackagings = [...editingProduct.packagings];
    newPackagings.splice(index, 1);
    setEditingProduct({ ...editingProduct, packagings: newPackagings });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const method = editingProduct.id ? 'PUT' : 'POST';
      const url = editingProduct.id ? `/api/products/${editingProduct.id}` : '/api/products';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct)
      });
      
      if (res.ok) {
        await fetchProducts();
        closeEditor();
      } else {
        alert("Erro ao salvar");
      }
    } catch(e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative animate-fade-in pb-10">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Gestão de Produtos e Embalagens</h2>
            <p className="text-sm text-slate-500">Gerencie o estoque base, SKUs e embalagens.</p>
          </div>
        </div>
        <button 
          onClick={() => openEditor()}
          className="flex items-center gap-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg transition-colors w-full sm:w-auto justify-center shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Novo Produto
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por nome..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Nome do Produto</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Estoque Base</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => openEditor(p)}>
                  <td className="px-6 py-4 font-medium text-slate-800">{p.name}</td>
                  <td className="px-6 py-4">{p.category}</td>
                  <td className="px-6 py-4 font-mono">{p.stockQuantity} un</td>
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
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-slate-500">Nenhum produto encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isSlideOverOpen && editingProduct && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={closeEditor} />
          
          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10 animate-slide-in-right">
            <div className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col h-full">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-emerald-50/50">
                <h2 className="text-lg font-semibold text-slate-800" id="slide-over-title">
                  {editingProduct.id ? "Editar Produto" : "Novo Produto"}
                </h2>
                <button 
                  onClick={closeEditor}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors focus:outline-none"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                <form id="product-form" onSubmit={handleSave} className="space-y-6">
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Produto</label>
                      <input 
                        required
                        type="text" 
                        value={editingProduct.name}
                        onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                      <select 
                        value={editingProduct.category || ''}
                        onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
                      >
                        <option value="">Selecione...</option>
                        <option value="Comunicação Visual">Comunicação Visual</option>
                        <option value="Adesivos">Adesivos</option>
                        <option value="Brindes">Brindes</option>
                        <option value="Gráfica Rápida">Gráfica Rápida</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Estoque Real (Unidade Base)</label>
                      <input 
                        type="number" 
                        step="0.001"
                        value={editingProduct.stockQuantity || "0"}
                        onChange={e => setEditingProduct({...editingProduct, stockQuantity: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm font-mono" 
                      />
                      <p className="text-xs text-slate-500 mt-1">O estoque é sempre medido na unidade base.</p>
                    </div>
                  </div>

                  <div className="mt-8 border-t border-slate-200 pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-md font-semibold text-slate-800">Grade de Embalagens / SKUs</h3>
                        <p className="text-xs text-slate-500">Defina as variações de venda (ex: 1 Unidade, 1 Caixa com 100)</p>
                      </div>
                      <button 
                        type="button"
                        onClick={addPackaging}
                        className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Plus className="h-3 w-3" /> Adicionar Embalagem
                      </button>
                    </div>

                    <div className="space-y-4">
                      {editingProduct.packagings?.map((pack: any, i: number) => (
                        <div key={i} className="p-4 border border-slate-200 rounded-lg bg-slate-50/50 relative">
                          {i > 0 && (
                            <button type="button" onClick={() => removePackaging(i)} className="absolute -top-2 -right-2 p-1.5 bg-red-100 text-red-600 rounded-full shadow-sm hover:bg-red-200">
                              <Trash className="h-3 w-3" />
                            </button>
                          )}
                          <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-4">
                              <label className="block text-xs font-medium text-slate-600 mb-1">Tipo de Embalagem</label>
                              <input required type="text" value={pack.name} onChange={e => updatePackaging(i, 'name', e.target.value)} placeholder="Ex: Caixa" className="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 text-sm" />
                            </div>
                            <div className="col-span-3">
                              <label className="block text-xs font-medium text-slate-600 mb-1">Fator (Qtd Base)</label>
                              <input required type="number" step="0.001" disabled={i===0} value={pack.conversionFactor} onChange={e => updatePackaging(i, 'conversionFactor', e.target.value)} className="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 text-sm font-mono" />
                            </div>
                            <div className="col-span-5">
                              <label className="block text-xs font-medium text-slate-600 mb-1">Cód. Barras (EAN)</label>
                              <input type="text" value={pack.barcode || ''} onChange={e => updatePackaging(i, 'barcode', e.target.value)} className="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 text-sm font-mono" />
                            </div>
                            <div className="col-span-4">
                              <label className="block text-xs font-medium text-slate-600 mb-1">Custo Base (R$)</label>
                              <input required type="number" step="0.01" value={pack.costPrice} onChange={e => updatePackaging(i, 'costPrice', e.target.value)} className="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 text-sm font-mono" />
                            </div>
                            <div className="col-span-4">
                              <label className="block text-xs font-medium text-slate-600 mb-1">Preço de Venda (R$)</label>
                              <input required type="number" step="0.01" value={pack.sellPrice} onChange={e => updatePackaging(i, 'sellPrice', e.target.value)} className="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 text-sm font-mono" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </form>
              </div>

              <div className="border-t border-slate-100 p-4 bg-slate-50 flex justify-end gap-3">
                <button type="button" onClick={closeEditor} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors shadow-sm">
                  Cancelar
                </button>
                <button type="submit" form="product-form" disabled={isLoading} className="px-4 py-2 flex items-center gap-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm disabled:opacity-50">
                  <Check className="h-4 w-4" />
                  {isLoading ? "Salvando..." : "Salvar Produto"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
