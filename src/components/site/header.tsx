"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Menu, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MARCA, MARCA_LARGA, enlaceWhatsApp } from "@/lib/jabones";

const LINKS = [
  { href: "#configurar", label: "Crear mi jabón" },
  { href: "#guia", label: "Guía botánica" },
  { href: "#aceites", label: "Aceites" },
  { href: "#aromas", label: "Aromas" },
  { href: "#info", label: "Pagos y envíos" },
];

export function Header({ whatsapp }: { whatsapp: string }) {
  const [conSombra, setConSombra] = useState(false);
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    const alDesplazar = () => setConSombra(window.scrollY > 12);
    alDesplazar();
    window.addEventListener("scroll", alDesplazar, { passive: true });
    return () => window.removeEventListener("scroll", alDesplazar);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b bg-crema/90 backdrop-blur-md transition-shadow ${
        conSombra ? "border-border shadow-sm" : "border-transparent"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a
          href="#inicio"
          className="flex items-center gap-2.5"
          aria-label={`${MARCA_LARGA} — inicio`}
        >
          <Image
            src="/logo.png"
            alt="Logo de By-Sil: colibrí y flor de cala"
            width={96}
            height={96}
            className="h-14 w-14 rounded-full border-2 border-secondary bg-card object-cover shadow-sm sm:h-16 sm:w-16"
          />
          <span className="font-display text-2xl font-semibold leading-none tracking-tight text-primary">
            {MARCA}
            <span className="mt-0.5 block text-xs font-normal uppercase tracking-[0.18em] text-muted-foreground">
              Jabones Artesanales
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Principal">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={enlaceWhatsApp(whatsapp, "¡Hola! Quisiera información sobre sus jabones artesanales \u{1f33f}")}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex"
          >
            <Button size="sm" className="rounded-full">
              <MessageCircle className="h-4 w-4" aria-hidden />
              WhatsApp
            </Button>
          </a>

          <Sheet open={abierto} onOpenChange={setAbierto}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-xl lg:hidden"
                aria-label="Abrir menú"
              >
                <Menu className="h-5 w-5" aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="font-display text-primary">
                  {MARCA_LARGA}
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-2 flex flex-col gap-1 px-4" aria-label="Menú móvil">
                {LINKS.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setAbierto(false)}
                    className="rounded-xl px-3 py-3 text-base font-medium transition-colors hover:bg-secondary"
                  >
                    {l.label}
                  </a>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
