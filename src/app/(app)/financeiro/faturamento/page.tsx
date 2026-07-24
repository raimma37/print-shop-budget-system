"use client";
import { useEffect, useState, Suspense } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { Plus, Search, CheckCircle, Package, AlertCircle, FileText } from "lucide-react";

interface Client { id: number; name: string; }
interface Product { id: number; name: string; basePrice: string; costPrice: string; unit: string; size?: string; }

const CATEGORIES = ["Produto Físico", "Mensalidade", "Serviço", "Juros por Atraso", "Taxa Administrativa", "Outros"];
const PAYMENT_METHODS = ["pix", "cartao_credito", "dinheiro", "transferencia"];
const PAYMENT_LABELS: Record<string, string> = { pix: "PIX", cartao_credito: "Cartão de Crédito", dinheiro: "Dinheiro", transferencia: "Transferência" };

interface LineItem {
  productId?: number;
  description: string;
  category: string;
  unitPrice: number;
  quantity: number;
  discount: number;
}

function FaturamentoContent() {
  const sp = useSearchParams();
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedClientId, setSelectedClientId] = useState(sp.get("clientId") ?? "");
  const [items, setItems] = useState<LineItem[]>([]);
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [productSearch, setProductSearch] = useState("");

  useEffect(() => {
    fetch("/api/clients").then((r) => r.json()).then(setClients);
    fetch("/api/products").then((r) => r.json()).then(setProducts);
  }, []);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const addProduct = (p: Product) => {
    setItems((prev) => [...prev, {
      productId: p.id,
      description: p.name + (p.size ? ` (${p.size})` : ""),
      category: "Produto Físico",
      unitPrice: parseFloat(p.basePrice),
      quantity: 1,
      discount: 0,
    }]);
    setProductSearch("");
  };

  const addManualItem = () => {
    setItems((prev) => [...prev, {
      description: "",
      category: "Outros",
      unitPrice: 0,
      quantity: 1,
      discount: 0,
    }]);
  };

  const updateItem = (i: number, field: keyof LineItem, value: string | number) => {
    setItems((prev) => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  };

  const removeItem = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i));

  const total = items.reduce((acc, item) => {
    const subtotal = item.unitPrice * item.quantity;
    return acc + subtotal - (subtotal * item.discount / 100);
  }, 0);

  const handleSubmit = async () => {
    if (!selectedClientId) { setError("Selecione um cliente."); return; }
    if (items.length === 0) { setError("Adicione pelo menos um item."); return; }
    setSaving(true);
    setError("");

    try {
      for (const item of items) {
        const subtotal = item.unitPrice * item.quantity;
        const finalAmount = subtotal - (subtotal * item.discount / 100);

        await fetch("/api/financeiro/transacoes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientId: parseInt(selectedClientId),
            type: "charge",
            category: item.category,
            description: item.description,
            amount: finalAmount.toFixed(2),
            dueDate: dueDate || null,
          }),
        });
      }
      setSuccess(true);
      setItems([]);
      setDueDate("");
    } catch {
      setError("Erro ao lançar cobranças.");
    }
    setSaving(false);
  };

  if (success) {
    return (
      <AppLayout title="Faturamento">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mb-4">
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Cobranças lançadas com sucesso!</h2>
          <p className="text-slate-500 mb-6">As cobranças foram adicionadas à conta do cliente.</p>
          <div className="flex gap-3">
            <Button onClick={() => setSuccess(false)}>Novo Lançamento</Button>
            <Button variant="secondary" onClick={() => window.location.href = `/financeiro/contas/${selectedClientId}`}>
              Ver Extrato
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Faturamento" subtitle="Lance produtos e serviços na conta do cliente">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Coluna principal */}
        <div className="xl:col-span-2 space-y-5">
          {/* Seleção de cliente */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-bold">1</span>
              Selecione o Cliente
            </h3>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Selecione um cliente --</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Itens */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-bold">2</span>
              Itens da Cobrança
            </h3>

            {/* Busca de produto */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar produto do catálogo..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {productSearch && (
              <div className="mb-3 rounded-xl border border-slate-200 overflow-hidden max-h-44 overflow-y-auto">
                {filteredProducts.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-slate-400">Nenhum produto encontrado</p>
                ) : filteredProducts.slice(0, 6).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => addProduct(p)}
                    className="flex items-center justify-between w-full px-4 py-2.5 hover:bg-indigo-50 text-left transition-colors border-b border-slate-50 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">{p.name}</p>
                      {p.size && <p className="text-xs text-slate-400">{p.size}</p>}
                    </div>
                    <span className="text-sm font-semibold text-indigo-600">{formatCurrency(parseFloat(p.basePrice))}</span>
                  </button>
                ))}
              </div>
            )}

            {items.length > 0 && (
              <div className="space-y-3 mb-3">
                {items.map((item, i) => (
                  <div key={i} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3">
                      <input
                        type="text"
                        placeholder="Descrição"
                        value={item.description}
                        onChange={(e) => updateItem(i, "description", e.target.value)}
                        className="sm:col-span-2 md:col-span-4 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <select
                        value={item.category}
                        onChange={(e) => updateItem(i, "category", e.target.value)}
                        className="sm:col-span-1 md:col-span-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                      <div className="relative sm:col-span-1 md:col-span-2">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">R$</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(i, "unitPrice", parseFloat(e.target.value) || 0)}
                          className="w-full pl-7 pr-2 py-1.5 rounded-lg border border-slate-200 bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="flex items-center gap-2 sm:col-span-1 md:col-span-2">
                        <span className="text-xs text-slate-400 flex-shrink-0 whitespace-nowrap">Qtd</span>
                        <input
                          type="number"
                          min="1"
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) => updateItem(i, "quantity", parseFloat(e.target.value) || 1)}
                          className="w-full min-w-0 px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="flex items-center gap-2 sm:col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-xs text-slate-400 flex-shrink-0 whitespace-nowrap">Desc%</span>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={item.discount}
                            onChange={(e) => updateItem(i, "discount", parseFloat(e.target.value) || 0)}
                            className="w-full min-w-0 px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <button onClick={() => removeItem(i)} className="rounded-lg p-1 text-red-400 hover:bg-red-50 flex-shrink-0">×</button>
                      </div>
                    </div>
                    <p className="text-right text-xs font-semibold text-indigo-600 mt-1">
                      Subtotal: {formatCurrency((item.unitPrice * item.quantity) * (1 - item.discount / 100))}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={addManualItem}
              className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
            >
              <Plus className="h-4 w-4" /> Adicionar item manualmente
            </button>
          </div>

          {/* Vencimento */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-bold">3</span>
              Data de Vencimento (opcional)
            </h3>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Painel lateral — resumo */}
        <div>
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 sticky top-20">
            <h3 className="font-semibold text-slate-900 mb-4">Resumo do Lançamento</h3>
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-300">
                <Package className="h-8 w-8 mb-2" />
                <p className="text-sm">Nenhum item adicionado</p>
              </div>
            ) : (
              <div className="space-y-2 mb-4">
                {items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <p className="text-slate-700 truncate max-w-[60%]">{item.description || "Item sem nome"}</p>
                    <p className="font-medium text-slate-900">
                      {formatCurrency((item.unitPrice * item.quantity) * (1 - item.discount / 100))}
                    </p>
                  </div>
                ))}
                <div className="border-t border-slate-100 pt-2 flex items-center justify-between">
                  <span className="font-semibold text-slate-900">Total</span>
                  <span className="text-lg font-bold text-indigo-600 tabular-nums">{formatCurrency(total)}</span>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 mb-3">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                <p className="text-xs text-red-700">{error}</p>
              </div>
            )}

            <Button
              className="w-full"
              onClick={handleSubmit}
              loading={saving}
              disabled={items.length === 0 || !selectedClientId}
            >
              <FileText className="h-4 w-4" />
              Confirmar Lançamento
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default function FaturamentoPage() {
  return (
    <Suspense fallback={<AppLayout title="Faturamento"><div className="h-64 bg-slate-100 animate-pulse rounded-2xl" /></AppLayout>}>
      <FaturamentoContent />
    </Suspense>
  );
}
