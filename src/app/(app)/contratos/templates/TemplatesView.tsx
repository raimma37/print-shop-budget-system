"use client";

import { useState } from "react";
import { Upload, Loader2, FileCheck, X } from "lucide-react";
import { useRouter } from "next/navigation";

export function TemplatesView() {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      if (!name) {
        setName(e.target.files[0].name.replace(".docx", ""));
      }
      setError(null);
      setSuccess(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return setError("Selecione um arquivo DOCX.");
    if (!name) return setError("Dê um nome ao modelo.");
    if (!file.name.endsWith(".docx")) return setError("Apenas arquivos .docx são suportados.");

    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", name);

    try {
      const res = await fetch("/api/contratos/templates", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao fazer upload");
      }

      setSuccess(`Modelo cadastrado com sucesso! ${data.tagsCount} tags encontradas.`);
      setFile(null);
      setName("");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm flex items-start gap-2">
          <X className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-400 text-sm flex items-start gap-2">
          <FileCheck className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">Arquivo (.docx)</label>
        <div className="relative">
          <input
            type="file"
            accept=".docx"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="flex items-center justify-center w-full px-4 py-4 border-2 border-dashed border-slate-700 rounded-lg cursor-pointer bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
          >
            <div className="text-center">
              <Upload className="mx-auto h-6 w-6 text-slate-500 mb-2" />
              <span className="text-sm text-slate-300 font-medium">
                {file ? file.name : "Clique para selecionar o arquivo"}
              </span>
            </div>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">Nome de Exibição</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
          placeholder="Ex: Contrato de Aluguel Padrão"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !file}
        className="w-full inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors bg-sky-600 text-white hover:bg-sky-500 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed gap-2"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {loading ? "Processando..." : "Salvar Modelo"}
      </button>
    </form>
  );
}
