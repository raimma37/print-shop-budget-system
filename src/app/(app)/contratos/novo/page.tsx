import { AppLayout } from "@/components/layout/AppLayout";
import { FileSignature } from "lucide-react";
import { FormularioContratoView } from "./FormularioContratoView";
import { db } from "@/db";
import { documentTemplates } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function NovoContratoPage() {
  const templates = await db.select().from(documentTemplates).where(eq(documentTemplates.active, true));

  return (
    <AppLayout
      title="Novo Contrato"
      subtitle="Preencha os dados abaixo para gerar um novo documento a partir de um modelo."
    >
      <div className="space-y-6 animate-fade-in">
        <FormularioContratoView templates={templates} />
      </div>
    </AppLayout>
  );
}
