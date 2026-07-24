"use client";
import { useEffect, useState, Suspense } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { CheckCircle, DollarSign, AlertCircle, Receipt, CreditCard } from "lucide-react";

interface Client { id: number; name: string; balance: number; }

const TYPES = [
  { value: "payment", label: "Pagamento", desc: "Abatimento no saldo devedor" },
  { value: "discount", label: "Desconto/Perdão", desc: "Redução concedida (sem entrada de dinheiro)" },
  { value: "interest", label: "Juros/Multa", desc: "Acréscimo ao saldo devedor" },
  { value: "adjustment", label: "Ajuste Manual", desc: "Correção avulsa" },
];

const PAYMENT_METHODS = [
  { value: "pix", label: "PIX" },
  { value: "dinheiro", label: "Dinheiro" },
  { value: "cartao_credito", label: "Cartão de Crédito" },
  { value: "transferencia", label: "Transferência Bancária" },
];

function RecebimentosContent() {
  const sp = useSearchParams();
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState(sp.get("clientId") ?? "");
  const [type, setType] = useState("payment");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [lastReceipt, setLastReceipt] = useState<{ clientName: string; amount: number; method: string; date: string } | null>(null);

  useEffect(() => {
    fetch("/api/financeiro/contas")
      .then((r) => r.json())
      .then(setClients);
  }, []);

  const selectedClient = clients.find((c) => String(c.id) === clientId);

  const handleSubmit = async () => {
    if (!clientId) { setError("Selecione um cliente."); return; }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) { setError("Informe um valor válido."); return; }
    if (!description.trim()) { setError("Informe uma descrição."); return; }
    if (type === "payment" && !paymentMethod) { setError("Selecione o método de pagamento."); return; }

    setSaving(true);
    setError("");

    const res = await fetch("/api/financeiro/transacoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: parseInt(clientId),
        type,
        category: "outros",
        description: description.trim(),
        amount: amt.toFixed(2),
        paymentMethod: type === "payment" ? paymentMethod : null,
      }),
    });

    if (res.ok) {
      setLastReceipt({
        clientName: selectedClient?.name ?? "",
        amount: amt,
        method: PAYMENT_METHODS.find((m) => m.value === paymentMethod)?.label ?? "",
        date: new Date().toLocaleString("pt-BR"),
      });
      setSuccess(true);
      setAmount("");
      setDescription("");
    } else {
      const d = await res.json();
      setError(d.error ?? "Erro ao registrar.");
    }
    setSaving(false);
  };

  const selectedType = TYPES.find((t) => t.value === type);
  const currentBalance = selectedClient?.balance ?? 0;
  const newBalance = currentBalance - (parseFloat(amount) || 0) * (["payment", "discount"].includes(type) ? 1 : -1);

  return (
    <AppLayout title="Recebimentos & Abatimentos" subtitle="Registre pagamentos e ajustes no saldo dos clientes">
      {success && lastReceipt && (
        <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
              <Receipt className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-emerald-900">Recibo gerado com sucesso!</p>
              <p className="text-xs text-emerald-700">{lastReceipt.date}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-emerald-200 p-4 text-sm space-y-1">
            <div className="flex justify-between"><span className="text-slate-500">Cliente</span><span className="font-medium">{lastReceipt.clientName}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Valor</span><span className="font-bold text-emerald-700">{formatCurrency(lastReceipt.amount)}</span></div>
            {lastReceipt.method && <div className="flex justify-between"><span className="text-slate-500">Forma</span><span>{lastReceipt.method}</span></div>}
          </div>
          <button onClick={() => setSuccess(false)} className="mt-3 text-sm text-emerald-700 hover:text-emerald-900 font-medium">
            + Registrar outro pagamento
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="space-y-5">
          {/* Cliente */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
            <h3 className="font-semibold text-slate-900 mb-3">Cliente</h3>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Selecione --</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.balance > 0 ? `(Deve: ${formatCurrency(c.balance)})` : "(Adimplente)"}
                </option>
              ))}
            </select>

            {selectedClient && currentBalance > 0 && (
              <div className="mt-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3 flex items-center gap-3">
                <DollarSign className="h-4 w-4 text-red-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-red-800">Saldo em Débito: {formatCurrency(currentBalance)}</p>
                  <p className="text-xs text-red-600">O pagamento será abatido deste saldo</p>
                </div>
              </div>
            )}
          </div>

          {/* Tipo */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
            <h3 className="font-semibold text-slate-900 mb-3">Tipo de Lançamento</h3>
            <div className="grid grid-cols-2 gap-2">
              {TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setType(t.value)}
                  className={`text-left rounded-xl border p-3 transition-all ${
                    type === t.value
                      ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-400"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <p className="text-sm font-medium text-slate-900">{t.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {/* Valor e Método */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
            <h3 className="font-semibold text-slate-900 mb-3">Valor e Detalhes</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Valor (R$)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">R$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0,00"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-white text-right text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Descrição</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Pagamento referente ao mês de julho"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {type === "payment" && (
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">
                    <CreditCard className="inline h-4 w-4 mr-1" />
                    Forma de Pagamento
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {PAYMENT_METHODS.map((m) => (
                      <button
                        key={m.value}
                        onClick={() => setPaymentMethod(m.value)}
                        className={`rounded-xl border py-2 px-3 text-sm font-medium transition-all ${
                          paymentMethod === m.value
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preview */}
          {selectedClient && parseFloat(amount) > 0 && (
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
              <h3 className="font-semibold text-indigo-900 mb-3">Preview do Impacto</h3>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-indigo-700">Saldo atual</span>
                  <span className="font-medium text-slate-900">{formatCurrency(currentBalance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-indigo-700">
                    {["payment", "discount"].includes(type) ? "(-) Abatimento" : "(+) Acréscimo"}
                  </span>
                  <span className={`font-medium ${["payment", "discount"].includes(type) ? "text-emerald-700" : "text-red-700"}`}>
                    {formatCurrency(parseFloat(amount))}
                  </span>
                </div>
                <div className="flex justify-between border-t border-indigo-200 pt-1.5">
                  <span className="font-semibold text-indigo-800">Novo saldo</span>
                  <span className={`font-bold text-base ${newBalance > 0 ? "text-red-700" : "text-emerald-700"}`}>
                    {formatCurrency(Math.max(0, newBalance))}
                  </span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <Button className="w-full" onClick={handleSubmit} loading={saving} disabled={!clientId || !parseFloat(amount)}>
            <Receipt className="h-4 w-4" />
            Confirmar e Emitir Recibo
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}

export default function RecebimentosPage() {
  return (
    <Suspense fallback={<AppLayout title="Recebimentos"><div className="h-64 bg-slate-100 animate-pulse rounded-2xl" /></AppLayout>}>
      <RecebimentosContent />
    </Suspense>
  );
}
