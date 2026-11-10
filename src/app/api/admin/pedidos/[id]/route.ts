/**
 * PATCH  /api/admin/pedidos/[id] — cambia el estado del pedido (con marca de
 *        fecha y hora) o actualiza las notas internas de la administradora.
 * DELETE /api/admin/pedidos/[id] — elimina definitivamente el pedido.
 *
 * Un pedido con varios jabones se guarda como VARIAS FILAS con el mismo
 * código, por lo que el cuerpo puede incluir `ids: [...]` para aplicar el
 * cambio a TODAS las líneas del pedido a la vez. El estado, las notas y las
 * marcas de tiempo se mantienen sincronizados entre líneas.
 *
 * Flujo de estados: Pendiente → Realizado → Entregado (+ Cancelado).
 * Cada transición guarda su marca de tiempo:
 *   creadoEn (Pendiente) · realizadoEn · entregadoEn · canceladoEn.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { adminDeRequest } from "@/lib/auth";
import { esEstado, transicionesPermitidas } from "@/lib/estadisticas";

const esquemaCambio = z
  .object({
    estado: z.string().trim().max(20).optional(),
    notasAdmin: z.string().trim().max(1000).optional(),
    ids: z.array(z.string().trim().min(1).max(40)).min(1).max(50).optional(),
  })
  .refine((d) => d.estado !== undefined || d.notasAdmin !== undefined, {
    message: "Nada que actualizar",
  });

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!adminDeRequest(req)) {
    return NextResponse.json({ ok: false, error: "No autorizado." }, { status: 401 });
  }
  try {
    const { id } = await params;
    const datos = esquemaCambio.parse(await req.json());
    const ids = datos.ids?.length ? datos.ids : [id];

    // Toma una línea representativa del pedido para validar la transición.
    const pedido = await db.pedido.findFirst({
      where: { id: { in: ids } },
      orderBy: { lineaNum: "asc" },
    });
    if (!pedido) {
      return NextResponse.json(
        { ok: false, error: "Pedido no encontrado." },
        { status: 404 }
      );
    }

    const data: {
      estado?: string;
      realizadoEn?: Date | null;
      entregadoEn?: Date | null;
      canceladoEn?: Date | null;
      notasAdmin?: string;
    } = {};

    if (datos.notasAdmin !== undefined) data.notasAdmin = datos.notasAdmin;

    if (datos.estado !== undefined) {
      if (!esEstado(datos.estado)) {
        return NextResponse.json({ ok: false, error: "Estado inválido." }, { status: 400 });
      }
      const actuales = transicionesPermitidas(
        esEstado(pedido.estado) ? pedido.estado : "Pendiente"
      );
      if (!actuales.includes(datos.estado as never)) {
        return NextResponse.json(
          {
            ok: false,
            error: `No se puede pasar de "${pedido.estado}" a "${datos.estado}".`,
          },
          { status: 409 }
        );
      }
      data.estado = datos.estado;
      const ahora = new Date();
      // Marcas de fecha y hora por transición
      data.realizadoEn = null;
      data.entregadoEn = null;
      data.canceladoEn = null;
      if (datos.estado === "Realizado") data.realizadoEn = ahora;
      if (datos.estado === "Entregado") {
        // conservar la marca de Realizado si venía de ahí
        data.realizadoEn = pedido.realizadoEn ?? ahora;
        data.entregadoEn = ahora;
      }
      if (datos.estado === "Pendiente") {
        data.realizadoEn = null;
        data.entregadoEn = null;
        data.canceladoEn = null;
      }
      if (datos.estado === "Cancelado") {
        data.canceladoEn = ahora;
        data.realizadoEn = pedido.realizadoEn;
        data.entregadoEn = null;
      }
    }

    await db.pedido.updateMany({ where: { id: { in: ids } }, data });
    return NextResponse.json({ ok: true, lineas: ids.length });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Datos de actualización inválidos." },
        { status: 400 }
      );
    }
    console.error("[PATCH /api/admin/pedidos/[id]]", error);
    return NextResponse.json(
      { ok: false, error: "No se pudo actualizar el pedido." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!adminDeRequest(req)) {
    return NextResponse.json({ ok: false, error: "No autorizado." }, { status: 401 });
  }
  try {
    const { id } = await params;
    // El cuerpo puede traer `ids` para eliminar todas las líneas del pedido.
    let ids = [id];
    try {
      const cuerpo = (await req.json()) as { ids?: unknown };
      if (
        Array.isArray(cuerpo?.ids) &&
        cuerpo.ids.length > 0 &&
        cuerpo.ids.every((x) => typeof x === "string")
      ) {
        ids = cuerpo.ids as string[];
      }
    } catch {
      // Sin cuerpo: elimina solo la fila del id de la URL.
    }
    const resultado = await db.pedido.deleteMany({ where: { id: { in: ids } } });
    return NextResponse.json({ ok: true, eliminadas: resultado.count });
  } catch (error) {
    console.error("[DELETE /api/admin/pedidos/[id]]", error);
    return NextResponse.json(
      { ok: false, error: "No se pudo eliminar el pedido." },
      { status: 500 }
    );
  }
}
