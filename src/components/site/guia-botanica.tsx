"use client";

import Image from "next/image";
import { ArrowDown, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AROMAS, TIPOS_PIEL } from "@/lib/jabones";

/** Texto alternativo con los nombres de aceites y aromas (accesibilidad y buscadores). */
const ALT_CATALOGO =
  "Catálogo By-Sil. Aromas disponibles para cualquier tipo de piel: " +
  AROMAS.map((a) => a.nombre).join(", ") +
  ". Aceites esenciales según el tipo de piel. " +
  TIPOS_PIEL.map((t) => `${t.nombre}: ${t.aceites.join(", ")}`).join(". ") +
  ".";

export function GuiaBotanica() {
  return (
    <section id="guia" className="scroll-mt-28 bg-arena/60 py-16 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-salvia">
          Catálogo
        </p>
        <h2 className="font-display text-3xl font-semibold tracking-tight text-primary sm:text-4xl lg:text-5xl">
          Encuentra tu jabón ideal, renueva tu piel
        </h2>

        <Dialog>
          <figure className="relative mt-10">
            <div
              className="absolute -inset-3 rounded-[2.2rem] bg-salvia/10 blur-xl"
              aria-hidden
            />
            <DialogTrigger asChild>
              <button
                type="button"
                className="group relative block w-full overflow-hidden rounded-[2rem] border-4 border-card text-left shadow-xl"
                aria-label="Ver el catálogo en grande"
              >
                <Image
                  src="/images/catalogo-botanico.jpg"
                  alt={ALT_CATALOGO}
                  width={1706}
                  height={1159}
                  sizes="(min-width: 1024px) 1024px, 100vw"
                  className="h-auto w-full object-cover"
                />
                <span className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-crema/90 px-3 py-1.5 text-xs font-medium text-primary shadow backdrop-blur transition-colors group-hover:bg-card">
                  <ZoomIn className="h-3.5 w-3.5" aria-hidden />
                  Ver en grande
                </span>
              </button>
            </DialogTrigger>
            <figcaption className="mt-3 text-xs text-muted-foreground">
              Catálogo By-Sil · Aromas y aceites esenciales según tipo de piel
            </figcaption>
          </figure>

          <DialogContent className="max-w-[calc(100%-1rem)] gap-2 p-2 sm:max-w-5xl">
            <DialogTitle className="sr-only">Catálogo By-Sil</DialogTitle>
            <DialogDescription className="sr-only">
              Aromas y aceites esenciales según el tipo de piel.
            </DialogDescription>
            <div className="max-h-[85vh] overflow-auto rounded-md">
              <Image
                src="/images/catalogo-botanico.jpg"
                alt={ALT_CATALOGO}
                width={1706}
                height={1159}
                sizes="(min-width: 1024px) 1024px, 900px"
                className="h-auto w-[900px] max-w-none sm:w-full"
              />
            </div>
          </DialogContent>
        </Dialog>

        <a href="#configurar" className="mt-8 inline-block">
          <Button size="lg" className="rounded-full shadow-md">
            Probar el configurador
            <ArrowDown className="h-4 w-4" aria-hidden />
          </Button>
        </a>
      </div>
    </section>
  );
}
