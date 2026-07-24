"use client";
import { AppLayout } from "@/components/layout/AppLayout";
import { TemplatesEtiquetasView } from "@/components/etiquetas/TemplatesEtiquetasView";

export default function Page() {
  return (
    <AppLayout 
      title="Meus Templates"
      subtitle="Impressão e Etiquetas"
      breadcrumb={[
        { label: "Impressão e Etiquetas" },
        { label: "Meus Templates" }
      ]}
    >
      <div className="max-w-6xl mx-auto">
        <TemplatesEtiquetasView />
      </div>
    </AppLayout>
  );
}
