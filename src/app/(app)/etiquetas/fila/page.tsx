"use client";
import { AppLayout } from "@/components/layout/AppLayout";
import { FilaImpressaoView } from "@/components/etiquetas/FilaImpressaoView";

export default function Page() {
  return (
    <AppLayout 
      title="Fila de Impressão"
      subtitle="Impressão e Etiquetas"
      breadcrumb={[
        { label: "Impressão e Etiquetas" },
        { label: "Fila de Impressão" }
      ]}
    >
      <div className="max-w-6xl mx-auto">
        <FilaImpressaoView />
      </div>
    </AppLayout>
  );
}
