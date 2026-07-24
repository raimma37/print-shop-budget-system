"use client";

import React, { useState } from "react";
import { 
  FolderTree, 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  MoreVertical, 
  Settings2,
  Trash2,
  Edit2,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Types & Mocks ---
interface Category {
  id: string;
  name: string;
  code: string;
  rules: {
    requiresWarranty: boolean;
    requiresExpirationDate: boolean;
  };
  children?: Category[];
}

const mockCategories: Category[] = [
  {
    id: "1",
    name: "Comunicação Visual",
    code: "CV",
    rules: { requiresWarranty: true, requiresExpirationDate: false },
    children: [
      {
        id: "1-1",
        name: "Impressão Lona",
        code: "CV-LONA",
        rules: { requiresWarranty: true, requiresExpirationDate: false },
        children: [
          { id: "1-1-1", name: "Lona Brilho", code: "CV-LONA-B", rules: { requiresWarranty: true, requiresExpirationDate: false } },
          { id: "1-1-2", name: "Lona Fosca", code: "CV-LONA-F", rules: { requiresWarranty: true, requiresExpirationDate: false } },
        ]
      },
      {
        id: "1-2",
        name: "Adesivos",
        code: "CV-ADES",
        rules: { requiresWarranty: true, requiresExpirationDate: false },
      }
    ]
  },
  {
    id: "2",
    name: "Brindes",
    code: "BR",
    rules: { requiresWarranty: false, requiresExpirationDate: false },
    children: [
      { id: "2-1", name: "Canetas", code: "BR-CAN", rules: { requiresWarranty: false, requiresExpirationDate: false } },
      { id: "2-2", name: "Chaveiros", code: "BR-CHAV", rules: { requiresWarranty: false, requiresExpirationDate: false } },
    ]
  },
  {
    id: "3",
    name: "Gráfica Rápida",
    code: "GR",
    rules: { requiresWarranty: false, requiresExpirationDate: false },
    children: [
      { id: "3-1", name: "Cartões de Visita", code: "GR-CART", rules: { requiresWarranty: false, requiresExpirationDate: false } },
      { id: "3-2", name: "Panfletos", code: "GR-PANF", rules: { requiresWarranty: false, requiresExpirationDate: false } },
    ]
  }
];

export function CategoriasTreeView() {
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(["1", "1-1"]));
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const toggleNode = (id: string) => {
    const next = new Set(expandedNodes);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setExpandedNodes(next);
  };

  const renderTree = (nodes: Category[], level: number = 0) => {
    return nodes.map((node) => {
      const hasChildren = node.children && node.children.length > 0;
      const isExpanded = expandedNodes.has(node.id);
      const isSelected = selectedCategory?.id === node.id;

      return (
        <div key={node.id} className="select-none">
          {/* Node Row */}
          <div 
            className={cn(
              "flex items-center gap-2 py-2 px-3 rounded-lg group transition-colors cursor-pointer border border-transparent",
              isSelected ? "bg-sky-50 border-sky-200" : "hover:bg-slate-50"
            )}
            style={{ paddingLeft: `${level * 24 + 12}px` }}
            onClick={() => setSelectedCategory(node)}
          >
            {/* Expand/Collapse Icon */}
            <div 
              className={cn("h-5 w-5 flex items-center justify-center rounded hover:bg-slate-200", hasChildren ? "cursor-pointer" : "opacity-0")}
              onClick={(e) => {
                e.stopPropagation();
                if (hasChildren) toggleNode(node.id);
              }}
            >
              {hasChildren ? (
                isExpanded ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronRight className="h-4 w-4 text-slate-500" />
              ) : null}
            </div>

            {/* Folder Icon */}
            <FolderTree className={cn("h-4 w-4", isSelected ? "text-sky-600" : "text-slate-400")} />

            {/* Node Name */}
            <span className={cn("flex-1 text-sm font-medium", isSelected ? "text-sky-900" : "text-slate-700")}>
              {node.name}
            </span>

            {/* Node Code */}
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded hidden sm:block">
              {node.code}
            </span>

            {/* Actions */}
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
              <button 
                className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-100 rounded"
                title="Adicionar Subcategoria"
                onClick={(e) => e.stopPropagation()}
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
              <button 
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded"
                title="Excluir"
                onClick={(e) => e.stopPropagation()}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Children Render */}
          {hasChildren && isExpanded && (
            <div className="animate-fade-in relative">
               {/* Guia Visual (Tree Line) */}
               <div 
                className="absolute border-l border-slate-200" 
                style={{ left: `${level * 24 + 31}px`, top: 0, bottom: 0 }} 
              />
              {renderTree(node.children!, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 animate-fade-in">
      
      {/* Esquerda: Árvore de Navegação */}
      <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[600px]">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <FolderTree className="h-5 w-5 text-sky-500" />
            Estrutura
          </h3>
          <button className="flex items-center gap-1.5 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 px-3 py-1.5 rounded-lg transition-colors">
            <Plus className="h-4 w-4" />
            Novo Departamento
          </button>
        </div>

        {/* Tree Container */}
        <div className="p-4 overflow-y-auto flex-1">
          {renderTree(categories)}
        </div>
      </div>

      {/* Direita: Painel de Detalhes / Regras */}
      <div className="w-full md:w-80 lg:w-96 flex-shrink-0">
        {selectedCategory ? (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden animate-slide-up">
            <div className="p-4 border-b border-slate-100 bg-sky-50/30">
              <div className="flex items-start justify-between mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-sky-100 text-sky-600 border border-sky-200 mb-2 inline-block">
                  {selectedCategory.code}
                </span>
                <button className="p-1 text-slate-400 hover:text-slate-600">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
              <h3 className="text-lg font-bold text-slate-800">{selectedCategory.name}</h3>
            </div>
            
            <div className="p-5 space-y-5">
              
              {/* Form Básico */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Edit2 className="h-3.5 w-3.5" /> Informações Básicas
                </h4>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Categoria</label>
                  <input type="text" defaultValue={selectedCategory.name} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none text-sm" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Código (Prefixo)</label>
                  <input type="text" defaultValue={selectedCategory.code} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none text-sm" />
                </div>
              </div>

              {/* Regras Herdadas */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Settings2 className="h-3.5 w-3.5" /> Regras de Negócio
                </h4>
                
                <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                  <div className="flex items-center h-5">
                    <input 
                      type="checkbox" 
                      className="h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500" 
                      defaultChecked={selectedCategory.rules.requiresWarranty}
                    />
                  </div>
                  <div className="flex-1">
                    <span className="block text-sm font-medium text-slate-800">Exige Garantia</span>
                    <span className="block text-xs text-slate-500 mt-0.5">Obriga a informar o prazo de garantia no cadastro do produto.</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                  <div className="flex items-center h-5">
                    <input 
                      type="checkbox" 
                      className="h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500" 
                      defaultChecked={selectedCategory.rules.requiresExpirationDate}
                    />
                  </div>
                  <div className="flex-1">
                    <span className="block text-sm font-medium text-slate-800">Controle de Validade</span>
                    <span className="block text-xs text-slate-500 mt-0.5">Aciona alertas de perecíveis e lote no módulo de estoque.</span>
                  </div>
                </label>
              </div>

              <div className="pt-4 flex gap-2">
                <button className="flex-1 bg-sky-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-sky-700 transition-colors flex items-center justify-center gap-2">
                  <Check className="h-4 w-4" /> Salvar Regras
                </button>
              </div>

            </div>
          </div>
        ) : (
          <div className="h-full border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-8 text-center text-slate-500">
            <FolderTree className="h-10 w-10 text-slate-300 mb-3" />
            <p className="font-medium text-slate-700">Nenhuma categoria selecionada</p>
            <p className="text-sm mt-1">Selecione uma categoria na árvore ao lado para visualizar e editar suas regras estruturais.</p>
          </div>
        )}
      </div>
    </div>
  );
}
