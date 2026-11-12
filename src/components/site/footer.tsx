import Image from "next/image";
import { MapPin, MessageCircle } from "lucide-react";
import { MARCA, MARCA_LARGA, enlaceWhatsApp } from "@/lib/jabones";

export function Footer({ whatsapp }: { whatsapp: string }) {
  const anio = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-bosque text-[#ede9dc]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="flex items-center gap-2.5">
              <Image
                src="/logo-256.png"
                alt="Logo de By-Sil: colibrí y flor de cala"
                width={96}
                height={96}
                className="h-14 w-14 rounded-full bg-[#ede9dc]/15 object-cover ring-1 ring-white/20"
              />
              <span className="font-display text-xl font-semibold">
                {MARCA_LARGA}
              </span>
            </p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed opacity-80">
              Jabones artesanales hechos a mano en Costa Rica, formulados con
              aceites esenciales naturales para cuidar cada tipo de piel.
              Elaborados contra pedido, con dedicación y amor por lo artesanal.
            </p>
          </div>

          <nav aria-label="Enlaces del pie de página">
            <h3 className="font-display text-lg font-semibold">
              Explora la tienda
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                { href: "#configurar", label: "Crear mi jabón" },
                { href: "#guia", label: "Catálogo" },
                { href: "#info", label: "Pagos y envíos" },
              ].map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="opacity-80 transition-opacity hover:opacity-100"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="font-display text-lg font-semibold">Contacto</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a
                  href={enlaceWhatsApp(
                    whatsapp,
                    "¡Hola! Quisiera hacer un pedido de jabones By-Sil \u{1f33f}"
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 opacity-80 transition-opacity hover:opacity-100"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden />
                  Pedidos por WhatsApp
                </a>
              </li>
              <li className="inline-flex items-center gap-2.5 opacity-80">
                <MapPin className="h-4 w-4" aria-hidden />
                Costa Rica
              </li>
            </ul>
            <p className="mt-5 rounded-2xl bg-white/5 p-3.5 text-xs leading-relaxed opacity-80">
              Aceptamos Sinpe Móvil, efectivo y tarjeta. Los pedidos se
              confirman y coordinan por WhatsApp.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs opacity-70 sm:flex-row">
          <p>
            © {anio} {MARCA}. Todos los derechos reservados.
          </p>
          <p>Hecho a mano con ingredientes naturales · Costa Rica</p>
        </div>
      </div>
    </footer>
  );
}
