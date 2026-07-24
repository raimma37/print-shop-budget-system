"use client";
import { AppLayout } from "@/components/layout/AppLayout";
import { AnalyticsKanbanView } from "@/components/kanban/AnalyticsKanbanView";

export default function Page() {
  return (
    <AppLayout 
      title="Métricas Ágeis"
      subtitle="Gestão Kanban"
      breadcrumb={[
        { label: "Gestão Kanban" },
        { label: "Métricas Ágeis" }
      ]}
    >
      <div className="max-w-6xl mx-auto">
        <AnalyticsKanbanView />
      </div>
    </AppLayout>
  );
}
