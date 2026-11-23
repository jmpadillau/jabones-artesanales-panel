/**
 * PATCH /api/admin/pedidos/[id]/item — cambia el estatus de producción de UNA
 * línea del pedido (el [id] es el de la fila/línea): Pendiente ↔ Realizado.
 *
 * Automatización del estatus del pedido (todo en una transacción):
 *  - Si TODAS las líneas quedan en Realizado y el pedido estaba Pendiente,
 *    el pedido pasa a Realizado (con su marca de fecha y hora).
 *  - Si se desmarca alguna línea y el pedido estaba Realizado, vuelve a
 *    Pendiente.
 * La respuesta indica si el pedido cambió, para mostrar el aviso en pantalla.
 * Los pedidos Entregado o Cancelado no se modifican desde aquí.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { adminDeRequest } from "@/lib/auth";

const esquema = z.object({
  estadoItem: z.enum(["Pendiente", "Realizado"]),
});

class ErrorNegocio extends Error {
  constructor(
    mensaje: string,
    public status: number
  ) {
    super(mensaje);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!adminDeRequest(req)) {
    return NextResponse.json({ ok: false, error: "No autorizado." }, { status: 401 });
  }
  try {
    const { id } = await params;
    const { estadoItem } = esquema.parse(await req.json());

    const resultado = await db.$transaction(async (tx) => {
      const linea = await tx.pedido.findUnique({ where: { id } });
      if (!linea) throw new ErrorNegocio("Línea no encontrada.", 404);
      if (linea.estado !== "Pendiente" && linea.estado !== "Realizado") {
        throw new ErrorNegocio(
          `El pedido está ${linea.estado}: devuélvelo a Pendiente para cambiar sus jabones.`,
          409
        );
      }

      const ahora = new Date();
      await tx.pedido.update({
        where: { id },
        data: {
          estadoItem,
          itemRealizadoEn: estadoItem === "Realizado" ? ahora : null,
        },
      });

      // Todas las líneas del pedido (filas con el mismo código).
      const hermanas = linea.codigo
        ? await tx.pedido.findMany({ where: { codigo: linea.codigo } })
        : [linea];
      const todasRealizadas = hermanas.every((h) =>
        h.id === id ? estadoItem === "Realizado" : h.estadoItem === "Realizado"
      );

      const estadoAnterior = linea.estado;
      let estadoNuevo = estadoAnterior;
      if (todasRealizadas && estadoAnterior === "Pendiente") {
        estadoNuevo = "Realizado";
      } else if (!todasRealizadas && estadoAnterior === "Realizado") {
        estadoNuevo = "Pendiente";
      }

      if (estadoNuevo !== estadoAnterior) {
        await tx.pedido.updateMany({
          where: { id: { in: hermanas.map((h) => h.id) } },
          data: {
            estado: estadoNuevo,
            realizadoEn: estadoNuevo === "Realizado" ? ahora : null,
            entregadoEn: null,
            canceladoEn: null,
          },
        });
      }

      return {
        codigo: linea.codigo,
        clienteNombre: linea.clienteNombre,
        estadoAnterior,
        estadoNuevo,
      };
    });

    return NextResponse.json({
      ok: true,
      estadoItem,
      pedido: { ...resultado, cambio: resultado.estadoAnterior !== resultado.estadoNuevo },
    });
  } catch (error) {
    if (error instanceof ErrorNegocio) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: "Estatus inválido." }, { status: 400 });
    }
    console.error("[PATCH /api/admin/pedidos/[id]/item]", error);
    return NextResponse.json(
      { ok: false, error: "No se pudo actualizar el jabón." },
      { status: 500 }
    );
  }
}
