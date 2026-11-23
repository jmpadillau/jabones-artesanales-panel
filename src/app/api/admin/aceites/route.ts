/**
 * GET  /api/admin/aceites — lista los aceites esenciales del catálogo.
 * POST /api/admin/aceites — agrega un aceite esencial.
 * Los cambios se reflejan en la tienda en la siguiente visita del cliente.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { adminDeRequest } from "@/lib/auth";
import { listarAceites, siguienteOrden } from "@/lib/catalogo";
import { IDS_PIEL } from "@/lib/jabones";

const esquema = z.object({
  nombre: z.string().trim().min(2).max(80),
  propiedades: z.string().trim().max(500).default(""),
  pieles: z.array(z.enum(IDS_PIEL as [string, ...string[]])).max(4),
});

export async function GET(req: NextRequest) {
  if (!adminDeRequest(req)) {
    return NextResponse.json({ ok: false, error: "No autorizado." }, { status: 401 });
  }
  return NextResponse.json({ ok: true, aceites: await listarAceites() });
}

export async function POST(req: NextRequest) {
  if (!adminDeRequest(req)) {
    return NextResponse.json({ ok: false, error: "No autorizado." }, { status: 401 });
  }
  try {
    const datos = esquema.parse(await req.json());
    const existe = await db.aceiteEsencial.findUnique({ where: { nombre: datos.nombre } });
    if (existe) {
      return NextResponse.json(
        { ok: false, error: "Ya existe un aceite con ese nombre." },
        { status: 409 }
      );
    }
    const aceite = await db.aceiteEsencial.create({
      data: {
        nombre: datos.nombre,
        propiedades: datos.propiedades,
        pieles: [...new Set(datos.pieles)].join(","),
        orden: await siguienteOrden("aceite"),
      },
    });
    return NextResponse.json({ ok: true, aceite }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Escribe el nombre del aceite (mínimo 2 letras)." },
        { status: 400 }
      );
    }
    console.error("[POST /api/admin/aceites]", error);
    return NextResponse.json(
      { ok: false, error: "No se pudo agregar el aceite." },
      { status: 500 }
    );
  }
}
