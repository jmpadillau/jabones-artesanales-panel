/**
 * GET  /api/admin/materias         — lista las materias primas registradas.
 * POST /api/admin/materias         — registra una nueva materia prima.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { adminDeRequest } from "@/lib/auth";
import { CATEGORIAS_MATERIA, UNIDADES_MATERIA } from "@/lib/costos";

const esquema = z.object({
  nombre: z.string().trim().min(2).max(120),
  categoria: z.enum(CATEGORIAS_MATERIA),
  cantidadCompra: z.number().positive().max(1_000_000),
  unidad: z.enum(UNIDADES_MATERIA),
  costoTotal: z.number().min(0).max(100_000_000),
});

export async function GET(req: NextRequest) {
  if (!adminDeRequest(req)) {
    return NextResponse.json({ ok: false, error: "No autorizado." }, { status: 401 });
  }
  const materias = await db.materiaPrima.findMany({ orderBy: { creadoEn: "desc" } });
  return NextResponse.json({ ok: true, materias });
}

export async function POST(req: NextRequest) {
  if (!adminDeRequest(req)) {
    return NextResponse.json({ ok: false, error: "No autorizado." }, { status: 401 });
  }
  try {
    const datos = esquema.parse(await req.json());
    const materia = await db.materiaPrima.create({ data: datos });
    return NextResponse.json({ ok: true, materia }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Datos de la materia prima incompletos." },
        { status: 400 }
      );
    }
    console.error("[POST /api/admin/materias]", error);
    return NextResponse.json(
      { ok: false, error: "No se pudo registrar la materia prima." },
      { status: 500 }
    );
  }
}
