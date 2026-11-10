/**
 * GET /api/admin/costos — lista los costos de producción por tamaño.
 * PUT /api/admin/costos — actualiza el costo de un tamaño ({ tamanoId, costoUnitario }).
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { adminDeRequest } from "@/lib/auth";
import { asegurarCostosIniciales } from "@/lib/costos";
import { TAMANOS } from "@/lib/jabones";

export async function GET(req: NextRequest) {
  if (!adminDeRequest(req)) {
    return NextResponse.json({ ok: false, error: "No autorizado." }, { status: 401 });
  }
  await asegurarCostosIniciales();
  const costos = await db.costoTamano.findMany({ orderBy: { tamanoId: "asc" } });
  return NextResponse.json({ ok: true, costos });
}

const esquema = z.object({
  tamanoId: z.string().trim().max(10),
  costoUnitario: z.number().min(0).max(10_000_000),
});

export async function PUT(req: NextRequest) {
  if (!adminDeRequest(req)) {
    return NextResponse.json({ ok: false, error: "No autorizado." }, { status: 401 });
  }
  try {
    const datos = esquema.parse(await req.json());
    const tamano = TAMANOS.find((t) => t.id === datos.tamanoId);
    if (!tamano) {
      return NextResponse.json({ ok: false, error: "Tamaño no válido." }, { status: 400 });
    }
    await asegurarCostosIniciales();
    const costo = await db.costoTamano.upsert({
      where: { tamanoId: datos.tamanoId },
      update: { costoUnitario: datos.costoUnitario },
      create: {
        tamanoId: datos.tamanoId,
        etiqueta: `${tamano.etiqueta} · ${tamano.gramos} g`,
        costoUnitario: datos.costoUnitario,
      },
    });
    return NextResponse.json({ ok: true, costo });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Datos del costo inválidos." },
        { status: 400 }
      );
    }
    console.error("[PUT /api/admin/costos]", error);
    return NextResponse.json(
      { ok: false, error: "No se pudo actualizar el costo." },
      { status: 500 }
    );
  }
}
