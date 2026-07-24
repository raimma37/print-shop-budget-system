"use client";
import { useEffect, useState, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { useTheme, type ColorScheme } from "@/contexts/ThemeContext";
import {
  Sliders,
  Building,
  Check,
  Palette,
  Info,
  FileText,
  LayoutTemplate,
  Eye,
  EyeOff,
  AlignLeft,
  AlignRight,
  AlignCenter,
  Sun,
  Moon,
  Monitor,
  Tag,
  Ruler,
  Plus,
  Pencil,
  Trash2,
  X,
  GripVertical,
} from "lucide-react";

interface SettingsData {
  appName: string;
  companyName: string;
  cnpj: string;
  phone: string;
  email: string;
  address: string;
  logoUrl: string;
  themeColor: string;
  glassEffect: boolean;
  // PDF
  pdfAccentColor: string;
  pdfFooterText: string;
  pdfValidityText: string;
  pdfTermsText: string;
  pdfShowLogo: boolean;
  pdfShowCnpj: boolean;
  pdfShowPhone: boolean;
  pdfShowEmail: boolean;
  pdfShowAddress: boolean;
  pdfHeaderLayout: string;
}

const THEME_OPTIONS = [
  { value: "amber", label: "Âmbar (Original)", colorClass: "bg-amber-500" },
  { value: "indigo", label: "Índigo", colorClass: "bg-indigo-600" },
  { value: "emerald", label: "Esmeralda", colorClass: "bg-emerald-600" },
  { value: "violet", label: "Violeta", colorClass: "bg-violet-600" },
  { value: "slate", label: "Cinza Slate", colorClass: "bg-slate-600" },
];

const HEADER_LAYOUTS = [
  {
    value: "logo-left",
    label: "Logo à Esquerda",
    icon: AlignLeft,
    preview: (
      <div className="flex items-center gap-2 w-full p-2 bg-slate-100 rounded text-xs">
        <div className="w-8 h-5 bg-slate-400 rounded flex-shrink-0" />
        <div className="flex-1 space-y-1">
          <div className="h-1.5 bg-slate-300 rounded w-3/4" />
          <div className="h-1 bg-slate-200 rounded w-1/2" />
        </div>
      </div>
    ),
  },
  {
    value: "logo-right",
    label: "Logo à Direita",
    icon: AlignRight,
    preview: (
      <div className="flex items-center gap-2 w-full p-2 bg-slate-100 rounded text-xs flex-row-reverse">
        <div className="w-8 h-5 bg-slate-400 rounded flex-shrink-0" />
        <div className="flex-1 space-y-1">
          <div className="h-1.5 bg-slate-300 rounded w-3/4 ml-auto" />
          <div className="h-1 bg-slate-200 rounded w-1/2 ml-auto" />
        </div>
      </div>
    ),
  },
  {
    value: "centered",
    label: "Centralizado",
    icon: AlignCenter,
    preview: (
      <div className="flex flex-col items-center w-full p-2 bg-slate-100 rounded text-xs gap-1">
        <div className="w-8 h-5 bg-slate-400 rounded" />
        <div className="h-1.5 bg-slate-300 rounded w-1/2" />
        <div className="h-1 bg-slate-200 rounded w-1/3" />
      </div>
    ),
  },
  {
    value: "no-logo",
    label: "Sem Logo",
    icon: EyeOff,
    preview: (
      <div className="w-full p-2 bg-slate-100 rounded text-xs space-y-1">
        <div className="h-1.5 bg-slate-300 rounded w-3/4" />
        <div className="h-1 bg-slate-200 rounded w-1/2" />
        <div className="h-1 bg-slate-200 rounded w-2/3" />
      </div>
    ),
  },
];

interface ToggleFieldProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}

