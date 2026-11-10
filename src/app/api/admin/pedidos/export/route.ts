/**
 * GET /api/admin/pedidos/export — exporta los pedidos a CSV
 * (compatible con Excel en español: BOM UTF-8 y separador ";").
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminDeRequest } from "@/lib/auth";
import { formatoFechaHora } from "@/lib/estadisticas";

function celda(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  // Escapa comillas y encierra si contiene separador/salto de línea
  if (/[";\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(req: NextRequest) {
  if (!adminDeRequest(req)) {
    return NextResponse.json({ ok: false, error: "No autorizado." }, { status: 401 });
  }

  const pedidos = await db.pedido.findMany({ orderBy: { creadoEn: "desc" } });

  const encabezados = [
    "Código",
    "N.º línea",
    "Estado",
    "Fecha pedido",
    "Fecha realizado",
    "Fecha entregado",
    "Cliente",
    "Teléfono",
    "Email",
    "Dirección",
    "Método de pago",
    "Producto",
    "Tipo de piel",
    "Aceite esencial",
    "Aroma",
    "Tamaño",
    "Cantidad",
    "Precio unitario (₡)",
    "Total (₡)",
    "Notas internas",
  ];

  const filas = pedidos.map((p) =>
    [
      p.codigo,
      p.lineaNum,
      p.estado,
      formatoFechaHora(p.creadoEn),
      formatoFechaHora(p.realizadoEn),
      formatoFechaHora(p.entregadoEn),
      p.clienteNombre,
      p.clienteTelefono,
      p.clienteEmail,
      p.direccion,
      p.metodoPago,
      p.producto,
      p.tipoPiel,
      p.aceite,
      p.aroma,
      p.tamanoEtiqueta,
      p.cantidad,
      p.precioUnit,
      p.total,
      p.notasAdmin,
    ]
      .map(celda)
      .join(";")
  );

  const csv = "\uFEFF" + [encabezados.join(";"), ...filas].join("\r\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pedidos-jabones-${new Date()
        .toISOString()
        .slice(0, 10)}.csv"`,
    },
  });
}
