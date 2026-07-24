"use client";
import { AppLayout } from "@/components/layout/AppLayout";
import { QuadrosKanbanView } from "@/components/kanban/QuadrosKanbanView";

export default function Page() {
  return (
    <AppLayout 
      title="Meus Quadros"
      subtitle="Gestão Kanban"
      breadcrumb={[
        { label: "Gestão Kanban" },
        { label: "Meus Quadros" }
      ]}
    >
      <div className="max-w-6xl mx-auto">
        <QuadrosKanbanView />
      </div>
    </AppLayout>
  );
}
