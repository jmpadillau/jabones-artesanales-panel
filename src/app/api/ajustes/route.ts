/**
 * GET /api/ajustes — PÚBLICO: devuelve la configuración visible de la tienda
 *                     (número de WhatsApp vigente).
 * PUT /api/ajustes — ADMIN: guarda un nuevo número de WhatsApp para la tienda.
 *                    Todos los botones de WhatsApp de la web lo usan al instante.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDeRequest } from "@/lib/auth";
import { guardarNumeroWhatsapp, numeroWhatsappTienda } from "@/lib/ajustes";

export async function GET() {
  try {
    const whatsapp = await numeroWhatsappTienda();
    return NextResponse.json({ ok: true, whatsapp });
  } catch (error) {
    console.error("[GET /api/ajustes]", error);
    return NextResponse.json(
      { ok: false, error: "No se pudo leer la configuración." },
      { status: 500 }
    );
  }
}

const esquema = z.object({
  // Código de país + número, solo dígitos (Costa Rica: 506 + 8 dígitos).
  whatsapp: z.string().trim().regex(/^\d{8,15}$/, "Número inválido"),
});

export async function PUT(req: NextRequest) {
  if (!adminDeRequest(req)) {
    return NextResponse.json({ ok: false, error: "No autorizado." }, { status: 401 });
  }
  try {
    const datos = esquema.parse(await req.json());
    await guardarNumeroWhatsapp(datos.whatsapp);
    return NextResponse.json({ ok: true, whatsapp: datos.whatsapp });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "El número debe tener entre 8 y 15 dígitos, sin espacios ni guiones (ej. 50688888888).",
        },
        { status: 400 }
      );
    }
    console.error("[PUT /api/ajustes]", error);
    return NextResponse.json(
      { ok: false, error: "No se pudo guardar el número." },
      { status: 500 }
    );
  }
}
