import { Header } from "@/components/site/header";
import { Hero } from "@/components/site/hero";
import { Configurator } from "@/components/site/configurator";
import { GuiaBotanica } from "@/components/site/guia-botanica";
import { InfoPagos } from "@/components/site/info-pagos";
import { Footer } from "@/components/site/footer";
import { numeroWhatsappTienda } from "@/lib/ajustes";

// La tienda se genera en cada visita para usar siempre el número de
// WhatsApp vigente (Panel → Ajustes) y cualquier otro ajuste del sitio.
export const dynamic = "force-dynamic";

export default async function Home() {
  const whatsapp = await numeroWhatsappTienda();

  return (
    <div className="sitio-colibri flex min-h-screen flex-col bg-background">
      <Header whatsapp={whatsapp} />
      <main className="flex-1">
        <Hero />
        <Configurator whatsapp={whatsapp} />
        <GuiaBotanica />
        <InfoPagos />
      </main>
      <Footer whatsapp={whatsapp} />
      {/* Espacio para la barra móvil fija del total */}
      <div className="h-16 bg-bosque lg:hidden" aria-hidden />
    </div>
  );
}
