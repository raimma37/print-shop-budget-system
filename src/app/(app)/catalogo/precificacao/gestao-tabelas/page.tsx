"use client";
import { AppLayout } from "@/components/layout/AppLayout";
import { TabelasPrecoView } from "@/components/catalogo/precificacao/TabelasPrecoView";

export default function Page() {
  return (
    <AppLayout 
      title="Tabelas Comerciais"
      subtitle="Precificação e Tabelas"
      breadcrumb={[
        { label: "Catálogo" },
        { label: "Precificação e Tabelas" },
        { label: "Tabelas Comerciais" }
      ]}
    >
      <div className="max-w-6xl mx-auto">
        <TabelasPrecoView />
      </div>
    </AppLayout>
  );
}
