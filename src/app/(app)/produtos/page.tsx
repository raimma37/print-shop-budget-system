"use client";
import { useEffect, useState, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/lib/utils";
import { Plus, Search, Package, Pencil, Trash2, Tag } from "lucide-react";

interface Product {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  unit: string;
  basePrice: string;
  active: boolean;
  createdAt: string;
}

const emptyForm = {
  name: "",
  description: "",
  category: "",
  unit: "un",
  basePrice: "0",
};

const CATEGORIES = [
  "Banners & Lonas",
  "Adesivos & Vinil",
  "Placas & Painéis",
  "Letreiros & Fachadas",
  "Totens & Displays",
  "Papelaria",
  "Serviços",
  "Outros",
];

const UNITS = ["un", "m²", "m", "cm", "km", "mil", "h", "dia", "kg", "L"];

export default function ProdutosPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  const fetchData = useCallback(async () => {
    setFetching(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (categoryFilter) params.set("category", categoryFilter);
    const res = await fetch(`/api/products?${params}`);
    if (res.ok) setProducts(await res.json());
    setFetching(false);
  }, [search, categoryFilter]);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user, fetchData]);

  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditTarget(product);
    setForm({
      name: product.name,
      description: product.description ?? "",
      category: product.category ?? "",
      unit: product.unit,
      basePrice: product.basePrice,
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setFormError("Nome é obrigatório."); return; }
    setSaving(true);
    setFormError("");

    const url = editTarget ? `/api/products/${editTarget.id}` : "/api/products";
    const method = editTarget ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, basePrice: parseFloat(form.basePrice) || 0 }),
    });

    if (!res.ok) {
      const data = await res.json();
      setFormError(data.error ?? "Erro ao salvar.");
      setSaving(false);
      return;
    }

    const saved: Product = await res.json();
    if (editTarget) {
      setProducts((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
    } else {
      setProducts((prev) => [saved, ...prev]);
    }
    setModalOpen(false);
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Desativar este produto?")) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));
    await fetch(`/api/products/${id}`, { method: "DELETE" });
  };

  // Group by category
  const grouped = products.reduce<Record<string, Product[]>>((acc, p) => {
    const cat = p.category ?? "Outros";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {});

  if (loading || !user) return null;

  return (
    <AppLayout
      title="Produtos & Serviços"
      actions={
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Novo Produto
        </Button>
      }
    >
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Todas as categorias</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {fetching ? (
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-6">
          <TableSkeleton rows={8} cols={4} />
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
          <EmptyState
            icon={<Package className="h-8 w-8" />}
            title="Nenhum produto encontrado"
            description={search || categoryFilter ? "Tente ajustar os filtros." : "Cadastre os produtos e serviços da gráfica."}
            action={
              !search && !categoryFilter ? (
                <Button size="sm" onClick={openCreate}>
                  <Plus className="h-4 w-4" /> Novo Produto
                </Button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
              <div className="px-6 py-3 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                <Tag className="h-4 w-4 text-indigo-500" />
                <h3 className="font-semibold text-slate-900 text-sm">{category}</h3>
                <span className="ml-auto text-xs text-slate-400">{items.length} item(s)</span>
              </div>

              {/* Desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-slate-50">
                    {items.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-3 w-8">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
                            <Package className="h-4 w-4 text-indigo-500" />
                          </div>
                        </td>
                        <td className="px-4 py-3 flex-1">
                          <p className="font-medium text-slate-900">{p.name}</p>
                          {p.description && (
                            <p className="text-xs text-slate-500 mt-0.5 truncate max-w-md">{p.description}</p>
                          )}
                        </td>
                        <td className="px-6 py-3 text-slate-500 text-xs">
                          <span className="rounded-full bg-slate-100 px-2 py-1">{p.unit}</span>
                        </td>
                        <td className="px-6 py-3 font-semibold text-slate-900">
                          {formatCurrency(parseFloat(p.basePrice))}
                          <span className="text-xs font-normal text-slate-500">/{p.unit}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEdit(p)}
                              className="rounded-lg p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="rounded-lg p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="md:hidden divide-y divide-slate-100">
                {items.map((p) => (
                  <div key={p.id} className="px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{p.name}</p>
                      <p className="text-xs text-slate-500">{formatCurrency(parseFloat(p.basePrice))}/{p.unit}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(p)} className="rounded-lg p-2 bg-amber-50 text-amber-600">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="rounded-lg p-2 bg-red-50 text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? "Editar Produto" : "Novo Produto"}
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} loading={saving}>
              {editTarget ? "Salvar Alterações" : "Cadastrar Produto"}
            </Button>
          </div>
        }
      >
        {formError && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-sm text-red-700">{formError}</p>
          </div>
        )}
        <div className="space-y-4">
          <Input
            label="Nome *"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Ex: Banner Lona 440g"
          />
          <Textarea
            label="Descrição"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={3}
            placeholder="Detalhes do produto ou serviço"
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Categoria</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Selecione...</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Unidade</label>
              <select
                value={form.unit}
                onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Preço Base (R$)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">R$</span>
              <input
                type="number"
                value={form.basePrice}
                onChange={(e) => setForm((f) => ({ ...f, basePrice: e.target.value }))}
                min="0"
                step="0.01"
                className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
              />
            </div>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
