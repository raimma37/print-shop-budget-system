"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await login(email, password);
    
    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 relative overflow-hidden">
      {/* Background Decorativo */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md p-8 sm:p-10 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-3xl shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-500/20 text-amber-600 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">GráfikaORC</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm text-center">
            Acesso Restrito. Por favor, identifique-se para continuar.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <Input 
            label="E-mail"
            type="email" 
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          
          <Input 
            label="Senha"
            type="password" 
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400 text-center animate-in fade-in zoom-in duration-300">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            variant="primary" 
            className="w-full h-12 text-base font-semibold rounded-xl mt-2" 
            loading={loading}
          >
            {loading ? "Autenticando..." : "Entrar no Sistema"}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 text-center">
          <p className="text-xs text-slate-400">
            Sistema protegido de ponta a ponta. Conformidade LGPD ativa.
          </p>
        </div>
      </div>
    </div>
  );
}
