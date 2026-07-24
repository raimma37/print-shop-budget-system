"use client";

import React from "react";
import { 
  Activity, 
  TrendingDown, 
  Calendar,
  Clock,
  Layers,
  CheckCircle2,
  AlertOctagon
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";

const cfdData = [
  { name: 'Seg', aFazer: 40, emAndamento: 24, concluido: 10 },
  { name: 'Ter', aFazer: 30, emAndamento: 30, concluido: 20 },
  { name: 'Qua', aFazer: 20, emAndamento: 35, concluido: 35 },
  { name: 'Qui', aFazer: 27, emAndamento: 20, concluido: 50 },
  { name: 'Sex', aFazer: 18, emAndamento: 15, concluido: 65 },
  { name: 'Sáb', aFazer: 23, emAndamento: 10, concluido: 75 },
  { name: 'Dom', aFazer: 20, emAndamento: 5, concluido: 80 },
];

const leadTimeData = [
  { setor: 'Grandes Formatos', dias: 4.2 },
  { setor: 'Offset', dias: 8.5 },
  { setor: 'Recorte Vinil', dias: 2.1 },
  { setor: 'Design (Artes)', dias: 1.5 },
  { setor: 'Instalação', dias: 5.0 },
];

export function AnalyticsKanbanView() {
  return (
    <div className="max-w-6xl mx-auto pb-10 animate-fade-in">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-fuchsia-100 text-fuchsia-600 rounded-lg">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Métricas Ágeis</h2>
            <p className="text-sm text-slate-500">Analise gargalos, tempo de entrega e saúde do fluxo de trabalho.</p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 px-4 py-2 rounded-lg transition-colors shadow-sm">
            <Calendar className="h-4 w-4" />
            Últimos 7 Dias
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 text-slate-500 font-medium mb-3">
            <Clock className="h-4 w-4 text-fuchsia-500" /> Lead Time Médio
          </div>
          <div className="text-3xl font-black text-slate-800 mb-1">3.4 dias</div>
          <p className="text-xs text-emerald-500 font-bold flex items-center gap-1">
            <TrendingDown className="h-3 w-3" /> -12% vs. semana anterior
          </p>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 text-slate-500 font-medium mb-3">
            <Layers className="h-4 w-4 text-blue-500" /> Cycle Time Médio
          </div>
          <div className="text-3xl font-black text-slate-800 mb-1">1.8 dias</div>
          <p className="text-xs text-slate-400">Tempo ativo de execução</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 text-slate-500 font-medium mb-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Tarefas Entregues
          </div>
          <div className="text-3xl font-black text-slate-800 mb-1">142 un</div>
          <p className="text-xs text-emerald-500 font-bold flex items-center gap-1">
            <TrendingDown className="h-3 w-3 rotate-180" /> +5% vs. semana anterior
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 text-slate-500 font-medium mb-3">
            <AlertOctagon className="h-4 w-4 text-red-500" /> Tarefas Atrasadas
          </div>
          <div className="text-3xl font-black text-red-600 mb-1">8 un</div>
          <p className="text-xs text-red-500 font-bold">12% do total ativo</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gráfico 1: Diagrama de Fluxo Cumulativo (CFD) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-1">Diagrama de Fluxo Cumulativo (CFD)</h3>
          <p className="text-xs text-slate-500 mb-6">Visualização da estabilidade do processo e acúmulo de gargalos.</p>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={cfdData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="concluido" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.8} name="Concluído" />
                <Area type="monotone" dataKey="emAndamento" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.8} name="Em Andamento" />
                <Area type="monotone" dataKey="aFazer" stackId="1" stroke="#cbd5e1" fill="#cbd5e1" fillOpacity={0.8} name="A Fazer (Backlog)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Lead Time por Setor */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-1">Lead Time por Departamento</h3>
          <p className="text-xs text-slate-500 mb-6">Tempo médio (em dias) que os pedidos levam para serem concluídos por setor.</p>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={leadTimeData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="setor" type="category" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="dias" name="Dias Corridos" fill="#d946ef" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
