import Image from "next/image";
import { Flower2 } from "lucide-react";
import { AROMAS } from "@/lib/jabones";

export function Aromas() {
  return (
    <section id="aromas" className="scroll-mt-20 bg-arena/60 py-16 sm:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-14">
        <div>
          <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-salvia">
            <Flower2 className="h-4 w-4" aria-hidden />
            Esencias y aromas
          </p>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-primary sm:text-4xl lg:text-5xl">
            Una paleta de fragancias para cada momento
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            De lo cítrico y herbal a lo dulce y frutal: nuestra colección de
            aromas acompaña las propiedades de cada aceite esencial. Frutas,
            flores, maderas y notas festivas para que cada baño sea un pequeño
            ritual.
          </p>

          <ul className="mt-7 flex flex-wrap gap-2" aria-label="Catálogo de aromas">
            {AROMAS.map((a) => (
              <li
                key={a.nombre}
                title={a.descripcion}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium text-foreground/85 transition-colors hover:border-salvia/50 hover:bg-secondary"
              >
                <Flower2 className="h-3.5 w-3.5 text-salvia" aria-hidden />
                {a.nombre}
              </li>
            ))}
          </ul>

          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
            Todos los aromas están disponibles para cualquier tipo de piel: elige
            el que más te guste en el configurador.
          </p>
        </div>

        <figure className="relative">
          <div
            className="absolute -inset-3 rounded-[2.2rem] bg-salvia/10 blur-xl"
            aria-hidden
          />
          <div className="relative overflow-hidden rounded-[2rem] border-4 border-card shadow-lg">
            <Image
              src="/images/aceites-esenciales.png"
              alt="Frascos ámbar de aceites esenciales rodeados de hierbas y flores en acuarela"
              width={1344}
              height={768}
              className="h-auto w-full object-cover"
            />
          </div>
          <figcaption className="mt-3 text-center text-xs text-muted-foreground">
            Aceites esenciales puros, seleccionados para cada tipo de piel
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
