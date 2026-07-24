"use client";
import { AppLayout } from "@/components/layout/AppLayout";
import { LogisticaView } from "@/components/catalogo/produtos/LogisticaView";

export default function Page() {
  return (
    <AppLayout 
      title="Logística e Dimensões"
      subtitle="Gestão de Produtos"
      breadcrumb={[
        { label: "Catálogo" },
        { label: "Gestão de Produtos" },
        { label: "Logística e Dimensões" }
      ]}
    >
      <div className="max-w-6xl mx-auto">
        <LogisticaView />
      </div>
    </AppLayout>
  );
}
