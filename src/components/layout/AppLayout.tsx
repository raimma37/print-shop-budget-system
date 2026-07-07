"use client";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Menu, ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumb?: BreadcrumbItem[];
}

export function AppLayout({ children, title, subtitle, actions, breadcrumb }: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      {/* Main content */}
      <div className="flex flex-col flex-1 lg:pl-64 min-h-screen overflow-hidden">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 lg:px-6 py-0 flex items-center h-14 gap-3 flex-shrink-0">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden rounded-lg p-2 text-slate-500 hover:bg-slate-100 transition-colors focus-ring"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Title area */}
          <div className="flex-1 min-w-0">
            {breadcrumb && breadcrumb.length > 0 ? (
              <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-slate-500">
                {breadcrumb.map((item, i) => (
                  <span key={i} className="flex items-center gap-1">
                    {i > 0 && <ChevronRight className="h-3 w-3" />}
                    {item.href ? (
                      <a href={item.href} className="hover:text-slate-700 transition-colors">
                        {item.label}
                      </a>
                    ) : (
                      <span className="text-slate-900 font-medium">{item.label}</span>
                    )}
                  </span>
                ))}
              </nav>
            ) : (
              <div>
                {title && (
                  <h1 className={cn("font-semibold text-slate-900 truncate", subtitle ? "text-base" : "text-lg")}>
                    {title}
                  </h1>
                )}
                {subtitle && <p className="text-xs text-slate-500 truncate">{subtitle}</p>}
              </div>
            )}
          </div>

          {/* Actions */}
          {actions && (
            <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>
          )}
        </header>

        {/* Page content */}
        <main
          id="main-content"
          className="flex-1 px-4 lg:px-6 py-5 overflow-y-auto animate-fade-in"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
