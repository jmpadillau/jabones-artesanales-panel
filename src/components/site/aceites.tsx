import { ArrowRight, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  pielesDeAceite,
  propiedadesDe,
  TIPOS_PIEL,
  type TipoPiel,
} from "@/lib/jabones";

const ETIQUETA_CORTA: Record<TipoPiel["id"], string> = {
  grasa: "Grasa / Mixta",
  sensible: "Sensible",
  madura: "Madura",
};

const COLOR_PIEL: Record<string, string> = Object.fromEntries(
  TIPOS_PIEL.map((t) => [t.id, t.color])
);

export function Aceites() {
  const aceites = TIPOS_PIEL.flatMap((t) => t.aceites);
  const unicos = Array.from(new Set(aceites));

  return (
    <section id="aceites" className="scroll-mt-20 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-salvia">
            <Leaf className="h-4 w-4" aria-hidden />
            Nuestros aceites esenciales
          </p>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-primary sm:text-4xl lg:text-5xl">
            El poder de las plantas, en cada jabón
          </h2>
          <p className="mt-4 text-muted-foreground">
            Seleccionamos aceites esenciales con propiedades específicas para
            cada tipo de piel. Estos son los que trabajamos en nuestros
            jabones artesanales.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {unicos.map((nombre) => {
            const pieles = pielesDeAceite(nombre);
            return (
              <article
                key={nombre}
                className="flex flex-col rounded-3xl border border-border bg-card p-5 transition-shadow hover:shadow-md sm:p-6"
              >
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-salvia">
                    <Leaf className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="font-display text-xl font-semibold text-foreground">
                    {nombre}
                  </h3>
                </div>
                <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                  {propiedadesDe(nombre)}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {pieles.map((p) => (
                    <span
                      key={p}
                      className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-foreground/80"
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: COLOR_PIEL[p] }}
                        aria-hidden
                      />
                      {ETIQUETA_CORTA[p]}
                    </span>
                  ))}
                </div>
              </article>
            );
          })}

          {/* Tarjeta de cierre */}
          <article className="flex flex-col justify-center rounded-3xl bg-primary p-6 text-primary-foreground sm:col-span-2 lg:p-8">
            <h3 className="font-display text-2xl font-semibold sm:text-3xl">
              ¿No sabes cuál elegir?
            </h3>
            <p className="mt-2 max-w-md text-sm leading-relaxed opacity-90">
              Usa el configurador: al indicar tu tipo de piel te mostramos
              únicamente los aceites y aromas compatibles, con su explicación.
            </p>
            <a href="#configurar" className="mt-5">
              <Button variant="secondary" className="rounded-full">
                Crear mi jabón ideal
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </a>
          </article>
        </div>
      </div>
    </section>
  );
}
