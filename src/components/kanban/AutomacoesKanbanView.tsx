"use client";

import React, { useState } from "react";
import { 
  Zap, 
  Plus, 
  Search, 
  ArrowRight,
  Bot,
  Mail,
  RefreshCw,
  Bell,
  Clock,
  Settings2,
  Trash2,
  Edit,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  isActive: boolean;
  runCount: number;
  lastRun?: string;
  icon: any;
}

const mockRules: AutomationRule[] = [
  { id: "r1", name: "Faturamento Automático", trigger: "Quando um cartão entra em 'Faturado'", action: "Mudar status do Pedido no ERP para 'Finalizado'", isActive: true, runCount: 142, lastRun: "Hoje às 10:30", icon: RefreshCw },
  { id: "r2", name: "Alerta de Prazo", trigger: "24h antes do Prazo Final", action: "Adicionar etiqueta 'Urgente' e notificar Produção", isActive: true, runCount: 38, lastRun: "Ontem às 18:00", icon: Clock },
  { id: "r3", name: "Aviso de Cliente", trigger: "Quando um cartão entra em 'Aguardando Aprovação'", action: "Enviar E-mail para o Cliente", isActive: false, runCount: 0, icon: Mail },
  { id: "r4", name: "Notificação de Instalação", trigger: "Quando cartão entra em 'Instalação Externa'", action: "Enviar push para o celular do Instalador", isActive: true, runCount: 89, lastRun: "Hoje às 08:15", icon: Bell },
];

interface ColumnData {
  id: number;
  title: string;
}

