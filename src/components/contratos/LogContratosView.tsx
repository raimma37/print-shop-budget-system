"use client";

import React, { useState, useEffect } from "react";
import { 
  FileSignature, 
  Trash2,
  ExternalLink,
  Settings,
  Loader2,
  CalendarClock,
  Search,
  CheckCircle2,
  Download
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";

interface ContractLog {
  id: number;
  status: string;
  fileUrl: string | null;
  createdAt: string;
  templateName: string | null;
}

export function LogContratosView() {
  const [logs, setLogs] = useState<ContractLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [retentionDays, setRetentionDays] = useState<number>(30);
  const [savingSettings, setSavingSettings] = useState(false);
  const [search, setSearch] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<number | null>(null);
  const [saveSuccessModalOpen, setSaveSuccessModalOpen] = useState(false);

  useEffect(() => {
    fetchLogs();
    fetchSettings();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/contratos/log");
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (error) {
      console.error("Erro ao carregar log de contratos", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/contratos/log/settings");
      if (res.ok) {
        const data = await res.json();
        if (data.contractsRetentionDays) {
          setRetentionDays(data.contractsRetentionDays);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar configurações", error);
    }
  };

  const saveSettings = async () => {
    try {
      setSavingSettings(true);
      const res = await fetch("/api/contratos/log/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractsRetentionDays: retentionDays }),
      });
      if (!res.ok) throw new Error("Falha ao salvar");
      setSaveSuccessModalOpen(true);
      fetchLogs(); // Reload logs since changing settings might trigger cleanup
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar configuração de validade.");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setContractToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!contractToDelete) return;

    try {
      const res = await fetch(`/api/contratos/log/${contractToDelete}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao deletar");
      
      // Update local state
      setLogs(logs.filter(log => log.id !== contractToDelete));
      setDeleteModalOpen(false);
      setContractToDelete(null);
    } catch (error) {
      console.error(error);
      alert("Falha ao deletar o documento.");
    }
  };

  const downloadFile = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = url.split('/').pop() || 'documento.docx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLogs = logs.filter(log => 
    (log.templateName || "Contrato").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative animate-fade-in pb-10 space-y-6">
      
      {/* Painel de Configurações */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-lg shrink-0">
            <CalendarClock className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-800">Validade dos Documentos (Auto-Limpeza)</h2>
            <p className="text-sm text-slate-500 mt-1 max-w-xl">
              Os contratos gerados ocupam espaço em disco no servidor local. Defina abaixo o número de dias que o sistema deve manter os documentos salvos antes de apagá-á-los automaticamente para não acumular memória.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 shrink-0">
          <div className="flex flex-col">
            <label className="text-xs font-medium text-slate-500 mb-1">Dias de Retenção</label>
            <input 
              type="number"
              min={1}
              value={retentionDays}
              onChange={(e) => setRetentionDays(parseInt(e.target.value) || 1)}
              className="w-24 px-3 py-1.5 border border-slate-300 rounded focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm font-semibold" 
            />
          </div>
          <button 
            onClick={saveSettings}
            disabled={savingSettings}
            className="mt-5 bg-slate-800 hover:bg-slate-700 text-white px-4 py-1.5 rounded transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50"
          >
            {savingSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Salvar
          </button>
        </div>
      </div>

      {/* Tabela de Log */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-semibold text-slate-700 flex items-center gap-2">
            <FileSignature className="h-5 w-5 text-slate-400" />
            Documentos Gerados Salvos no Disco
          </h3>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar contrato..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white shadow-sm"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          {loading ? (
            <div className="flex justify-center items-center h-full p-20 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 text-slate-400">
              <FileSignature className="h-12 w-12 text-slate-200 mb-4" />
              <p>Nenhum contrato foi gerado ou todos já expiraram.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="px-6 py-4">Arquivo / Modelo</th>
                  <th className="px-6 py-4">Data de Geração</th>
                  <th className="px-6 py-4">Expira Em</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => {
                  const createdDate = new Date(log.createdAt);
                  const expirationDate = new Date(createdDate);
                  expirationDate.setDate(expirationDate.getDate() + retentionDays);
                  
                  return (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-800 flex flex-col">
                        <span>{log.fileUrl?.split('/').pop() || "Documento Sem Nome"}</span>
                        <span className="text-xs text-slate-400 font-normal mt-0.5">Gerado a partir de: {log.templateName || "Desconhecido"}</span>
                      </td>
                      <td className="px-6 py-4">
                        {format(createdDate, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md text-xs font-semibold">
                          {format(expirationDate, "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {log.fileUrl && (
                            <button 
                              onClick={() => downloadFile(log.fileUrl!)} 
                              className="p-2 text-sky-600 hover:bg-sky-50 rounded transition-colors flex items-center gap-1.5 text-xs font-medium border border-transparent hover:border-sky-200"
                              title="Baixar Cópia Local"
                            >
                              <Download className="h-4 w-4" /> Baixar
                            </button>
                          )}
                          <button 
                            onClick={() => handleDeleteClick(log.id)} 
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors flex items-center gap-1.5 text-xs font-medium border border-transparent hover:border-red-200"
                            title="Excluir Permanentemente"
                          >
                            <Trash2 className="h-4 w-4" /> Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      {/* Custom Delete Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setDeleteModalOpen(false)}></div>
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm relative z-10 animate-scale-in overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Excluir Documento?</h3>
              <p className="text-sm text-slate-500 mb-6">
                Tem certeza que deseja apagar este documento? O arquivo físico gerado também será <span className="font-bold text-red-500">deletado permanentemente</span> do servidor.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleConfirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white hover:bg-red-700 font-semibold rounded-lg transition-colors"
                >
                  Sim, excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Save Success Modal */}
      {saveSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSaveSuccessModalOpen(false)}></div>
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm relative z-10 animate-scale-in overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Configuração Salva!</h3>
              <p className="text-sm text-slate-500 mb-6">
                O prazo de retenção foi atualizado com sucesso. O sistema usará essa configuração para limpeza automática.
              </p>
              <button 
                onClick={() => setSaveSuccessModalOpen(false)}
                className="w-full px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold rounded-lg transition-colors"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
