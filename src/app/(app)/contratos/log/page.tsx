"use client";
import { AppLayout } from "@/components/layout/AppLayout";
import { LogContratosView } from "@/components/contratos/LogContratosView";

export default function Page() {
  return (
    <AppLayout 
      title="Histórico e Log"
      subtitle="Contratos e Documentos Gerados"
      breadcrumb={[
        { label: "Contratos e Docs" },
        { label: "Histórico e Log" }
      ]}
    >
      <div className="max-w-6xl mx-auto">
        <LogContratosView />
      </div>
    </AppLayout>
  );
}
