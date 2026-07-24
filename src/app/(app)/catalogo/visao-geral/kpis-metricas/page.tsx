"use client";
import { AppLayout } from "@/components/layout/AppLayout";
import { KpiMetricsView } from "@/components/catalogo/visao-geral/KpiMetricsView";

export default function Page() {
  return (
    <AppLayout 
      title="KPIs e Métricas"
      subtitle="Catálogo de Produtos e Serviços"
      breadcrumb={[
        { label: "Catálogo" },
        { label: "Visão Geral e Dashboard" },
        { label: "KPIs e Métricas" }
      ]}
    >
      <div className="max-w-6xl mx-auto">
        <KpiMetricsView />
      </div>
    </AppLayout>
  );
}
