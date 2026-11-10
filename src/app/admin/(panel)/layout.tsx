import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  BarChart3,
  Coins,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
} from "lucide-react";
import { adminServidor } from "@/lib/auth";
import { LogoutButton } from "@/components/admin/logout-button";

export const metadata: Metadata = {
  title: "Panel de administración · By-Sil",
  robots: { index: false, follow: false },
};

const ENLACES = [
  { href: "/admin", label: "Resumen", icon: LayoutDashboard },
  { href: "/admin/pedidos", label: "Pedidos", icon: Package },
  { href: "/admin/costos", label: "Costos", icon: Coins },
  { href: "/admin/ganancias", label: "Ganancias", icon: BarChart3 },
  { href: "/admin/ajustes", label: "Ajustes", icon: Settings },
];

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await adminServidor();
  if (!admin) redirect("/admin/login");

  return (
    <div className="fondo-botanico flex min-h-screen flex-col bg-background">
      {/* Encabezado del panel */}
      <header className="sticky top-0 z-40 border-b border-border bg-bosque text-[#ede9dc] shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link href="/admin" className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="Logo de By-Sil"
              width={80}
              height={80}
              className="h-12 w-12 rounded-full bg-[#ede9dc]/15 object-cover"
            />
            <span className="font-display text-lg font-semibold leading-tight">
              Panel de administración
              <span className="block text-[11px] font-normal uppercase tracking-[0.16em] opacity-70">
                By-Sil · Jabones Artesanales
              </span>
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-1.5">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-xs opacity-80 transition-opacity hover:bg-white/10 hover:opacity-100 sm:inline-flex"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              Ver tienda
            </a>
            <LogoutButton
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs opacity-80 transition-opacity hover:bg-white/10 hover:opacity-100"
              icono={<LogOut className="h-3.5 w-3.5" aria-hidden />}
              etiqueta="Salir"
            />
          </div>
        </div>

        {/* Navegación principal del panel */}
        <nav
          aria-label="Secciones del panel"
          className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2 sm:px-6"
        >
          {ENLACES.map((e) => (
            <Link
              key={e.href}
              href={e.href}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm transition-colors hover:bg-white/10"
            >
              <e.icon className="h-4 w-4" aria-hidden />
              {e.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-4 text-center text-xs text-muted-foreground sm:px-6">
          Panel privado · {new Date().getFullYear()} · Los datos se guardan de forma
          segura y solo son visibles para la administradora.
        </div>
      </footer>
    </div>
  );
}
