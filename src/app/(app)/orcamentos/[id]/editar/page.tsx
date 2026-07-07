"use client";
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { OrcamentoForm } from "@/components/orcamentos/OrcamentoForm";
import { Skeleton } from "@/components/ui/Skeleton";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface OrcamentoDetail {
  id: number;
  numero: string;
  status: string;
  validUntil: string | null;
  discount: string;
  notes: string | null;
  internalNotes: string | null;
  clientId: number;
  items: Array<{
    productId: number | null;
    description: string;
    quantity: string;
    unit: string;
    unitPrice: string;
    discount: string;
    sortOrder: number;
  }>;
}

export default function EditarOrcamentoPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [orc, setOrc] = useState<OrcamentoDetail | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/orcamentos/${id}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setOrc)
      .catch(() => router.replace("/orcamentos"))
      .finally(() => setFetching(false));
  }, [user, id, router]);

  if (loading || !user) return null;

  return (
    <AppLayout title="Editar Orçamento">
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/orcamentos" className="hover:text-slate-700">Orçamentos</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href={`/orcamentos/${id}`} className="hover:text-slate-700">{orc?.numero ?? "..."}</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-slate-900 font-medium">Editar</span>
      </nav>

      {fetching ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      ) : orc ? (
        <OrcamentoForm mode="edit" initialData={{
          ...orc,
          notes: orc.notes ?? undefined,
          internalNotes: orc.internalNotes ?? undefined,
          validUntil: orc.validUntil ?? undefined,
        }} />
      ) : null}
    </AppLayout>
  );
}
