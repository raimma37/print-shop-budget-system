"use client";
import { AppLayout } from "@/components/layout/AppLayout";
import { PromocoesView } from "@/components/catalogo/precificacao/PromocoesView";

export default function Page() {
  return (
    <AppLayout 
      title="Promoções e Descontos"
      subtitle="Precificação e Tabelas"
      breadcrumb={[
        { label: "Catálogo" },
        { label: "Precificação e Tabelas" },
        { label: "Promoções e Descontos" }
      ]}
    >
      <div className="max-w-6xl mx-auto">
        <PromocoesView />
      </div>
    </AppLayout>
  );
}
