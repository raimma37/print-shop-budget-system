"use client";
import { AppLayout } from "@/components/layout/AppLayout";
import { SystemAlertsView } from "@/components/catalogo/visao-geral/SystemAlertsView";

export default function Page() {
  return (
    <AppLayout 
      title="Alertas do Sistema"
      subtitle="Catálogo de Produtos e Serviços"
      breadcrumb={[
        { label: "Catálogo" },
        { label: "Visão Geral e Dashboard" },
        { label: "Alertas do Sistema" }
      ]}
    >
      <div className="max-w-5xl mx-auto">
        <SystemAlertsView />
      </div>
    </AppLayout>
  );
}
