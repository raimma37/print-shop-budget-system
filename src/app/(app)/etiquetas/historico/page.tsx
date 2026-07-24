"use client";
import { AppLayout } from "@/components/layout/AppLayout";
import { HistoricoEtiquetasView } from "@/components/etiquetas/HistoricoEtiquetasView";

export default function Page() {
  return (
    <AppLayout 
      title="Histórico de Impressão"
      subtitle="Impressão e Etiquetas"
      breadcrumb={[
        { label: "Impressão e Etiquetas" },
        { label: "Histórico de Impressão" }
      ]}
    >
      <div className="max-w-6xl mx-auto">
        <HistoricoEtiquetasView />
      </div>
    </AppLayout>
  );
}
