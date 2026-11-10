/**
 * /admin/pedidos — compilación completa de los pedidos con su estado.
 * La administradora puede avanzar Pendiente → Realizado → Entregado
 * (cada cambio guarda su marca de fecha y hora), dejar notas internas,
 * contactar al cliente por WhatsApp y exportar todo a CSV.
 */

import { db } from "@/lib/db";
import { PedidosGestor } from "@/components/admin/pedidos-gestor";

export const dynamic = "force-dynamic";

export default async function AdminPedidosPage() {
  const pedidos = await db.pedido.findMany({ orderBy: { creadoEn: "desc" } });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold text-primary sm:text-4xl">
          Pedidos
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Cada pedido llega como <strong>Pendiente</strong>; avánzalo a{" "}
          <strong>Realizado</strong> cuando lo estés preparando y a{" "}
          <strong>Entregado</strong> al completar la venta. La fecha y hora de
          cada paso queda guardada.
        </p>
      </header>

      <PedidosGestor
        pedidos={pedidos.map((p) => ({
          id: p.id,
          codigo: p.codigo,
          lineaNum: p.lineaNum,
          estado: p.estado,
          creadoEn: p.creadoEn.toISOString(),
          realizadoEn: p.realizadoEn?.toISOString() ?? null,
          entregadoEn: p.entregadoEn?.toISOString() ?? null,
          canceladoEn: p.canceladoEn?.toISOString() ?? null,
          notasAdmin: p.notasAdmin,
          clienteNombre: p.clienteNombre,
          clienteTelefono: p.clienteTelefono,
          clienteEmail: p.clienteEmail,
          direccion: p.direccion,
          metodoPago: p.metodoPago,
          producto: p.producto,
          tipoPiel: p.tipoPiel,
          aceite: p.aceite,
          aroma: p.aroma,
          tamanoEtiqueta: p.tamanoEtiqueta,
          cantidad: p.cantidad,
          precioUnit: p.precioUnit,
          total: p.total,
        }))}
      />
    </div>
  );
}
