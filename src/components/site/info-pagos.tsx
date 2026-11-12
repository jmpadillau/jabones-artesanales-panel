import { CreditCard, Truck, HeartHandshake, Gift } from "lucide-react"

export function InfoPagos() {
  return (
    <section id="info" className="scroll-mt-28 py-16 bg-[#fdfbf7]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold tracking-widest text-[#8c7a6b] uppercase block mb-2">
            Pedidos, Pagos y Envíos
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2d4a3e] mb-3">
            Comprar es así de sencillo
          </h2>
          <p className="text-base text-[#5a6b5c]">
            Arma tu jabón en el configurador, envíanos el pedido y nosotros nos encargamos del resto.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-white rounded-2xl p-6 border border-[#e5ded0] shadow-xs text-center">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-[#eae3d2] flex items-center justify-center text-[#2d4a3e] mb-4">
              <CreditCard className="h-6 w-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#2d4a3e] mb-2">
              Métodos de pago
            </h3>
            <p className="text-xs text-[#6b7c6d] leading-relaxed">
              Sinpe Móvil, efectivo y tarjeta. Elige el que prefieras al hacer tu pedido.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#e5ded0] shadow-xs text-center">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-[#eae3d2] flex items-center justify-center text-[#2d4a3e] mb-4">
              <Truck className="h-6 w-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#2d4a3e] mb-2">
              Entregas coordinadas
            </h3>
            <p className="text-xs text-[#6b7c6d] leading-relaxed">
              Después de confirmar tu pedido, coordinamos juntos la entrega y el envío.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#e5ded0] shadow-xs text-center">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-[#eae3d2] flex items-center justify-center text-[#2d4a3e] mb-4">
              <HeartHandshake className="h-6 w-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#2d4a3e] mb-2">
              Hecho a mano
            </h3>
            <p className="text-xs text-[#6b7c6d] leading-relaxed">
              Cada jabón se elabora en pequeños lotes con ingredientes naturales y aceites esenciales.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#e5ded0] shadow-xs text-center">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-[#eae3d2] flex items-center justify-center text-[#2d4a3e] mb-4">
              <Gift className="h-6 w-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#2d4a3e] mb-2">
              Detalles personalizados
            </h3>
            <p className="text-xs text-[#6b7c6d] leading-relaxed">
              Combos, regalos y detalles para ocasiones especiales: cuéntanos tu idea por WhatsApp.
            </p>
          </div>

        </div>

      </div>
    </section>
  )
}
