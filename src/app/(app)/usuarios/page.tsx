"use client";
import { useEffect, useState, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { formatDate } from "@/lib/utils";
import { Plus, Users, Pencil, Trash2, Shield, ShieldCheck, Eye } from "lucide-react";

interface UserRow {
  id: number;
  name: string;
  email: string;
  role: string;
  avatarInitials: string | null;
  active: boolean;
  createdAt: string;
}

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "vendedor",
};

export default function UsuariosPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [fetching, setFetching] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<UserRow | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!loading && !user) router.replace("/dashboard");
    if (!loading && user && user.role !== "admin") router.replace("/dashboard");
  }, [user, loading, router]);

  const fetchData = useCallback(async () => {
    setFetching(true);
    const res = await fetch("/api/users");
    if (res.ok) setUsers(await res.json());
    setFetching(false);
  }, []);

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    fetchData();
  }, [user, fetchData]);

  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (u: UserRow) => {
    setEditTarget(u);
    setForm({ name: u.name, email: u.email, password: "", role: u.role });
    setFormError("");
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      setFormError("Nome e email são obrigatórios.");
      return;
    }
    if (!editTarget && !form.password.trim()) {
      setFormError("Senha é obrigatória para novos usuários.");
      return;
    }
    setSaving(true);
    setFormError("");

    const url = editTarget ? `/api/users/${editTarget.id}` : "/api/users";
    const method = editTarget ? "PUT" : "POST";

    const body: Record<string, string> = { name: form.name, email: form.email, role: form.role };
    if (form.password.trim()) body.password = form.password;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setFormError(data.error ?? "Erro ao salvar.");
      setSaving(false);
      return;
    }

    const saved: UserRow = await res.json();
    if (editTarget) {
      setUsers((prev) => prev.map((u) => (u.id === saved.id ? saved : u)));
    } else {
      setUsers((prev) => [saved, ...prev]);
    }
    setModalOpen(false);
    setSaving(false);
  };

  const handleDeactivate = async (id: number) => {
    if (!confirm("Desativar este usuário?")) return;
    setUsers((prev) => prev.filter((u) => u.id !== id));
    await fetch(`/api/users/${id}`, { method: "DELETE" });
  };

  const roleIcon = (role: string) => {
    if (role === "admin") return <ShieldCheck className="h-3.5 w-3.5" />;
    if (role === "vendedor") return <Shield className="h-3.5 w-3.5" />;
    return <Eye className="h-3.5 w-3.5" />;
  };

  const roleBadge = (role: string) => {
    const map: Record<string, "success" | "info" | "default"> = {
      admin: "success",
      vendedor: "info",
      viewer: "default",
    };
    const labels: Record<string, string> = { admin: "Admin", vendedor: "Vendedor", viewer: "Leitor" };
    return (
      <Badge variant={map[role] ?? "default"}>
        <span className="flex items-center gap-1">{roleIcon(role)}{labels[role] ?? role}</span>
      </Badge>
    );
  };

  if (loading || !user || user.role !== "admin") return null;

  return (
    <AppLayout
      title="Usuários"
      actions={
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Novo Usuário
        </Button>
      }
    >
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        {fetching ? (
          <div className="p-6"><TableSkeleton rows={5} cols={4} /></div>
        ) : users.length === 0 ? (
          <EmptyState
            icon={<Users className="h-8 w-8" />}
            title="Nenhum usuário encontrado"
            action={
              <Button size="sm" onClick={openCreate}>
                <Plus className="h-4 w-4" /> Novo Usuário
              </Button>
            }
          />
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Usuário</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">E-mail</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Perfil</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Cadastro</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex-shrink-0">
                            {u.avatarInitials ?? u.name.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-medium text-slate-900">{u.name}</span>
                          {u.id === user.userId && (
                            <span className="text-xs bg-indigo-50 text-indigo-600 rounded-full px-2 py-0.5">Você</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{u.email}</td>
                      <td className="px-6 py-4">{roleBadge(u.role)}</td>
                      <td className="px-6 py-4">
                        <Badge variant={u.active ? "success" : "default"}>
                          {u.active ? "Ativo" : "Inativo"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">{formatDate(u.createdAt)}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEdit(u)}
                            className="rounded-lg p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          {u.id !== user.userId && (
                            <button
                              onClick={() => handleDeactivate(u.id)}
                              className="rounded-lg p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden divide-y divide-slate-100">
              {users.map((u) => (
                <div key={u.id} className="p-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold flex-shrink-0">
                    {u.avatarInitials ?? u.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 text-sm">{u.name}</p>
                    <p className="text-xs text-slate-500 truncate">{u.email}</p>
                  </div>
                  {roleBadge(u.role)}
                  <button onClick={() => openEdit(u)} className="rounded-lg p-2 bg-amber-50 text-amber-600 ml-2">
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-500">
              {users.length} usuário(s)
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? "Editar Usuário" : "Novo Usuário"}
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} loading={saving}>
              {editTarget ? "Salvar Alterações" : "Criar Usuário"}
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
            placeholder="Nome completo"
          />
          <Input
            label="E-mail *"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="email@grafika.com"
          />
          <Input
            label={editTarget ? "Nova Senha (deixe em branco para manter)" : "Senha *"}
            type="password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            placeholder="Mínimo 6 caracteres"
          />
          <Select
            label="Perfil"
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
          >
            <option value="admin">Admin – acesso total</option>
            <option value="vendedor">Vendedor – criar e editar orçamentos</option>
            <option value="viewer">Leitor – somente visualização</option>
          </Select>
        </div>
      </Modal>
    </AppLayout>
  );
}
