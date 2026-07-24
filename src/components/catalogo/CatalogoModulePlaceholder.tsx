import React from "react";
import { AlertCircle, Server, Code, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface CatalogoModulePlaceholderProps {
  title: string;
  subtitle: string;
  description: string;
  color?: "slate" | "sky" | "emerald" | "violet" | "orange" | "cyan" | "red" | "pink" | "amber" | "indigo";
  moduleId: string;
  apiEndpoint?: string;
  features?: { label: string; description: string; icon?: React.ReactNode }[];
  moduleIcon?: React.ReactNode;
}

const colorMap = {
  slate: { bg: "bg-slate-50", text: "text-slate-900", border: "border-slate-200", badge: "bg-slate-100 text-slate-700", icon: "text-slate-500", gradient: "from-slate-600 to-slate-900" },
  sky: { bg: "bg-sky-50", text: "text-sky-900", border: "border-sky-200", badge: "bg-sky-100 text-sky-700", icon: "text-sky-500", gradient: "from-sky-500 to-sky-700" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-900", border: "border-emerald-200", badge: "bg-emerald-100 text-emerald-700", icon: "text-emerald-500", gradient: "from-emerald-500 to-emerald-700" },
  violet: { bg: "bg-violet-50", text: "text-violet-900", border: "border-violet-200", badge: "bg-violet-100 text-violet-700", icon: "text-violet-500", gradient: "from-violet-500 to-violet-700" },
  orange: { bg: "bg-orange-50", text: "text-orange-900", border: "border-orange-200", badge: "bg-orange-100 text-orange-700", icon: "text-orange-500", gradient: "from-orange-500 to-orange-700" },
  cyan: { bg: "bg-cyan-50", text: "text-cyan-900", border: "border-cyan-200", badge: "bg-cyan-100 text-cyan-700", icon: "text-cyan-500", gradient: "from-cyan-500 to-cyan-700" },
  red: { bg: "bg-red-50", text: "text-red-900", border: "border-red-200", badge: "bg-red-100 text-red-700", icon: "text-red-500", gradient: "from-red-500 to-red-700" },
  pink: { bg: "bg-pink-50", text: "text-pink-900", border: "border-pink-200", badge: "bg-pink-100 text-pink-700", icon: "text-pink-500", gradient: "from-pink-500 to-pink-700" },
  amber: { bg: "bg-amber-50", text: "text-amber-900", border: "border-amber-200", badge: "bg-amber-100 text-amber-700", icon: "text-amber-500", gradient: "from-amber-500 to-amber-700" },
  indigo: { bg: "bg-indigo-50", text: "text-indigo-900", border: "border-indigo-200", badge: "bg-indigo-100 text-indigo-700", icon: "text-indigo-500", gradient: "from-indigo-600 to-indigo-900" },
};

export default function CatalogoModulePlaceholder({
  title,
  subtitle,
  description,
  color = "indigo",
  moduleId,
  apiEndpoint,
  features,
  moduleIcon,
}: CatalogoModulePlaceholderProps) {
  const theme = colorMap[color];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Banner de Apresentação */}
      <div className={cn("relative overflow-hidden rounded-2xl bg-gradient-to-br shadow-md text-white p-8", theme.gradient)}>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider bg-white/20 backdrop-blur-md rounded-full border border-white/10">
                {subtitle}
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-emerald-500/20 text-emerald-50 backdrop-blur-md rounded-full border border-emerald-500/30">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Planejado
              </span>
            </div>
            
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              {moduleIcon && <span className="opacity-90">{moduleIcon}</span>}
              {title}
            </h1>
            
            <p className="text-white/80 text-lg leading-relaxed">
              {description}
            </p>
          </div>

          <div className="hidden md:flex p-4 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl flex-col items-center justify-center text-center max-w-[200px]">
            <Code className="h-8 w-8 mb-2 opacity-70" />
            <p className="text-sm font-medium">Módulo Arquitetado</p>
            <p className="text-xs text-white/60 mt-1">ID: {moduleId}</p>
          </div>
        </div>
      </div>

      {/* Grid de Funcionalidades */}
      {features && features.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-slate-400" />
            Escopo Planejado para este Módulo
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, idx) => (
              <div key={idx} className={cn("p-5 rounded-xl border bg-white shadow-sm transition-all hover:shadow-md", theme.border)}>
                <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center mb-4", theme.bg, theme.text)}>
                  {feature.icon || <ArrowRight className="h-5 w-5" />}
                </div>
                <h3 className="font-medium text-slate-800 mb-2">{feature.label}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detalhes de Integração / API */}
      {apiEndpoint && (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex items-center gap-3">
            <Server className="h-5 w-5 text-slate-500" />
            <h3 className="font-semibold text-slate-700">Microsserviço Preparado</h3>
          </div>
          <div className="p-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">O endpoint base para este módulo já foi reservado na arquitetura.</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-green-100 text-green-700 border border-green-200">GET</span>
                <code className="text-sm font-mono text-slate-800 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                  {apiEndpoint}
                </code>
              </div>
            </div>
            <Link 
              href={apiEndpoint} 
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
            >
              Testar Endpoint Base
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
