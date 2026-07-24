"use client";
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { formatCurrency } from "@/lib/utils";
import {
  TrendingUp, TrendingDown, AlertTriangle, DollarSign,
  Users, Clock, ArrowUpRight, ArrowDownRight, BarChart3, RefreshCw,
} from "lucide-react";
import Link from "next/link";

interface OverviewData {
  totalAReceber: number;
  totalAPagar: number;
  totalRecebidoMes: number;
  totalDevedores: number;
  inadimplencia: { ate30: number; ate60: number; ate90: number; acima90: number; total: number };
  fluxoCaixa: { date: string; entradas: number; saidas: number }[];
}

function StatCard({
  title, value, subtitle, icon, color, href,
}: { title: string; value: string; subtitle?: string; icon: React.ReactNode; color: string; href?: string }) {
  const card = (
    <div className={`rounded-2xl border bg-white shadow-sm p-5 hover:shadow-md transition-shadow ${href ? "cursor-pointer" : ""}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
          {icon}
        </div>
        {href && <ArrowUpRight className="h-4 w-4 text-slate-300" />}
      </div>
      <p className="text-2xl font-bold text-slate-900 tabular-nums">{value}</p>
      <p className="text-sm font-medium text-slate-600 mt-0.5">{title}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
  );
  return href ? <Link href={href}>{card}</Link> : card;
}

export default function VisaoGeralPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const res = await fetch("/api/financeiro/overview");
    if (res.ok) setData(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const maxCashflow = data
    ? Math.max(...data.fluxoCaixa.map((d) => Math.max(d.entradas, d.saidas)), 1)
    : 1;

  const inadTotal = data?.inadimplencia.total ?? 0;
  const inadBuckets = data?.inadimplencia ?? { ate30: 0, ate60: 0, ate90: 0, acima90: 0, total: 0 };

  return (
    <AppLayout
      title="Visão Geral Financeira"
      subtitle="Monitoramento em tempo real da saúde financeira"
      actions={
        <button
          onClick={fetchData}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </button>
      }
    >
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="A Receber"
              value={formatCurrency(data?.totalAReceber ?? 0)}
              subtitle="cobranças em aberto"
              icon={<ArrowUpRight className="h-5 w-5 text-emerald-600" />}
              color="bg-emerald-50"
              href="/financeiro/contas"
            />
            <StatCard
              title="A Pagar"
              value={formatCurrency(data?.totalAPagar ?? 0)}
              subtitle="despesas pendentes"
              icon={<ArrowDownRight className="h-5 w-5 text-red-600" />}
              color="bg-red-50"
              href="/financeiro/despesas"
            />
            <StatCard
              title="Recebido no Mês"
              value={formatCurrency(data?.totalRecebidoMes ?? 0)}
              subtitle="entradas confirmadas"
              icon={<DollarSign className="h-5 w-5 text-indigo-600" />}
              color="bg-indigo-50"
            />
            <StatCard
              title="Clientes Devedores"
              value={String(data?.totalDevedores ?? 0)}
              subtitle="com saldo negativo"
              icon={<Users className="h-5 w-5 text-amber-600" />}
              color="bg-amber-50"
              href="/financeiro/relatorios"
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">
            {/* Termômetro de Inadimplência */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900 text-sm">Termômetro de Inadimplência</h2>
                  <p className="text-xs text-slate-500">Total vencido: {formatCurrency(inadTotal)}</p>
                </div>
              </div>

              {inadTotal === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 mb-2">
                    <TrendingUp className="h-6 w-6 text-emerald-600" />
                  </div>
                  <p className="text-sm font-medium text-emerald-700">Nenhuma inadimplência!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {[
                    { label: "Até 30 dias", value: inadBuckets.ate30, color: "bg-amber-400", textColor: "text-amber-700" },
                    { label: "31–60 dias", value: inadBuckets.ate60, color: "bg-orange-400", textColor: "text-orange-700" },
                    { label: "61–90 dias", value: inadBuckets.ate90, color: "bg-red-400", textColor: "text-red-700" },
                    { label: "Acima de 90", value: inadBuckets.acima90, color: "bg-red-700", textColor: "text-red-900" },
                  ].map(({ label, value, color, textColor }) => {
                    const pct = inadTotal > 0 ? (value / inadTotal) * 100 : 0;
                    return (
                      <div key={label}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-slate-600">{label}</span>
                          <span className={`text-xs font-semibold ${textColor}`}>{formatCurrency(value)}</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div className={`h-2 rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-slate-100">
                <Link
                  href="/financeiro/relatorios"
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Ver relatório completo →
                </Link>
              </div>
            </div>

            {/* Fluxo de Caixa */}
            <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
                  <BarChart3 className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900 text-sm">Fluxo de Caixa — Últimos 30 dias</h2>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                    <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-emerald-400"></span> Entradas</span>
                    <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-red-400"></span> Saídas</span>
                  </div>
                </div>
              </div>

              {data?.fluxoCaixa && data.fluxoCaixa.every((d) => d.entradas === 0 && d.saidas === 0) ? (
                <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400">
                  <Clock className="h-8 w-8 mb-2" />
                  <p className="text-sm">Nenhuma movimentação nos últimos 30 dias</p>
                </div>
              ) : (
                <div className="flex items-end gap-1 h-36 overflow-hidden">
                  {(data?.fluxoCaixa ?? []).slice(-20).map((d) => (
                    <div key={d.date} className="flex-1 flex items-end gap-px min-w-0" title={d.date}>
                      <div
                        className="flex-1 rounded-t bg-emerald-400/80 min-h-[2px] transition-all"
                        style={{ height: `${(d.entradas / maxCashflow) * 100}%` }}
                      />
                      <div
                        className="flex-1 rounded-t bg-red-400/80 min-h-[2px] transition-all"
                        style={{ height: `${(d.saidas / maxCashflow) * 100}%` }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Atalhos rápidos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Lançar Cobrança", href: "/financeiro/faturamento", icon: <TrendingUp className="h-4 w-4" />, color: "text-indigo-600 bg-indigo-50 hover:bg-indigo-100" },
              { label: "Registrar Pagamento", href: "/financeiro/recebimentos", icon: <DollarSign className="h-4 w-4" />, color: "text-emerald-600 bg-emerald-50 hover:bg-emerald-100" },
              { label: "Contas de Clientes", href: "/financeiro/contas", icon: <Users className="h-4 w-4" />, color: "text-amber-600 bg-amber-50 hover:bg-amber-100" },
              { label: "Relatórios", href: "/financeiro/relatorios", icon: <BarChart3 className="h-4 w-4" />, color: "text-violet-600 bg-violet-50 hover:bg-violet-100" },
            ].map(({ label, href, icon, color }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-xl border border-slate-100 px-4 py-3 font-medium text-sm transition-colors ${color}`}
              >
                {icon} {label}
              </Link>
            ))}
          </div>
        </>
      )}
    </AppLayout>
  );
}
