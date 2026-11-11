import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ACEITES,
  pielesDeAceite,
  TIPOS_PIEL,
  type PielId,
} from "@/lib/jabones";

const ETIQUETA_PIEL: Record<PielId, string> = {
  grasa: "Grasa / Mixta",
  sensible: "Sensible",
  madura: "Madura",
  seca: "Seca",
};

const COLOR_PIEL: Record<string, string> = Object.fromEntries(
  TIPOS_PIEL.map((t) => [t.id, t.color])
);

export function Aceites() {
  return (
    <section id="aceites" className="scroll-mt-20 bg-[#fdfbf7] py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-[#8c7a6b]">
            Nuestros Aceites Esenciales
          </span>
          <h2 className="mb-4 font-serif text-3xl font-bold text-[#2d4a3e] sm:text-4xl">
            El poder de las plantas, en cada jabón
          </h2>
          <p className="text-base text-[#5a6b5c]">
            Seleccionamos aceites esenciales con propiedades específicas para
            cada tipo de piel. Estos son los que trabajamos en nuestros jabones
            artesanales.
          </p>
        </div>

        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ACEITES.map((aceite) => {
            const pieles = pielesDeAceite(aceite.nombre);
            return (
              <div
                key={aceite.nombre}
                className="flex flex-col justify-between rounded-2xl border border-[#e5ded0] bg-white p-6 shadow-xs"
              >
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eae3d2] text-xs text-[#2d4a3e]">
                      🍃
                    </span>
                    <h3 className="font-serif text-lg font-bold text-[#2d4a3e]">
                      {aceite.nombre}
                    </h3>
                  </div>
                  <p className="mb-4 text-xs leading-relaxed text-[#5a6b5c]">
                    {aceite.propiedades}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 border-t border-[#f0eae0] pt-3">
                  {pieles.map((p) => (
                    <span
                      key={p}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#f4f1ea] px-2.5 py-1 text-[10px] font-semibold text-[#2d4a3e]"
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: COLOR_PIEL[p] }}
                        aria-hidden
                      />
                      {ETIQUETA_PIEL[p]}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col items-center justify-between gap-6 rounded-3xl bg-[#2d4a3e] p-8 text-white shadow-md md:flex-row">
          <div className="max-w-xl">
            <h3 className="mb-2 font-serif text-2xl font-bold">
              ¿No sabes cuál elegir?
            </h3>
            <p className="text-sm leading-relaxed text-[#d0ded3]">
              Usa el configurador: al indicar tu tipo de piel te mostramos
              únicamente los aceites esenciales compatibles, con su explicación.
            </p>
          </div>
          <a href="#configurar" className="shrink-0">
            <Button
              variant="secondary"
              className="rounded-full bg-[#fdfbf7] px-6 py-3 text-sm font-semibold whitespace-nowrap text-[#2d4a3e] hover:bg-[#eae3d2]"
            >
              Crear mi jabón ideal
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
