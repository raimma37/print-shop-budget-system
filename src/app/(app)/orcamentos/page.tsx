"use client";
import { useEffect, useState, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { TableSkeleton } from "@/components/ui/Skeleton";
import {
  Plus,
  Search,
  FileText,
  Pencil,
  Trash2,
  Eye,
  ChevronDown,
  Filter,
} from "lucide-react";
import Link from "next/link";

interface OrcamentoRow {
  id: number;
  numero: string;
  status: string;
  total: string;
  createdAt: string;
  validUntil: string | null;
  clientName: string;
  clientEmail: string | null;
  userName: string;
}

const STATUS_OPTIONS = ["", "rascunho", "enviado", "aprovado", "reprovado", "cancelado"];
const STATUS_LABELS: Record<string, string> = {
  "": "Todos",
  rascunho: "Rascunho",
  enviado: "Enviado",
  aprovado: "Aprovado",
  reprovado: "Reprovado",
  cancelado: "Cancelado",
};

export default function OrcamentosPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [rows, setRows] = useState<OrcamentoRow[]>([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/dashboard");
  }, [user, loading, router]);

  const fetchData = useCallback(async () => {
    setFetching(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    const res = await fetch(`/api/orcamentos?${params}`);
    if (res.ok) setRows(await res.json());
    setFetching(false);
  }, [search, status]);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user, fetchData]);

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este orçamento?")) return;
    setDeleting(id);
    // Optimistic update
    setRows((prev) => prev.filter((r) => r.id !== id));
    const res = await fetch(`/api/orcamentos/${id}`, { method: "DELETE" });
    if (!res.ok) {
      fetchData(); // revert
    }
    setDeleting(null);
  };

  if (loading || !user) return null;

  return (
    <AppLayout
      title="Orçamentos"
      actions={
        <Link href="/orcamentos/novo">
          <Button size="sm">
            <Plus className="h-4 w-4" /> Novo Orçamento
          </Button>
        </Link>
      }
    >
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por número ou cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="pl-9 pr-8 py-2 rounded-lg border border-slate-200 bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        {fetching ? (
          <div className="p-6">
            <TableSkeleton rows={6} cols={5} />
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-8 w-8" />}
            title="Nenhum orçamento encontrado"
            description={
              search || status
                ? "Tente ajustar os filtros de busca."
                : "Crie o primeiro orçamento para começar."
            }
            action={
              !search && !status ? (
                <Link href="/orcamentos/novo">
                  <Button size="sm">
                    <Plus className="h-4 w-4" /> Criar Orçamento
                  </Button>
                </Link>
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
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Número</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Validade</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Vendedor</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {rows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-1 rounded">
                          {row.numero}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">{row.clientName}</p>
                        {row.clientEmail && (
                          <p className="text-xs text-slate-400">{row.clientEmail}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {row.validUntil ? formatDate(row.validUntil) : "—"}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-900">
                        {formatCurrency(parseFloat(row.total))}
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-xs">{row.userName}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <Link href={`/orcamentos/${row.id}`}>
                            <button className="rounded-lg p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                              <Eye className="h-4 w-4" />
                            </button>
                          </Link>
                          <Link href={`/orcamentos/${row.id}/editar`}>
                            <button className="rounded-lg p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors">
                              <Pencil className="h-4 w-4" />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDelete(row.id)}
                            disabled={deleting === row.id}
                            className="rounded-lg p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
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
              {rows.map((row) => (
                <div key={row.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-mono text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-1 rounded">
                      {row.numero}
                    </span>
                    <StatusBadge status={row.status} />
                  </div>
                  <p className="font-medium text-slate-900 mb-1">{row.clientName}</p>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-lg font-bold text-slate-900">{formatCurrency(parseFloat(row.total))}</p>
                    <div className="flex gap-2">
                      <Link href={`/orcamentos/${row.id}`}>
                        <button className="rounded-lg p-2 bg-slate-100 text-slate-600">
                          <Eye className="h-4 w-4" />
                        </button>
                      </Link>
                      <Link href={`/orcamentos/${row.id}/editar`}>
                        <button className="rounded-lg p-2 bg-amber-50 text-amber-600">
                          <Pencil className="h-4 w-4" />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(row.id)}
                        className="rounded-lg p-2 bg-red-50 text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-500">
              {rows.length} orçamento(s) encontrado(s)
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
