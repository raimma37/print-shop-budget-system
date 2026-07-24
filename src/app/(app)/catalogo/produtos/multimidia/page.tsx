"use client";
import { AppLayout } from "@/components/layout/AppLayout";
import { MultimidiaView } from "@/components/catalogo/produtos/MultimidiaView";

export default function Page() {
  return (
    <AppLayout 
      title="Multimídia"
      subtitle="Gestão de Produtos"
      breadcrumb={[
        { label: "Catálogo" },
        { label: "Gestão de Produtos" },
        { label: "Multimídia" }
      ]}
    >
      <div className="max-w-6xl mx-auto">
        <MultimidiaView />
      </div>
    </AppLayout>
  );
}
