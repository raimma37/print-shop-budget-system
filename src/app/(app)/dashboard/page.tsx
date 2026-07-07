import { db } from "@/db";
import { orcamentos, clients, users } from "@/db/schema";
import { eq, desc, count, sum, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  TrendingUp,
  FileText,
  Users,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard – GráfikaORC",
};

async function getDashboardData(userId: number, role: string) {
  // Busca estatísticas em paralelo
  const [statusCounts, recentOrcamentos, clientCount] = await Promise.all([
    db
      .select({
        status: orcamentos.status,
        count: count(orcamentos.id),
        total: sum(orcamentos.total),
      })
      .from(orcamentos)
      .groupBy(orcamentos.status),

    db
      .select({
        id: orcamentos.id,
        numero: orcamentos.numero,
        status: orcamentos.status,
        total: orcamentos.total,
        createdAt: orcamentos.createdAt,
        clientName: clients.name,
      })
      .from(orcamentos)
      .innerJoin(clients, eq(orcamentos.clientId, clients.id))
      .orderBy(desc(orcamentos.createdAt))
      .limit(8),

    db.select({ count: count(clients.id) }).from(clients).where(eq(clients.active, true)),
  ]);

  const statusMap = Object.fromEntries(
    statusCounts.map((s) => [s.status, { count: s.count, total: parseFloat(s.total ?? "0") }])
  );

  return {
    statusMap,
    recentOrcamentos,
    totalClients: clientCount[0]?.count ?? 0,
    totalAll: statusCounts.reduce((acc, s) => acc + parseFloat(s.total ?? "0"), 0),
  };
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const { statusMap, recentOrcamentos, totalClients, totalAll } = await getDashboardData(
    session.userId,
    session.role
  );

  const cards = [
    {
      title: "Total Aprovado",
      value: formatCurrency(statusMap["aprovado"]?.total ?? 0),
      subtitle: `${statusMap["aprovado"]?.count ?? 0} orçamento(s)`,
      icon: <CheckCircle2 className="h-5 w-5" />,
      iconBg: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Aguardando Aprovação",
      value: formatCurrency(statusMap["enviado"]?.total ?? 0),
      subtitle: `${statusMap["enviado"]?.count ?? 0} enviado(s)`,
      icon: <Clock className="h-5 w-5" />,
      iconBg: "bg-sky-50 text-sky-600",
    },
    {
      title: "Em Rascunho",
      value: String(statusMap["rascunho"]?.count ?? 0),
      subtitle: "para finalizar",
      icon: <FileText className="h-5 w-5" />,
      iconBg: "bg-amber-50 text-amber-600",
    },
    {
      title: "Clientes Ativos",
      value: String(totalClients),
      subtitle: "clientes cadastrados",
      icon: <Users className="h-5 w-5" />,
      iconBg: "bg-violet-50 text-violet-600",
    },
  ];

  const statusList = [
    { status: "aprovado", label: "Aprovado", color: "bg-emerald-500" },
    { status: "enviado", label: "Enviado", color: "bg-sky-500" },
    { status: "rascunho", label: "Rascunho", color: "bg-amber-500" },
    { status: "reprovado", label: "Reprovado", color: "bg-red-500" },
    { status: "cancelado", label: "Cancelado", color: "bg-slate-400" },
  ];
  const totalCount = statusList.reduce((a, s) => a + (statusMap[s.status]?.count ?? 0), 0) || 1;

  return (
    <AppLayout
      title={`Olá, ${session.name.split(" ")[0]} 👋`}
      subtitle="Aqui está um resumo dos seus orçamentos"
      actions={
        <Link href="/orcamentos/novo">
          <Button size="sm">
            <Plus className="h-3.5 w-3.5" />
            Novo Orçamento
          </Button>
        </Link>
      }
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {cards.map((card, i) => (
          <StatCard
            key={i}
            title={card.title}
            value={card.value}
            subtitle={card.subtitle}
            icon={card.icon}
            iconBg={card.iconBg}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Orçamentos recentes */}
        <div className="xl:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <h2 className="font-semibold text-slate-900 text-base">Orçamentos Recentes</h2>
              <p className="text-xs text-slate-500">Últimas {recentOrcamentos.length} atividades</p>
            </div>
            <Link
              href="/orcamentos"
              className="flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-700 transition-colors"
            >
              Ver todos <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recentOrcamentos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-10 w-10 text-slate-200 mb-3" />
              <p className="text-slate-500 text-sm font-medium">Nenhum orçamento ainda</p>
              <p className="text-slate-400 text-xs mt-1">Crie o primeiro orçamento para começar</p>
              <Link href="/orcamentos/novo" className="mt-4">
                <Button size="sm">
                  <Plus className="h-3.5 w-3.5" /> Criar Orçamento
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {recentOrcamentos.map((orc) => {
                const initials = orc.clientName
                  .split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase();
                return (
                  <Link
                    key={orc.id}
                    href={`/orcamentos/${orc.id}`}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50 text-amber-700 text-xs font-bold flex-shrink-0 border border-amber-100">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 group-hover:text-amber-600 transition-colors truncate">
                        {orc.numero}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{orc.clientName}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-slate-900 tabular-nums">
                        {formatCurrency(parseFloat(orc.total))}
                      </p>
                      <p className="text-xs text-slate-400">{formatDate(orc.createdAt)}</p>
                    </div>
                    <StatusBadge status={orc.status} />
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Status summary */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900 text-base">Por Status</h2>
            <p className="text-xs text-slate-500">{totalCount} orçamentos no total</p>
          </div>
          <div className="p-5 space-y-4">
            {statusList.map(({ status, label, color }) => {
              const entry = statusMap[status];
              const cnt = entry?.count ?? 0;
              const pct = Math.round((cnt / totalCount) * 100);
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-slate-600">{label}</span>
                    <span className="text-sm font-semibold text-slate-900 tabular-nums">{cnt}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${color} transition-all duration-700`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Volume total */}
          <div className="px-5 pb-5">
            <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 p-4 text-center">
              <p className="text-xs text-slate-500 mb-1 flex items-center justify-center gap-1">
                <TrendingUp className="h-3.5 w-3.5 text-amber-500" />
                Volume total em orçamentos
              </p>
              <p className="text-xl font-bold text-amber-700 tabular-nums">
                {formatCurrency(totalAll)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
