"use client";

import { useState, useMemo } from "react";
import { ptBR } from "date-fns/locale";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Loader2, FileCheck, X, FileSignature, MapPin, TextCursorInput } from "lucide-react";
import { DocumentTemplate } from "@/db/schema";

interface Props {
  templates: DocumentTemplate[];
}

// Utilitários de Máscara
const maskCPF_CNPJ = (val: string) => {
  const v = val.replace(/\D/g, '');
  if (v.length <= 11) {
    return v.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1');
  }
  return v.replace(/(\d{2})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1/$2').replace(/(\d{4})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1');
};

const maskCEP = (val: string) => {
  return val.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{3})\d+?$/, '$1');
};

const maskMoney = (val: string) => {
  let num = val.replace(/\D/g, '');
  if (!num) return '';
  num = (parseInt(num) / 100).toFixed(2);
  return num.replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export function FormularioContratoView({ templates }: Props) {
  const [templateId, setTemplateId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultFileUrl, setResultFileUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const selectedTemplate = useMemo(() => {
    return templates.find(t => t.id.toString() === templateId);
  }, [templateId, templates]);

  // Váriaveis automáticas geradas no backend, não exigem input.
  const AUTO_VARS = ["DIA", "MES", "ANO", "DATA_ATUAL", "DATA_EXTENSA", "LOCAL_E_DATA"];

  const requiredTags = useMemo(() => {
    if (!selectedTemplate) return [];
    try {
      const parsed = JSON.parse(selectedTemplate.requiredTags) as string[];
      // Filtra as vars auto
      return parsed.filter(tag => !AUTO_VARS.includes(tag));
    } catch (e) {
      return [];
    }
  }, [selectedTemplate]);

  const fetchCEP = async (cep: string, fieldName: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          // Tenta preencher automaticamente campos de endereço correlatos se eles existirem na lista de tags
          const newData = { ...formData };
          
          // Heurística básica: Se a tag tem "LOCADOR", preenche ENDERECO_LOCADOR etc.
          const prefix = fieldName.split('_').pop() || ''; 
          
          const findTag = (keyword: string) => requiredTags.find(t => t.includes(keyword) && t.includes(prefix));

          const logradouroTag = findTag('ENDERECO') || findTag('RUA') || findTag('LOGRADOURO');
          if (logradouroTag && !newData[logradouroTag]) {
            newData[logradouroTag] = `${data.logradouro}, ${data.bairro}`;
          }

          const cidadeTag = findTag('CIDADE') || findTag('MUNICIPIO');
          if (cidadeTag && !newData[cidadeTag]) {
            newData[cidadeTag] = data.localidade;
          }

          const ufTag = findTag('ESTADO') || findTag('UF');
          if (ufTag && !newData[ufTag]) {
            newData[ufTag] = data.uf;
          }

          setFormData(newData);
        }
      } catch (e) {
        console.error("Erro ViaCEP:", e);
      }
    }
  };

  const handleInputChange = (tag: string, value: string) => {
    let formattedValue = value;
    const tagUpper = tag.toUpperCase();

    if (tagUpper.includes('CPF') || tagUpper.includes('CNPJ')) {
      formattedValue = maskCPF_CNPJ(value);
    } else if (tagUpper.includes('CEP')) {
      formattedValue = maskCEP(value);
      if (formattedValue.length === 9) {
        fetchCEP(formattedValue, tagUpper);
      }
    } else if (tagUpper.includes('VALOR') || tagUpper.includes('PRECO') || tagUpper.includes('REAIS')) {
      formattedValue = maskMoney(value);
    }

    setFormData(prev => ({ ...prev, [tag]: formattedValue }));
  };

  const getInputType = (tag: string) => {
    const t = tag.toUpperCase();
    if (t.includes('DATA') && !t.includes('ATUAL')) return 'date';
    if (t.includes('EMAIL')) return 'email';
    return 'text';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResultFileUrl(null);
    
    if (!templateId) return setError("Selecione um modelo de contrato.");

    setLoading(true);

    try {
      const payload = {
        templateId: parseInt(templateId),
        variables: formData, // Envia o formulário flat
      };

      const res = await fetch("/api/contratos/gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao gerar contrato");
      }

      setResultFileUrl(data.fileUrl);

    } catch (err: any) {
      setError(err.message || "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  if (resultFileUrl) {
    return (
      <Card className="p-8 border border-emerald-500/30 bg-slate-900/50 shadow-sm text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 mb-4 text-emerald-400">
          <FileCheck className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-semibold text-white mb-2">Documento Gerado com Sucesso!</h2>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">Seu documento foi processado dinamicamente. Você pode baixá-lo agora para impressão ou envio.</p>
        
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => setResultFileUrl(null)}>
            Gerar Outro
          </Button>
          <a href={`/api/contratos/download?file=${encodeURIComponent(resultFileUrl)}`} download className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-emerald-600 text-white shadow hover:bg-emerald-600/90 h-9 px-4 py-2 gap-2">
            <FileSignature className="h-4 w-4" />
            Fazer Download (.docx)
          </a>
        </div>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-20">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-start gap-3">
          <X className="h-5 w-5 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Card className="p-6 border border-slate-800 bg-slate-900/50 shadow-sm">
        <h3 className="text-lg font-medium text-white mb-4">Seleção do Modelo</h3>
        <div className="max-w-md">
          <Label htmlFor="template" className="text-slate-400">Modelo Base</Label>
          <select
            id="template"
            value={templateId}
            onChange={(e) => {
              setTemplateId(e.target.value);
              setFormData({}); // Reseta o form quando muda o template
            }}
            className="mt-1 flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-200"
            required
          >
            <option value="">-- Selecione um modelo --</option>
            {templates.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </Card>

      {selectedTemplate && requiredTags.length > 0 && (
        <Card className="p-6 border border-slate-800 bg-slate-900/50 shadow-sm">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
            <TextCursorInput className="h-5 w-5 text-sky-400" />
            <h3 className="text-lg font-medium text-sky-400">Campos do Documento</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {requiredTags.map((tag) => (
              <div key={tag}>
                <Label className="text-slate-400 mb-1.5 block">
                  {tag.replace(/_/g, ' ')}
                  {tag.toUpperCase().includes('VALOR') && ' (R$)'}
                </Label>
                <div className="flex gap-2">
                  <Input 
                    type={getInputType(tag)}
                    placeholder={`Preencha ${tag.replace(/_/g, ' ').toLowerCase()}`} 
                    value={formData[tag] || ""} 
                    onChange={e => handleInputChange(tag, e.target.value)} 
                    className="bg-slate-800/50 border-slate-700 w-full text-slate-200" 
                  />
                  {tag.toUpperCase().includes('CEP') && (
                    <div className="flex items-center text-xs text-slate-500 shrink-0"><MapPin className="h-3 w-3 mr-1"/> Busca Auto</div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-6 pt-4 border-t border-slate-800/50">
            Dica: Os campos acima foram extraídos automaticamente do seu arquivo DOCX. As máscaras de CPF, CNPJ, CEP e Valores (R$) são aplicadas dependendo do nome que você deu à variável no Word. As variáveis de data atual (DIA, MES, ANO, DATA_EXTENSA, LOCAL_E_DATA) são injetadas sozinhas.
          </p>
        </Card>
      )}

      {selectedTemplate && requiredTags.length === 0 && (
        <Card className="p-6 border border-slate-800 bg-slate-900/50 shadow-sm text-center">
          <p className="text-slate-400">Nenhuma variável customizada foi detectada neste documento.</p>
        </Card>
      )}

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={loading || !templateId} className="bg-sky-600 hover:bg-sky-500 text-white min-w-[200px] h-12">
          {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <FileSignature className="h-5 w-5 mr-2" />}
          {loading ? "Gerando Documento..." : "Processar e Gerar"}
        </Button>
      </div>
    </form>
  );
}
