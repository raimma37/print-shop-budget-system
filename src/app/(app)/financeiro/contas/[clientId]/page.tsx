"use client";
import { useEffect, useState, use } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ArrowLeft, ShieldOff, ShieldCheck, TrendingUp, TrendingDown,
  DollarSign, FileText, Plus, Trash2, User, CreditCard,
} from "lucide-react";
import Link from "next/link";

interface Transaction {
  id: number;
  type: string;
  category: string;
  description: string;
  amount: string;
  paymentMethod: string | null;
  dueDate: string | null;
  paidAt: string | null;
  createdAt: string;
  createdByName: string;
}

interface AccountData {
  client: { id: number; name: string; email: string; phone: string };
  account: { creditLimit: string; blocked: boolean };
  balance: number;
  transactions: Transaction[];
  invoices: { id: number; numero: string; status: string; totalAmount: string; dueDate: string }[];
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  charge: { label: "Cobrança", color: "text-red-700 bg-red-50" },
  payment: { label: "Pagamento", color: "text-emerald-700 bg-emerald-50" },
  adjustment: { label: "Ajuste", color: "text-indigo-700 bg-indigo-50" },
  interest: { label: "Juros", color: "text-orange-700 bg-orange-50" },
  discount: { label: "Desconto", color: "text-teal-700 bg-teal-50" },
};

