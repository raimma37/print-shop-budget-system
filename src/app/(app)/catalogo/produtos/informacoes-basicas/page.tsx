"use client";
import { AppLayout } from "@/components/layout/AppLayout";
import { InfoBasicasView } from "@/components/catalogo/produtos/InfoBasicasView";

export default function Page() {
  return (
    <AppLayout 
      title="Informações Básicas"
      subtitle="Gestão de Produtos"
      breadcrumb={[
        { label: "Catálogo" },
        { label: "Gestão de Produtos" },
        { label: "Informações Básicas" }
      ]}
    >
      <div className="max-w-6xl mx-auto">
        <InfoBasicasView />
      </div>
    </AppLayout>
  );
}
