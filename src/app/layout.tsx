import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { db } from "@/db";
import { systemSettings } from "@/db/schema";

export const metadata: Metadata = {
  title: {
    default: "GráfikaORC – Sistema de Orçamentos",
    template: "%s – GráfikaORC",
  },
  description: "Sistema profissional de orçamentos para gráfica de comunicação visual. Gerencie clientes, produtos e orçamentos com agilidade.",
  keywords: ["orçamentos", "gráfica", "comunicação visual", "gestão"],
};

// Script inline executado ANTES da hidratação para evitar flash de tema incorreto
const themeScript = `
(function() {
  try {
    var scheme = localStorage.getItem('colorScheme') || 'system';
    var dark = scheme === 'dark' || (scheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) document.documentElement.classList.add('dark');
  } catch(e) {}
})();
`;

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: ReactNode }) {
  let glassEffect = false;
  try {
    const settings = await db.select().from(systemSettings).limit(1);
    if (settings.length > 0) {
      glassEffect = settings[0].glassEffect;
    }
  } catch(e) {}

  return (
    <html lang="pt-BR" suppressHydrationWarning className={glassEffect ? "glass-mode" : ""}>
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
