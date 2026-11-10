/**
 * PUT /api/admin/password — cambia la contraseña de la administradora.
 * Requiere sesión vigente. La contraseña actual se verifica contra el
 * hash scrypt guardado en la base de datos (tabla AdminUser).
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDeRequest } from "@/lib/auth";
import { cambiarContraseñaAdmin } from "@/lib/ajustes";

const esquema = z.object({
  contraseñaActual: z.string().min(1).max(120),
  contraseñaNueva: z.string().min(8).max(120),
});

export async function PUT(req: NextRequest) {
  const admin = adminDeRequest(req);
  if (!admin) {
    return NextResponse.json({ ok: false, error: "No autorizado." }, { status: 401 });
  }
  try {
    const datos = esquema.parse(await req.json());
    if (datos.contraseñaNueva === datos.contraseñaActual) {
      return NextResponse.json(
        { ok: false, error: "La nueva contraseña debe ser distinta de la actual." },
        { status: 400 }
      );
    }
    // `admin` es el usuario guardado en la sesión (la cuenta sembrada).
    const resultado = await cambiarContraseñaAdmin(
      admin,
      datos.contraseñaActual,
      datos.contraseñaNueva
    );
    if (!resultado.ok) {
      return NextResponse.json(
        { ok: false, error: resultado.error },
        { status: 400 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "La nueva contraseña debe tener al menos 8 caracteres y la actual no puede quedar vacía.",
        },
        { status: 400 }
      );
    }
    console.error("[PUT /api/admin/password]", error);
    return NextResponse.json(
      { ok: false, error: "No se pudo cambiar la contraseña." },
      { status: 500 }
    );
  }
}
