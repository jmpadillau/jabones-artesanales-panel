import Image from "next/image";
import { ArrowDown, HeartHandshake, Leaf, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const SELLOS = [
  { icono: Leaf, texto: "Aceites esenciales naturales" },
  { icono: Sparkles, texto: "Elaborados a mano en pequeños lotes" },
  { icono: HeartHandshake, texto: "Pedidos y asesoría por WhatsApp" },
];

export function Hero() {
  return (
    <section id="inicio" className="fondo-botanico relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-12 pb-16 sm:px-6 sm:pt-16 lg:grid-cols-2 lg:gap-14 lg:pt-20 lg:pb-24">
        <div>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-salvia/30 bg-secondary px-4 py-1.5 text-xs font-semibold tracking-[0.14em] text-primary uppercase">
            <Leaf className="h-3.5 w-3.5" aria-hidden />
            100% artesanal · Hecho en Costa Rica
          </p>
          <h1 className="font-display text-4xl leading-[1.08] font-semibold tracking-tight text-primary sm:text-5xl lg:text-6xl">
            Tu jabón ideal,
            <span className="block italic text-salvia">hecho a tu medida</span>
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
            Combina tu tipo de piel con el aceite esencial, el aroma y el
            tamaño que prefieras. Lo elaboramos a mano con ingredientes
            naturales, según tus gustos y necesidades y lo entregamos en tu
            puerta.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#configurar">
              <Button size="lg" className="rounded-full shadow-md">
                Crear mi jabón
                <ArrowDown className="h-4 w-4" aria-hidden />
              </Button>
            </a>
            <a href="#guia">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-salvia/40 bg-transparent hover:bg-secondary"
              >
                Ver el catálogo
              </Button>
            </a>
          </div>

          <ul className="mt-10 grid gap-3 sm:grid-cols-3">
            {SELLOS.map((s) => (
              <li
                key={s.texto}
                className="flex items-start gap-2.5 rounded-2xl bg-card/70 p-3 text-sm text-foreground/85"
              >
                <s.icono className="mt-0.5 h-4.5 w-4.5 shrink-0 text-salvia" aria-hidden />
                {s.texto}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div
            className="absolute -inset-4 rounded-[2.5rem] bg-salvia/10 blur-2xl"
            aria-hidden
          />
          <figure className="relative overflow-hidden rounded-[2.5rem] border-4 border-card shadow-xl">
            <Image
              src="/images/hero-jabones.png"
              alt="Jabones artesanales en acuarela rodeados de lavanda, eucalipto y flores secas"
              width={1344}
              height={768}
              priority
              className="h-full w-full object-cover"
            />
            <figcaption className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-crema/90 px-4 py-1.5 text-xs font-medium text-primary backdrop-blur">
              Esencias y aromas de la naturaleza
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
