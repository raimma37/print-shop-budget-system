"use client";

import React, { useState, useEffect } from "react";
import { 
  MoreHorizontal, 
  Plus, 
  MessageSquare, 
  Paperclip, 
  Clock, 
  Filter,
  Users,
  AlertTriangle,
  AlignLeft,
  Loader2,
  X,
  Edit2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskCard {
  id: number;
  title: string;
  description?: string;
  tags: string[];
  dueDate?: string;
  comments: number;
  attachments: number;
  priority: "low" | "medium" | "high" | "urgent";
  members: string[]; // initials
  isDone?: boolean;
  clientId?: number | null;
  fileUrl?: string | null;
}

interface Column {
  id: number;
  title: string;
  wipLimit?: number | null;
  cards: TaskCard[];
}

interface ClientData {
  id: number;
  name: string;
}

interface UserData {
  id: number;
  name: string;
  email: string;
  avatarInitials: string;
}

interface BoardMember {
  id: number;
  userId: number;
  role: string;
  userName: string;
  userEmail: string;
  userAvatar: string;
}

interface BoardData {
  id: number;
  name: string;
  category: string;
  members: number;
}

export function QuadroAtivoView({ boardId }: { boardId: string }) {
  const [board, setBoard] = useState<BoardData | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [clients, setClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);

  // Column Modal State
  const [isColModalOpen, setIsColModalOpen] = useState(false);
  const [newColTitle, setNewColTitle] = useState("");
  const [isCreatingCol, setIsCreatingCol] = useState(false);

  // Card Modal State
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [activeColumnId, setActiveColumnId] = useState<number | null>(null);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [newCardDesc, setNewCardDesc] = useState("");
  const [newCardPriority, setNewCardPriority] = useState("medium");
  const [newCardClient, setNewCardClient] = useState("");
  const [newCardDueDate, setNewCardDueDate] = useState("");
  const [newCardFile, setNewCardFile] = useState<File | null>(null);
  const [isCreatingCard, setIsCreatingCard] = useState(false);

  // Members State
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [isAddingMember, setIsAddingMember] = useState(false);

  // Filter State
  const [filterPriority, setFilterPriority] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // View/Edit Card State
  const [viewCardId, setViewCardId] = useState<number | null>(null);
  const selectedCard = columns.flatMap(c => c.cards).find(c => c.id === viewCardId);
  const [isEditingCard, setIsEditingCard] = useState(false);
  const [editCardTitle, setEditCardTitle] = useState("");
  const [editCardDesc, setEditCardDesc] = useState("");
  const [editCardPriority, setEditCardPriority] = useState("medium");
  const [editCardClient, setEditCardClient] = useState("");
  const [editCardDueDate, setEditCardDueDate] = useState("");
  const [editCardFile, setEditCardFile] = useState<File | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Drag State
  const [draggedCardId, setDraggedCardId] = useState<number | null>(null);

  useEffect(() => {
    fetchBoardData();
    fetchClients();
    fetchMembersAndUsers();
  }, [boardId]);

  const fetchMembersAndUsers = async () => {
    try {
      const [membersRes, usersRes] = await Promise.all([
        fetch(`/api/kanban/boards/${boardId}/members`),
        fetch(`/api/users`) // Rota que deve retornar todos os usuários
      ]);
      
      if (membersRes.ok) {
        const data = await membersRes.json();
        setBoardMembers(Array.isArray(data.members) ? data.members : []);
      }
      if (usersRes.ok) {
        const data = await usersRes.json();
        setAllUsers(Array.isArray(data) ? data : (Array.isArray(data.users) ? data.users : []));
      }
    } catch (e) {
      console.error("Erro ao buscar membros/usuários", e);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/clients");
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      }
    } catch (e) {
      console.error("Erro ao buscar clientes", e);
    }
  };

  const fetchBoardData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/kanban/boards/${boardId}`);
      if (res.ok) {
        const data = await res.json();
        setBoard(data.board);
        setColumns(data.columns);
      }
    } catch (error) {
      console.error("Erro ao carregar quadro", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (userId: number) => {
    try {
      setIsAddingMember(true);
      const res = await fetch(`/api/kanban/boards/${boardId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });
      if (res.ok) {
        fetchMembersAndUsers();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveMember = async (userId: number) => {
    try {
      const res = await fetch(`/api/kanban/boards/${boardId}/members`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });
      if (res.ok) {
        fetchMembersAndUsers();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColTitle.trim()) return;

    try {
      setIsCreatingCol(true);
      const res = await fetch("/api/kanban/columns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ boardId: parseInt(boardId), title: newColTitle })
      });

      if (res.ok) {
        setIsColModalOpen(false);
        setNewColTitle("");
        fetchBoardData();
      } else {
        alert("Erro ao criar coluna");
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao criar coluna");
    } finally {
      setIsCreatingCol(false);
    }
  };

  const handleOpenCardModal = (colId: number) => {
    setActiveColumnId(colId);
    setNewCardTitle("");
    setNewCardDesc("");
    setNewCardPriority("medium");
    setNewCardClient("");
    setNewCardDueDate("");
    setNewCardFile(null);
    setIsCardModalOpen(true);
  };

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardTitle.trim() || activeColumnId === null) return;

    try {
      setIsCreatingCard(true);
      let fileUrl = "";

      // Se houver arquivo, faz o upload primeiro
      if (newCardFile) {
        const formData = new FormData();
        formData.append("file", newCardFile);
        const uploadRes = await fetch("/api/kanban/upload", {
          method: "POST",
          body: formData,
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          fileUrl = uploadData.url;
        }
      }

      const res = await fetch("/api/kanban/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          columnId: activeColumnId,
          title: newCardTitle,
          description: newCardDesc,
          priority: newCardPriority,
          clientId: newCardClient || undefined,
          dueDate: newCardDueDate || undefined,
          fileUrl: fileUrl || undefined
        })
      });

      if (res.ok) {
        setIsCardModalOpen(false);
        fetchBoardData();
      } else {
        alert("Erro ao criar cartão");
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao criar cartão");
    } finally {
      setIsCreatingCard(false);
    }
  };

  const handleStartEdit = () => {
    if (!selectedCard) return;
    setEditCardTitle(selectedCard.title);
    setEditCardDesc(selectedCard.description || "");
    setEditCardPriority(selectedCard.priority || "medium");
    setEditCardClient(selectedCard.clientId ? selectedCard.clientId.toString() : "");
    setEditCardDueDate(selectedCard.dueDate ? new Date(selectedCard.dueDate).toISOString().split('T')[0] : "");
    setEditCardFile(null);
    setIsEditingCard(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCard || !editCardTitle.trim()) return;

    try {
      setIsSavingEdit(true);
      let fileUrl = selectedCard.fileUrl || "";

      // Upload if new file
      if (editCardFile) {
        const formData = new FormData();
        formData.append("file", editCardFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          fileUrl = uploadData.url;
        }
      }

      const res = await fetch(`/api/kanban/cards/${selectedCard.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editCardTitle,
          description: editCardDesc,
          priority: editCardPriority,
          clientId: editCardClient || undefined,
          dueDate: editCardDueDate || undefined,
          fileUrl: fileUrl || undefined
        })
      });

      if (res.ok) {
        setIsEditingCard(false);
        fetchBoardData();
      } else {
        alert("Erro ao salvar alterações");
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar alterações");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetColId: number) => {
    e.preventDefault();
    const cardIdStr = e.dataTransfer.getData("cardId");
    if (!cardIdStr) return;
    const cardId = parseInt(cardIdStr);
    setDraggedCardId(null);

    // Optimistic UI update
    setColumns(prev => {
      // Cria cópias profundas para evitar mutação direta
      const newCols = prev.map(c => ({ ...c, cards: [...c.cards] }));
      let cardToMove: TaskCard | null = null;
      let sourceColIdx = -1;
      
      // Find and remove from source
      for (let i = 0; i < newCols.length; i++) {
        const cIdx = newCols[i].cards.findIndex(c => c.id === cardId);
        if (cIdx > -1) {
          cardToMove = newCols[i].cards[cIdx];
          sourceColIdx = i;
          newCols[i].cards.splice(cIdx, 1);
          break;
        }
      }

      // Add to target
      if (cardToMove) {
        const targetColIdx = newCols.findIndex(c => c.id === targetColId);
        if (targetColIdx > -1 && sourceColIdx !== targetColIdx) {
          newCols[targetColIdx].cards.push(cardToMove);
        } else if (sourceColIdx === targetColIdx) {
          // If dropped in the same column, revert
          newCols[sourceColIdx].cards.push(cardToMove);
        }
      }
      return newCols;
    });

    try {
      await fetch(`/api/kanban/cards/${cardId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ columnId: targetColId })
      });
    } catch (error) {
      console.error(error);
      fetchBoardData(); // Revert on error
    }
  };

  const getPriorityColor = (priority?: string | null) => {
    switch (priority) {
      case "urgent": return "bg-red-500 text-white";
      case "high": return "bg-orange-400 text-white";
      case "medium": return "bg-blue-400 text-white";
      case "low": return "bg-slate-300 text-slate-700";
      default: return "bg-slate-200 text-slate-700";
    }
  };

  const getTagColor = (tag: string) => {
    const colors = ["bg-emerald-100 text-emerald-700", "bg-purple-100 text-purple-700", "bg-sky-100 text-sky-700", "bg-amber-100 text-amber-700", "bg-rose-100 text-rose-700"];
    const index = tag.length % colors.length;
    return colors[index];
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-fuchsia-500" />
      </div>
    );
  }

  if (!board) {
    return <div className="p-10 text-center text-slate-500">Quadro não encontrado.</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-fade-in -mx-4 sm:mx-0 relative">
      
      {/* Board Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex-shrink-0 mx-4 sm:mx-0">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            Quadro: {board.name}
            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded font-medium">#{board.id}</span>
          </h2>
        </div>
        <div className="flex items-center gap-3 relative">
          <div className="flex -space-x-2 mr-2">
            {boardMembers.length > 0 ? (
              boardMembers.slice(0, 3).map(member => (
                <div key={member.id} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-600 shadow-sm" title={member.userName}>
                  {member.userAvatar || member.userName.substring(0,2).toUpperCase()}
                </div>
              ))
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-600 shadow-sm" title={`Sem membros`}>
                <Users className="h-4 w-4" />
              </div>
            )}
            <button 
              onClick={() => setIsMembersModalOpen(true)}
              className="w-8 h-8 rounded-full bg-slate-50 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-400 transition-colors"
              title="Gerenciar Equipe"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={cn(
              "p-2 border hover:bg-slate-100 rounded-lg transition-colors shadow-sm relative",
              filterPriority !== "all" ? "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200" : "text-slate-500 bg-slate-50 border-slate-200"
            )}
            title="Filtrar Tarefas"
          >
            <Filter className="h-4 w-4" />
          </button>

          {/* Filter Dropdown */}
          {isFilterOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-20 p-2 animate-scale-in">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">
                Filtrar Prioridade
              </div>
              <div className="space-y-1">
                {[
                  { value: "all", label: "Todas" },
                  { value: "urgent", label: "Urgente", color: "text-red-500" },
                  { value: "high", label: "Alta", color: "text-orange-500" },
                  { value: "medium", label: "Média", color: "text-blue-500" },
                  { value: "low", label: "Baixa", color: "text-slate-500" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setFilterPriority(opt.value); setIsFilterOpen(false); }}
                    className={cn(
                      "w-full text-left px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-slate-100",
                      filterPriority === opt.value ? "bg-slate-100 text-slate-800" : "text-slate-600",
                      opt.color
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Board Canvas (Scrollable Horizontal) */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4 px-4 sm:px-0 scrollbar-thin">
        <div className="flex gap-6 h-full items-start">
          
          {columns.map((col) => {
            const filteredCards = col.cards.filter(c => filterPriority === "all" || c.priority === filterPriority);
            const isOverLimit = col.wipLimit && filteredCards.length > col.wipLimit;

            return (
              <div key={col.id} className="flex flex-col w-80 max-h-full flex-shrink-0 bg-slate-100/80 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                
                {/* Column Header */}
                <div className={cn(
                  "p-3 flex justify-between items-center border-b",
                  isOverLimit ? "bg-red-50 border-red-200" : "bg-slate-100/50 border-slate-200"
                )}>
                  <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                    {col.title}
                    <span className="text-[10px] bg-white text-slate-500 px-1.5 py-0.5 rounded shadow-sm">
                      {filteredCards.length}
                    </span>
                  </h3>
                  <div className="flex items-center gap-1">
                    {col.wipLimit && (
                      <span title={`Limite de Trabalho (WIP): ${col.wipLimit}`} className={cn(
                        "text-[10px] font-bold px-1.5 py-0.5 rounded",
                        isOverLimit ? "text-red-700 bg-red-100" : "text-slate-400 bg-white shadow-sm"
                      )}>
                        Max {col.wipLimit}
                      </span>
                    )}
                    <button className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {isOverLimit && (
                  <div className="bg-red-500 text-white text-[10px] font-bold px-3 py-1 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Gargalo de Produção (WIP Excedido)
                  </div>
                )}

                {/* Cards Container */}
                <div 
                  className={cn("flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin transition-colors", 
                    draggedCardId ? "bg-slate-50/50" : ""
                  )}
                  onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
                  onDrop={(e) => handleDrop(e, col.id)}
                >
                  {filteredCards.map((card) => (
                    <div 
                      key={card.id} 
                      draggable
                      onClick={() => setViewCardId(card.id)}
                      onDragStart={(e) => {
                        setDraggedCardId(card.id);
                        e.dataTransfer.setData("cardId", card.id.toString());
                      }}
                      onDragEnd={() => setDraggedCardId(null)}
                      className={cn(
                        "bg-white p-3 rounded-lg border shadow-sm hover:shadow-md hover:border-fuchsia-300 cursor-pointer transition-all group relative",
                        card.isDone ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200",
                        card.priority === 'urgent' && !card.isDone ? "border-l-4 border-l-red-500" : "",
                        draggedCardId === card.id ? "opacity-50 border-dashed" : "opacity-100"
                      )}
                    >
                      {/* Tags */}
                      {card.tags && card.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {card.tags.map(tag => (
                            <span key={tag} className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded", getTagColor(tag))}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {/* Title */}
                      <p className={cn("text-sm font-semibold text-slate-800 leading-snug mb-2", card.isDone && "line-through text-slate-500")}>
                        {card.title}
                      </p>
                      
                      {/* Description indicator */}
                      {card.description && (
                        <div className="mb-3">
                          <AlignLeft className="h-4 w-4 text-slate-400" />
                        </div>
                      )}

                      {/* Meta info (Bottom) */}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-3 text-slate-400">
                          {card.fileUrl && (
                            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500" title="Contém Arquivo de Impressão">
                              <Paperclip className="h-3.5 w-3.5" />
                            </div>
                          )}
                          {card.clientId && (
                            <div className="flex items-center gap-1 text-[11px] font-medium text-fuchsia-600" title="Cliente Vinculado">
                              <Users className="h-3.5 w-3.5" />
                            </div>
                          )}
                          {card.dueDate && (
                            <div className={cn("flex items-center gap-1 text-[11px] font-medium", card.priority === 'urgent' ? "text-red-500" : "")}>
                              <Clock className="h-3.5 w-3.5" />
                              <span>{new Date(card.dueDate).toLocaleDateString()}</span>
                            </div>
                          )}
                          {(card.comments > 0 || card.attachments > 0) && (
                            <div className="flex items-center gap-2 text-[11px] font-medium">
                              {card.comments > 0 && (
                                <span className="flex items-center gap-1">
                                  <MessageSquare className="h-3 w-3" />
                                  {card.comments}
                                </span>
                              )}
                              {card.attachments > 0 && !card.fileUrl && (
                                <span className="flex items-center gap-1">
                                  <Paperclip className="h-3 w-3" />
                                  {card.attachments}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {card.members && card.members.map((m, i) => (
                            <div key={i} className="w-6 h-6 rounded-full bg-slate-200 border border-white flex items-center justify-center text-[9px] font-bold text-slate-600 shadow-sm" title={`Atribuído a ${m}`}>
                              {m}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Card Footer */}
                <div className="p-3 bg-slate-100/50 border-t border-slate-200">
                  <button 
                    onClick={() => handleOpenCardModal(col.id)}
                    className="w-full flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 py-1.5 px-2 rounded transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar Cartão
                  </button>
                </div>
              </div>
            );
          })}
          
          {/* Add Column */}
          <div className="w-72 flex-shrink-0">
            <button 
              onClick={() => setIsColModalOpen(true)}
              className="w-full flex items-center gap-2 text-sm font-medium text-slate-500 bg-slate-100/50 hover:bg-slate-200 border-2 border-dashed border-slate-300 hover:border-slate-400 py-3 px-4 rounded-xl transition-all shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Adicionar Nova Coluna
            </button>
          </div>

        </div>
      </div>

      {/* Modal Nova Coluna */}
      {isColModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => !isCreatingCol && setIsColModalOpen(false)}></div>
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm relative z-10 animate-scale-in flex flex-col p-5">
            <h3 className="font-bold text-lg text-slate-800 mb-4">Adicionar Nova Coluna</h3>
            <form onSubmit={handleCreateColumn}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Título da Coluna</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={newColTitle}
                    onChange={e => setNewColTitle(e.target.value)}
                    placeholder="Ex: Em Andamento"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsColModalOpen(false)}
                  disabled={isCreatingCol}
                  className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreatingCol}
                  className="flex-1 px-4 py-2 bg-fuchsia-600 text-white hover:bg-fuchsia-700 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isCreatingCol ? <Loader2 className="h-4 w-4 animate-spin" /> : "Adicionar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Card Modal */}
      {isCardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => !isCreatingCard && setIsCardModalOpen(false)}></div>
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md relative z-10 animate-scale-in flex flex-col p-5">
            <h3 className="font-bold text-lg text-slate-800 mb-4">Adicionar Nova Tarefa</h3>
            <form onSubmit={handleCreateCard}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Título da Tarefa *</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={newCardTitle}
                    onChange={e => setNewCardTitle(e.target.value)}
                    placeholder="Ex: Imprimir lona João"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                  <textarea
                    rows={3}
                    value={newCardDesc}
                    onChange={e => setNewCardDesc(e.target.value)}
                    placeholder="Detalhes adicionais..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Prioridade</label>
                  <select
                    value={newCardPriority}
                    onChange={e => setNewCardPriority(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:outline-none"
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cliente (Opcional)</label>
                  <select
                    value={newCardClient}
                    onChange={e => setNewCardClient(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:outline-none"
                  >
                    <option value="">Selecione um cliente...</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Prazo (Opcional)</label>
                  <input
                    type="date"
                    value={newCardDueDate}
                    onChange={e => setNewCardDueDate(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Arquivo para Impressão (Opcional)</label>
                  <input
                    type="file"
                    onChange={e => setNewCardFile(e.target.files ? e.target.files[0] : null)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-fuchsia-50 file:text-fuchsia-700 hover:file:bg-fuchsia-100"
                  />
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCardModalOpen(false)}
                  disabled={isCreatingCard}
                  className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreatingCard}
                  className="flex-1 px-4 py-2 bg-fuchsia-600 text-white hover:bg-fuchsia-700 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isCreatingCard ? <Loader2 className="h-4 w-4 animate-spin" /> : "Adicionar Tarefa"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Members Modal */}
      {isMembersModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Equipe do Quadro</h3>
              <button onClick={() => setIsMembersModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <h4 className="text-sm font-bold text-slate-700 mb-3">Membros Atuais</h4>
              {boardMembers.length === 0 ? (
                <p className="text-sm text-slate-500 mb-4">Nenhum membro adicionado a este quadro.</p>
              ) : (
                <div className="space-y-3 mb-6">
                  {boardMembers.map(member => (
                    <div key={member.id} className="flex justify-between items-center p-2 rounded-lg border border-slate-100 bg-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                          {member.userAvatar || member.userName.substring(0,2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 leading-none">{member.userName}</p>
                          <p className="text-xs text-slate-500 mt-1">{member.userEmail}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleRemoveMember(member.userId)}
                        className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors text-xs font-medium"
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <h4 className="text-sm font-bold text-slate-700 mb-3 pt-4 border-t border-slate-100">Adicionar Usuários</h4>
              <div className="space-y-3">
                {allUsers.filter(u => !boardMembers.find(bm => bm.userId === u.id)).length === 0 ? (
                  <p className="text-sm text-slate-500">Todos os usuários já estão no quadro.</p>
                ) : (
                  allUsers
                    .filter(u => !boardMembers.find(bm => bm.userId === u.id))
                    .map(user => (
                      <div key={user.id} className="flex justify-between items-center p-2 rounded-lg border border-slate-100 hover:border-slate-300 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                            {user.avatarInitials || user.name.substring(0,2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800 leading-none">{user.name}</p>
                            <p className="text-xs text-slate-500 mt-1">{user.email}</p>
                          </div>
                        </div>
                        <button 
                          disabled={isAddingMember}
                          onClick={() => handleAddMember(user.id)}
                          className="text-fuchsia-600 bg-fuchsia-50 hover:bg-fuchsia-100 px-3 py-1.5 rounded-lg transition-colors text-xs font-medium disabled:opacity-50"
                        >
                          Adicionar
                        </button>
                      </div>
                  ))
                )}
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                onClick={() => setIsMembersModalOpen(false)}
                className="px-4 py-2 font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Card Modal */}
      {viewCardId && selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="absolute inset-0" onClick={() => setViewCardId(null)}></div>
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg relative z-10 animate-scale-in flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-start bg-slate-50/50 rounded-t-2xl">
              <div>
                <h3 className="font-bold text-xl text-slate-800 break-words">{selectedCard.title}</h3>
                <div className="flex gap-2 mt-2">
                  <span className={cn("text-xs font-bold px-2 py-1 rounded-md", getPriorityColor(selectedCard.priority))}>
                    {(selectedCard.priority || "medium").toUpperCase()}
                  </span>
                  {selectedCard.isDone && (
                    <span className="text-xs font-bold px-2 py-1 rounded-md bg-emerald-100 text-emerald-700">
                      CONCLUÍDO
                    </span>
                  )}
                </div>
              </div>
              <button onClick={() => { setViewCardId(null); setIsEditingCard(false); }} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {isEditingCard ? (
              /* Formulário de Edição */
              <form onSubmit={handleSaveEdit} className="flex flex-col flex-1 overflow-hidden">
                <div className="p-6 overflow-y-auto space-y-4 flex-1">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Título da Tarefa</label>
                    <input
                      required
                      type="text"
                      value={editCardTitle}
                      onChange={e => setEditCardTitle(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                    <textarea
                      value={editCardDesc}
                      onChange={e => setEditCardDesc(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:outline-none resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Prioridade</label>
                      <select
                        value={editCardPriority}
                        onChange={e => setEditCardPriority(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:outline-none"
                      >
                        <option value="low">Baixa</option>
                        <option value="medium">Média</option>
                        <option value="high">Alta</option>
                        <option value="urgent">Urgente</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
                      <select
                        value={editCardClient}
                        onChange={e => setEditCardClient(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:outline-none"
                      >
                        <option value="">Selecione...</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Prazo</label>
                      <input
                        type="date"
                        value={editCardDueDate}
                        onChange={e => setEditCardDueDate(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Novo Arquivo de Impressão</label>
                    <input
                      type="file"
                      onChange={e => setEditCardFile(e.target.files ? e.target.files[0] : null)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-fuchsia-50 file:text-fuchsia-700 hover:file:bg-fuchsia-100"
                    />
                    {selectedCard.fileUrl && !editCardFile && (
                      <p className="text-xs text-slate-500 mt-2">Um arquivo já está salvo. Faça o upload apenas se quiser substituí-lo.</p>
                    )}
                  </div>
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 rounded-b-2xl">
                  <button
                    type="button"
                    onClick={() => setIsEditingCard(false)}
                    className="px-4 py-2 font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEdit}
                    className="px-4 py-2 font-medium text-white bg-fuchsia-600 rounded-lg hover:bg-fuchsia-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSavingEdit && <Loader2 className="h-4 w-4 animate-spin" />}
                    Salvar
                  </button>
                </div>
              </form>
            ) : (
              /* Visualização dos Detalhes */
              <>
                {/* Body */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Descrição */}
              <div>
                <h4 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <AlignLeft className="h-4 w-4" /> Descrição
                </h4>
                {selectedCard.description ? (
                  <p className="text-sm text-slate-600 whitespace-pre-wrap bg-slate-50 p-3 rounded-lg border border-slate-100">{selectedCard.description}</p>
                ) : (
                  <p className="text-sm text-slate-400 italic">Nenhuma descrição fornecida.</p>
                )}
              </div>

              {/* Grid 2 colunas para info secundária */}
              <div className="grid grid-cols-2 gap-4">
                {/* Cliente */}
                {selectedCard.clientId && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Cliente Vinculado</h4>
                    <p className="text-sm font-medium text-slate-800">
                      {clients.find(c => c.id === selectedCard.clientId)?.name || "Cliente não encontrado"}
                    </p>
                  </div>
                )}
                
                {/* Data de Vencimento */}
                {selectedCard.dueDate && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Vencimento</h4>
                    <p className="text-sm font-medium text-slate-800 flex items-center gap-1">
                      <Clock className="h-4 w-4 text-slate-400" />
                      {new Date(selectedCard.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Arquivo de Impressão */}
              {selectedCard.fileUrl && (
                <div>
                  <h4 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <Paperclip className="h-4 w-4" /> Arquivo para Impressão
                  </h4>
                  <div className="flex items-center gap-3 p-3 bg-fuchsia-50/50 border border-fuchsia-100 rounded-lg">
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-medium text-slate-700 truncate">{selectedCard.fileUrl.split('/').pop()}</p>
                    </div>
                    <a 
                      href={selectedCard.fileUrl} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-fuchsia-100 hover:bg-fuchsia-200 text-fuchsia-700 font-bold text-xs rounded-md transition-colors"
                    >
                      Abrir / Baixar
                    </a>
                  </div>
                </div>
              )}
            </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between gap-3 rounded-b-2xl">
                  <button
                    onClick={handleStartEdit}
                    className="px-4 py-2 font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
                  >
                    <Edit2 className="h-4 w-4" /> Editar Cartão
                  </button>
                  <button
                    onClick={() => setViewCardId(null)}
                    className="px-4 py-2 font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
