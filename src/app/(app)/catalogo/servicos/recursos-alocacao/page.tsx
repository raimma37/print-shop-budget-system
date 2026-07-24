"use client";
import dynamic from "next/dynamic";
import { Users } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";

const CatalogoModulePlaceholder = dynamic(
  () => import("@/components/catalogo/CatalogoModulePlaceholder"),
  { ssr: false, loading: () => <div className="h-64 rounded-xl bg-slate-100 animate-pulse border border-slate-200"></div> }
);

export default function Page() {
  return (
    <AppLayout 
      title="Gestão de Serviços"
      subtitle="Catálogo de Produtos e Serviços"
      breadcrumb={[
        { label: "Catálogo" },
        { label: "Gestão de Serviços" },
        { label: "Recursos e Alocação" }
      ]}
    >
      <div className="max-w-5xl mx-auto">
        <CatalogoModulePlaceholder
          title="Recursos e Alocação"
          subtitle="Gestão de Serviços"
          description="Esta área será desenvolvida em etapas futuras. Ela concentrará as ferramentas e processos relacionados a Recursos e Alocação."
          color="violet"
          moduleId="cat-serv-rec"
          moduleIcon={<Users className="h-7 w-7" />}
          apiEndpoint="/api/catalogo/servicos"
          features={[
            { label: "Design System", description: "Componentes padronizados e responsivos." },
            { label: "Integração API", description: "Comunicação REST e Server Actions." },
            { label: "Auditoria", description: "Rastreamento completo das alterações." }
          ]}
        />
      </div>
    </AppLayout>
  );
}
