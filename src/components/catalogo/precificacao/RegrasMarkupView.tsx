"use client";

import React, { useState } from "react";
import { 
  Calculator, 
  Plus, 
  Trash2,
  Check,
  TrendingUp,
  Percent
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

// --- Types & Mocks ---
interface CostComponent {
  id: string;
  name: string;
  percentage: number;
  type: "imposto" | "taxa" | "comissao" | "lucro";
}

const initialComponents: CostComponent[] = [
  { id: "c1", name: "Simples Nacional", percentage: 6.0, type: "imposto" },
  { id: "c2", name: "Taxa de Cartão (Crédito)", percentage: 3.5, type: "taxa" },
  { id: "c3", name: "Comissão Vendedor", percentage: 2.0, type: "comissao" },
  { id: "c4", name: "Margem de Lucro Desejada", percentage: 30.0, type: "lucro" },
];

const COLORS = {
  imposto: "#ef4444",   // red-500
  taxa: "#f59e0b",      // amber-500
  comissao: "#3b82f6",  // blue-500
  lucro: "#10b981",     // emerald-500
  custo_base: "#64748b" // slate-500
};

export function RegrasMarkupView() {
  const [components, setComponents] = useState<CostComponent[]>(initialComponents);
  const [newCompName, setNewCompName] = useState("");
  const [newCompPerc, setNewCompPerc] = useState<number>(0);
  const [newCompType, setNewCompType] = useState<CostComponent["type"]>("imposto");

  // O Total do preço de venda é 100%. 
  // O Custo Base do produto (Material + Mão de obra) ocupa a fatia que sobra.
  const totalDeductions = components.reduce((acc, curr) => acc + curr.percentage, 0);
  const custoBasePercentage = 100 - totalDeductions;

  // O Multiplicador de Markup é o fator que você multiplica pelo custo para chegar no preço de venda.
  // Formula: Preço de Venda = Custo Base / (1 - (Total Deduções / 100))
  // Logo, Markup = 1 / (1 - (Total Deduções / 100))
  const markupMultiplier = custoBasePercentage > 0 ? (1 / (custoBasePercentage / 100)) : 0;

  const chartData = [
    { name: "Custo do Produto (Insumos/Mão de Obra)", value: custoBasePercentage, type: "custo_base" },
    ...components.map(c => ({ name: c.name, value: c.percentage, type: c.type }))
  ];

  const handleAddComponent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompName || newCompPerc <= 0) return;
    
    // Valida se não vai estourar 100%
    if (totalDeductions + newCompPerc >= 100) {
      alert("As deduções e margem não podem somar ou ultrapassar 100% do preço de venda.");
      return;
    }

    setComponents([...components, {
      id: Math.random().toString(),
      name: newCompName,
      percentage: newCompPerc,
      type: newCompType
    }]);

    setNewCompName("");
    setNewCompPerc(0);
  };

  const removeComponent = (id: string) => {
    setComponents(components.filter(c => c.id !== id));
  };

  return (
    <div className="max-w-6xl mx-auto pb-10 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <Calculator className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Simulador de Markup</h2>
            <p className="text-sm text-slate-500">Crie regras matemáticas universais para calcular preços de venda automaticamente.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Painel Esquerdo: Construtor */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Plus className="h-4 w-4 text-blue-500" /> Adicionar Variável
            </h3>
          </div>
          
          <div className="p-5">
            <form onSubmit={handleAddComponent} className="space-y-4">
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-12 sm:col-span-6">
                  <label className="block text-xs font-medium text-slate-700 mb-1">Nome da Variável</label>
                  <input 
                    type="text" 
                    value={newCompName}
                    onChange={e => setNewCompName(e.target.value)}
                    placeholder="Ex: Embalagem Extra..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                  />
                </div>
                <div className="col-span-6 sm:col-span-3">
                  <label className="block text-xs font-medium text-slate-700 mb-1">Tipo</label>
                  <select 
                    value={newCompType}
                    onChange={e => setNewCompType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                  >
                    <option value="imposto">Imposto</option>
                    <option value="taxa">Taxa</option>
                    <option value="comissao">Comissão</option>
                    <option value="lucro">Lucro</option>
                  </select>
                </div>
                <div className="col-span-6 sm:col-span-3">
                  <label className="block text-xs font-medium text-slate-700 mb-1">Impacto (%)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      step="0.1"
                      value={newCompPerc || ""}
                      onChange={e => setNewCompPerc(parseFloat(e.target.value))}
                      className="w-full pl-3 pr-8 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm font-bold text-blue-700"
                    />
                    <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  </div>
                </div>
              </div>
              <button 
                type="submit" 
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" /> Inserir no Cálculo
              </button>
            </form>

            <div className="mt-8 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Composição do Preço de Venda</h4>
              
              {components.map(c => (
                <div key={c.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg bg-white shadow-sm group hover:border-slate-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[c.type] }} 
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-800">{c.name}</p>
                      <p className="text-[10px] text-slate-500 uppercase">{c.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono font-bold text-slate-700">{c.percentage.toFixed(1)}%</span>
                    <button 
                      onClick={() => removeComponent(c.id)}
                      className="text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              
              {/* Custo Base Implícito */}
              <div className="flex items-center justify-between p-3 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50 opacity-80">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-800">Custo Base (Insumos/Mão de Obra)</p>
                    <p className="text-[10px] text-slate-500 uppercase">Calculado pelo sistema</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono font-bold text-slate-500">{custoBasePercentage.toFixed(1)}%</span>
                  <div className="w-4" /> {/* Spacer */}
                </div>
              </div>

            </div>
          </div>
          
          <div className="mt-auto border-t border-slate-100 p-4 bg-slate-50 flex justify-end">
            <button className="px-6 py-2 flex items-center gap-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm">
              <Check className="h-4 w-4" /> Salvar Regra de Markup
            </button>
          </div>
        </div>

        {/* Painel Direito: Gráfico e Resultado */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 bg-blue-50/50 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-slate-800">Simulação Visual</h3>
          </div>
          
          <div className="flex-1 p-6 flex flex-col items-center justify-center relative min-h-[300px]">
            {custoBasePercentage <= 0 ? (
              <div className="text-center p-6 bg-red-50 rounded-xl border border-red-100">
                <p className="text-red-600 font-bold">Atenção: Margem Negativa</p>
                <p className="text-sm text-red-500 mt-1">As deduções somam {totalDeductions}%. O preço de venda não cobrirá sequer o custo base.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.type as keyof typeof COLORS]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [`${Number(value).toFixed(1)}%`, 'Participação no Preço']}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="p-6 bg-slate-800 text-white rounded-t-xl mx-4 mt-auto mb-0 transform translate-y-2">
            <p className="text-sm text-slate-300 font-medium mb-1">Multiplicador de Markup Recomendado</p>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-bold text-blue-400 font-mono">
                {markupMultiplier.toFixed(2)}x
              </span>
              <span className="text-sm text-slate-400 mb-1">
                (Multiplique seu custo por este valor para aplicar a regra)
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
