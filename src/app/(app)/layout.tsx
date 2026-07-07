import { cache } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AuthProvider } from "@/contexts/AuthContext";
import { type ReactNode } from "react";

// Cache da sessão por request — evita múltiplas queries ao banco
export const getCurrentSession = cache(async () => {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
});

export default async function AppGroupLayout({ children }: { children: ReactNode }) {
  // Garante que há sessão antes de renderizar qualquer página do grupo
  await getCurrentSession();

  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
