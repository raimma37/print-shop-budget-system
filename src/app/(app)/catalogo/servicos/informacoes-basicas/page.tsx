"use client";
import { AppLayout } from "@/components/layout/AppLayout";
import { ServicosInfoBasicasView } from "@/components/catalogo/servicos/ServicosInfoBasicasView";

export default function Page() {
  return (
    <AppLayout 
      title="Informações Básicas"
      subtitle="Gestão de Serviços"
      breadcrumb={[
        { label: "Catálogo" },
        { label: "Gestão de Serviços" },
        { label: "Informações Básicas" }
      ]}
    >
      <div className="max-w-6xl mx-auto">
        <ServicosInfoBasicasView />
      </div>
    </AppLayout>
  );
}
