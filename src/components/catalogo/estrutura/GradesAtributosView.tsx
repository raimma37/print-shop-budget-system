"use client";

import React, { useState } from "react";
import { 
  Grid, 
  Plus, 
  Trash2, 
  Tag, 
  Edit3, 
  Search,
  Check,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Grade {
  id: string;
  name: string;
  options: string[];
}

const mockGrades: Grade[] = [
  { id: "g1", name: "Tamanhos Confecção", options: ["P", "M", "G", "GG", "XG"] },
  { id: "g2", name: "Voltagem", options: ["110v", "220v", "Bivolt"] },
  { id: "g3", name: "Cores Básicas", options: ["Branco", "Preto", "Azul", "Vermelho"] },
  { id: "g4", name: "Acabamentos (Lona)", options: ["Bainha e Ilhós", "Bainha", "Madeira e Cordinha", "Refile"] },
];

export function GradesAtributosView() {
  const [grades, setGrades] = useState<Grade[]>(mockGrades);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(mockGrades[0]);
  const [newOption, setNewOption] = useState("");
  const [search, setSearch] = useState("");

  const filteredGrades = grades.filter(g => g.name.toLowerCase().includes(search.toLowerCase()));

  const handleAddOption = (e: React.KeyboardEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement> | React.FormEvent) => {
    e.preventDefault();
    if (!selectedGrade || !newOption.trim()) return;
    
    // Evita duplicatas
    if (selectedGrade.options.includes(newOption.trim())) {
      setNewOption("");
      return;
    }

    const updated = {
      ...selectedGrade,
      options: [...selectedGrade.options, newOption.trim()]
    };
    
    setSelectedGrade(updated);
    setGrades(grades.map(g => g.id === updated.id ? updated : g));
    setNewOption("");
  };

  const handleRemoveOption = (optionToRemove: string) => {
    if (!selectedGrade) return;
    const updated = {
      ...selectedGrade,
      options: selectedGrade.options.filter(o => o !== optionToRemove)
    };
    setSelectedGrade(updated);
    setGrades(grades.map(g => g.id === updated.id ? updated : g));
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 animate-fade-in">
      
      {/* Esquerda: Lista de Grades */}
      <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[600px]">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Grid className="h-5 w-5 text-sky-500" />
            Suas Grades
          </h3>
          <div className="flex w-full sm:w-auto gap-2">
            <div className="relative flex-1 sm:w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar grade..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <button className="flex items-center justify-center bg-sky-600 text-white p-1.5 rounded-lg hover:bg-sky-700 transition-colors">
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 p-2">
          {filteredGrades.map((grade) => (
            <div 
              key={grade.id}
              onClick={() => setSelectedGrade(grade)}
              className={cn(
                "p-3 mb-1 rounded-lg cursor-pointer flex items-center justify-between group border transition-all",
                selectedGrade?.id === grade.id 
                  ? "bg-sky-50 border-sky-200 shadow-sm" 
                  : "bg-white border-transparent hover:bg-slate-50 hover:border-slate-200"
              )}
            >
              <div>
                <h4 className={cn("text-sm font-medium", selectedGrade?.id === grade.id ? "text-sky-900" : "text-slate-800")}>
                  {grade.name}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {grade.options.length} variações
                </p>
              </div>
              <ChevronRight className={cn("h-4 w-4 transition-transform", selectedGrade?.id === grade.id ? "text-sky-500 translate-x-1" : "text-slate-300 group-hover:text-slate-400")} />
            </div>
          ))}
        </div>
      </div>

      {/* Direita: Editor da Grade */}
      <div className="w-full md:w-[450px] lg:w-[500px] flex-shrink-0">
        {selectedGrade ? (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm animate-slide-up overflow-hidden flex flex-col h-full md:h-[600px]">
            
            {/* Cabeçalho do Editor */}
            <div className="p-5 border-b border-slate-100 bg-sky-50/30 relative">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="h-4 w-4 text-sky-600" />
                <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">Editor de Grade</span>
              </div>
              <input 
                type="text" 
                defaultValue={selectedGrade.name} 
                className="w-full text-xl font-bold text-slate-800 bg-transparent border-b-2 border-transparent hover:border-slate-200 focus:border-sky-500 focus:outline-none transition-colors px-1 py-1 -ml-1 rounded"
              />
            </div>

            {/* Construtor de Variacoes */}
            <div className="p-5 flex-1 overflow-y-auto">
              <label className="block text-sm font-medium text-slate-700 mb-3">Opções / Variações</label>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedGrade.options.map((option) => (
                  <span 
                    key={option} 
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg shadow-sm group hover:border-sky-300 transition-colors"
                  >
                    {option}
                    <button 
                      onClick={() => handleRemoveOption(option)}
                      className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full p-0.5 transition-colors focus:outline-none"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Input Adicionar */}
              <form onSubmit={handleAddOption} className="relative mt-2">
                <input 
                  type="text" 
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  placeholder="Digite a variação e aperte Enter..." 
                  className="w-full pl-3 pr-10 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm"
                />
                <button 
                  type="submit"
                  disabled={!newOption.trim()}
                  className="absolute right-1 top-1 bottom-1 px-2 flex items-center justify-center text-sky-600 hover:bg-sky-50 rounded-md disabled:opacity-50 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </form>
              <p className="text-xs text-slate-500 mt-2">Pressione Enter para adicionar uma nova tag.</p>

            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
              <button className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors">
                Cancelar
              </button>
              <button className="px-4 py-2 flex items-center gap-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors">
                <Check className="h-4 w-4" />
                Salvar Alterações
              </button>
            </div>

          </div>
        ) : (
          <div className="h-[600px] border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-8 text-center text-slate-500">
            <Grid className="h-10 w-10 text-slate-300 mb-3" />
            <p className="font-medium text-slate-700">Nenhuma grade selecionada</p>
            <p className="text-sm mt-1">Selecione uma grade na lista ou crie uma nova para visualizar e editar suas opções.</p>
          </div>
        )}
      </div>
    </div>
  );
}
