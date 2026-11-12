/**
 * /admin/ajustes — configuración de la cuenta y del sitio:
 *  1. Cambiar la contraseña de la administradora.
 *  2. Actualizar el número de WhatsApp de la tienda (los botones de
 *     WhatsApp de la web usan el número vigente al instante).
 */

import { usuarioAdmin } from "@/lib/auth";
import {
  asegurarAjustesIniciales,
  numeroWhatsappTienda,
  usaContraseñaPorDefecto,
} from "@/lib/ajustes";
import { AjustesPanel } from "@/components/admin/ajustes-panel";

export const dynamic = "force-dynamic";

export default async function AdminAjustesPage() {
  await asegurarAjustesIniciales();
  const whatsapp = await numeroWhatsappTienda();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold text-primary sm:text-4xl">
          Ajustes
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
          Administra tu cuenta y los datos de contacto de la tienda. Los cambios
          se aplican de inmediato en la web.
        </p>
      </header>

      <AjustesPanel
        usuario={usuarioAdmin()}
        whatsappActual={whatsapp}
        contraseñaPorDefecto={usaContraseñaPorDefecto()}
      />
    </div>
  );
}
