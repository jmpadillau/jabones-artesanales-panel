/**
 * ============================================================
 *  AUTENTICACIÓN DEL PANEL DE ADMINISTRACIÓN
 * ============================================================
 *  Sesión simple y segura sin dependencias externas:
 *  - Cuenta de la administradora en la base de datos (AdminUser,
 *    hash scrypt; se siembra sola la primera vez — ver lib/ajustes.ts).
 *  - Cookie HttpOnly con token firmado (HMAC-SHA256) y expiración.
 *
 *  ⚠️ En Vercel define AUTH_SECRET (y opcionalmente ADMIN_PASSWORD
 *  para sembrar la contraseña inicial). La contraseña se cambia
 *  desde Panel → Ajustes y queda guardada en la base de datos.
 * ============================================================
 */

import crypto from "node:crypto";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

export const COOKIE_ADMIN = "jabon_admin";
/** Sesión válida por 12 horas. */
const DURACION_SESION_MS = 12 * 60 * 60 * 1000;

export function usuarioAdmin(): string {
  return process.env.ADMIN_USER?.trim() || "admin";
}

/** Secreto de firma de la sesión. Estable: no depende de la contraseña,
 *  así que cambiarla desde Ajustes no invalida la sesión abierta. */
function secreto(): string {
  return (
    process.env.AUTH_SECRET?.trim() ||
    `bysil-jabones::${usuarioAdmin()}::sesion-v1`
  );
}

function firmar(payload: string): string {
  return crypto
    .createHmac("sha256", secreto())
    .update(payload)
    .digest("base64url");
}

/** Crea el token de sesión: payload.exp firmado. */
export function crearTokenSesion(usuario: string): string {
  const payload = Buffer.from(
    JSON.stringify({ u: usuario, exp: Date.now() + DURACION_SESION_MS })
  ).toString("base64url");
  return `${payload}.${firmar(payload)}`;
}

/** Valida el token y devuelve el usuario si es vigente. */
export function verificarToken(token: string | undefined): string | null {
  if (!token || !token.includes(".")) return null;
  const [payload, firma] = token.split(".");
  const esperada = firmar(payload);
  const a = Buffer.from(firma);
  const b = Buffer.from(esperada);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const datos = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
      u: string;
      exp: number;
    };
    if (typeof datos.exp !== "number" || datos.exp < Date.now()) return null;
    return datos.u;
  } catch {
    return null;
  }
}

/** Compara credenciales de forma segura contra la base de datos (AdminUser).
 *  La validación de la contraseña vive en lib/ajustes.ts (scrypt + salt). */
export async function credencialesValidas(
  usuario: string,
  contraseña: string
): Promise<boolean> {
  const { credencialesValidasBD } = await import("@/lib/ajustes");
  return credencialesValidasBD(usuario, contraseña);
}

/** Para rutas API: devuelve el usuario admin o null. */
export function adminDeRequest(req: NextRequest): string | null {
  return verificarToken(req.cookies.get(COOKIE_ADMIN)?.value);
}

/** Para páginas de servidor: devuelve el usuario admin o null. */
export async function adminServidor(): Promise<string | null> {
  const jar = await cookies();
  return verificarToken(jar.get(COOKIE_ADMIN)?.value);
}

/** Opciones de la cookie de sesión. `secure` solo cuando el sitio corre
 *  sobre HTTPS (en Vercel siempre; en pruebas por HTTP local la cookie
 *  debe poder guardarse igual, o el login "no entra"). */
export function opcionesCookie(maxAge: number, sobreHttps?: boolean) {
  const secure =
    sobreHttps ??
    (process.env.NODE_ENV === "production" &&
      process.env.VERCEL_ENV !== undefined);
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure,
    path: "/",
    maxAge,
  };
}
