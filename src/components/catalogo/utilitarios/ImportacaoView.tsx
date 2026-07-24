"use client";

import React, { useState, useRef } from "react";
import { 
  UploadCloud, 
  FileSpreadsheet, 
  Download,
  AlertCircle,
  CheckCircle2,
  ListRestart
} from "lucide-react";

export function ImportacaoView() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleDownloadTemplate = () => {
    const csvContent = "SKU,Nome,Categoria,Custo,Preco_Venda,Estoque,Unidade,NCM\nSKU001,Copo Acrílico,Brindes,1.50,3.50,500,UN,39241000";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "modelo_importacao.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto pb-10 animate-fade-in">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
            <ListRestart className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Importação em Massa</h2>
            <p className="text-sm text-slate-500">Migre seus produtos e serviços via planilhas de forma rápida.</p>
          </div>
        </div>
        <button onClick={handleDownloadTemplate} className="flex items-center gap-2 text-sm font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 px-4 py-2 rounded-lg transition-colors border border-amber-200">
          <Download className="h-4 w-4" />
          Baixar Planilha Modelo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Lado Esquerdo: Instruções */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" /> Instruções
            </h3>
            <ul className="text-sm text-slate-600 space-y-3">
              <li className="flex gap-2">
                <span className="font-bold text-slate-400">1.</span> 
                Baixe a planilha modelo no botão acima.
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-slate-400">2.</span> 
                Preencha os dados (SKU, Nome, Custo, NCM, etc). Não altere o nome das colunas.
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-slate-400">3.</span> 
                Salve o arquivo no formato <strong>.xlsx</strong> ou <strong>.csv</strong>.
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-slate-400">4.</span> 
                Arraste o arquivo para a área ao lado e aguarde a validação.
              </li>
            </ul>
          </div>
        </div>

        {/* Lado Direito: Dropzone */}
        <div className="md:col-span-2">
          {!file ? (
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-12 transition-all min-h-[300px] bg-white
                ${isDragging ? 'border-amber-500 bg-amber-50 scale-[1.02]' : 'border-slate-300 hover:border-amber-400 hover:bg-slate-50'}
              `}
            >
              <div className="p-4 bg-slate-100 rounded-full mb-4 text-slate-400">
                <UploadCloud className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-700">Arraste seu arquivo aqui</h3>
              <p className="text-slate-500 text-sm mt-1 text-center max-w-xs">
                ou clique para selecionar do seu computador. Apenas arquivos .XLSX ou .CSV
              </p>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                className="hidden" 
              />
              <button onClick={handleBrowseClick} className="mt-6 px-6 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
                Procurar Arquivo
              </button>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm text-center flex flex-col items-center min-h-[300px] justify-center animate-scale-in">
              <div className="p-4 bg-emerald-100 rounded-full mb-4 text-emerald-600 relative">
                <FileSpreadsheet className="h-10 w-10" />
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-slate-800">Arquivo Carregado!</h3>
              <p className="text-sm font-mono text-slate-500 mt-2 bg-slate-100 px-3 py-1 rounded-md">
                {file.name}
              </p>
              
              <div className="mt-8 flex gap-3">
                <button onClick={resetFile} className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                  Cancelar
                </button>
                <button className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-bold transition-colors shadow-sm">
                  Validar e Importar
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
