"use client";

import React, { useState, useEffect } from "react";
import { 
  KanbanSquare, 
  Plus, 
  Search, 
  MoreVertical, 
  Users,
  Lock,
  Globe2,
  FolderOpen,
  Loader2,
  X
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface KanbanBoard {
  id: string;
  name: string;
  description: string;
  category: string;
  members: number;
  visibility: "public" | "private";
  activeTasks: number;
  color: string;
}

export function QuadrosKanbanView() {
  const [boards, setBoards] = useState<KanbanBoard[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [newBoardCategory, setNewBoardCategory] = useState("Geral");
  const [newBoardDesc, setNewBoardDesc] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/kanban/boards");
      if (res.ok) {
        const data = await res.json();
        // Usar os dados retornados pela API (que agora inclui o activeTasks calculado)
        setBoards(data);
      }
    } catch (error) {
      console.error("Erro ao buscar quadros", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;

    try {
      setIsCreating(true);
      const res = await fetch("/api/kanban/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newBoardName,
          category: newBoardCategory,
          description: newBoardDesc
        })
      });

      if (res.ok) {
        setIsModalOpen(false);
        setNewBoardName("");
        setNewBoardDesc("");
        setNewBoardCategory("Geral");
        fetchBoards(); // Reload boards
      } else {
        alert("Erro ao criar quadro");
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao criar quadro");
    } finally {
      setIsCreating(false);
    }
  };

  const categories = Array.from(new Set(boards.map(b => b.category)));
  // Se "Geral" não estiver, adiciona para o dropdown
  if (!categories.includes("Geral")) categories.push("Geral");

  const filteredBoards = boards.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase()) || (b.description || "").toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || b.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-6xl mx-auto pb-10 animate-fade-in relative">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-fuchsia-100 text-fuchsia-600 rounded-lg">
            <KanbanSquare className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Quadros de Produção (Boards)</h2>
            <p className="text-sm text-slate-500">Gerencie os fluxos de trabalho da sua equipe.</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 text-sm font-bold text-white bg-fuchsia-600 hover:bg-fuchsia-700 px-6 py-2 rounded-lg transition-colors shadow-sm w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Novo Quadro
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar quadros..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500 bg-white shadow-sm"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <FolderOpen className="h-4 w-4 text-slate-400" />
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500 shadow-sm"
          >
            <option value="all">Todas as Categorias</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Grid de Quadros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBoards.map((board) => (
          <Link href={`/kanban/board/${board.id}`} key={board.id} className="group flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer hover:border-fuchsia-300">
            {/* Header Color Bar */}
            <div className={cn("h-3 w-full", board.color)} />
            
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-1 rounded">
                  {board.category}
                </span>
                <button className="text-slate-400 hover:text-slate-700 transition-colors opacity-0 group-hover:opacity-100 p-1" onClick={(e) => e.preventDefault()}>
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
              
              <h3 className="font-bold text-slate-800 text-lg mb-1 group-hover:text-fuchsia-600 transition-colors">
                {board.name}
              </h3>
              <p className="text-sm text-slate-500 mb-6 flex-1 line-clamp-2">
                {board.description}
              </p>
              
              {/* Footer Stats */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium" title="Membros da Equipe">
                    <Users className="h-3.5 w-3.5" />
                    {board.members}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium" title="Visibilidade">
                    {board.visibility === 'public' ? <Globe2 className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5 text-amber-500" />}
                  </div>
                </div>
                
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {board.activeTasks} ativos
                </div>
              </div>
            </div>
          </Link>
        ))}

        {/* Card Novo Quadro */}
        <div 
          onClick={() => setIsModalOpen(true)}
          className="flex flex-col items-center justify-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl hover:border-fuchsia-300 hover:bg-fuchsia-50/50 transition-all cursor-pointer min-h-[220px]"
        >
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-fuchsia-500 mb-3 border border-slate-100">
            <Plus className="h-6 w-6" />
          </div>
          <span className="font-medium text-slate-600">Criar Novo Quadro</span>
          <span className="text-xs text-slate-400 mt-1">Template ou em branco</span>
        </div>
      </div>

      {/* Modal Novo Quadro */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => !isCreating && setIsModalOpen(false)}></div>
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md relative z-10 animate-scale-in flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-800">Criar Novo Quadro</h3>
              <button onClick={() => setIsModalOpen(false)} disabled={isCreating} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateBoard} className="p-5 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Quadro *</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={newBoardName}
                    onChange={e => setNewBoardName(e.target.value)}
                    placeholder="Ex: Produção de Adesivos"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                  <input
                    type="text"
                    value={newBoardCategory}
                    onChange={e => setNewBoardCategory(e.target.value)}
                    placeholder="Ex: Impressão, Financeiro"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                  <textarea
                    rows={3}
                    value={newBoardDesc}
                    onChange={e => setNewBoardDesc(e.target.value)}
                    placeholder="Para que serve este quadro?"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:outline-none resize-none"
                  />
                </div>
              </div>
              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isCreating}
                  className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 px-4 py-2 bg-fuchsia-600 text-white hover:bg-fuchsia-700 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Criar Quadro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