export function AutomacoesKanbanView() {
  const [rules, setRules] = useState<AutomationRule[]>(mockRules);
  const [search, setSearch] = useState("");
  const [availableColumns, setAvailableColumns] = useState<ColumnData[]>([]);

  React.useEffect(() => {
    fetch("/api/kanban/columns")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Remover duplicadas por título para facilitar
          const uniqueTitles = new Set();
          const uniqueCols = data.filter(c => {
            if (uniqueTitles.has(c.title)) return false;
            uniqueTitles.add(c.title);
            return true;
          });
          setAvailableColumns(uniqueCols);
        }
      });
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRuleName, setNewRuleName] = useState("");
  const [newRuleTrigger, setNewRuleTrigger] = useState("Quando um cartão entra na coluna");
  const [triggerParam, setTriggerParam] = useState("");
  
  const [newRuleAction, setNewRuleAction] = useState("Enviar E-mail para o Cliente");
  const [actionParam, setActionParam] = useState("");

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName.trim()) return;

    let finalTrigger = newRuleTrigger;
    if (newRuleTrigger === "Quando um cartão entra na coluna" && triggerParam) {
      finalTrigger = `Quando um cartão entra em '${triggerParam}'`;
    } else if (newRuleTrigger === "Quando o prazo final for em" && triggerParam) {
      finalTrigger = `${triggerParam} antes do Prazo Final`;
    } else if (newRuleTrigger === "Quando uma etiqueta for adicionada" && triggerParam) {
      finalTrigger = `Quando a etiqueta '${triggerParam}' for adicionada`;
    }

    let finalAction = newRuleAction;
    if (newRuleAction === "Mudar status no ERP" && actionParam) {
      finalAction = `Mudar status do Pedido no ERP para '${actionParam}'`;
    } else if (newRuleAction === "Adicionar Etiqueta" && actionParam) {
      finalAction = `Adicionar etiqueta '${actionParam}'`;
    } else if (newRuleAction === "Atribuir a um membro" && actionParam) {
      finalAction = `Atribuir ao membro '${actionParam}'`;
    }

    const newRule: AutomationRule = {
      id: "r" + Date.now(),
      name: newRuleName,
      trigger: finalTrigger,
      action: finalAction,
      isActive: true,
      runCount: 0,
      icon: Zap, // Default icon
    };

    setRules([newRule, ...rules]);
    setIsModalOpen(false);
    setNewRuleName("");
    setNewRuleTrigger("Quando um cartão entra na coluna");
    setTriggerParam("");
    setNewRuleAction("Enviar E-mail para o Cliente");
    setActionParam("");
  };

  const toggleRule = (id: string) => {
    setRules(rules.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
  };

  const filteredRules = rules.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) || 
    r.trigger.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto pb-10 animate-fade-in">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-fuchsia-100 text-fuchsia-600 rounded-lg">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Regras e Automações</h2>
            <p className="text-sm text-slate-500">Configure robôs para mover cartões ou notificar o sistema raiz automaticamente.</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 text-sm font-bold text-white bg-fuchsia-600 hover:bg-fuchsia-700 px-6 py-2 rounded-lg transition-colors shadow-sm w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Nova Regra
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar regra de negócio..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500 bg-white shadow-sm"
          />
        </div>
        
        <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
          <Bot className="h-5 w-5 text-fuchsia-500" />
          <span>{rules.filter(r => r.isActive).length} robôs rodando ativos</span>
        </div>
      </div>

      {/* Grid de Regras */}
      <div className="space-y-4">
        {filteredRules.map((rule) => {
          const Icon = rule.icon;
          return (
            <div key={rule.id} className={cn(
              "flex flex-col lg:flex-row items-start lg:items-center justify-between p-5 bg-white border rounded-xl shadow-sm transition-colors",
              rule.isActive ? "border-slate-200 hover:border-fuchsia-300" : "border-slate-100 bg-slate-50/50 opacity-80"
            )}>
              
              <div className="flex items-start gap-4 flex-1">
                <div className={cn(
                  "p-3 rounded-xl flex items-center justify-center flex-shrink-0 mt-1",
                  rule.isActive ? "bg-fuchsia-100 text-fuchsia-600" : "bg-slate-200 text-slate-400"
                )}>
                  <Icon className="h-6 w-6" />
                </div>
                
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-slate-800">{rule.name}</h3>
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                      rule.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"
                    )}>
                      {rule.isActive ? "Ativo" : "Pausado"}
                    </span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-sm text-slate-600 font-medium">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-md border border-slate-200">
                      <span className="text-slate-400 font-normal">SE</span> {rule.trigger}
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 hidden sm:block" />
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-fuchsia-50 text-fuchsia-800 rounded-md border border-fuchsia-100">
                      <span className="text-fuchsia-400 font-normal">ENTÃO</span> {rule.action}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between w-full lg:w-auto mt-4 lg:mt-0 gap-6 lg:ml-6 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                <div className="flex flex-col items-end text-sm">
                  <span className="font-bold text-slate-700">{rule.runCount} execuções</span>
                  <span className="text-xs text-slate-400">Última: {rule.lastRun || "Nunca"}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer mr-4">
                    <input type="checkbox" className="sr-only peer" checked={rule.isActive} onChange={() => toggleRule(rule.id)} />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>

                  <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Modal Nova Regra */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="absolute inset-0" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md relative z-10 animate-scale-in flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-lg text-slate-800">Criar Nova Automação</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateRule} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Regra</label>
                <input 
                  type="text"
                  required
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  placeholder="Ex: Alerta de Vencimento"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Gatilho (Quando...)</label>
                <select 
                  value={newRuleTrigger}
                  onChange={(e) => { setNewRuleTrigger(e.target.value); setTriggerParam(""); }}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:outline-none"
                >
                  <option value="Quando um cartão entra na coluna">Quando um cartão entra na coluna</option>
                  <option value="Quando o prazo final for em">Quando o prazo final for em...</option>
                  <option value="Quando uma etiqueta for adicionada">Quando uma etiqueta for adicionada</option>
                  <option value="Quando o cartão for concluído">Quando o cartão for concluído</option>
                </select>
                
                {newRuleTrigger === "Quando um cartão entra na coluna" && (
                  <select
                    value={triggerParam}
                    onChange={e => setTriggerParam(e.target.value)}
                    className="w-full mt-2 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:outline-none text-sm bg-slate-50"
                  >
                    <option value="">Selecione a coluna...</option>
                    {availableColumns.map(c => (
                      <option key={c.id} value={c.title}>{c.title}</option>
                    ))}
                  </select>
                )}
                {newRuleTrigger === "Quando o prazo final for em" && (
                  <input type="text" placeholder="Tempo (ex: 24h, 2 dias)" value={triggerParam} onChange={e => setTriggerParam(e.target.value)} className="w-full mt-2 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:outline-none text-sm bg-slate-50" />
                )}
                {newRuleTrigger === "Quando uma etiqueta for adicionada" && (
                  <input type="text" placeholder="Nome da etiqueta (ex: Urgente)" value={triggerParam} onChange={e => setTriggerParam(e.target.value)} className="w-full mt-2 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:outline-none text-sm bg-slate-50" />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ação (Faça...)</label>
                <select 
                  value={newRuleAction}
                  onChange={(e) => { setNewRuleAction(e.target.value); setActionParam(""); }}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:outline-none"
                >
                  <option value="Enviar E-mail para o Cliente">Enviar E-mail para o Cliente</option>
                  <option value="Notificar no WhatsApp">Notificar no WhatsApp</option>
                  <option value="Mudar status no ERP">Mudar status no ERP</option>
                  <option value="Adicionar Etiqueta">Adicionar Etiqueta</option>
                  <option value="Atribuir a um membro">Atribuir a um membro</option>
                </select>
                
                {newRuleAction === "Mudar status no ERP" && (
                  <input type="text" placeholder="Qual o novo status? (ex: Finalizado)" value={actionParam} onChange={e => setActionParam(e.target.value)} className="w-full mt-2 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:outline-none text-sm bg-slate-50" />
                )}
                {newRuleAction === "Adicionar Etiqueta" && (
                  <input type="text" placeholder="Qual etiqueta? (ex: Urgente)" value={actionParam} onChange={e => setActionParam(e.target.value)} className="w-full mt-2 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:outline-none text-sm bg-slate-50" />
                )}
                {newRuleAction === "Atribuir a um membro" && (
                  <input type="text" placeholder="Nome do membro (ex: João)" value={actionParam} onChange={e => setActionParam(e.target.value)} className="w-full mt-2 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:outline-none text-sm bg-slate-50" />
                )}
              </div>
              
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 font-medium text-white bg-fuchsia-600 rounded-lg hover:bg-fuchsia-700 transition-colors"
                >
                  Criar Regra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
