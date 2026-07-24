"use client";
import { AppLayout } from "@/components/layout/AppLayout";
import { QuadroAtivoView } from "@/components/kanban/QuadroAtivoView";
import { use } from "react";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  
  return (
    <AppLayout 
      title="Quadro Ativo"
      subtitle="Gestão Kanban"
      breadcrumb={[
        { label: "Gestão Kanban" },
        { label: "Quadros", href: "/kanban/quadros" },
        { label: resolvedParams.id }
      ]}
    >
      <div className="mx-auto h-full">
        <QuadroAtivoView boardId={resolvedParams.id} />
      </div>
    </AppLayout>
  );
}
