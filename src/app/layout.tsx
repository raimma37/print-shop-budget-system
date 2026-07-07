import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "GráfikaORC – Sistema de Orçamentos",
    template: "%s – GráfikaORC",
  },
  description: "Sistema profissional de orçamentos para gráfica de comunicação visual. Gerencie clientes, produtos e orçamentos com agilidade.",
  keywords: ["orçamentos", "gráfica", "comunicação visual", "gestão"],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
