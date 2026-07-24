"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Package, 
  Wrench, 
  AlertOctagon, 
  TableProperties, 
  TrendingUp, 
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";

// --- Mock Data ---
const kpiData = {
  produtosAtivos: 1240,
  produtosInativos: 85,
  servicosCadastrados: 42,
  produtosSemEstoque: 18,
  tabelasVigentes: 3
};

const barChartData = [
  { name: "Eletrônicos", ativos: 400, inativos: 24 },
  { name: "Informática", ativos: 300, inativos: 13 },
  { name: "Móveis", ativos: 200, inativos: 38 },
  { name: "Escritório", ativos: 278, inativos: 10 },
  { name: "Serviços", ativos: 42, inativos: 0 },
];

const pieChartData = [
  { name: "Com Estoque", value: 1222, color: "#10b981" },
  { name: "Sem Estoque", value: 18, color: "#ef4444" },
];

const lineChartData = [
  { name: "Jan", cadastros: 40 },
  { name: "Fev", cadastros: 30 },
  { name: "Mar", cadastros: 20 },
  { name: "Abr", cadastros: 27 },
  { name: "Mai", cadastros: 18 },
  { name: "Jun", cadastros: 23 },
  { name: "Jul", cadastros: 34 },
];

// --- Components ---

function KpiCard({ title, value, icon, trend, trendValue, colorClass, href }: any) {
  const CardWrapper = href ? (props: any) => <Link href={href} {...props} /> : (props: any) => <div {...props} />;
  
  return (
    <CardWrapper className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all group cursor-pointer block relative overflow-hidden">
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-slate-100/50 to-transparent rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150" />
      <div className="flex justify-between items-start mb-4 relative">
        <div className={`p-3 rounded-lg ${colorClass}`}>
          {icon}
        </div>
        <button className="text-slate-400 hover:text-indigo-500 transition-colors">
          {href ? <ArrowUpRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" /> : <MoreHorizontal className="h-5 w-5" />}
        </button>
      </div>
      <div className="relative">
        <p className="text-slate-500 text-sm font-medium group-hover:text-indigo-600 transition-colors">{title}</p>
        <h3 className="text-3xl font-bold text-slate-800 mt-1">{value}</h3>
      </div>
      {trend && (
        <div className={`flex items-center gap-1 mt-4 text-sm font-medium ${trend === 'up' ? 'text-emerald-600' : 'text-red-500'} relative`}>
          {trend === 'up' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
          <span>{trendValue} vs mês passado</span>
        </div>
      )}
    </CardWrapper>
  );
}

export function KpiMetricsView() {
  const [mounted, setMounted] = useState(true);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Resumo do Catálogo</h2>
          <p className="text-sm text-slate-500">Métricas atualizadas em tempo real sobre seus produtos e serviços.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600 font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <TrendingUp className="h-4 w-4 text-indigo-500" />
          Status Geral: <span className="text-emerald-600">Saudável</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard 
          title="Produtos Ativos" 
          value={kpiData.produtosAtivos.toLocaleString()} 
          icon={<Package className="h-6 w-6 text-emerald-600" />} 
          trend="up"
          trendValue="+12%"
          colorClass="bg-emerald-500/10 text-emerald-700"
          href="/catalogo/produtos/informacoes-basicas"
        />
        <KpiCard 
          title="Serviços" 
          value={kpiData.servicosCadastrados} 
          icon={<Wrench className="h-6 w-6 text-violet-600" />} 
          trend="up"
          trendValue="+2%"
          colorClass="bg-violet-500/10 text-violet-700"
          href="/catalogo/servicos/informacoes-basicas"
        />
        <KpiCard 
          title="Sem Estoque" 
          value={kpiData.produtosSemEstoque} 
          icon={<AlertOctagon className="h-6 w-6 text-red-600" />} 
          trend="down"
          trendValue="-5%"
          colorClass="bg-red-500/10 text-red-700"
          href="/catalogo/produtos/informacoes-basicas"
        />
        <KpiCard 
          title="Tabelas Vigentes" 
          value={kpiData.tabelasVigentes} 
          icon={<TableProperties className="h-6 w-6 text-indigo-600" />} 
          colorClass="bg-indigo-500/10 text-indigo-700"
          href="/catalogo/precificacao/gestao-tabelas"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bar Chart - Distribuição */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm lg:col-span-2">
          <div className="mb-6">
            <h3 className="text-base font-semibold text-slate-800">Distribuição por Departamento</h3>
            <p className="text-sm text-slate-500">Produtos ativos e inativos segmentados por árvore de categoria principal.</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#f8fafc', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)' }}
                  itemStyle={{ color: '#e2e8f0' }}
                  labelStyle={{ color: '#f8fafc', fontWeight: 600, paddingBottom: '4px' }}
                />
                <Bar dataKey="ativos" name="Ativos" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} />
                <Bar dataKey="inativos" name="Inativos" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie & Line Charts */}
        <div className="space-y-6 flex flex-col justify-between">
          
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex-1">
             <div className="mb-2">
              <h3 className="text-base font-semibold text-slate-800">Saúde do Estoque</h3>
            </div>
            <div className="h-[160px] w-full relative flex items-center justify-center">
               <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-\${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#f8fafc', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)' }}
                    itemStyle={{ color: '#e2e8f0' }}
                    labelStyle={{ color: '#f8fafc', fontWeight: 600 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col mt-2">
                <span className="text-2xl font-bold text-slate-800">98%</span>
                <span className="text-[10px] uppercase font-semibold text-emerald-600 tracking-wider">Com Estoque</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex-1">
             <div className="mb-4">
              <h3 className="text-base font-semibold text-slate-800">Ritmo de Cadastros</h3>
            </div>
            <div className="h-[140px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} dy={5} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#f8fafc', padding: '8px 12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)' }}
                    itemStyle={{ color: '#e2e8f0' }}
                    labelStyle={{ color: '#f8fafc', fontWeight: 600, paddingBottom: '4px' }}
                  />
                  <Line type="monotone" dataKey="cadastros" name="Novos Itens" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
