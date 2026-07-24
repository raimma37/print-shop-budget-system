"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  templateId: number;
}

export function DeleteTemplateButton({ templateId }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("Clicou em deletar. Template ID:", templateId);
    /* 
    if (!confirm("Tem certeza que deseja remover este modelo? Contratos já gerados não serão afetados, mas você não poderá gerar novos com ele.")) {
      return;
    }
    */

    setLoading(true);
    try {
      const res = await fetch(`/api/contratos/templates/${templateId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Falha ao deletar modelo");
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Ocorreu um erro ao deletar o modelo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={loading}
      title="Remover modelo"
      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </button>
  );
}
