"use client";
import { AppLayout } from "@/components/layout/AppLayout";
import { RegrasEstoqueView } from "@/components/catalogo/produtos/RegrasEstoqueView";

export default function Page() {
  return (
    <AppLayout 
      title="Regras de Estoque"
      subtitle="Gestão de Produtos"
      breadcrumb={[
        { label: "Catálogo" },
        { label: "Gestão de Produtos" },
        { label: "Regras de Estoque" }
      ]}
    >
      <div className="max-w-6xl mx-auto">
        <RegrasEstoqueView />
      </div>
    </AppLayout>
  );
}
