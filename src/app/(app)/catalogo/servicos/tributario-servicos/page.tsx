"use client";
import { AppLayout } from "@/components/layout/AppLayout";
import { ServicosTributarioView } from "@/components/catalogo/servicos/ServicosTributarioView";

export default function Page() {
  return (
    <AppLayout 
      title="Tributário e Fiscal"
      subtitle="Gestão de Serviços"
      breadcrumb={[
        { label: "Catálogo" },
        { label: "Gestão de Serviços" },
        { label: "Tributário e Fiscal" }
      ]}
    >
      <div className="max-w-6xl mx-auto">
        <ServicosTributarioView />
      </div>
    </AppLayout>
  );
}
