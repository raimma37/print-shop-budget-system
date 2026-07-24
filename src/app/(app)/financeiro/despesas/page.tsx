"use client";
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { Plus, Calendar, AlertTriangle, CheckCircle, Clock, Repeat, Trash2, Pencil } from "lucide-react";

interface Expense {
  id: number;
  description: string;
  category: string;
  amount: string;
  dueDate: string;
  paidAt: string | null;
  status: "pendente" | "pago" | "vencido";
  recurring: boolean;
  recurringInterval: string | null;
  notes: string | null;
}

const CATEGORIES = ["Luz", "Internet", "Aluguel", "Fornecedor", "Folha de Pagamento", "Impostos", "Manutenção", "Outros"];
const CATEGORY_VALUES: Record<string, string> = { "Luz": "luz", "Internet": "internet", "Aluguel": "aluguel", "Fornecedor": "fornecedor", "Folha de Pagamento": "folha", "Impostos": "impostos", "Manutenção": "manutencao", "Outros": "outros" };

const STATUS_LABELS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pendente: { label: "Pendente", color: "bg-amber-100 text-amber-800", icon: <Clock className="h-3.5 w-3.5" /> },
  pago: { label: "Pago", color: "bg-emerald-100 text-emerald-800", icon: <CheckCircle className="h-3.5 w-3.5" /> },
  vencido: { label: "Vencido", color: "bg-red-100 text-red-800", icon: <AlertTriangle className="h-3.5 w-3.5" /> },
};

const emptyForm = {
  description: "",
  category: "outros",
  amount: "",
  dueDate: "",
  recurring: false,
  recurringInterval: "monthly",
  notes: "",
};

export default function DespesasPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Expense | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const params = statusFilter !== "todos" ? `?status=${statusFilter}` : "";
    const res = await fetch(`/api/financeiro/despesas${params}`);
    if (res.ok) {
      const data = await res.json();
      // Auto-mark overdue
      const today = new Date().toISOString().slice(0, 10);
      const withStatus = data.map((e: Expense) => ({
        ...e,
        status: e.status === "pendente" && e.dueDate < today ? "vencido" : e.status,
      }));
      setExpenses(withStatus);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [statusFilter]);

  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (e: Expense) => {
    setEditTarget(e);
    setForm({
      description: e.description,
      category: e.category,
      amount: e.amount,
      dueDate: e.dueDate,
      recurring: e.recurring,
      recurringInterval: e.recurringInterval ?? "monthly",
      notes: e.notes ?? "",
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const url = editTarget ? `/api/financeiro/despesas/${editTarget.id}` : "/api/financeiro/despesas";
    const method = editTarget ? "PUT" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, status: editTarget?.status ?? "pendente" }),
    });
    setSaving(false);
    setModalOpen(false);
    fetchData();
  };

  const handlePay = async (e: Expense) => {
    await fetch(`/api/financeiro/despesas/${e.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...e, status: "pago", paidAt: new Date().toISOString().slice(0, 10) }),
    });
    fetchData();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Excluir esta despesa?")) return;
    await fetch(`/api/financeiro/despesas/${id}`, { method: "DELETE" });
    fetchData();
  };

  const totalPendente = expenses.filter((e) => e.status === "pendente").reduce((acc, e) => acc + parseFloat(e.amount), 0);
  const totalVencido = expenses.filter((e) => e.status === "vencido").reduce((acc, e) => acc + parseFloat(e.amount), 0);
  const totalPago = expenses.filter((e) => e.status === "pago").reduce((acc, e) => acc + parseFloat(e.amount), 0);

  return (
    <AppLayout
      title="Contas a Pagar"
      subtitle="Gerencie as despesas internas do negócio"
      actions={
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Nova Despesa
        </Button>
      }
    >
      {/* Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 shadow-sm px-5 py-4">
          <p className="text-xs font-medium text-amber-700">Pendentes</p>
          <p className="text-2xl font-bold text-amber-900 tabular-nums">{formatCurrency(totalPendente)}</p>
        </div>
        <div className="rounded-2xl border border-red-200 bg-red-50 shadow-sm px-5 py-4">
          <p className="text-xs font-medium text-red-700">Vencidas</p>
          <p className="text-2xl font-bold text-red-900 tabular-nums">{formatCurrency(totalVencido)}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 shadow-sm px-5 py-4">
          <p className="text-xs font-medium text-emerald-700">Pagas (filtro atual)</p>
          <p className="text-2xl font-bold text-emerald-900 tabular-nums">{formatCurrency(totalPago)}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-5">
        {["todos", "pendente", "vencido", "pago"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors capitalize ${
              statusFilter === s
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {s === "todos" ? "Todos" : s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />)}
        </div>
      ) : expenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center">
          <Calendar className="h-10 w-10 text-slate-200 mb-3" />
          <p className="text-slate-500 font-medium">Nenhuma despesa registrada</p>
          <Button size="sm" onClick={openCreate} className="mt-4">
            <Plus className="h-4 w-4" /> Cadastrar Despesa
          </Button>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Descrição</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Categoria</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Vencimento</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">Valor</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {expenses.map((e) => {
                const st = STATUS_LABELS[e.status];
                return (
                  <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{e.description}</p>
                      {e.recurring && (
                        <span className="inline-flex items-center gap-1 text-xs text-indigo-600">
                          <Repeat className="h-3 w-3" /> Recorrente ({e.recurringInterval})
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 capitalize">{e.category}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {new Date(e.dueDate + "T00:00:00").toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900 tabular-nums">
                      {formatCurrency(parseFloat(e.amount))}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${st.color}`}>
                        {st.icon} {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {e.status !== "pago" && (
                          <button
                            onClick={() => handlePay(e)}
                            className="rounded-lg px-2 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                          >
                            Pagar
                          </button>
                        )}
                        <button onClick={() => openEdit(e)} className="rounded p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(e.id)} className="rounded p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? "Editar Despesa" : "Nova Despesa"}
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} loading={saving}>Salvar</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Descrição *</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Ex: Fatura de energia elétrica"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Categoria</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {CATEGORIES.map((c) => <option key={c} value={CATEGORY_VALUES[c] ?? c.toLowerCase()}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Valor (R$)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">R$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Data de Vencimento *</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-700">Despesa recorrente</p>
              <p className="text-xs text-slate-400">Mensalidade, aluguel, etc.</p>
            </div>
            <button
              onClick={() => setForm((f) => ({ ...f, recurring: !f.recurring }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.recurring ? "bg-indigo-600" : "bg-slate-200"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.recurring ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
          {form.recurring && (
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Frequência</label>
              <select
                value={form.recurringInterval}
                onChange={(e) => setForm((f) => ({ ...f, recurringInterval: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
              </select>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Observações</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
