"use client";
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import Link from "next/link";
import {
  ChevronRight,
  Pencil,
  Trash2,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  Calendar,
  Printer,
} from "lucide-react";


interface OrcamentoDetail {
  id: number;
  numero: string;
  status: string;
  validUntil: string | null;
  subtotal: string;
  discount: string;
  total: string;
  notes: string | null;
  internalNotes: string | null;
  createdAt: string;
  updatedAt: string;
  clientId: number;
  userId: number;
  clientName: string;
  clientEmail: string | null;
  clientPhone: string | null;
  clientCnpjCpf: string | null;
  clientAddress: string | null;
  clientCity: string | null;
  clientState: string | null;
  userName: string;
  items: Array<{
    id: number;
    description: string;
    quantity: string;
    unit: string;
    unitPrice: string;
    discount: string;
    total: string;
  }>;
}

export default function OrcamentoDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [orc, setOrc] = useState<OrcamentoDetail | null>(null);
  const [settings, setSettings] = useState<any>(null);
  const [fetching, setFetching] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    
    // Busca os dados do orçamento
    fetch(`/api/orcamentos/${id}`)
      .then((r) => {
        if (!r.ok) { router.replace("/orcamentos"); return null; }
        return r.json();
      })
      .then((d) => { if (d) setOrc(d); })
      .finally(() => setFetching(false));

    // Busca as configurações de White Label
    fetch("/api/settings")
      .then((r) => r.json())
      .then(setSettings)
      .catch((err) => console.error("Erro ao carregar settings na visualização do orçamento:", err));
  }, [user, id, router]);

  const handleDelete = async () => {
    if (!confirm("Excluir este orçamento?")) return;
    setDeleting(true);
    await fetch(`/api/orcamentos/${id}`, { method: "DELETE" });
    router.push("/orcamentos");
  };

  if (loading || !user) return null;

  return (
    <AppLayout
      title={orc?.numero ?? "Orçamento"}
      actions={
        orc ? (
          <div className="flex items-center gap-2 print:hidden">
            <Link href={`/orcamentos/${id}/editar`}>
              <Button variant="secondary" size="sm">
                <Pencil className="h-4 w-4" /> Editar
              </Button>
            </Link>
            <Button variant="danger" size="sm" onClick={handleDelete} loading={deleting}>
              <Trash2 className="h-4 w-4" /> Excluir
            </Button>
          </div>
        ) : undefined
      }
    >
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6 print:hidden">
        <Link href="/orcamentos" className="hover:text-slate-700">Orçamentos</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-slate-900 font-medium">{orc?.numero ?? "Carregando..."}</span>
      </nav>

      {fetching ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      ) : !orc ? null : (
        <div className="space-y-5">
          {/* Cabeçalho Corporativo Emitente (White Label) */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 overflow-hidden relative">
            <div className={cn("absolute top-0 left-0 right-0 h-1.5", 
              settings?.themeColor === "indigo" ? "bg-indigo-600" :
              settings?.themeColor === "emerald" ? "bg-emerald-600" :
              settings?.themeColor === "violet" ? "bg-violet-600" :
              settings?.themeColor === "slate" ? "bg-slate-600" :
              "bg-amber-500"
            )} />

            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 pt-2">
              <div className="flex items-start gap-4">
                {settings?.logoUrl ? (
                  <img src={settings.logoUrl} alt={settings.companyName} className="h-12 w-auto object-contain rounded-lg border border-slate-100 p-1" />
                ) : (
                  <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl text-white", 
                    settings?.themeColor === "indigo" ? "bg-indigo-600" :
                    settings?.themeColor === "emerald" ? "bg-emerald-600" :
                    settings?.themeColor === "violet" ? "bg-violet-600" :
                    settings?.themeColor === "slate" ? "bg-slate-600" :
                    "bg-amber-500"
                  )}>
                    <Printer className="h-6 w-6" />
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{settings?.companyName || "Gráfica São João"}</h2>
                  {settings?.cnpj && <p className="text-xs text-slate-500 font-mono mt-0.5">CNPJ: {settings.cnpj}</p>}
                  <div className="text-xs text-slate-500 mt-2 space-y-0.5">
                    {settings?.address && <p>{settings.address}</p>}
                    {(settings?.phone || settings?.email) && (
                      <p>
                        {settings.phone && `Tel: ${settings.phone}`}
                        {settings.phone && settings.email && " · "}
                        {settings.email && `E-mail: ${settings.email}`}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-left md:text-right border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 flex flex-col justify-between">
                <div className="flex items-center md:justify-end gap-3 mb-2">
                  <span className="font-mono text-xl font-bold text-slate-900">{orc.numero}</span>
                  <StatusBadge status={orc.status} />
                </div>
                <p className="text-xs text-slate-500">
                  Emitido em: {formatDateTime(orc.createdAt)}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Vendedor: {orc.userName}
                </p>
                {orc.validUntil && (
                  <p className="text-xs text-red-600 font-medium mt-1.5 flex items-center md:justify-end gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Válido até {formatDate(orc.validUntil)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Destaque de Valor e Ações de Proposta */}
          <div className="rounded-2xl border border-slate-150 bg-slate-50 p-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Valor Total do Orçamento</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{formatCurrency(parseFloat(orc.total))}</p>
            </div>
            <div className="flex items-center gap-2 print:hidden">
              {parseFloat(orc.discount) > 0 && (
                <span className="text-xs font-semibold bg-red-50 text-red-700 border border-red-150 px-3 py-1.5 rounded-full mr-2">
                  Desconto: {formatCurrency(parseFloat(orc.discount))}
                </span>
              )}
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="h-4 w-4" /> Imprimir Proposta
              </Button>
            </div>
          </div>


          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Client info */}
            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-6">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <User className="h-4 w-4 text-slate-400" /> Cliente
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{orc.clientName}</p>
                  {orc.clientCnpjCpf && (
                    <p className="text-xs text-slate-500">{orc.clientCnpjCpf}</p>
                  )}
                </div>
                {orc.clientEmail && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    <a href={`mailto:${orc.clientEmail}`} className="hover:text-indigo-600 truncate">
                      {orc.clientEmail}
                    </a>
                  </div>
                )}
                {orc.clientPhone && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    {orc.clientPhone}
                  </div>
                )}
                {(orc.clientCity || orc.clientState) && (
                  <div className="flex items-start gap-2 text-sm text-slate-600">
                    <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span>
                      {orc.clientAddress && `${orc.clientAddress}, `}
                      {orc.clientCity}{orc.clientState ? ` – ${orc.clientState}` : ""}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="lg:col-span-2 space-y-4">
              {orc.notes && (
                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
                  <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Observações para o Cliente
                  </h3>
                  <p className="text-sm text-blue-800 whitespace-pre-wrap">{orc.notes}</p>
                </div>
              )}
              {orc.internalNotes && (
                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-6">
                  <h3 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Notas Internas
                  </h3>
                  <p className="text-sm text-amber-800 whitespace-pre-wrap">{orc.internalNotes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Items table */}
          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900">Itens do Orçamento</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">#</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Descrição</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Qtd</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Un</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Preço Unit.</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Desc.</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {orc.items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3 text-slate-400 text-xs">{idx + 1}</td>
                      <td className="px-6 py-3 font-medium text-slate-900">{item.description}</td>
                      <td className="px-6 py-3 text-right text-slate-700">{parseFloat(item.quantity).toLocaleString("pt-BR")}</td>
                      <td className="px-6 py-3 text-slate-500">{item.unit}</td>
                      <td className="px-6 py-3 text-right text-slate-700">{formatCurrency(parseFloat(item.unitPrice))}</td>
                      <td className="px-6 py-3 text-right text-slate-500">
                        {parseFloat(item.discount) > 0 ? `${parseFloat(item.discount)}%` : "—"}
                      </td>
                      <td className="px-6 py-3 text-right font-semibold text-slate-900">
                        {formatCurrency(parseFloat(item.total))}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t-2 border-slate-200 bg-slate-50">
                  <tr>
                    <td colSpan={6} className="px-6 py-3 text-right text-sm font-medium text-slate-600">Subtotal</td>
                    <td className="px-6 py-3 text-right font-semibold text-slate-900">{formatCurrency(parseFloat(orc.subtotal))}</td>
                  </tr>
                  {parseFloat(orc.discount) > 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-2 text-right text-sm font-medium text-red-600">Desconto</td>
                      <td className="px-6 py-2 text-right font-semibold text-red-600">– {formatCurrency(parseFloat(orc.discount))}</td>
                    </tr>
                  )}
                  <tr className="border-t border-slate-200">
                    <td colSpan={6} className="px-6 py-4 text-right text-base font-bold text-slate-900">TOTAL</td>
                    <td className="px-6 py-4 text-right text-xl font-bold text-indigo-700">{formatCurrency(parseFloat(orc.total))}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
