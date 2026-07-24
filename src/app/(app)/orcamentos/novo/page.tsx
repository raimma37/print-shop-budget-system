"use client";
import { useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { OrcamentoForm } from "@/components/orcamentos/OrcamentoForm";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function NovoOrcamentoPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/dashboard");
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <AppLayout title="Novo Orçamento">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/orcamentos" className="hover:text-slate-700">Orçamentos</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-slate-900 font-medium">Novo Orçamento</span>
      </nav>

      <OrcamentoForm mode="create" />
    </AppLayout>
  );
}
