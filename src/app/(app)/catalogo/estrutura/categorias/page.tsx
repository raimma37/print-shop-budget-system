"use client";
import { AppLayout } from "@/components/layout/AppLayout";
import { CategoriasTreeView } from "@/components/catalogo/estrutura/CategoriasTreeView";

export default function Page() {
  return (
    <AppLayout 
      title="Árvore de Categorias"
      subtitle="Catálogo de Produtos e Serviços"
      breadcrumb={[
        { label: "Catálogo" },
        { label: "Estrutura de Catálogo" },
        { label: "Árvore de Categorias" }
      ]}
    >
      <div className="max-w-6xl mx-auto">
        <CategoriasTreeView />
      </div>
    </AppLayout>
  );
}
