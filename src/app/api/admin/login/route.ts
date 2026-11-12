/**
 * POST /api/admin/login — valida usuario y contraseña contra la cuenta
 * guardada en la base de datos (AdminUser) y crea la sesión mediante
 * cookie HttpOnly firmada (válida 12 horas).
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  COOKIE_ADMIN,
  crearTokenSesion,
  credencialesValidas,
  opcionesCookie,
} from "@/lib/auth";

const esquema = z.object({
  usuario: z.string().trim().min(1).max(60),
  contraseña: z.string().min(1).max(120),
});

// Máx. 8 intentos por IP cada 15 minutos (fuerza bruta).
const VENTANA_MS = 15 * 60 * 1000;
const MAX_INTENTOS = 8;
const intentos = new Map<string, number[]>();

function excedeIntentos(ip: string): boolean {
  const ahora = Date.now();
  const previos = (intentos.get(ip) ?? []).filter((t) => ahora - t < VENTANA_MS);
  previos.push(ahora);
  intentos.set(ip, previos);
  return previos.length > MAX_INTENTOS;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    if (excedeIntentos(ip)) {
      return NextResponse.json(
        { ok: false, error: "Demasiados intentos. Espera 15 minutos." },
        { status: 429 }
      );
    }

    const datos = esquema.parse(await req.json());
    if (!(await credencialesValidas(datos.usuario, datos.contraseña))) {
      return NextResponse.json(
        { ok: false, error: "Usuario o contraseña incorrectos." },
        { status: 401 }
      );
    }

    const respuesta = NextResponse.json({ ok: true });
    // Cookie "secure" solo si la petición llega por HTTPS; en pruebas por
    // HTTP (p. ej. http://localhost:3000) hay que poder guardar la cookie.
    const sobreHttps =
      (req.headers.get("x-forwarded-proto") ?? "").split(",")[0].trim() ===
        "https" || req.nextUrl.protocol === "https:";
    respuesta.cookies.set(
      COOKIE_ADMIN,
      crearTokenSesion(datos.usuario),
      opcionesCookie(12 * 60 * 60, sobreHttps)
    );
    return respuesta;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Completa usuario y contraseña." },
        { status: 400 }
      );
    }
    console.error("[POST /api/admin/login]", error);
    return NextResponse.json(
      { ok: false, error: "No se pudo iniciar sesión." },
      { status: 500 }
    );
  }
}
