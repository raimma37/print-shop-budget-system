"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/Card";
import { FileSignature, Plus, LayoutTemplate, FileDown } from "lucide-react";
import Link from "next/link";

export default function ContratosPage() {
  return (
    <AppLayout
      title="Contratos e Documentos"
      subtitle="Gere, visualize e gerencie seus contratos e documentos padronizados."
      actions={
        <div className="flex gap-2">
          <Link
            href="/contratos/templates"
            className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors bg-slate-800 text-white hover:bg-slate-700 shadow-sm border border-slate-700 gap-2"
          >
            <LayoutTemplate className="h-4 w-4" />
            Modelos
          </Link>
          <Link
            href="/contratos/novo"
            className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors bg-sky-600 text-white hover:bg-sky-500 shadow-sm border border-sky-500 gap-2"
          >
            <Plus className="h-4 w-4" />
            Novo Contrato
          </Link>
        </div>
      }
    >
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 border border-slate-800/50 bg-slate-900/50 shadow-sm relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-slate-400">Total Gerados</p>
                <h3 className="text-3xl font-bold text-white mt-1">0</h3>
              </div>
              <div className="p-3 bg-sky-500/10 rounded-xl border border-sky-500/20 text-sky-400">
                <FileSignature className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-slate-500">
              <span className="text-emerald-400 font-medium">Contratos registrados no sistema</span>
            </p>
          </Card>
        </div>

        <Card className="border border-slate-800 bg-slate-900/50 shadow-sm">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Contratos Recentes</h2>
          </div>
          <div className="p-8 text-center text-slate-500">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 mb-4">
              <FileSignature className="h-8 w-8 text-slate-600" />
            </div>
            <h3 className="text-base font-medium text-slate-300 mb-1">Nenhum contrato gerado</h3>
            <p className="text-sm max-w-md mx-auto mb-6">Você ainda não gerou nenhum contrato. Faça o upload de um modelo DOCX e comece a gerar documentos automaticamente.</p>
            <Link
              href="/contratos/novo"
              className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors bg-sky-600 text-white hover:bg-sky-500 gap-2"
            >
              <Plus className="h-4 w-4" />
              Gerar Primeiro Contrato
            </Link>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
