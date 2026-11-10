import Image from "next/image";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TIPOS_PIEL } from "@/lib/jabones";

export function GuiaBotanica() {
  return (
    <section id="guia" className="scroll-mt-20 bg-arena/60 py-16 sm:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-14">
        <figure className="relative order-2 lg:order-1">
          <div
            className="absolute -inset-3 rounded-[2.2rem] bg-salvia/10 blur-xl"
            aria-hidden
          />
          <div className="relative overflow-hidden rounded-[2rem] border-4 border-card shadow-lg">
            <Image
              src="/images/catalogo-botanico.jpg"
              alt="Catálogo botánico: tipos de piel con sus aceites esenciales y aromas recomendados"
              width={1706}
              height={959}
              className="h-auto w-full object-cover"
            />
          </div>
          <figcaption className="mt-3 text-center text-xs text-muted-foreground">
            Catálogo botánico de referencia · Esencias y aromas por tipo de piel
          </figcaption>
        </figure>

        <div className="order-1 lg:order-2">
          <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-salvia">
            Guía botánica
          </p>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-primary sm:text-4xl lg:text-5xl">
            Encuentra tu jabón ideal, renueva tu piel
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Cada tipo de piel pide ingredientes distintos. Por eso organizamos
            nuestro catálogo en tres familias: al elegir la tuya en el
            configurador, solo verás los aceites esenciales y aromas que la
            benefician, tal como aparece en nuestro catálogo botánico.
          </p>

          <ul className="mt-7 space-y-3.5">
            {TIPOS_PIEL.map((t) => (
              <li key={t.id} className="flex items-start gap-3">
                <span
                  className="mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full ring-4 ring-background"
                  style={{ backgroundColor: t.color }}
                  aria-hidden
                />
                <div>
                  <p className="font-semibold text-foreground">{t.nombre}</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {t.descripcion}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <a href="#configurar" className="mt-8 inline-block">
            <Button size="lg" className="rounded-full shadow-md">
              Probar el configurador
              <ArrowDown className="h-4 w-4" aria-hidden />
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
