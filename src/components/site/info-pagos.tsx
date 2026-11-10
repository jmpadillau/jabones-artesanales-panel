import { CreditCard, Gift, HandHeart, Truck } from "lucide-react";

const BENEFICIOS = [
  {
    icono: CreditCard,
    titulo: "Métodos de pago",
    texto: "Sinpe Móvil, efectivo y tarjeta. Elige el que prefieras al hacer tu pedido.",
  },
  {
    icono: Truck,
    titulo: "Entregas coordinadas",
    texto: "Después de confirmar tu pedido por WhatsApp, coordinamos juntos la entrega y el envío.",
  },
  {
    icono: HandHeart,
    titulo: "Hecho a mano",
    texto: "Cada jabón se elabora en pequeños lotes con ingredientes naturales y aceites esenciales.",
  },
  {
    icono: Gift,
    titulo: "Detalles personalizados",
    texto: "Combos, regalos y detalles para ocasiones especiales: cuéntanos tu idea por WhatsApp.",
  },
];

export function InfoPagos() {
  return (
    <section id="info" className="scroll-mt-20 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-salvia">
            Pedidos, pagos y envíos
          </p>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-primary sm:text-4xl lg:text-5xl">
            Comprar es así de sencillo
          </h2>
          <p className="mt-4 text-muted-foreground">
            Arma tu jabón en el configurador, envíanos el pedido por WhatsApp
            y nosotros nos encargamos del resto.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFICIOS.map((b) => (
            <article
              key={b.titulo}
              className="rounded-3xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
            >
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-salvia">
                <b.icono className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="font-display text-xl font-semibold text-foreground">
                {b.titulo}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {b.texto}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
