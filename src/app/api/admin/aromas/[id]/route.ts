/**
 * PATCH  /api/admin/aromas/[id] — edita un aroma.
 * DELETE /api/admin/aromas/[id] — elimina un aroma.
 * Los pedidos ya registrados conservan el nombre con el que se pidieron.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { adminDeRequest } from "@/lib/auth";
import { SORPRENDEME } from "@/lib/jabones";

const esquema = z.object({
  nombre: z.string().trim().min(2).max(80).optional(),
  descripcion: z.string().trim().max(300).optional(),
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
    if (datos.nombre) {
      if (datos.nombre.toLowerCase() === SORPRENDEME.toLowerCase()) {
        return NextResponse.json(
          { ok: false, error: "«Sorpréndeme» ya existe como opción especial." },
          { status: 400 }
        );
      }
      const repetido = await db.aroma.findFirst({
        where: { nombre: datos.nombre, NOT: { id } },
        select: { id: true },
      });
      if (repetido) {
        return NextResponse.json(
          { ok: false, error: "Ya existe un aroma con ese nombre." },
          { status: 409 }
        );
      }
    }
    const aroma = await db.aroma.update({ where: { id }, data: datos });
    return NextResponse.json({ ok: true, aroma });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: "Datos inválidos." }, { status: 400 });
    }
    console.error("[PATCH /api/admin/aromas/[id]]", error);
    return NextResponse.json(
      { ok: false, error: "No se pudo actualizar el aroma." },
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
    await db.aroma.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/admin/aromas/[id]]", error);
    return NextResponse.json(
      { ok: false, error: "No se pudo eliminar el aroma." },
      { status: 500 }
    );
  }
}
