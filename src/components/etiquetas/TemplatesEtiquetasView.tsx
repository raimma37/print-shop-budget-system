"use client";

import React, { useState } from "react";
import { 
  Search, 
  LayoutTemplate, 
  X,
  Settings,
  Barcode,
  Eye
} from "lucide-react";

interface LabelTemplate {
  id: string;
  name: string;
  width: number;
  height: number;
  type: "ZPL" | "PDF";
  tags: string[];
  description: string;
}

const defaultTemplates: LabelTemplate[] = [
  { 
    id: "t1", 
    name: "Etiqueta de Envio (Correios/Transportadora)", 
    width: 100, 
    height: 150, 
    type: "PDF", 
    tags: ["{{destinatario.nome}}", "{{destinatario.endereco}}", "{{cep}}", "{{barcode_rastreio}}"],
    description: "Padrão logístico para caixas de envio. Suporta código de barras longo e endereço completo."
  },
  { 
    id: "t2", 
    name: "Etiqueta Gôndola Padrão (Supermercado)", 
    width: 100, 
    height: 30, 
    type: "PDF", 
    tags: ["{{produto.nome}}", "{{produto.preco}}", "{{barcode_ean}}"],
    description: "Formato largo e baixo para fixar em prateleiras. Destaca o preço e nome."
  },
  { 
    id: "t3", 
    name: "Etiqueta Produto Padrão (Roupas/Caixas)", 
    width: 60, 
    height: 40, 
    type: "ZPL", 
    tags: ["{{produto.nome}}", "{{produto.sku}}", "{{produto.preco}}", "{{barcode}}"],
    description: "Ideal para impressoras Zebra. Tamanho versátil para colar em produtos individuais."
  },
  { 
    id: "t4", 
    name: "Etiqueta Pequena (3 Colunas)", 
    width: 33, 
    height: 22, 
    type: "PDF", 
    tags: ["{{produto.codigo}}", "{{produto.preco}}"],
    description: "Muito usada em papel A4 padrão Pimaco (3 colunas). Serve para precificação rápida."
  },
  { 
    id: "t5", 
    name: "Etiqueta Ótica / Jóias", 
    width: 80, 
    height: 12, 
    type: "ZPL", 
    tags: ["{{produto.ref}}", "{{produto.preco}}", "{{barcode_mini}}"],
    description: "Formato 'halteres' que dobra ao meio. Específica para óculos, anéis e pulseiras."
  },
];

export function TemplatesEtiquetasView() {
  const [search, setSearch] = useState("");
  const [viewingTemplate, setViewingTemplate] = useState<LabelTemplate | null>(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);

  const filteredTemplates = defaultTemplates.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  const openViewer = (template: LabelTemplate) => {
    setViewingTemplate(template);
    setIsSlideOverOpen(true);
  };

  const closeViewer = () => {
    setIsSlideOverOpen(false);
    setTimeout(() => setViewingTemplate(null), 300);
  };

  return (
    <div className="relative animate-fade-in pb-10">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
            <LayoutTemplate className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Modelos Padrões de Etiquetas</h2>
            <p className="text-sm text-slate-500">Catálogo pré-configurado com os formatos mais comuns do mercado.</p>
          </div>
        </div>
      </div>

      {/* Data Grid */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar modelo de etiqueta..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {filteredTemplates.length === 0 ? (
            <div className="text-center p-20 text-slate-400">
              Nenhum modelo encontrado com esse termo.
            </div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Modelo</th>
                  <th className="px-6 py-4">Uso Recomendado</th>
                  <th className="px-6 py-4">Formato (L x A)</th>
                  <th className="px-6 py-4">Tecnologia</th>
                  <th className="px-6 py-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTemplates.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => openViewer(t)}>
                    <td className="px-6 py-4 font-medium text-slate-800 whitespace-nowrap">{t.name}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{t.description}</td>
                    <td className="px-6 py-4 font-mono whitespace-nowrap">{t.width} x {t.height} mm</td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">{t.type}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded flex items-center gap-1 transition-colors text-xs font-medium">
                          <Eye className="h-4 w-4" /> Detalhes
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Slide-over (Painel Lateral de Visualização) */}
      {isSlideOverOpen && viewingTemplate && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={closeViewer} />
          
          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10 animate-slide-in-right">
            <div className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col h-full border-l border-slate-200">
              
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-indigo-50/50">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2" id="slide-over-title">
                  <LayoutTemplate className="h-5 w-5 text-indigo-600" />
                  Detalhes do Modelo
                </h2>
                <button type="button" onClick={closeViewer} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors focus:outline-none">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-8">
                
                {/* Lado Esquerdo: Configurações Read-Only */}
                <div className="w-full lg:w-1/2 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Layout</label>
                    <input 
                      type="text" 
                      readOnly
                      value={viewingTemplate.name}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 text-sm shadow-sm cursor-not-allowed" 
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <Settings className="h-4 w-4 text-indigo-500" /> Dimensões da Etiqueta
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Largura (mm)</label>
                        <input 
                          type="text" 
                          readOnly
                          value={viewingTemplate.width}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 text-sm shadow-sm font-mono cursor-not-allowed" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Altura (mm)</label>
                        <input 
                          type="text"
                          readOnly
                          value={viewingTemplate.height}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 text-sm shadow-sm font-mono cursor-not-allowed" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <Barcode className="h-4 w-4 text-indigo-500" /> Tags Automáticas
                    </h4>
                    <p className="text-xs text-slate-500 mb-3">Este modelo injeta os seguintes dados no momento da impressão:</p>
                    <div className="flex flex-wrap gap-2">
                      {viewingTemplate.tags.map((tag, i) => (
                        <div key={i} className="text-[11px] font-mono bg-indigo-50 text-indigo-700 px-2 py-1 rounded border border-indigo-100">
                          {tag}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Lado Direito: Preview (Mock Visual Editor) */}
                <div className="w-full lg:w-1/2">
                  <label className="block text-sm font-medium text-slate-700 mb-3">Pré-visualização (Amostra)</label>
                  
                  {/* Simulador de Etiqueta Físico */}
                  <div className="bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl p-8 flex items-center justify-center min-h-[300px]">
                    <div 
                      className="bg-white shadow-md border border-slate-200 flex flex-col p-4 relative overflow-hidden"
                      style={{ 
                        width: '280px', 
                        height: '140px',
                        // Simulando proporção 100x50mm
                      }}
                    >
                      <div className="text-[10px] text-slate-400 border border-slate-200 border-dashed absolute inset-2 p-2 pointer-events-none">
                        Margem de Impressão (2mm)
                      </div>
                      
                      <div className="z-10 mt-2 ml-2">
                        <p className="font-bold text-slate-800 text-sm leading-tight">Exemplo de {viewingTemplate.name.split(' ')[2]}</p>
                        <p className="font-mono text-[10px] text-slate-500 mt-1">ID: DEMO-12345</p>
                        
                        <div className="flex justify-between items-end mt-4">
                          <div className="w-24 h-8 bg-slate-200 flex items-center justify-center">
                            <span className="text-[8px] font-mono">|| ||| | ||| || |||</span>
                          </div>
                          <div>
                            <p className="text-xl font-black text-slate-900 leading-none">R$ 99,90</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-center text-xs text-slate-400 mt-3 italic">Esta é uma simulação genérica do formato final impresso.</p>
                </div>
              </div>

              <div className="border-t border-slate-100 p-4 bg-slate-50 flex justify-end gap-3 mt-auto">
                <button type="button" onClick={closeViewer} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors shadow-sm">
                  Fechar Visulização
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
