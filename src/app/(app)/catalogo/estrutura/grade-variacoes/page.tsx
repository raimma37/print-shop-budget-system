"use client";
import { AppLayout } from "@/components/layout/AppLayout";
import { GradesAtributosView } from "@/components/catalogo/estrutura/GradesAtributosView";

export default function Page() {
  return (
    <AppLayout 
      title="Grade de Variações e Atributos"
      subtitle="Catálogo de Produtos e Serviços"
      breadcrumb={[
        { label: "Catálogo" },
        { label: "Estrutura de Catálogo" },
        { label: "Grade de Variações" }
      ]}
    >
      <div className="max-w-6xl mx-auto">
        <GradesAtributosView />
      </div>
    </AppLayout>
  );
}