export default function ContaClientePage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = use(params);
  const [data, setData] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal de crédito
  const [creditModalOpen, setCreditModalOpen] = useState(false);
  const [creditForm, setCreditForm] = useState({ creditLimit: "0", blocked: false, notes: "" });
  const [savingCredit, setSavingCredit] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const res = await fetch(`/api/financeiro/contas/${clientId}`);
    if (res.ok) {
      const d = await res.json();
      setData(d);
      setCreditForm({
        creditLimit: d.account?.creditLimit ?? "0",
        blocked: d.account?.blocked ?? false,
        notes: d.account?.notes ?? "",
      });
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [clientId]);

  const handleSaveCredit = async () => {
    setSavingCredit(true);
    await fetch(`/api/financeiro/contas/${clientId}/credito`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(creditForm),
    });
    setSavingCredit(false);
    setCreditModalOpen(false);
    fetchData();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Excluir esta transação? Não pode ser desfeito.")) return;
    await fetch(`/api/financeiro/transacoes/${id}`, { method: "DELETE" });
    fetchData();
  };

  if (loading) return (
    <AppLayout title="Carregando...">
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => <div key={i} className="h-12 rounded-xl bg-slate-100 animate-pulse" />)}
      </div>
    </AppLayout>
  );

  if (!data) return <AppLayout title="Cliente não encontrado"><p className="text-slate-500">Cliente não encontrado.</p></AppLayout>;

  const { client, account, balance, transactions, invoices } = data;
  const creditLimit = parseFloat(account?.creditLimit ?? "0");
  const creditUsage = creditLimit > 0 ? Math.min(100, (Math.max(0, balance) / creditLimit) * 100) : 0;

  return (
    <AppLayout
      title={client.name}
      subtitle="Extrato detalhado da conta corrente"
      actions={
        <div className="flex gap-2">
          <Link href="/financeiro/contas">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="h-4 w-4" /> Voltar
            </Button>
          </Link>
          <Button size="sm" onClick={() => setCreditModalOpen(true)}>
            <CreditCard className="h-4 w-4" /> Limites e Crédito
          </Button>
        </div>
      }
    >
      {/* Cabeçalho do cliente */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className={`rounded-2xl border shadow-sm p-5 ${
          balance > 0 ? "border-red-200 bg-red-50" : "border-emerald-200 bg-emerald-50"
        }`}>
          <p className="text-xs font-medium text-slate-500 mb-1">Saldo Atual</p>
          <p className={`text-3xl font-bold tabular-nums ${balance > 0 ? "text-red-700" : "text-emerald-700"}`}>
            {balance > 0 ? formatCurrency(balance) : "Adimplente"}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {balance > 0 ? "em débito" : "sem dívidas"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
          <p className="text-xs font-medium text-slate-500 mb-1">Limite de Crédito</p>
          <p className="text-xl font-bold text-slate-900">
            {creditLimit > 0 ? formatCurrency(creditLimit) : "Sem limite definido"}
          </p>
          {creditLimit > 0 && (
            <>
              <div className="mt-2 h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all ${creditUsage > 80 ? "bg-red-500" : "bg-emerald-500"}`}
                  style={{ width: `${creditUsage}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">{creditUsage.toFixed(0)}% utilizado</p>
            </>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
          <p className="text-xs font-medium text-slate-500 mb-2">Status da Conta</p>
          <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${
            account?.blocked ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
          }`}>
            {account?.blocked
              ? <><ShieldOff className="h-4 w-4" /> Bloqueada</>
              : <><ShieldCheck className="h-4 w-4" /> Ativa</>
            }
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {client.email && <span className="block truncate">{client.email}</span>}
            {client.phone && <span>{client.phone}</span>}
          </p>
        </div>
      </div>

      {/* Atalhos rápidos */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Link href={`/financeiro/faturamento?clientId=${client.id}`}>
          <Button size="sm" variant="secondary">
            <Plus className="h-4 w-4" /> Lançar Cobrança
          </Button>
        </Link>
        <Link href={`/financeiro/recebimentos?clientId=${client.id}`}>
          <Button size="sm" variant="secondary">
            <DollarSign className="h-4 w-4" /> Registrar Pagamento
          </Button>
        </Link>
        <Link href={`/financeiro/faturamento?clientId=${client.id}&action=invoice`}>
          <Button size="sm" variant="secondary">
            <FileText className="h-4 w-4" /> Gerar Fatura
          </Button>
        </Link>
      </div>

      {/* Extrato */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden mb-5">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Extrato Cronológico</h2>
          <span className="text-xs text-slate-400">{transactions.length} lançamentos</span>
        </div>

        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <FileText className="h-8 w-8 mb-2" />
            <p className="text-sm">Nenhuma movimentação registrada</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Data</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Descrição</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Método</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">Valor</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500">Usuário</th>
                  <th className="px-4 py-3 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {transactions.map((tx) => {
                  const amt = parseFloat(tx.amount);
                  const typeInfo = TYPE_LABELS[tx.type] ?? { label: tx.type, color: "text-slate-700 bg-slate-100" };
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                        {formatDate(tx.createdAt)}
                        {tx.paidAt && <span className="block text-emerald-600 text-xs">✓ pago</span>}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900 text-sm">{tx.description}</p>
                        <p className="text-xs text-slate-400">{tx.category}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {tx.paymentMethod ?? "—"}
                      </td>
                      <td className={`px-4 py-3 text-right font-semibold tabular-nums ${amt >= 0 ? "text-red-700" : "text-emerald-700"}`}>
                        {amt >= 0 ? "+" : ""}{formatCurrency(Math.abs(amt))}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">{tx.createdByName}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="rounded p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Crédito */}
      <Modal
        open={creditModalOpen}
        onClose={() => setCreditModalOpen(false)}
        title="Limite e Crédito"
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setCreditModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveCredit} loading={savingCredit}>Salvar</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Limite de Crédito (R$)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">R$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={creditForm.creditLimit}
                onChange={(e) => setCreditForm((f) => ({ ...f, creditLimit: e.target.value }))}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">0 = sem limite definido</p>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-700">Bloquear novos lançamentos</p>
              <p className="text-xs text-slate-400">Impede que novos débitos sejam adicionados à conta</p>
            </div>
            <button
              onClick={() => setCreditForm((f) => ({ ...f, blocked: !f.blocked }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                creditForm.blocked ? "bg-red-500" : "bg-slate-200"
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                creditForm.blocked ? "translate-x-6" : "translate-x-1"
              }`} />
            </button>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Observações internas</label>
            <textarea
              value={creditForm.notes}
              onChange={(e) => setCreditForm((f) => ({ ...f, notes: e.target.value }))}
              rows={3}
              placeholder="Ex: cliente solicitou prazo, aguardando pagamento..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
