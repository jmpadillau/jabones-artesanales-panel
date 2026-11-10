/**
 * PATCH  /api/admin/materias/[id] — actualiza una materia prima.
 * DELETE /api/admin/materias/[id] — elimina una materia prima.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { adminDeRequest } from "@/lib/auth";
import { CATEGORIAS_MATERIA, UNIDADES_MATERIA } from "@/lib/costos";

const esquema = z.object({
  nombre: z.string().trim().min(2).max(120).optional(),
  categoria: z.enum(CATEGORIAS_MATERIA).optional(),
  cantidadCompra: z.number().positive().max(1_000_000).optional(),
  unidad: z.enum(UNIDADES_MATERIA).optional(),
  costoTotal: z.number().min(0).max(100_000_000).optional(),
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
    const datos = esquema.parse(await req.json());
    const materia = await db.materiaPrima.update({ where: { id }, data: datos });
    return NextResponse.json({ ok: true, materia });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Datos inválidos." },
        { status: 400 }
      );
    }
    console.error("[PATCH /api/admin/materias/[id]]", error);
    return NextResponse.json(
      { ok: false, error: "No se pudo actualizar la materia prima." },
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
    await db.materiaPrima.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/admin/materias/[id]]", error);
    return NextResponse.json(
      { ok: false, error: "No se pudo eliminar la materia prima." },
      { status: 500 }
    );
  }
}
