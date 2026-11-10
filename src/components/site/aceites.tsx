"use client"

import Link from "next/link"
import { ACEITES } from "@/lib/jabones"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function Aceites() {
  return (
    <section id="aceites" className="py-16 bg-[#fdfbf7]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-semibold tracking-widest text-[#8c7a6b] uppercase block mb-2">
            Nuestros Aceites Esenciales
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2d4a3e] mb-4">
            El poder de las plantas, en cada jabón
          </h2>
          <p className="text-base text-[#5a6b5c]">
            Seleccionamos aceites esenciales con propiedades específicas para cada tipo de piel. Estos son los que trabajamos en nuestros jabones artesanales.
          </p>
        </div>

        {/* Grilla con los 10 aceites de catálogo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {ACEITES.map((aceite) => (
            <div
              key={aceite.id}
              className="bg-white rounded-2xl p-6 border border-[#e5ded0] shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eae3d2] text-[#2d4a3e] text-xs">
                    🍃
                  </span>
                  <h3 className="font-serif text-lg font-bold text-[#2d4a3e]">
                    {aceite.nombre}
                  </h3>
                </div>
                <p className="text-xs text-[#5a6b5c] leading-relaxed mb-4">
                  {aceite.propiedades}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-3 border-t border-[#f0eae0]">
                {aceite.tiposPielIds.map((pielId) => {
                  const labelMap: Record<string, string> = {
                    "grasa-mixta": "Grasa / Mixta",
                    sensible: "Sensible",
                    madura: "Madura",
                    seca: "Piel Seca",
                  }
                  return (
                    <span
                      key={pielId}
                      className="px-2.5 py-1 rounded-full bg-[#f4f1ea] text-[#2d4a3e] text-[10px] font-semibold"
                    >
                      {labelMap[pielId] || pielId}
                    </span>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Banner Explicativo Verde */}
        <div className="bg-[#2d4a3e] rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="max-w-xl">
            <h3 className="font-serif text-2xl font-bold mb-2">
              ¿No sabes cuál elegir?
            </h3>
            <p className="text-sm text-[#d0ded3] leading-relaxed">
              Usa el configurador: al indicar tu tipo de piel te mostramos únicamente los aceites compatibles, con su explicación.
            </p>
          </div>
          <Button
            asChild
            className="bg-[#fdfbf7] text-[#2d4a3e] hover:bg-[#eae3d2] rounded-full px-6 py-3 font-semibold text-sm whitespace-nowrap shrink-0"
          >
            <Link href="#configurador" className="flex items-center gap-2">
              <span>Crear mi jabón ideal</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

      </div>
    </section>
  )
}
