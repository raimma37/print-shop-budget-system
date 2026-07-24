"use client";
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { BarChart3, Users, FileText, History, Download, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";

type Tab = "aging" | "dre" | "auditoria";

interface AgingClient {
  clientId: number;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  totalOverdue: number;
  maxDaysOverdue: number;
  riskLevel: "alto" | "medio" | "baixo";
  buckets: { ate30: number; ate60: number; ate90: number; acima90: number };
}

interface DREData {
  periodo: { from: string; to: string };
  totalVendido: number;
  totalRecebido: number;
  totalDescontos: number;
  totalJuros: number;
  totalDespesas: number;
  lucroBrutoProjetado: number;
  lucroBrutoReal: number;
  margemReal: number;
}

interface AuditEntry {
  id: number;
  action: string;
  entityType: string;
  entityId: number;
  details: string;
  createdAt: string;
  userName: string | null;
}

const ACTION_LABELS: Record<string, string> = {
  charge_created: "Cobrança lançada",
  payment_created: "Pagamento registrado",
  discount_created: "Desconto aplicado",
  interest_created: "Juros lançados",
  adjustment_created: "Ajuste manual",
  transaction_deleted: "Transação excluída",
};

const RISK_COLORS: Record<string, string> = {
  alto: "bg-red-100 text-red-800 border-l-red-500",
  medio: "bg-orange-100 text-orange-800 border-l-orange-500",
  baixo: "bg-amber-100 text-amber-800 border-l-amber-500",
};

export default function RelatoriosPage() {
  const [tab, setTab] = useState<Tab>("aging");
  const [aging, setAging] = useState<AgingClient[]>([]);
  const [dre, setDRE] = useState<DREData | null>(null);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // DRE period
  const now = new Date();
  const [dreFrom, setDreFrom] = useState(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10));
  const [dreTo, setDreTo] = useState(now.toISOString().slice(0, 10));

  useEffect(() => {
    if (tab === "aging") {
      setLoading(true);
      fetch("/api/financeiro/relatorios/aging")
        .then((r) => r.json())
        .then(setAging)
        .finally(() => setLoading(false));
    }
    if (tab === "dre") {
      loadDRE();
    }
    if (tab === "auditoria") {
      setLoading(true);
      fetch("/api/financeiro/auditoria")
        .then((r) => r.json())
        .then(setAudit)
        .finally(() => setLoading(false));
    }
  }, [tab]);

  const loadDRE = () => {
    setLoading(true);
    fetch(`/api/financeiro/relatorios/dre?from=${dreFrom}&to=${dreTo}`)
      .then((r) => r.json())
      .then(setDRE)
      .finally(() => setLoading(false));
  };

  const exportAgingCSV = () => {
    const rows = [
      ["Cliente", "Email", "Telefone", "Até 30d", "31-60d", "61-90d", "+90d", "Total", "Risco"],
      ...aging.map((c) => [
        c.clientName, c.clientEmail, c.clientPhone,
        c.buckets.ate30.toFixed(2), c.buckets.ate60.toFixed(2),
        c.buckets.ate90.toFixed(2), c.buckets.acima90.toFixed(2),
        c.totalOverdue.toFixed(2), c.riskLevel,
      ]),
    ];
    const csv = rows.map((r) => r.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aging-list-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const tabs = [
    { key: "aging" as Tab, label: "Aging List", icon: <AlertTriangle className="h-4 w-4" /> },
    { key: "dre" as Tab, label: "DRE", icon: <BarChart3 className="h-4 w-4" /> },
    { key: "auditoria" as Tab, label: "Auditoria", icon: <History className="h-4 w-4" /> },
  ];

  return (
    <AppLayout title="Relatórios Financeiros" subtitle="Análises detalhadas e trilha de auditoria">
      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-xl w-fit">
        {tabs.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === key
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />)}
        </div>
      ) : (
        <>
          {/* ─── Aging List ─────────────────────────────────────────────── */}
          {tab === "aging" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-semibold text-slate-900">Relatório de Inadimplência</h2>
                  <p className="text-sm text-slate-500">{aging.length} clientes com valores em atraso</p>
                </div>
                <Button size="sm" variant="secondary" onClick={exportAgingCSV}>
                  <Download className="h-4 w-4" /> Exportar CSV
                </Button>
              </div>

              {aging.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center">
                  <TrendingUp className="h-10 w-10 text-emerald-300 mb-3" />
                  <p className="font-medium text-slate-500">Nenhuma inadimplência registrada!</p>
                  <p className="text-sm text-slate-400 mt-1">Todos os clientes estão adimplentes.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {aging.map((c) => (
                    <div key={c.clientId} className={`rounded-2xl border-l-4 border border-slate-100 bg-white shadow-sm px-5 py-4 ${RISK_COLORS[c.riskLevel]}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-slate-900">{c.clientName}</p>
                          <p className="text-xs text-slate-500">{c.clientEmail || c.clientPhone || "—"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-red-700 tabular-nums">{formatCurrency(c.totalOverdue)}</p>
                          <p className="text-xs text-slate-500">{c.maxDaysOverdue} dias de atraso máximo</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        {[
                          { label: "Até 30d", value: c.buckets.ate30, color: "text-amber-700" },
                          { label: "31-60d", value: c.buckets.ate60, color: "text-orange-700" },
                          { label: "61-90d", value: c.buckets.ate90, color: "text-red-700" },
                          { label: "+90d", value: c.buckets.acima90, color: "text-red-900 font-bold" },
                        ].map(({ label, value, color }) => (
                          <div key={label} className="text-center">
                            <p className="text-xs text-slate-400">{label}</p>
                            <p className={`text-sm tabular-nums ${color}`}>{formatCurrency(value)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─── DRE ─────────────────────────────────────────────────────── */}
          {tab === "dre" && (
            <div>
              <div className="flex items-center gap-3 mb-5 flex-wrap">
                <div className="flex items-center gap-2 text-sm">
                  <label className="text-slate-600 font-medium">De:</label>
                  <input type="date" value={dreFrom} onChange={(e) => setDreFrom(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <label className="text-slate-600 font-medium">Até:</label>
                  <input type="date" value={dreTo} onChange={(e) => setDreTo(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <Button size="sm" onClick={loadDRE}>Calcular</Button>
              </div>

              {dre && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="px-5 py-4 bg-slate-50 border-b border-slate-100">
                      <h2 className="font-semibold text-slate-900">DRE Simplificada</h2>
                      <p className="text-xs text-slate-500">Período: {dre.periodo.from} a {dre.periodo.to}</p>
                    </div>
                    <div className="divide-y divide-slate-50">
                      {[
                        { label: "Faturamento Bruto (cobranças)", value: dre.totalVendido, color: "text-slate-900", bold: false },
                        { label: "(−) Descontos Concedidos", value: dre.totalDescontos, color: "text-red-600", bold: false },
                        { label: "(+) Juros e Multas", value: dre.totalJuros, color: "text-amber-700", bold: false },
                        { label: "= Receita Líquida Projetada", value: dre.lucroBrutoProjetado, color: "text-indigo-700", bold: true },
                        { label: "Receita Efetivamente Recebida", value: dre.totalRecebido, color: "text-emerald-700", bold: false },
                        { label: "(−) Despesas Pagas", value: dre.totalDespesas, color: "text-red-700", bold: false },
                        { label: "= Lucro Bruto Real", value: dre.lucroBrutoReal, color: dre.lucroBrutoReal >= 0 ? "text-emerald-700" : "text-red-700", bold: true },
                      ].map(({ label, value, color, bold }) => (
                        <div key={label} className={`flex items-center justify-between px-5 py-3 ${bold ? "bg-slate-50" : ""}`}>
                          <span className={`text-sm ${bold ? "font-semibold text-slate-900" : "text-slate-600"}`}>{label}</span>
                          <span className={`text-sm tabular-nums ${color} ${bold ? "font-bold text-base" : "font-medium"}`}>
                            {formatCurrency(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="px-5 py-4 bg-gradient-to-br from-indigo-50 to-violet-50 border-t border-indigo-100 flex items-center justify-between">
                      <span className="font-semibold text-indigo-900">Margem Líquida Real</span>
                      <span className={`text-2xl font-bold ${dre.margemReal >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                        {dre.margemReal.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── Auditoria ───────────────────────────────────────────────── */}
          {tab === "auditoria" && (
            <div>
              <div className="mb-4">
                <h2 className="font-semibold text-slate-900">Log de Transações</h2>
                <p className="text-sm text-slate-500">{audit.length} registros mais recentes</p>
              </div>

              {audit.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center">
                  <History className="h-10 w-10 text-slate-200 mb-3" />
                  <p className="text-slate-500 font-medium">Nenhum registro de auditoria</p>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Data/Hora</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Ação</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Entidade</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Usuário</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Detalhes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {audit.map((entry) => {
                          let details: Record<string, unknown> = {};
                          try { details = JSON.parse(entry.details ?? "{}"); } catch {}
                          return (
                            <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                                {new Date(entry.createdAt).toLocaleString("pt-BR")}
                              </td>
                              <td className="px-4 py-3">
                                <span className="inline-block rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                                  {ACTION_LABELS[entry.action] ?? entry.action}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-xs text-slate-500">
                                {entry.entityType} #{entry.entityId}
                              </td>
                              <td className="px-4 py-3 text-xs text-slate-600">
                                {entry.userName ?? "Sistema"}
                              </td>
                              <td className="px-4 py-3 text-xs text-slate-400 max-w-xs truncate">
                                {details.description as string ?? details.amount ? `Valor: ${formatCurrency(Math.abs(parseFloat(String(details.amount ?? 0))))}` : "—"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </AppLayout>
  );
}
