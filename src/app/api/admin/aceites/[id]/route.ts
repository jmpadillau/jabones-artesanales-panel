/**
 * PATCH  /api/admin/aceites/[id] — edita un aceite esencial.
 * DELETE /api/admin/aceites/[id] — elimina un aceite esencial.
 * Los pedidos ya registrados conservan el nombre con el que se pidieron.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { adminDeRequest } from "@/lib/auth";
import { IDS_PIEL } from "@/lib/jabones";

const esquema = z.object({
  nombre: z.string().trim().min(2).max(80).optional(),
  propiedades: z.string().trim().max(500).optional(),
  pieles: z.array(z.enum(IDS_PIEL as [string, ...string[]])).max(4).optional(),
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
      const repetido = await db.aceiteEsencial.findFirst({
        where: { nombre: datos.nombre, NOT: { id } },
        select: { id: true },
      });
      if (repetido) {
        return NextResponse.json(
          { ok: false, error: "Ya existe un aceite con ese nombre." },
          { status: 409 }
        );
      }
    }
    const aceite = await db.aceiteEsencial.update({
      where: { id },
      data: {
        ...(datos.nombre !== undefined ? { nombre: datos.nombre } : {}),
        ...(datos.propiedades !== undefined ? { propiedades: datos.propiedades } : {}),
        ...(datos.pieles !== undefined
          ? { pieles: [...new Set(datos.pieles)].join(",") }
          : {}),
      },
    });
    return NextResponse.json({ ok: true, aceite });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: "Datos inválidos." }, { status: 400 });
    }
    console.error("[PATCH /api/admin/aceites/[id]]", error);
    return NextResponse.json(
      { ok: false, error: "No se pudo actualizar el aceite." },
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
    await db.aceiteEsencial.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/admin/aceites/[id]]", error);
    return NextResponse.json(
      { ok: false, error: "No se pudo eliminar el aceite." },
      { status: 500 }
    );
  }
}
