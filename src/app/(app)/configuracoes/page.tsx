"use client";
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Sliders, Building, Check, Palette, Link as LinkIcon, Info } from "lucide-react";

interface SettingsData {
  appName: string;
  companyName: string;
  cnpj: string;
  phone: string;
  email: string;
  address: string;
  logoUrl: string;
  themeColor: string;
}

const THEME_OPTIONS = [
  { value: "amber", label: "Âmbar (Original)", colorClass: "bg-amber-500" },
  { value: "indigo", label: "Índigo", colorClass: "bg-indigo-600" },
  { value: "emerald", label: "Esmeralda", colorClass: "bg-emerald-600" },
  { value: "violet", label: "Violeta", colorClass: "bg-violet-600" },
  { value: "slate", label: "Cinza Slate", colorClass: "bg-slate-600" },
];

export default function ConfiguracoesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState<SettingsData>({
    appName: "",
    companyName: "",
    cnpj: "",
    phone: "",
    email: "",
    address: "",
    logoUrl: "",
    themeColor: "amber",
  });
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
    if (!loading && user && user.role !== "admin") router.replace("/dashboard");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || user.role !== "admin") return;

    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          setForm({
            appName: data.appName ?? "GráfikaORC",
            companyName: data.companyName ?? "Gráfica São João",
            cnpj: data.cnpj ?? "",
            phone: data.phone ?? "",
            email: data.email ?? "",
            address: data.address ?? "",
            logoUrl: data.logoUrl ?? "",
            themeColor: data.themeColor ?? "amber",
          });
        }
      })
      .catch((err) => {
        console.error("Erro ao carregar configurações:", err);
        setError("Não foi possível carregar as configurações.");
      })
      .finally(() => setFetching(false));
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!form.appName.trim()) {
      setError("O nome do sistema é obrigatório.");
      return;
    }
    if (!form.companyName.trim()) {
      setError("O nome da gráfica é obrigatório.");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Erro ao salvar configurações.");
      }

      setSuccess(true);
      // Forçar atualização do estado global do app para refletir a marca
      router.refresh();
      // Remove a mensagem de sucesso depois de 3 segundos
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err.message || "Erro de conexão com o servidor.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user || user.role !== "admin") return null;

  return (
    <AppLayout
      title="Configurações do Sistema"
      subtitle="Personalize o sistema com a marca e dados da sua gráfica (White Label)"
    >
      {fetching ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3">
              <p className="text-sm text-red-700">⚠ {error}</p>
            </div>
          )}

          {success && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
              <p className="text-sm text-emerald-700">✓ Configurações salvas com sucesso! As alterações visuais foram aplicadas.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bloco 1: Identidade Visual */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 space-y-4">
              <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <Palette className="h-5 w-5 text-indigo-500" />
                Identidade Visual
              </h3>

              <Input
                label="Nome do Sistema *"
                value={form.appName}
                onChange={(e) => setForm((f) => ({ ...f, appName: e.target.value }))}
                placeholder="Ex: GráfikaORC"
                required
              />

              <Input
                label="URL do Logotipo"
                value={form.logoUrl}
                onChange={(e) => setForm((f) => ({ ...f, logoUrl: e.target.value }))}
                placeholder="https://sua-empresa.com/logo.png"
              />
              <p className="text-xs text-slate-400 -mt-2">
                Insira o link para a imagem da logo. De preferência em formato PNG transparente ou SVG.
              </p>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Tema de Cores</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {THEME_OPTIONS.map((theme) => {
                    const selected = form.themeColor === theme.value;
                    return (
                      <button
                        key={theme.value}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, themeColor: theme.value }))}
                        className={`flex items-center gap-2 rounded-xl border p-2.5 text-left transition-all text-xs font-medium ${
                          selected
                            ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <span className={`h-4 w-4 rounded-full ${theme.colorClass} flex-shrink-0`} />
                        <span className="truncate">{theme.label}</span>
                        {selected && <Check className="h-3.5 w-3.5 ml-auto text-slate-900" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bloco 2: Dados da Gráfica emitente */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 space-y-4">
              <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <Building className="h-5 w-5 text-indigo-500" />
                Dados Corporativos
              </h3>

              <Input
                label="Razão Social / Nome da Gráfica *"
                value={form.companyName}
                onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
                placeholder="Ex: Gráfica São João Ltda"
                required
              />

              <Input
                label="CNPJ / CPF"
                value={form.cnpj}
                onChange={(e) => setForm((f) => ({ ...f, cnpj: e.target.value }))}
                placeholder="00.000.000/0001-00"
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Telefone"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="(11) 3456-7890"
                />
                <Input
                  label="E-mail corporativo"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="contato@suagrafica.com"
                />
              </div>

              <Textarea
                label="Endereço Completo"
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                placeholder="Rua, número, bairro, cidade - UF"
                rows={3}
              />
            </div>
          </div>

          {/* Dica Informativa */}
          <div className="rounded-2xl bg-indigo-50/50 border border-indigo-100 p-4 flex gap-3">
            <Info className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-indigo-950">
              <p className="font-semibold">Onde essas informações aparecem?</p>
              <ul className="list-disc list-inside text-xs mt-1.5 space-y-1 text-slate-600">
                <li>O <strong>Nome do Sistema</strong> muda o título na aba do navegador, na tela de login e no topo da Sidebar.</li>
                <li>Os <strong>Dados Corporativos</strong> aparecem no cabeçalho profissional de todos os orçamentos emitidos, garantindo que o seu cliente veja a sua marca e contatos.</li>
              </ul>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push("/dashboard")}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              <Sliders className="h-4 w-4" />
              Salvar Alterações
            </Button>
          </div>
        </form>
      )}
    </AppLayout>
  );
}
