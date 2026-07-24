"use client";
import { AppLayout } from "@/components/layout/AppLayout";
import { AutomacoesKanbanView } from "@/components/kanban/AutomacoesKanbanView";

export default function Page() {
  return (
    <AppLayout 
      title="Regras e Automações"
      subtitle="Gestão Kanban"
      breadcrumb={[
        { label: "Gestão Kanban" },
        { label: "Regras e Automações" }
      ]}
    >
      <div className="max-w-6xl mx-auto">
        <AutomacoesKanbanView />
      </div>
    </AppLayout>
  );
}
