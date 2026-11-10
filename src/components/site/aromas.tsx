import { AROMAS } from "@/lib/jabones"

export function Aromas() {
  return (
    <section id="aromas" className="py-16 bg-[#f9f6f0]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <span className="text-xs font-semibold tracking-widest text-[#8c7a6b] uppercase block mb-2">
            Aromas
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2d4a3e] mb-4">
            Una paleta de fragancias para cada momento
          </h2>
          <p className="text-base text-[#5a6b5c] leading-relaxed">
            De lo cítrico y herbal a lo dulce y frutal: nuestra colección de aromas acompaña las propiedades de cada aceite esencial. Frutas, flores, maderas y notas festivas para que cada baño sea un pequeño ritual.
          </p>
        </div>

        {/* Colección de los 18 aromas */}
        <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
          {AROMAS.map((aroma) => (
            <div
              key={aroma.id}
              className="bg-white border border-[#e5ded0] rounded-full px-4 py-2.5 text-xs font-medium text-[#2d4a3e] shadow-xs flex items-center gap-2"
            >
              <span>🌸</span>
              <span>{aroma.nombre}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
