import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowDown } from "lucide-react"

const familiasPiel = [
  {
    id: "grasa-mixta",
    nombre: "Grasa, Mixta o con Tendencia al Acné",
    descripcion: "Controla el brillo, minimiza los poros y equilibra la piel con tendencia al acné.",
    colorHex: "#e69d24",
  },
  {
    id: "sensible",
    nombre: "Sensible, Irritada o con Afecciones Cutáneas",
    descripcion: "Calma irritaciones y rojeces con fórmulas suaves, naturales y equilibrantes.",
    colorHex: "#9b51e0",
  },
  {
    id: "madura",
    nombre: "Madura o con Pérdida de Firmeza",
    descripcion: "Aporta firmeza y luminosidad, y ayuda a suavizar las líneas de expresión.",
    colorHex: "#e91e63",
  },
  {
    id: "seca",
    nombre: "Seca o con Pérdida de Hidratación",
    descripcion: "Nutrición profunda para restaurar la barrera cutánea e hidratación duradera.",
    colorHex: "#2196f3",
  },
]

export function GuiaBotanica() {
  return (
    <section id="guia-botanica" className="py-16 bg-[#f9f6f0]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Imagen Oficial del Catálogo */}
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-md border border-[#e5ded0]">
              <Image
                src="/images/catalogo-botanico.jpg"
                alt="Catálogo Botánico By-Sil"
                fill
                className="object-cover"
              />
            </div>
            <p className="text-center text-xs text-[#8c7a6b] mt-3 italic">
              Catálogo botánico de referencia · Esencias y aromas por tipo de piel
            </p>
          </div>

          {/* Contenido descriptivo */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <span className="text-xs font-semibold tracking-widest text-[#8c7a6b] uppercase block mb-2">
                Guía Botánica
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2d4a3e] leading-tight">
                Encuentra tu jabón ideal, renueva tu piel
              </h2>
            </div>

            <p className="text-base text-[#5a6b5c] leading-relaxed">
              Cada tipo de piel pide ingredientes distintos. Por eso organizamos nuestro catálogo en cuatro familias: al elegir la tuya en el configurador, solo verás los aceites esenciales que la benefician, tal como aparece en nuestro catálogo botánico.
            </p>

            <div className="space-y-4 pt-2">
              {familiasPiel.map((familia) => (
                <div key={familia.id} className="flex items-start gap-3">
                  <span
                    className="h-3 w-3 rounded-full mt-1.5 shrink-0"
                    style={{ backgroundColor: familia.colorHex }}
                  />
                  <div>
                    <h4 className="font-bold text-sm text-[#2d4a3e]">
                      {familia.nombre}
                    </h4>
                    <p className="text-xs text-[#6b7c6d]">
                      {familia.descripcion}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <Button
                asChild
                className="bg-[#2d4a3e] hover:bg-[#1e3329] text-white rounded-full px-6 py-2.5 text-sm font-medium"
              >
                <Link href="#configurador" className="flex items-center gap-2">
                  <span>Probar el configurador</span>
                  <ArrowDown className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
