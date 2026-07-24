import { AuthProvider } from "@/contexts/AuthContext";
import { type ReactNode } from "react";

export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
