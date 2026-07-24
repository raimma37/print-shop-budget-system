"use client";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuditoriaView } from "@/components/catalogo/utilitarios/AuditoriaView";

export default function Page() {
  return (
    <AppLayout 
      title="Logs e Auditoria"
      subtitle="Utilitários e Auditoria"
      breadcrumb={[
        { label: "Catálogo" },
        { label: "Utilitários e Auditoria" },
        { label: "Logs e Auditoria" }
      ]}
    >
      <div className="max-w-6xl mx-auto">
        <AuditoriaView />
      </div>
    </AppLayout>
  );
}
