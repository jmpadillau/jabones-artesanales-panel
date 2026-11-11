/**
 * /admin/costos — aquí la administradora registra los costos:
 *  1. Materias primas (base, aceites, esencias, envases…) con su costo
 *     unitario calculado automáticamente.
 *  2. Costo de producción por tamaño de jabón, que se usa para calcular
 *     las ganancias de los pedidos Entregado.
 */

import { db } from "@/lib/db";
import { asegurarCostosIniciales } from "@/lib/costos";
import { CostosGestor } from "@/components/admin/costos-gestor";

export const dynamic = "force-dynamic";

export default async function AdminCostosPage() {
  await asegurarCostosIniciales();
  const [materias, costos] = await Promise.all([
    db.materiaPrima.findMany({ orderBy: { creadoEn: "desc" } }),
    db.costoTamano.findMany({ orderBy: { tamanoId: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold text-primary sm:text-4xl">
          Costos
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
          Registra lo que pagas por cada materia prima y define cuánto te cuesta
          producir un jabón de cada tamaño. Con eso el panel calcula las
          ganancias automáticamente.
        </p>
      </header>

      <CostosGestor
        materias={materias.map((m) => ({
          id: m.id,
          nombre: m.nombre,
          categoria: m.categoria,
          cantidadCompra: m.cantidadCompra,
          unidad: m.unidad,
          costoTotal: m.costoTotal,
          actualizadoEn: m.actualizadoEn.toISOString(),
        }))}
        costos={costos.map((c) => ({
          tamanoId: c.tamanoId,
          etiqueta: c.etiqueta,
          costoUnitario: c.costoUnitario,
          actualizadoEn: c.actualizadoEn.toISOString(),
        }))}
      />
    </div>
  );
}
