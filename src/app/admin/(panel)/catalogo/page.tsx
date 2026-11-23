/**
 * /admin/catalogo — la artesana agrega, edita y elimina los aceites
 * esenciales y los aromas que los clientes ven en la tienda.
 */

import { listarAceites, listarAromas } from "@/lib/catalogo";
import { CatalogoGestor } from "@/components/admin/catalogo-gestor";

export const dynamic = "force-dynamic";

export default async function AdminCatalogoPage() {
  const [aceites, aromas] = await Promise.all([listarAceites(), listarAromas()]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold text-primary sm:text-4xl">
          Catálogo
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
          Administra los aceites esenciales y los aromas de la tienda. Los
          cambios se ven de inmediato en el configurador que usan tus clientes.
          Los pedidos ya recibidos no se modifican.
        </p>
      </header>

      <CatalogoGestor aceites={aceites} aromas={aromas} />
    </div>
  );
}
