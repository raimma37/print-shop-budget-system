"use client";
import { AppLayout } from "@/components/layout/AppLayout";
import { ImportacaoView } from "@/components/catalogo/utilitarios/ImportacaoView";

export default function Page() {
  return (
    <AppLayout 
      title="Importação e Exportação"
      subtitle="Utilitários e Auditoria"
      breadcrumb={[
        { label: "Catálogo" },
        { label: "Utilitários e Auditoria" },
        { label: "Importação e Exportação" }
      ]}
    >
      <div className="max-w-6xl mx-auto">
        <ImportacaoView />
      </div>
    </AppLayout>
  );
}
