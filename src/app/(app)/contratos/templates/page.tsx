import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/Card";
import { LayoutTemplate, Upload } from "lucide-react";
import { db } from "@/db";
import { documentTemplates } from "@/db/schema";
import { desc } from "drizzle-orm";
import { TemplatesView } from "./TemplatesView";
import { DeleteTemplateButton } from "./DeleteTemplateButton";

export default async function TemplatesPage() {
  const templates = await db.select().from(documentTemplates).orderBy(desc(documentTemplates.createdAt));

  return (
    <AppLayout
      title="Gestão de Modelos"
      subtitle="Faça upload dos seus contratos e documentos base em formato DOCX."
    >
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="p-6 border border-slate-800 bg-slate-900/50 shadow-sm">
              <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                <Upload className="h-5 w-5 text-slate-400" />
                Novo Modelo
              </h3>
              <p className="text-sm text-slate-400 mb-6">
                Faça o upload de um arquivo <strong className="text-sky-400">.docx</strong>. 
                O sistema irá ler o arquivo e extrair automaticamente as tags no formato <code>{"{TAG}"}</code>.
              </p>
              <TemplatesView />
            </Card>
          </div>
          
          <div className="lg:col-span-2">
            <Card className="border border-slate-800 bg-slate-900/50 shadow-sm h-full">
              <div className="p-5 border-b border-slate-800">
                <h3 className="text-lg font-medium text-white">Modelos Cadastrados</h3>
              </div>
              
              <div className="p-5">
                {templates.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <LayoutTemplate className="h-10 w-10 mx-auto text-slate-700 mb-3" />
                    <p>Nenhum modelo cadastrado ainda.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {templates.map((template) => (
                      <div key={template.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
                        <div>
                          <h4 className="text-sm font-medium text-white">{template.name}</h4>
                          <p className="text-xs text-slate-400 mt-1">Tags detectadas: {JSON.parse(template.requiredTags).length}</p>
                        </div>
                        <div className="mt-3 sm:mt-0 flex items-center gap-3">
                          <div className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {template.active ? "Ativo" : "Inativo"}
                          </div>
                          <div className="w-px h-4 bg-slate-700"></div>
                          <DeleteTemplateButton templateId={template.id} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
