"use client";

import React, { useState } from "react";
import { 
  Search, 
  Image as ImageIcon,
  UploadCloud,
  PlayCircle,
  X,
  Check,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductMedia {
  id: string;
  sku: string;
  name: string;
  images: string[];
  youtubeUrl?: string;
}

const mockMedia: ProductMedia[] = [
  { id: "p1", sku: "CV-LONA-B-001", name: "Banner Lona Brilho 440g", images: ["/placeholder1.jpg"] },
  { id: "p2", sku: "CV-ADES-002", name: "Adesivo Vinil Leitoso", images: [] },
  { id: "p3", sku: "BR-CAN-003", name: "Caneta Plástica Personalizada", images: ["/placeholder2.jpg", "/placeholder3.jpg"], youtubeUrl: "https://youtube.com/watch?v=123" },
  { id: "p4", sku: "GR-CART-004", name: "Cartão de Visita Couché 300g", images: ["/placeholder4.jpg"] },
  { id: "p5", sku: "CV-LONA-F-005", name: "Banner Lona Fosca 340g", images: [] },
];

export function MultimidiaView() {
  const [products] = useState<ProductMedia[]>(mockMedia);
  const [search, setSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState<ProductMedia | null>(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const openEditor = (product: ProductMedia) => {
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
            <ImageIcon className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Multimídia</h2>
            <p className="text-sm text-slate-500">Galeria de fotos e vídeos dos produtos para exibição no catálogo.</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou SKU..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white shadow-sm"
          />
        </div>
      </div>

      {/* Grid de Produtos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredProducts.map((p) => (
          <div 
            key={p.id} 
            onClick={() => openEditor(p)}
            className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group flex flex-col"
          >
            {/* Aspect Ratio 1:1 Box for Image */}
            <div className="w-full aspect-square bg-slate-100 flex items-center justify-center relative border-b border-slate-100 group-hover:bg-slate-50 transition-colors">
              {p.images.length > 0 ? (
                <div className="absolute inset-0 flex items-center justify-center bg-emerald-50">
                  <ImageIcon className="h-12 w-12 text-emerald-300" />
                  <span className="absolute bottom-2 right-2 bg-slate-900/60 text-white text-[10px] px-1.5 py-0.5 rounded font-bold backdrop-blur-sm">
                    {p.images.length}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400">
                  <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
                  <span className="text-[10px] font-medium uppercase tracking-wider">Sem Imagem</span>
                </div>
              )}
              
              {/* Overlay Hover */}
              <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="bg-white text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5">
                  <Plus className="h-3 w-3" /> Gerenciar
                </span>
              </div>
            </div>

            {/* Product Info */}
            <div className="p-3 flex-1 flex flex-col">
              <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 leading-tight flex-1" title={p.name}>{p.name}</h3>
              <p className="font-mono text-[11px] text-slate-500 mt-1">{p.sku}</p>
            </div>
          </div>
        ))}
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
                    Gerenciar Mídia
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
                
                <h3 className="font-semibold text-slate-800 mb-1">{editingProduct.name}</h3>
                <p className="text-xs text-slate-500 mb-6">Adicione fotos ou vídeos que representem este item.</p>

                <form className="space-y-6">
                  
                  {/* Upload Area */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-emerald-600" /> Galeria de Imagens
                    </h4>
                    
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 hover:border-emerald-400 transition-colors cursor-pointer group">
                      <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full mb-3 group-hover:scale-110 transition-transform">
                        <UploadCloud className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">Clique ou arraste imagens aqui</p>
                      <p className="text-xs text-slate-500 mt-1">PNG, JPG ou WEBP (Máx 5MB)</p>
                    </div>
                  </div>

                  {/* Thumbnail Preview Area */}
                  {editingProduct.images.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {editingProduct.images.map((_, i) => (
                        <div key={i} className="aspect-square bg-emerald-50 rounded-lg border border-emerald-100 flex items-center justify-center relative group">
                          <ImageIcon className="h-6 w-6 text-emerald-300" />
                          <button className="absolute -top-1.5 -right-1.5 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-100">
                    <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <PlayCircle className="h-4 w-4 text-emerald-600" /> Vídeo Demonstrativo
                    </h4>
                    
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">URL do YouTube</label>
                      <input 
                        type="url" 
                        defaultValue={editingProduct.youtubeUrl}
                        placeholder="https://youtube.com/watch?v=..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm shadow-sm" 
                      />
                    </div>
                  </div>

                </form>
              </div>

              <div className="border-t border-slate-100 p-4 bg-slate-50 flex justify-end gap-3">
                <button onClick={closeEditor} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors shadow-sm">
                  Fechar
                </button>
                <button className="px-4 py-2 flex items-center gap-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm">
                  <Check className="h-4 w-4" />
                  Salvar Mídia
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
