/**
 * Cuenta de Gmail con la que se envían los correos de respaldo a los clientes.
 * Solo la administradora (sesión iniciada) puede usar estas rutas.
 *
 * PUT    — guarda usuario + contraseña de aplicación (antes comprueba con
 *          Gmail que sean válidos; la contraseña se guarda cifrada).
 * POST   — envía un correo de prueba a la propia cuenta configurada.
 * DELETE — desactiva el envío (borra usuario y contraseña).
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDeRequest } from "@/lib/auth";
import {
  borrarConfigCorreo,
  enviarCorreo,
  guardarConfigCorreo,
  limpiarClave,
  obtenerConfigCorreo,
  verificarCredenciales,
} from "@/lib/correo";

const noAutorizado = () =>
  NextResponse.json({ ok: false, error: "No autorizado." }, { status: 401 });

const esquema = z.object({
  usuario: z.string().trim().toLowerCase().email().max(160),
  clave: z.string().min(8).max(100),
});

export async function PUT(req: NextRequest) {
  if (!adminDeRequest(req)) return noAutorizado();
  try {
    const datos = esquema.parse(await req.json());
    const clave = limpiarClave(datos.clave);
    if (clave.length < 8) {
      return NextResponse.json(
        { ok: false, error: "La contraseña de aplicación es demasiado corta." },
        { status: 400 }
      );
    }

    const verificacion = await verificarCredenciales(datos.usuario, clave);
    if (!verificacion.ok) {
      return NextResponse.json(
        { ok: false, error: verificacion.error },
        { status: 400 }
      );
    }
    await guardarConfigCorreo(datos.usuario, clave);
    return NextResponse.json({ ok: true, usuario: datos.usuario });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Escribe un correo válido (ej. nombre@gmail.com) y la contraseña de aplicación de Google.",
        },
        { status: 400 }
      );
    }
    console.error("[PUT /api/admin/correo]", error);
    return NextResponse.json(
      { ok: false, error: "No se pudo guardar la configuración del correo." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!adminDeRequest(req)) return noAutorizado();
  try {
    const config = await obtenerConfigCorreo();
    if (!config) {
      return NextResponse.json(
        { ok: false, error: "Primero guarda la cuenta de correo de envío." },
        { status: 400 }
      );
    }
    await enviarCorreo(config, {
      para: config.usuario,
      asunto: "Prueba de correo · By-Sil Jabones Artesanales",
      texto:
        "¡Todo en orden! Los clientes que dejen su correo recibirán el respaldo de su pedido desde esta cuenta.",
      html: '<p style="font-family:Arial,sans-serif;font-size:16px;">¡Todo en orden! \u{1f33f}<br>Los clientes que dejen su correo recibirán el respaldo de su pedido desde esta cuenta.</p>',
    });
    return NextResponse.json({ ok: true, para: config.usuario });
  } catch (error) {
    console.error("[POST /api/admin/correo]", error);
    return NextResponse.json(
      {
        ok: false,
        error:
          "No se pudo enviar el correo de prueba. Vuelve a guardar la contraseña de aplicación.",
      },
      { status: 502 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  if (!adminDeRequest(req)) return noAutorizado();
  try {
    await borrarConfigCorreo();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/admin/correo]", error);
    return NextResponse.json(
      { ok: false, error: "No se pudo desactivar el envío." },
      { status: 500 }
    );
  }
}
