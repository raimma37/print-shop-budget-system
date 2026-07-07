"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Printer, Eye, EyeOff, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

const THEME_CLASSES: Record<string, { logoBg: string; buttonBg: string; text: string; bgSoft: string }> = {
  amber: {
    logoBg: "bg-amber-500 shadow-amber-900/30",
    buttonBg: "bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white",
    text: "text-amber-700",
    bgSoft: "bg-amber-50 border-amber-200",
  },
  indigo: {
    logoBg: "bg-indigo-600 shadow-indigo-950/30",
    buttonBg: "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white",
    text: "text-indigo-700",
    bgSoft: "bg-indigo-50 border-indigo-200",
  },
  emerald: {
    logoBg: "bg-emerald-600 shadow-emerald-950/30",
    buttonBg: "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white",
    text: "text-emerald-700",
    bgSoft: "bg-emerald-50 border-emerald-200",
  },
  violet: {
    logoBg: "bg-violet-600 shadow-violet-950/30",
    buttonBg: "bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white",
    text: "text-violet-700",
    bgSoft: "bg-violet-50 border-violet-200",
  },
  slate: {
    logoBg: "bg-slate-600 shadow-slate-900/30",
    buttonBg: "bg-slate-600 hover:bg-slate-700 active:bg-slate-800 text-white",
    text: "text-slate-700",
    bgSoft: "bg-slate-50 border-slate-200",
  },
};


export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("admin@grafika.com");
  const [password, setPassword] = useState("grafika123");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [settings, setSettings] = useState({
    appName: "GráfikaORC",
    logoUrl: "",
    themeColor: "amber",
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          setSettings({
            appName: data.appName ?? "GráfikaORC",
            logoUrl: data.logoUrl ?? "",
            themeColor: data.themeColor ?? "amber",
          });
        }
      })
      .catch((err) => console.error("Erro ao carregar configurações no Login:", err));
  }, []);

  const theme = THEME_CLASSES[settings.themeColor] ?? THEME_CLASSES.amber;


  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const result = await login(email, password);
    if (result.error) {
      setError(result.error);
      setSubmitting(false);
    } else {
      router.push("/dashboard");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-900">
      {/* ── Painel esquerdo – branding ─────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center relative overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-amber-500/30 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full bg-orange-400/20 blur-3xl" />
        </div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative z-10 text-center px-12 max-w-md">
          {settings.logoUrl ? (
            <img src={settings.logoUrl} alt={settings.appName} className="h-20 w-auto object-contain mx-auto mb-8 drop-shadow-xl" />
          ) : (
            <div className={cn("flex h-20 w-20 items-center justify-center rounded-2xl mx-auto mb-8 shadow-xl", theme.logoBg)}>
              <Printer className="h-10 w-10 text-white" />
            </div>
          )}
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">{settings.appName}</h1>
          <p className="text-slate-400 text-lg leading-relaxed mb-12">
            Sistema profissional de orçamentos<br />para comunicação visual
          </p>

          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: <Layers className="h-5 w-5 text-amber-400" />, label: "Organizado", desc: "Tudo em um lugar" },
              { icon: <Printer className="h-5 w-5 text-amber-400" />, label: "Ágil", desc: "Orçamentos rápidos" },
              { icon: <Eye className="h-5 w-5 text-amber-400" />, label: "Claro", desc: "Visão completa" },
            ].map((item) => (
              <div key={item.label} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10">
                <div className="flex justify-center mb-2">{item.icon}</div>
                <p className="text-white font-semibold text-sm">{item.label}</p>
                <p className="text-slate-400 text-xs mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Painel direito – formulário ────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt={settings.appName} className="h-10 w-auto object-contain rounded-lg" />
            ) : (
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", theme.logoBg.split(" ")[0])}>
                <Printer className="h-5 w-5 text-white" />
              </div>
            )}
            <span className="text-xl font-bold text-slate-900">{settings.appName}</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Entrar na conta</h2>
            <p className="text-slate-500 text-sm">Use suas credenciais para acessar o sistema</p>
          </div>

          {/* Demo hint */}
          <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 p-3.5">
            <p className="text-xs font-semibold text-amber-800 mb-1.5">🎯 Acesso de demonstração:</p>
            <div className="space-y-0.5">
              <p className="text-xs text-amber-700 font-mono">admin@grafika.com / grafika123</p>
              <p className="text-xs text-amber-600 font-mono">carlos@grafika.com / grafika123</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="E-mail"
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              autoComplete="email"
            />

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">
                Senha <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 pr-10 hover:border-slate-300 transition-colors"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div role="alert" className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                <p className="text-sm text-red-700">⚠ {error}</p>
              </div>
            )}

            <Button type="submit" className={cn("w-full mt-2", theme.buttonBg)} size="lg" loading={submitting}>
              {submitting ? "Entrando..." : "Entrar no sistema"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
