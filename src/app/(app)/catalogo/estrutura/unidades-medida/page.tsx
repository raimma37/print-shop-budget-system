"use client";
import { AppLayout } from "@/components/layout/AppLayout";
import { UnidadesMedidaView } from "@/components/catalogo/estrutura/UnidadesMedidaView";

export default function Page() {
  return (
    <AppLayout 
      title="Unidades de Medida"
      subtitle="Catálogo de Produtos e Serviços"
      breadcrumb={[
        { label: "Catálogo" },
        { label: "Estrutura de Catálogo" },
        { label: "Unidades de Medida" }
      ]}
    >
      <div className="max-w-6xl mx-auto">
        <UnidadesMedidaView />
      </div>
    </AppLayout>
  );
}
