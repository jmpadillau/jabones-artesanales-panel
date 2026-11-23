/**
 * GET  /api/admin/aromas — lista los aromas del catálogo.
 * POST /api/admin/aromas — agrega un aroma.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { adminDeRequest } from "@/lib/auth";
import { listarAromas, siguienteOrden } from "@/lib/catalogo";
import { SORPRENDEME } from "@/lib/jabones";

const esquema = z.object({
  nombre: z.string().trim().min(2).max(80),
  descripcion: z.string().trim().max(300).default(""),
});

export async function GET(req: NextRequest) {
  if (!adminDeRequest(req)) {
    return NextResponse.json({ ok: false, error: "No autorizado." }, { status: 401 });
  }
  return NextResponse.json({ ok: true, aromas: await listarAromas() });
}

export async function POST(req: NextRequest) {
  if (!adminDeRequest(req)) {
    return NextResponse.json({ ok: false, error: "No autorizado." }, { status: 401 });
  }
  try {
    const datos = esquema.parse(await req.json());
    if (datos.nombre.toLowerCase() === SORPRENDEME.toLowerCase()) {
      return NextResponse.json(
        { ok: false, error: "«Sorpréndeme» ya existe como opción especial." },
        { status: 400 }
      );
    }
    const existe = await db.aroma.findUnique({ where: { nombre: datos.nombre } });
    if (existe) {
      return NextResponse.json(
        { ok: false, error: "Ya existe un aroma con ese nombre." },
        { status: 409 }
      );
    }
    const aroma = await db.aroma.create({
      data: { ...datos, orden: await siguienteOrden("aroma") },
    });
    return NextResponse.json({ ok: true, aroma }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Escribe el nombre del aroma (mínimo 2 letras)." },
        { status: 400 }
      );
    }
    console.error("[POST /api/admin/aromas]", error);
    return NextResponse.json(
      { ok: false, error: "No se pudo agregar el aroma." },
      { status: 500 }
    );
  }
}
