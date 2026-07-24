"use client";
import { AppLayout } from "@/components/layout/AppLayout";
import { RegrasMarkupView } from "@/components/catalogo/precificacao/RegrasMarkupView";

export default function Page() {
  return (
    <AppLayout 
      title="Regras de Markup"
      subtitle="Precificação e Tabelas"
      breadcrumb={[
        { label: "Catálogo" },
        { label: "Precificação e Tabelas" },
        { label: "Regras de Markup" }
      ]}
    >
      <div className="max-w-6xl mx-auto">
        <RegrasMarkupView />
      </div>
    </AppLayout>
  );
}
