"use client";
import { AppLayout } from "@/components/layout/AppLayout";
import { TributarioView } from "@/components/catalogo/produtos/TributarioView";

export default function Page() {
  return (
    <AppLayout 
      title="Tributário e Fiscal"
      subtitle="Gestão de Produtos"
      breadcrumb={[
        { label: "Catálogo" },
        { label: "Gestão de Produtos" },
        { label: "Tributário e Fiscal" }
      ]}
    >
      <div className="max-w-6xl mx-auto">
        <TributarioView />
      </div>
    </AppLayout>
  );
}
