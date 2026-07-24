"use client";
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { formatCurrency } from "@/lib/utils";
import { Users, Search, AlertTriangle, ShieldOff, ShieldCheck, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";

interface ClientAccount {
  id: number;
  name: string;
  email: string;
  phone: string;
  balance: number;
  creditLimit: number;
  blocked: boolean;
}

export default function ContasPage() {
  const [clients, setClients] = useState<ClientAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("todos");

  useEffect(() => {
    fetch("/api/financeiro/contas")
      .then((r) => r.json())
      .then(setClients)
      .finally(() => setLoading(false));
  }, []);

  const filtered = clients.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "todos" ? true :
      filter === "devedores" ? c.balance > 0 :
      filter === "bloqueados" ? c.blocked :
      filter === "adimplentes" ? c.balance <= 0 : true;
    return matchSearch && matchFilter;
  });

  const totalDevido = clients.reduce((acc, c) => acc + Math.max(0, c.balance), 0);
  const totalDevedores = clients.filter((c) => c.balance > 0).length;
  const totalBloqueados = clients.filter((c) => c.blocked).length;

  const riskColor = (c: ClientAccount) => {
    if (c.blocked) return "border-l-red-500 bg-red-50/30";
    if (c.balance > (c.creditLimit > 0 ? c.creditLimit * 0.8 : 500)) return "border-l-orange-400 bg-orange-50/30";
    if (c.balance > 0) return "border-l-amber-400 bg-amber-50/20";
    return "border-l-emerald-400";
  };

  return (
    <AppLayout
      title="Contas de Clientes"
      subtitle="Monitore o perfil financeiro de cada cliente"
    >
      {/* Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm px-5 py-4">
          <p className="text-xs text-slate-500">Total a Receber</p>
          <p className="text-2xl font-bold text-slate-900 tabular-nums">{formatCurrency(totalDevido)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm px-5 py-4">
          <p className="text-xs text-slate-500">Clientes Devedores</p>
          <p className="text-2xl font-bold text-amber-700 tabular-nums">{totalDevedores}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm px-5 py-4">
          <p className="text-xs text-slate-500">Clientes Bloqueados</p>
          <p className="text-2xl font-bold text-red-700 tabular-nums">{totalBloqueados}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex gap-2">
          {[
            { key: "todos", label: "Todos" },
            { key: "devedores", label: "Devedores" },
            { key: "bloqueados", label: "Bloqueados" },
            { key: "adimplentes", label: "Adimplentes" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                filter === key
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="h-10 w-10 text-slate-200 mb-3" />
          <p className="text-slate-500 font-medium">Nenhum cliente encontrado</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => (
            <Link
              key={c.id}
              href={`/financeiro/contas/${c.id}`}
              className={`flex items-center gap-4 rounded-xl border-l-4 border border-slate-100 bg-white shadow-sm px-5 py-3.5 hover:shadow-md transition-all ${riskColor(c)}`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 text-sm font-bold flex-shrink-0">
                {c.name.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-slate-900 truncate">{c.name}</p>
                  {c.blocked && (
                    <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                      <ShieldOff className="h-3 w-3" /> Bloqueado
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 truncate">{c.email || c.phone || "—"}</p>
              </div>

              <div className="text-right flex-shrink-0">
                <p className={`text-base font-bold tabular-nums ${
                  c.balance > 0 ? "text-red-700" : "text-emerald-700"
                }`}>
                  {c.balance > 0 ? formatCurrency(c.balance) : formatCurrency(0)}
                </p>
                <p className="text-xs text-slate-500">
                  {c.balance > 0 ? "em débito" : "adimplente"}
                </p>
              </div>

              {c.creditLimit > 0 && (
                <div className="text-right flex-shrink-0 hidden sm:block">
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <TrendingUp className="h-3 w-3" />
                    {Math.round((Math.max(0, c.balance) / c.creditLimit) * 100)}% do limite
                  </div>
                  <div className="mt-1 h-1.5 w-20 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        c.balance / c.creditLimit > 0.8 ? "bg-red-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.min(100, (c.balance / c.creditLimit) * 100)}%` }}
                    />
                  </div>
                </div>
              )}

              <ArrowRight className="h-4 w-4 text-slate-300 flex-shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
