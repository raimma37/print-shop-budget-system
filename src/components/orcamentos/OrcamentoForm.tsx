"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { formatCurrency } from "@/lib/utils";
import { Plus, Trash2, Search, Package, GripVertical } from "lucide-react";

interface Client {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
}

interface Product {
  id: number;
  name: string;
  unit: string;
  basePrice: string;
  category: string | null;
}

interface LineItem {
  productId: number | null;
  description: string;
  quantity: string;
  unit: string;
  unitPrice: string;
  sortOrder: number;
}

interface OrcamentoFormProps {
  initialData?: {
    id?: number;
    clientId?: number;
    status?: string;
    validUntil?: string | null;
    discount?: string;
    notes?: string;
    internalNotes?: string;
    items?: Array<{
      productId: number | null;
      description: string;
      quantity: string;
      unit: string;
      unitPrice: string;
      sortOrder: number;
    }>;
  };
  mode: "create" | "edit";
}

function calcItemTotal(qty: string, price: string): number {
  const q = parseFloat(qty) || 0;
  const p = parseFloat(price) || 0;
  return q * p;
}

export function OrcamentoForm({ initialData, mode }: OrcamentoFormProps) {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [newItem, setNewItem] = useState<LineItem>({
    productId: null,
    description: "",
    quantity: "1",
    unit: "un",
    unitPrice: "0",
    sortOrder: 0,
  });
  const [showNewItemSearch, setShowNewItemSearch] = useState(false);

  const [clientId, setClientId] = useState<string>(String(initialData?.clientId ?? ""));
  const [status, setStatus] = useState(initialData?.status ?? "rascunho");
  const [validUntil, setValidUntil] = useState(
    initialData?.validUntil ? new Date(initialData.validUntil).toISOString().slice(0, 10) : ""
  );
  const [discountType, setDiscountType] = useState<"R$" | "%">("R$");
  const [discount, setDiscount] = useState(initialData?.discount ?? "0");
  const [notes, setNotes] = useState(initialData?.notes ?? "");
  const [internalNotes, setInternalNotes] = useState(initialData?.internalNotes ?? "");
  const [items, setItems] = useState<LineItem[]>(
    initialData?.items?.length
      ? initialData.items.map((it) => ({
          productId: it.productId,
          description: it.description,
          quantity: it.quantity,
          unit: it.unit,
          unitPrice: it.unitPrice,
          sortOrder: it.sortOrder,
        }))
      : []
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setClients(data);
        else console.error("Falha ao carregar clientes", data);
      })
      .catch((err) => console.error(err));

    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
        else console.error("Falha ao carregar produtos", data);
      })
      .catch((err) => console.error(err));
  }, []);

  const activeSearch = showNewItemSearch ? newItem.description : "";
  const filteredProducts = products.filter(
    (p) =>
      !activeSearch ||
      p.name.toLowerCase().includes(activeSearch.toLowerCase()) ||
      (p.category ?? "").toLowerCase().includes(activeSearch.toLowerCase())
  );

  const subtotal = items.reduce(
    (sum, item) => sum + calcItemTotal(item.quantity, item.unitPrice),
    0
  );
  const discountVal = parseFloat(discount) || 0;
  const discountAmt = discountType === "%" ? subtotal * (discountVal / 100) : discountVal;
  const total = subtotal - discountAmt;

  const addNewItemToBudget = () => {
    if (!newItem.description.trim()) return;
    setItems((prev) => [...prev, { ...newItem, sortOrder: prev.length }]);
    setNewItem({
      productId: null,
      description: "",
      quantity: "1",
      unit: "un",
      unitPrice: "0",
      sortOrder: 0,
    });
    setShowNewItemSearch(false);
    setTimeout(() => {
      document.getElementById("new-item-desc")?.focus();
    }, 10);
  };

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleNewItemKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addNewItemToBudget();
    }
  };

  const updateItem = (idx: number, field: keyof LineItem, value: string | number | null) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === idx ? { ...item, [field]: value } : item
      )
    );
  };

  const selectNewProduct = (product: Product) => {
    setNewItem({
      ...newItem,
      productId: product.id,
      description: product.name,
      unit: product.unit,
      unitPrice: product.basePrice,
    });
    setShowNewItemSearch(false);
    setTimeout(() => {
      document.getElementById("new-item-qty")?.focus();
    }, 10);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!clientId) {
      setError("Selecione um cliente.");
      return;
    }

    if (items.some((it) => !it.description.trim())) {
      setError("Todos os itens devem ter uma descrição.");
      return;
    }

    setSubmitting(true);

    const payload = {
      clientId: parseInt(clientId),
      status,
      validUntil: validUntil || null,
      discount: discountAmt, // Sempre envia o valor em R$ para o backend
      notes,
      internalNotes,
      items: items.map((it, idx) => ({
        productId: it.productId,
        description: it.description,
        quantity: parseFloat(it.quantity) || 0,
        unit: it.unit,
        unitPrice: parseFloat(it.unitPrice) || 0,
        sortOrder: idx,
      })),
    };

    const url = mode === "create" ? "/api/orcamentos" : `/api/orcamentos/${initialData?.id}`;
    const method = mode === "create" ? "POST" : "PUT";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Erro ao salvar orçamento.");
      setSubmitting(false);
      return;
    }

    const saved = await res.json();
    router.push(`/orcamentos/${saved.id}`);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Basic Info */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Informações Básicas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="md:col-span-2 lg:col-span-1">
            <Select
              label="Cliente *"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              required
            >
              <option value="">Selecione um cliente...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </div>
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="rascunho">Rascunho</option>
            <option value="enviado">Enviado</option>
            <option value="aprovado">Aprovado</option>
            <option value="reprovado">Reprovado</option>
            <option value="cancelado">Cancelado</option>
          </Select>
          <Input
            label="Válido até"
            type="date"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
          />
        </div>
      </div>

      {/* Add New Item */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-6 overflow-visible">
        <h2 className="font-semibold text-slate-900 mb-4">Adicionar Item</h2>
        <div className="flex flex-col md:flex-row gap-3 items-end">
          <div className="flex-1 relative w-full">
            <label className="block text-xs font-medium text-slate-700 mb-1">Descrição / Produto</label>
            <input
              id="new-item-desc"
              type="text"
              value={newItem.description}
              onFocus={() => setShowNewItemSearch(true)}
              onBlur={() => setTimeout(() => setShowNewItemSearch(false), 200)}
              onChange={(e) => {
                setNewItem({ ...newItem, description: e.target.value });
                setShowNewItemSearch(true);
              }}
              onKeyDown={handleNewItemKeyDown}
              placeholder="Buscar produto ou digitar..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {showNewItemSearch && (
              <div className="absolute top-full left-0 z-50 mt-1 w-full min-w-72 rounded-xl border border-slate-200 bg-white shadow-xl">
                <div className="max-h-[300px] overflow-y-auto scrollbar-thin py-1">
                  {filteredProducts.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-slate-500">Nenhum produto encontrado.</p>
                  ) : (
                    filteredProducts.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => selectNewProduct(p)}
                        className="w-full text-left px-4 py-2.5 hover:bg-indigo-50 transition-colors"
                      >
                        <p className="text-sm font-medium text-slate-900">{p.name}</p>
                        <p className="text-xs text-slate-500">
                          {p.category && `${p.category} · `}
                          {formatCurrency(parseFloat(p.basePrice))} / {p.unit}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="w-full md:w-24">
            <label className="block text-xs font-medium text-slate-700 mb-1">Qtd</label>
            <input
              id="new-item-qty"
              type="number"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
              onKeyDown={handleNewItemKeyDown}
              min="0"
              step="0.001"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
            />
          </div>
          
          <div className="w-full md:w-20">
            <label className="block text-xs font-medium text-slate-700 mb-1">Un</label>
            <input
              type="text"
              value={newItem.unit}
              onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
              onKeyDown={handleNewItemKeyDown}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div className="w-full md:w-32 relative">
            <label className="block text-xs font-medium text-slate-700 mb-1">Preço Unit.</label>
            <span className="absolute left-2.5 top-[28px] text-slate-400 text-xs">R$</span>
            <input
              type="number"
              value={newItem.unitPrice}
              onChange={(e) => setNewItem({ ...newItem, unitPrice: e.target.value })}
              onKeyDown={handleNewItemKeyDown}
              min="0"
              step="0.01"
              className="w-full rounded-lg border border-slate-200 pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
            />
          </div>
          
          <Button type="button" onClick={addNewItemToBudget} className="w-full md:w-auto mt-4 md:mt-0 gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden md:inline">Adicionar</span>
          </Button>
        </div>
      </div>

      {/* Registered Items */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm mt-6">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Itens Registrados</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="w-8 px-3 py-3" />
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Descrição</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase w-24">Qtd</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase w-20">Un</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase w-32">Preço Unit.</th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-slate-500 uppercase w-32">Total</th>
                <th className="w-12 px-3 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {items.map((item, idx) => (
                <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-3 py-3 text-slate-300 cursor-grab">
                    <GripVertical className="h-4 w-4" />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(idx, "description", e.target.value)}
                      className="w-full rounded-lg border-transparent bg-transparent px-3 py-2 text-sm focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500 hover:border-slate-200 transition-colors"
                      required
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                      min="0"
                      step="0.001"
                      className="w-full rounded-lg border-transparent bg-transparent px-3 py-2 text-sm text-right focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500 hover:border-slate-200 transition-colors"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) => updateItem(idx, "unit", e.target.value)}
                      className="w-full rounded-lg border-transparent bg-transparent px-3 py-2 text-sm focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500 hover:border-slate-200 transition-colors"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">R$</span>
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(idx, "unitPrice", e.target.value)}
                        min="0"
                        step="0.01"
                        className="w-full rounded-lg border-transparent bg-transparent pl-7 pr-3 py-2 text-sm text-right focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500 hover:border-slate-200 transition-colors"
                      />
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right font-medium text-slate-900">
                    {formatCurrency(calcItemTotal(item.quantity, item.unitPrice))}
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="rounded-lg p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {items.length === 0 && (
            <div className="py-12 text-center flex flex-col items-center justify-center">
              <Package className="h-10 w-10 text-slate-200 mb-3" />
              <p className="text-sm text-slate-500">Nenhum item registrado no orçamento.</p>
              <p className="text-xs text-slate-400 mt-1">Use a área acima para adicionar produtos.</p>
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="border-t border-slate-100 bg-slate-50 px-6 py-4">
          <div className="flex flex-col items-end gap-2 max-w-sm ml-auto">
            <div className="flex w-full justify-between text-sm text-slate-600">
              <span>Subtotal:</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex w-full items-center gap-3 text-sm text-slate-600">
              <span className="flex-1 text-right">Desconto global:</span>
              <div className="flex items-center gap-1">
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as "R$" | "%")}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="R$">R$</option>
                  <option value="%">%</option>
                </select>
                <div className="relative w-28">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                    {discountType === "R$" ? "R$" : ""}
                  </span>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    min="0"
                    step="0.01"
                    className={`w-full rounded-lg border border-slate-200 bg-white py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right ${
                      discountType === "R$" ? "pl-7 pr-3" : "px-3"
                    }`}
                  />
                  {discountType === "%" && (
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">%</span>
                  )}
                </div>
              </div>
            </div>
            {discountType === "%" && discountVal > 0 && (
              <div className="flex w-full justify-between text-xs text-slate-500">
                <span>Valor do desconto:</span>
                <span>-{formatCurrency(discountAmt)}</span>
              </div>
            )}
            <div className="flex w-full justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-900">
              <span>Total:</span>
              <span className="text-indigo-700">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-6">
          <Textarea
            label="Observações para o Cliente"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Condições de pagamento, prazo de entrega, etc."
          />
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-6">
          <Textarea
            label="Notas Internas"
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            rows={4}
            placeholder="Informações internas (não visíveis ao cliente)"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pb-6">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" loading={submitting}>
          {mode === "create" ? "Criar Orçamento" : "Salvar Alterações"}
        </Button>
      </div>
    </form>
  );
}
