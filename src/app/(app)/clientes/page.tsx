"use client";
import { useEffect, useState, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { formatDate } from "@/lib/utils";
import { Plus, Search, Users, Pencil, Trash2, Phone, Mail, MapPin } from "lucide-react";

interface Client {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  cnpjCpf: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  notes: string | null;
  active: boolean;
  createdAt: string;
}

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  cnpjCpf: "",
  address: "",
  city: "",
  state: "",
  notes: "",
};

export default function ClientesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Client | null>(null);
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
    const res = await fetch(`/api/clients?${params}`);
    if (res.ok) setClients(await res.json());
    setFetching(false);
  }, [search]);

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

  const openEdit = (client: Client) => {
    setEditTarget(client);
    setForm({
      name: client.name,
      email: client.email ?? "",
      phone: client.phone ?? "",
      cnpjCpf: client.cnpjCpf ?? "",
      address: client.address ?? "",
      city: client.city ?? "",
      state: client.state ?? "",
      notes: client.notes ?? "",
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setFormError("Nome é obrigatório."); return; }
    setSaving(true);
    setFormError("");

    const url = editTarget ? `/api/clients/${editTarget.id}` : "/api/clients";
    const method = editTarget ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json();
      setFormError(data.error ?? "Erro ao salvar.");
      setSaving(false);
      return;
    }

    const saved: Client = await res.json();
    if (editTarget) {
      setClients((prev) => prev.map((c) => (c.id === saved.id ? saved : c)));
    } else {
      setClients((prev) => [saved, ...prev]);
    }
    setModalOpen(false);
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Desativar este cliente?")) return;
    // Optimistic
    setClients((prev) => prev.filter((c) => c.id !== id));
    await fetch(`/api/clients/${id}`, { method: "DELETE" });
  };

  const ESTADOS_BR = [
    "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
    "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
  ];

  if (loading || !user) return null;

  return (
    <AppLayout
      title="Clientes"
      actions={
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Novo Cliente
        </Button>
      }
    >
      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por nome, email ou CNPJ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Content */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        {fetching ? (
          <div className="p-6"><TableSkeleton rows={6} cols={4} /></div>
        ) : clients.length === 0 ? (
          <EmptyState
            icon={<Users className="h-8 w-8" />}
            title="Nenhum cliente encontrado"
            description={search ? "Tente ajustar a busca." : "Cadastre o primeiro cliente."}
            action={
              !search ? (
                <Button size="sm" onClick={openCreate}>
                  <Plus className="h-4 w-4" /> Novo Cliente
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Nome</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Contato</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">CNPJ/CPF</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Cidade</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Cadastro</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {clients.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold flex-shrink-0">
                            {c.name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()}
                          </div>
                          <span className="font-medium text-slate-900">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          {c.email && (
                            <p className="flex items-center gap-1.5 text-slate-600">
                              <Mail className="h-3.5 w-3.5 text-slate-400" />
                              <a href={`mailto:${c.email}`} className="hover:text-indigo-600">{c.email}</a>
                            </p>
                          )}
                          {c.phone && (
                            <p className="flex items-center gap-1.5 text-slate-600">
                              <Phone className="h-3.5 w-3.5 text-slate-400" />
                              {c.phone}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-mono text-xs">{c.cnpjCpf ?? "—"}</td>
                      <td className="px-6 py-4">
                        {(c.city || c.state) ? (
                          <span className="flex items-center gap-1 text-slate-600">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                            {c.city}{c.state ? `, ${c.state}` : ""}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">{formatDate(c.createdAt)}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEdit(c)}
                            className="rounded-lg p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id)}
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

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {clients.map((c) => (
                <div key={c.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold">
                        {c.name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{c.name}</p>
                        {c.email && <p className="text-xs text-slate-500">{c.email}</p>}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(c)} className="rounded-lg p-2 bg-amber-50 text-amber-600">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="rounded-lg p-2 bg-red-50 text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-500">
              {clients.length} cliente(s)
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? "Editar Cliente" : "Novo Cliente"}
        size="xl"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} loading={saving}>
              {editTarget ? "Salvar Alterações" : "Cadastrar Cliente"}
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
            placeholder="Nome do cliente ou empresa"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="E-mail"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="email@empresa.com"
            />
            <Input
              label="Telefone"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="(11) 99999-9999"
            />
          </div>
          <Input
            label="CNPJ / CPF"
            value={form.cnpjCpf}
            onChange={(e) => setForm((f) => ({ ...f, cnpjCpf: e.target.value }))}
            placeholder="00.000.000/0001-00"
          />
          <Input
            label="Endereço"
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            placeholder="Rua, número, complemento"
          />
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <Input
                label="Cidade"
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                placeholder="São Paulo"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Estado</label>
              <select
                value={form.state}
                onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">UF</option>
                {ESTADOS_BR.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>
          </div>
          <Textarea
            label="Observações"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            rows={3}
            placeholder="Informações adicionais sobre o cliente"
          />
        </div>
      </Modal>
    </AppLayout>
  );
}