function ToggleField({ label, description, checked, onChange }: ToggleFieldProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 border-b border-slate-100 last:border-0">
      <div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
          checked ? "bg-indigo-600" : "bg-slate-200"
        }`}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform duration-200 ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

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
    glassEffect: false,
    pdfAccentColor: "#f59e0b",
    pdfFooterText: "",
    pdfValidityText: "Este orçamento é válido por 30 dias a partir da data de emissão.",
    pdfTermsText: "",
    pdfShowLogo: true,
    pdfShowCnpj: true,
    pdfShowPhone: true,
    pdfShowEmail: true,
    pdfShowAddress: true,
    pdfHeaderLayout: "logo-left",
  });

  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { colorScheme, setColorScheme } = useTheme();

  // ─ Categorias ────────────────────────────────────────────────────────
  type Category = { id: number; name: string; color: string; active: boolean };
  const [categories, setCategories] = useState<Category[]>([]);
  const [catLoading, setCatLoading] = useState(false);
  const [catForm, setCatForm] = useState({ name: "", color: "#64748b" });
  const [catEditing, setCatEditing] = useState<Category | null>(null);
  const [catSaving, setCatSaving] = useState(false);
  const [catError, setCatError] = useState("");
  const [showCatForm, setShowCatForm] = useState(false);

  const loadCategories = useCallback(async () => {
    setCatLoading(true);
    try {
      const r = await fetch("/api/categories");
      const data = await r.json();
      if (Array.isArray(data)) setCategories(data);
    } catch { /* silent */ }
    finally { setCatLoading(false); }
  }, []);

  const saveCategory = async () => {
    if (!catForm.name.trim()) { setCatError("Nome obrigatório."); return; }
    setCatSaving(true); setCatError("");
    try {
      const url = catEditing ? `/api/categories/${catEditing.id}` : "/api/categories";
      const method = catEditing ? "PUT" : "POST";
      const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(catForm) });
      if (!r.ok) { const d = await r.json(); throw new Error(d.error); }
      await loadCategories();
      setCatForm({ name: "", color: "#64748b" });
      setCatEditing(null);
      setShowCatForm(false);
    } catch (e: any) { setCatError(e.message); }
    finally { setCatSaving(false); }
  };

  const deleteCategory = async (id: number) => {
    if (!confirm("Excluir esta categoria? Produtos vinculados não serão afetados.")) return;
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    await loadCategories();
  };

  const startEditCat = (cat: Category) => {
    setCatEditing(cat);
    setCatForm({ name: cat.name, color: cat.color });
    setShowCatForm(true);
    setCatError("");
  };

  // ─ Unidades ─────────────────────────────────────────────────────────
  type Unit = { id: number; name: string; abbreviation: string; active: boolean };
  const [units, setUnits] = useState<Unit[]>([]);
  const [unitLoading, setUnitLoading] = useState(false);
  const [unitForm, setUnitForm] = useState({ name: "", abbreviation: "" });
  const [unitEditing, setUnitEditing] = useState<Unit | null>(null);
  const [unitSaving, setUnitSaving] = useState(false);
  const [unitError, setUnitError] = useState("");
  const [showUnitForm, setShowUnitForm] = useState(false);

  const loadUnits = useCallback(async () => {
    setUnitLoading(true);
    try {
      const r = await fetch("/api/units");
      const data = await r.json();
      if (Array.isArray(data)) setUnits(data);
    } catch { /* silent */ }
    finally { setUnitLoading(false); }
  }, []);

  const saveUnit = async () => {
    if (!unitForm.name.trim()) { setUnitError("Nome obrigatório."); return; }
    if (!unitForm.abbreviation.trim()) { setUnitError("Abreviação obrigatória."); return; }
    setUnitSaving(true); setUnitError("");
    try {
      const url = unitEditing ? `/api/units/${unitEditing.id}` : "/api/units";
      const method = unitEditing ? "PUT" : "POST";
      const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(unitForm) });
      if (!r.ok) { const d = await r.json(); throw new Error(d.error); }
      await loadUnits();
      setUnitForm({ name: "", abbreviation: "" });
      setUnitEditing(null);
      setShowUnitForm(false);
    } catch (e: any) { setUnitError(e.message); }
    finally { setUnitSaving(false); }
  };

  const deleteUnit = async (id: number) => {
    if (!confirm("Excluir esta unidade?")) return;
    await fetch(`/api/units/${id}`, { method: "DELETE" });
    await loadUnits();
  };

  const startEditUnit = (unit: Unit) => {
    setUnitEditing(unit);
    setUnitForm({ name: unit.name, abbreviation: unit.abbreviation });
    setShowUnitForm(true);
    setUnitError("");
  };

  const COLOR_SCHEMES: { value: ColorScheme; label: string; icon: React.ReactNode; description: string }[] = [
    { value: "light", label: "Claro", icon: <Sun className="h-5 w-5" />, description: "Sempre modo claro" },
    { value: "dark", label: "Escuro", icon: <Moon className="h-5 w-5" />, description: "Sempre modo escuro" },
    { value: "system", label: "Sistema", icon: <Monitor className="h-5 w-5" />, description: "Segue a preferência do dispositivo" },
  ];

  useEffect(() => {
    if (!loading && !user) router.replace("/dashboard");
    if (!loading && user && user.role !== "admin") router.replace("/dashboard");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    loadCategories();
    loadUnits();

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
            glassEffect: data.glassEffect === true,
            pdfAccentColor: data.pdfAccentColor ?? "#f59e0b",
            pdfFooterText: data.pdfFooterText ?? "",
            pdfValidityText:
              data.pdfValidityText ??
              "Este orçamento é válido por 30 dias a partir da data de emissão.",
            pdfTermsText: data.pdfTermsText ?? "",
            pdfShowLogo: data.pdfShowLogo !== false,
            pdfShowCnpj: data.pdfShowCnpj !== false,
            pdfShowPhone: data.pdfShowPhone !== false,
            pdfShowEmail: data.pdfShowEmail !== false,
            pdfShowAddress: data.pdfShowAddress !== false,
            pdfHeaderLayout: data.pdfHeaderLayout ?? "logo-left",
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
      router.refresh();
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err.message || "Erro de conexão com o servidor.");
    } finally {
      setSaving(false);
    }
  };

  const setField = <K extends keyof SettingsData>(key: K, value: SettingsData[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

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
              <p className="text-sm text-emerald-700">
                ✓ Configurações salvas com sucesso! As alterações foram aplicadas.
              </p>
            </div>
          )}

          {/* ── Seção 1: Identidade Visual + Dados Corporativos ── */}
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
                onChange={(e) => setField("appName", e.target.value)}
                placeholder="Ex: GráfikaORC"
                required
              />

              <Input
                label="URL do Logotipo"
                value={form.logoUrl}
                onChange={(e) => setField("logoUrl", e.target.value)}
                placeholder="https://sua-empresa.com/logo.png"
              />
              <p className="text-xs text-slate-400 -mt-2">
                Insira o link para a imagem da logo. De preferência PNG transparente ou SVG.
              </p>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">
                  Tema de Cores do Sistema
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {THEME_OPTIONS.map((theme) => {
                    const selected = form.themeColor === theme.value;
                    return (
                      <button
                        key={theme.value}
                        type="button"
                        onClick={() => setField("themeColor", theme.value)}
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

            {/* Bloco 2: Dados da Gráfica */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 space-y-4">
              <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <Building className="h-5 w-5 text-indigo-500" />
                Dados Corporativos
              </h3>

              <Input
                label="Razão Social / Nome da Gráfica *"
                value={form.companyName}
                onChange={(e) => setField("companyName", e.target.value)}
                placeholder="Ex: Gráfica São João Ltda"
                required
              />

              <Input
                label="CNPJ / CPF"
                value={form.cnpj}
                onChange={(e) => setField("cnpj", e.target.value)}
                placeholder="00.000.000/0001-00"
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Telefone"
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                  placeholder="(11) 3456-7890"
                />
                <Input
                  label="E-mail corporativo"
                  type="email"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  placeholder="contato@suagrafica.com"
                />
              </div>

              <Textarea
                label="Endereço Completo"
                value={form.address}
                onChange={(e) => setField("address", e.target.value)}
                placeholder="Rua, número, bairro, cidade - UF"
                rows={3}
              />
            </div>
          </div>

          {/* ── Seção 1.5: Aparência (Dark Mode) ── */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100 mb-5">
              <Moon className="h-5 w-5 text-violet-500" />
              <h3 className="font-semibold text-slate-900">Aparência</h3>
              <span className="ml-auto text-xs text-slate-400">
                Atual: <strong>{COLOR_SCHEMES.find(s => s.value === colorScheme)?.label}</strong>
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {COLOR_SCHEMES.map((scheme) => {
                const selected = colorScheme === scheme.value;
                return (
                  <button
                    key={scheme.value}
                    type="button"
                    onClick={() => setColorScheme(scheme.value)}
                    className={`flex flex-col items-center gap-3 rounded-2xl border-2 p-5 text-center transition-all ${
                      selected
                        ? "border-violet-500 bg-violet-50 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {/* Mini preview */}
                    <div className={`w-full h-16 rounded-xl overflow-hidden border border-slate-200 flex ${
                      scheme.value === 'dark' ? 'bg-slate-900' :
                      scheme.value === 'light' ? 'bg-white' :
                      'bg-gradient-to-r from-white to-slate-900'
                    }`}>
                      <div className={`w-1/3 h-full ${
                        scheme.value === 'dark' ? 'bg-slate-800' :
                        scheme.value === 'light' ? 'bg-slate-100' :
                        'bg-gradient-to-b from-slate-100 to-slate-800'
                      } flex flex-col gap-1 p-1.5`}>
                        <div className={`h-1.5 rounded-full w-3/4 ${ scheme.value === 'dark' ? 'bg-slate-600' : scheme.value === 'light' ? 'bg-slate-300' : 'bg-slate-400'}`} />
                        <div className={`h-1 rounded-full w-1/2 ${ scheme.value === 'dark' ? 'bg-slate-700' : scheme.value === 'light' ? 'bg-slate-200' : 'bg-slate-500'}`} />
                        <div className={`h-1 rounded-full w-2/3 ${ scheme.value === 'dark' ? 'bg-slate-700' : scheme.value === 'light' ? 'bg-slate-200' : 'bg-slate-500'}`} />
                      </div>
                      <div className="flex-1 flex flex-col gap-1 p-1.5">
                        <div className={`h-1.5 rounded w-full ${ scheme.value === 'dark' ? 'bg-slate-700' : scheme.value === 'light' ? 'bg-slate-100' : 'bg-slate-300'}`} />
                        <div className={`h-1 rounded w-2/3 ${ scheme.value === 'dark' ? 'bg-slate-800' : scheme.value === 'light' ? 'bg-slate-50' : 'bg-slate-400'}`} />
                      </div>
                    </div>
                    <div className={`p-2 rounded-xl ${ selected ? 'bg-violet-100 text-violet-600' : 'bg-slate-100 text-slate-500'}`}>
                      {scheme.icon}
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${ selected ? 'text-violet-700' : 'text-slate-700'}`}>
                        {scheme.label}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{scheme.description}</p>
                    </div>
                    {selected && (
                      <span className="flex items-center gap-1 text-xs text-violet-600 font-medium">
                        <Check className="h-3.5 w-3.5" /> Ativo
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-400 mt-4 text-center">
              A preferência de aparência é salva localmente no navegador e aplicada imediatamente.
            </p>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <ToggleField
                label="Efeito de Vidro (Glassmorphism)"
                description="Aplica um efeito translúcido desfocado (estilo Apple) nas bordas e fundos dos quadros e cartões."
                checked={form.glassEffect}
                onChange={(v) => setField("glassEffect", v)}
              />
            </div>
          </div>

          {/* ── Seção 2: Personalização do PDF ── */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <FileText className="h-5 w-5 text-violet-500" />
              <h3 className="font-semibold text-slate-900">Personalização do PDF dos Orçamentos</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Coluna esquerda: Layout e Visual */}
              <div className="space-y-5">
                {/* Layout do cabeçalho */}
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2 flex items-center gap-1.5">
                    <LayoutTemplate className="h-4 w-4 text-slate-400" />
                    Layout do Cabeçalho
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {HEADER_LAYOUTS.map((layout) => {
                      const selected = form.pdfHeaderLayout === layout.value;
                      return (
                        <button
                          key={layout.value}
                          type="button"
                          onClick={() => setField("pdfHeaderLayout", layout.value)}
                          className={`flex flex-col gap-2 rounded-xl border p-3 text-left transition-all ${
                            selected
                              ? "border-violet-500 bg-violet-50 ring-1 ring-violet-500"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          {layout.preview}
                          <div className="flex items-center gap-1.5">
                            <layout.icon className="h-3.5 w-3.5 text-slate-400" />
                            <span className="text-xs font-medium text-slate-600">{layout.label}</span>
                            {selected && <Check className="h-3 w-3 ml-auto text-violet-600" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Cor de destaque */}
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">
                    Cor de Destaque do PDF
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      id="pdfAccentColor"
                      value={form.pdfAccentColor}
                      onChange={(e) => setField("pdfAccentColor", e.target.value)}
                      className="h-10 w-14 rounded-lg border border-slate-200 cursor-pointer p-0.5 bg-white"
                    />
                    <div className="flex-1">
                      <Input
                        label=""
                        value={form.pdfAccentColor}
                        onChange={(e) => setField("pdfAccentColor", e.target.value)}
                        placeholder="#f59e0b"
                        className="font-mono"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Usada nos títulos, linhas divisórias e totais do orçamento.
                  </p>
                </div>

                {/* Campos visíveis no PDF */}
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2 flex items-center gap-1.5">
                    <Eye className="h-4 w-4 text-slate-400" />
                    Informações Visíveis no PDF
                  </label>
                  <div className="rounded-xl border border-slate-200 px-4 divide-y divide-slate-100">
                    <ToggleField
                      label="Exibir Logotipo"
                      description="Mostra a logo no cabeçalho do PDF"
                      checked={form.pdfShowLogo}
                      onChange={(v) => setField("pdfShowLogo", v)}
                    />
                    <ToggleField
                      label="Exibir CNPJ/CPF"
                      description="Mostra o CNPJ da empresa emissora"
                      checked={form.pdfShowCnpj}
                      onChange={(v) => setField("pdfShowCnpj", v)}
                    />
                    <ToggleField
                      label="Exibir Telefone"
                      description="Mostra o telefone de contato"
                      checked={form.pdfShowPhone}
                      onChange={(v) => setField("pdfShowPhone", v)}
                    />
                    <ToggleField
                      label="Exibir E-mail"
                      description="Mostra o e-mail de contato"
                      checked={form.pdfShowEmail}
                      onChange={(v) => setField("pdfShowEmail", v)}
                    />
                    <ToggleField
                      label="Exibir Endereço"
                      description="Mostra o endereço completo da empresa"
                      checked={form.pdfShowAddress}
                      onChange={(v) => setField("pdfShowAddress", v)}
                    />
                  </div>
                </div>
              </div>

              {/* Coluna direita: Textos */}
              <div className="space-y-5">
                <Input
                  label="Texto de Validade do Orçamento"
                  value={form.pdfValidityText}
                  onChange={(e) => setField("pdfValidityText", e.target.value)}
                  placeholder="Ex: Este orçamento é válido por 30 dias..."
                />
                <p className="text-xs text-slate-400 -mt-4">
                  Aparece abaixo dos totais, antes das observações.
                </p>

                <Textarea
                  label="Termos e Condições"
                  value={form.pdfTermsText}
                  onChange={(e) => setField("pdfTermsText", e.target.value)}
                  placeholder="Ex: Os preços estão sujeitos a alteração. Prazo de entrega a combinar. Forma de pagamento: 50% na aprovação e 50% na entrega..."
                  rows={5}
                />
                <p className="text-xs text-slate-400 -mt-4">
                  Exibidos em uma seção dedicada no final do documento.
                </p>

                <Textarea
                  label="Texto do Rodapé"
                  value={form.pdfFooterText}
                  onChange={(e) => setField("pdfFooterText", e.target.value)}
                  placeholder="Ex: Agradecemos a preferência! Gráfica São João — Qualidade e compromisso desde 1990."
                  rows={3}
                />
                <p className="text-xs text-slate-400 -mt-4">
                  Texto pequeno exibido na última linha do PDF.
                </p>

                {/* Preview mini */}
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
                  <p className="text-xs font-semibold text-slate-500 mb-3 flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5" />
                    Prévia do Cabeçalho
                  </p>
                  <div
                    className="rounded-lg p-3 text-white text-xs"
                    style={{ backgroundColor: form.pdfAccentColor || "#f59e0b" }}
                  >
                    <div
                      className={`flex ${
                        form.pdfHeaderLayout === "centered"
                          ? "flex-col items-center"
                          : form.pdfHeaderLayout === "logo-right"
                          ? "flex-row-reverse"
                          : "flex-row"
                      } gap-3 items-center`}
                    >
                      {form.pdfShowLogo && form.pdfHeaderLayout !== "no-logo" && (
                        <div className="w-10 h-6 bg-white/30 rounded flex items-center justify-center text-[8px] font-bold">
                          LOGO
                        </div>
                      )}
                      <div
                        className={`${
                          form.pdfHeaderLayout === "centered" ? "text-center" : ""
                        }`}
                      >
                        <p className="font-bold text-sm leading-tight">
                          {form.companyName || "Nome da Gráfica"}
                        </p>
                        <p className="opacity-80 text-[9px]">
                          {form.pdfShowCnpj && form.cnpj ? `CNPJ: ${form.cnpj}` : ""}
                          {form.pdfShowPhone && form.phone ? ` · ${form.phone}` : ""}
                        </p>
                        {form.pdfShowEmail && form.email && (
                          <p className="opacity-80 text-[9px]">{form.email}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Seção 3: Categorias & Unidades ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Categorias */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <Tag className="h-5 w-5 text-orange-500" />
                <h3 className="font-semibold text-slate-900 flex-1">Categorias de Produtos</h3>
                <button
                  type="button"
                  onClick={() => { setShowCatForm(true); setCatEditing(null); setCatForm({ name: "", color: "#64748b" }); setCatError(""); }}
                  className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" /> Adicionar
                </button>
              </div>

              {/* Formulário inline */}
              {showCatForm && (
                <div className="mb-4 rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3 animate-slide-up">
                  <p className="text-xs font-semibold text-slate-600">
                    {catEditing ? "Editar categoria" : "Nova categoria"}
                  </p>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        label=""
                        placeholder="Nome da categoria"
                        value={catForm.name}
                        onChange={(e) => setCatForm((f) => ({ ...f, name: e.target.value }))}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-slate-500">Cor</label>
                      <input
                        type="color"
                        value={catForm.color}
                        onChange={(e) => setCatForm((f) => ({ ...f, color: e.target.value }))}
                        className="h-9 w-12 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                      />
                    </div>
                  </div>
                  {catError && <p className="text-xs text-red-600">{catError}</p>}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={saveCategory}
                      disabled={catSaving}
                      className="flex-1 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 disabled:opacity-60 transition-colors"
                    >
                      {catSaving ? "Salvando..." : catEditing ? "Salvar" : "Criar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowCatForm(false); setCatEditing(null); setCatError(""); }}
                      className="px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Lista */}
              {catLoading ? (
                <div className="flex justify-center py-6">
                  <div className="animate-spin h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full" />
                </div>
              ) : categories.length === 0 ? (
                <p className="text-center text-sm text-slate-400 py-6">Nenhuma categoria cadastrada.</p>
              ) : (
                <ul className="space-y-1.5">
                  {categories.map((cat) => (
                    <li key={cat.id} className="flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-slate-50 group transition-colors">
                      <span
                        className="h-3 w-3 rounded-full flex-shrink-0 border border-white shadow-sm"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className={`flex-1 text-sm font-medium ${ cat.active ? 'text-slate-700' : 'text-slate-400 line-through'}`}>
                        {cat.name}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => startEditCat(cat)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Editar"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteCategory(cat.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-xs text-slate-400 mt-4 text-center">
                {categories.length} categoria{categories.length !== 1 ? "s" : ""} cadastrada{categories.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Unidades */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <Ruler className="h-5 w-5 text-cyan-500" />
                <h3 className="font-semibold text-slate-900 flex-1">Unidades de Medida</h3>
                <button
                  type="button"
                  onClick={() => { setShowUnitForm(true); setUnitEditing(null); setUnitForm({ name: "", abbreviation: "" }); setUnitError(""); }}
                  className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" /> Adicionar
                </button>
              </div>

              {/* Formulário inline */}
              {showUnitForm && (
                <div className="mb-4 rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3 animate-slide-up">
                  <p className="text-xs font-semibold text-slate-600">
                    {unitEditing ? "Editar unidade" : "Nova unidade"}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label=""
                      placeholder="Nome (ex: Metro quadrado)"
                      value={unitForm.name}
                      onChange={(e) => setUnitForm((f) => ({ ...f, name: e.target.value }))}
                    />
                    <Input
                      label=""
                      placeholder="Abrev. (ex: m²)"
                      value={unitForm.abbreviation}
                      onChange={(e) => setUnitForm((f) => ({ ...f, abbreviation: e.target.value }))}
                    />
                  </div>
                  {unitError && <p className="text-xs text-red-600">{unitError}</p>}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={saveUnit}
                      disabled={unitSaving}
                      className="flex-1 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 disabled:opacity-60 transition-colors"
                    >
                      {unitSaving ? "Salvando..." : unitEditing ? "Salvar" : "Criar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowUnitForm(false); setUnitEditing(null); setUnitError(""); }}
                      className="px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Lista */}
              {unitLoading ? (
                <div className="flex justify-center py-6">
                  <div className="animate-spin h-5 w-5 border-2 border-cyan-500 border-t-transparent rounded-full" />
                </div>
              ) : units.length === 0 ? (
                <p className="text-center text-sm text-slate-400 py-6">Nenhuma unidade cadastrada.</p>
              ) : (
                <ul className="space-y-1.5">
                  {units.map((unit) => (
                    <li key={unit.id} className="flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-slate-50 group transition-colors">
                      <span className="inline-flex items-center justify-center h-6 w-10 rounded-md bg-cyan-100 text-cyan-700 text-xs font-bold flex-shrink-0">
                        {unit.abbreviation}
                      </span>
                      <span className={`flex-1 text-sm font-medium ${ unit.active ? 'text-slate-700' : 'text-slate-400 line-through'}`}>
                        {unit.name}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => startEditUnit(unit)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Editar"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteUnit(unit.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-xs text-slate-400 mt-4 text-center">
                {units.length} unidade{units.length !== 1 ? "s" : ""} cadastrada{units.length !== 1 ? "s" : ""}
              </p>
            </div>

          </div>

          {/* Dica Informativa */}
          <div className="rounded-2xl bg-indigo-50/50 border border-indigo-100 p-4 flex gap-3">
            <Info className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-indigo-950">
              <p className="font-semibold">Onde essas informações aparecem?</p>
              <ul className="list-disc list-inside text-xs mt-1.5 space-y-1 text-slate-600">
                <li>
                  O <strong>Nome do Sistema</strong> muda o título na aba do navegador, na tela de
                  login e no topo da Sidebar.
                </li>
                <li>
                  Os <strong>Dados Corporativos</strong> aparecem no cabeçalho de todos os
                  orçamentos emitidos.
                </li>
                <li>
                  As <strong>Configurações do PDF</strong> definem o visual, textos e informações
                  visíveis nos orçamentos gerados.
                </li>
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
