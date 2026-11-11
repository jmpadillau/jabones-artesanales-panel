/**
 * ============================================================
 *  CONFIGURACIÓN DEL SITIO — CUENTA ADMIN Y NÚMERO DE WHATSAPP
 * ============================================================
 *  - AdminUser: cuenta de la administradora guardada en la base
 *    de datos (hash scrypt + salt, mismo formato que el panel
 *    de By-Sil). Se crea sola la primera vez con ADMIN_PASSWORD
 *    o con la contraseña inicial por defecto.
 *  - Ajuste (clave-valor): guarda el número de WhatsApp vigente
 *    de la tienda. La web pública lo lee en cada visita, así que
 *    los cambios desde Panel → Ajustes se reflejan al instante.
 * ============================================================
 */

import crypto from "node:crypto";
import { db } from "@/lib/db";
import { WHATSAPP_TIENDA } from "@/lib/jabones";
import { usuarioAdmin } from "@/lib/auth";

/** Contraseña inicial SOLO si no existe la cuenta y no hay ADMIN_PASSWORD.
 *  Es la misma contraseña que la administradora usa en el panel de By-Sil. */
export const CONTRASENA_INICIAL_POR_DEFECTO = "BySil8841";

export function contraseñaInicial(): string {
  return process.env.ADMIN_PASSWORD?.trim() || CONTRASENA_INICIAL_POR_DEFECTO;
}

/** true cuando el sitio aún corre con la contraseña sembrada por defecto
 *  (sin ADMIN_PASSWORD). Se usa para avisar en el login y en Ajustes. */
export function usaContraseñaPorDefecto(): boolean {
  return !process.env.ADMIN_PASSWORD?.trim();
}

/** Hash en el mismo formato del panel By-Sil: "scrypt$salt$hash". */
export function hashContraseña(plain: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(plain, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

/** Verifica una contraseña contra el hash almacenado (tiempo constante). */
export function verificarContraseña(plain: string, almacen: string): boolean {
  const [esquema, salt, hash] = almacen.split("$");
  if (esquema !== "scrypt" || !salt || !hash) return false;
  const calculado = crypto.scryptSync(plain, salt, 64).toString("hex");
  const a = Buffer.from(calculado, "hex");
  const b = Buffer.from(hash, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Crea la cuenta de la administradora si la tabla está vacía. */
export async function asegurarAdminUsuario(): Promise<void> {
  const existentes = await db.adminUser.count();
  if (existentes > 0) return;
  await db.adminUser.create({
    data: {
      usuario: usuarioAdmin(),
      passwordHash: hashContraseña(contraseñaInicial()),
    },
  });
}

/** Crea el ajuste del número de WhatsApp si no existe. */
export async function asegurarAjustesIniciales(): Promise<void> {
  await db.ajuste.upsert({
    where: { clave: "whatsapp" },
    update: {},
    create: { clave: "whatsapp", valor: WHATSAPP_TIENDA },
  });
}

/** Número de WhatsApp vigente de la tienda (tabla Ajuste o valor inicial). */
export async function numeroWhatsappTienda(): Promise<string> {
  try {
    await asegurarAjustesIniciales();
    const ajuste = await db.ajuste.findUnique({ where: { clave: "whatsapp" } });
    if (ajuste?.valor && /^\d{8,15}$/.test(ajuste.valor)) return ajuste.valor;
  } catch {
    // Base de datos no disponible: se usa el número inicial del catálogo.
  }
  return WHATSAPP_TIENDA;
}

/** Valida las credenciales contra la cuenta guardada en la base de datos. */
export async function credencialesValidasBD(
  usuario: string,
  contraseña: string
): Promise<boolean> {
  await asegurarAdminUsuario();
  // La cuenta se siembra con el usuario oficial (p. ej. "admin").
  const cuenta =
    (await db.adminUser.findUnique({ where: { usuario } })) ??
    (await db.adminUser.findFirst({
      where: { usuario: { in: [usuario, usuario.toLowerCase()] } },
    }));
  if (!cuenta) return false;
  return verificarContraseña(contraseña, cuenta.passwordHash);
}

export interface ResultadoCambio {
  ok: boolean;
  error?: string;
}

/** Cambia la contraseña de la administradora (verifica la actual). */
export async function cambiarContraseñaAdmin(
  usuario: string,
  actual: string,
  nueva: string
): Promise<ResultadoCambio> {
  await asegurarAdminUsuario();
  const cuenta = await db.adminUser.findUnique({ where: { usuario } });
  if (!cuenta) return { ok: false, error: "No existe la cuenta de administradora." };
  if (!verificarContraseña(actual, cuenta.passwordHash)) {
    return { ok: false, error: "La contraseña actual no es correcta." };
  }
  if (verificarContraseña(nueva, cuenta.passwordHash)) {
    return { ok: false, error: "La nueva contraseña debe ser distinta de la actual." };
  }
  await db.adminUser.update({
    where: { id: cuenta.id },
    data: { passwordHash: hashContraseña(nueva) },
  });
  return { ok: true };
}

/** Guarda el número de WhatsApp de la tienda. */
export async function guardarNumeroWhatsapp(numero: string): Promise<void> {
  await asegurarAjustesIniciales();
  await db.ajuste.upsert({
    where: { clave: "whatsapp" },
    update: { valor: numero },
    create: { clave: "whatsapp", valor: numero },
  });
}
