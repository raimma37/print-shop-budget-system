import { AuthProvider } from "@/contexts/AuthContext";
import { type ReactNode } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDV - GráfikaORC",
  description: "Frente de Caixa",
};

export default function PdvLayout({ children }: { children: ReactNode }) {
  // O PDV usa um layout próprio, tela cheia, sem sidebar e sem scroll desnecessário
  return (
    <AuthProvider>
      <div className="h-screen w-screen overflow-hidden bg-slate-900 text-slate-100 font-sans selection:bg-indigo-500/30">
        {children}
      </div>
    </AuthProvider>
  );
}
