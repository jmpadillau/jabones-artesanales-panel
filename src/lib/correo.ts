/**
 * ============================================================
 *  CORREO DE RESPALDO DEL PEDIDO AL CLIENTE (Gmail)
 * ============================================================
 *  Cuando un cliente deja su correo al hacer el pedido, recibe un
 *  resumen con el mismo formato del mensaje de WhatsApp. SOLO lo
 *  recibe el cliente: la artesana ya ve el pedido en el panel.
 *
 *  La cuenta de envío (Gmail + «contraseña de aplicación» de Google)
 *  se cambia desde Panel → Ajustes, igual que el número de WhatsApp:
 *   - Ajuste "correo_usuario": la dirección de Gmail.
 *   - Ajuste "correo_clave":  la contraseña de aplicación, GUARDADA
 *     CIFRADA (AES-256-GCM). Nunca se vuelve a mostrar en pantalla.
 *
 *  ⚠️ En Vercel conviene definir AUTH_SECRET: con él se cifra la
 *  contraseña. Si algún día cambia AUTH_SECRET, hay que volver a
 *  escribir la contraseña de aplicación en Ajustes.
 * ============================================================
 */

import crypto from "node:crypto";
import nodemailer from "nodemailer";
import {
  MARCA_LARGA,
  SORPRENDEME,
  construirMensajePedido,
  formatoCRC,
  nombreProducto,
  subtotalLinea,
  totalPedido,
  unidadesPedido,
  type DatosCliente,
  type LineaPedido,
  type MetodoPago,
} from "@/lib/jabones";

const CLAVE_USUARIO = "correo_usuario";
const CLAVE_SECRETA = "correo_clave";

// ------------------------------------------------------------
//  Cifrado de la contraseña de aplicación
// ------------------------------------------------------------

function claveCifrado(): Buffer {
  const base = process.env.AUTH_SECRET?.trim() || "bysil-jabones::correo-v1";
  return crypto.createHash("sha256").update(`correo::${base}`).digest();
}

export function cifrar(texto: string): string {
  const iv = crypto.randomBytes(12);
  const cifrador = crypto.createCipheriv("aes-256-gcm", claveCifrado(), iv);
  const datos = Buffer.concat([cifrador.update(texto, "utf8"), cifrador.final()]);
  const etiqueta = cifrador.getAuthTag();
  return [
    "v1",
    iv.toString("base64url"),
    etiqueta.toString("base64url"),
    datos.toString("base64url"),
  ].join(".");
}

export function descifrar(almacen: string): string | null {
  try {
    const [version, iv, etiqueta, datos] = almacen.split(".");
    if (version !== "v1" || !iv || !etiqueta || !datos) return null;
    const descifrador = crypto.createDecipheriv(
      "aes-256-gcm",
      claveCifrado(),
      Buffer.from(iv, "base64url")
    );
    descifrador.setAuthTag(Buffer.from(etiqueta, "base64url"));
    return Buffer.concat([
      descifrador.update(Buffer.from(datos, "base64url")),
      descifrador.final(),
    ]).toString("utf8");
  } catch {
    return null;
  }
}

// ------------------------------------------------------------
//  Configuración guardada (tabla Ajuste)
// ------------------------------------------------------------

export interface ConfigCorreo {
  usuario: string;
  clave: string;
}

export interface EstadoCorreo {
  usuario: string | null;
  configurado: boolean;
}

/** Quita espacios: Google muestra la clave como «abcd efgh ijkl mnop». */
export function limpiarClave(clave: string): string {
  return clave.replace(/\s+/g, "");
}

export function esCorreoValido(correo: string): boolean {
  return (
    correo.length <= 160 &&
    /^[^\s@<>"',;]+@[^\s@<>"',;]+\.[^\s@<>"',;]{2,}$/.test(correo)
  );
}

/** Config completa (con contraseña descifrada) para poder enviar. */
export async function obtenerConfigCorreo(): Promise<ConfigCorreo | null> {
  try {
    const { db } = await import("@/lib/db");
    const filas = await db.ajuste.findMany({
      where: { clave: { in: [CLAVE_USUARIO, CLAVE_SECRETA] } },
    });
    const usuario = filas.find((f) => f.clave === CLAVE_USUARIO)?.valor;
    const cifrada = filas.find((f) => f.clave === CLAVE_SECRETA)?.valor;
    if (!usuario || !cifrada) return null;
    const clave = descifrar(cifrada);
    if (!clave) return null;
    return { usuario, clave };
  } catch {
    return null;
  }
}

/** Estado para mostrar en Ajustes (nunca incluye la contraseña). */
export async function estadoCorreo(): Promise<EstadoCorreo> {
  const config = await obtenerConfigCorreo();
  if (config) return { usuario: config.usuario, configurado: true };
  try {
    const { db } = await import("@/lib/db");
    const fila = await db.ajuste.findUnique({ where: { clave: CLAVE_USUARIO } });
    return { usuario: fila?.valor ?? null, configurado: false };
  } catch {
    return { usuario: null, configurado: false };
  }
}

export async function guardarConfigCorreo(
  usuario: string,
  clave: string
): Promise<void> {
  const { db } = await import("@/lib/db");
  await db.ajuste.upsert({
    where: { clave: CLAVE_USUARIO },
    update: { valor: usuario },
    create: { clave: CLAVE_USUARIO, valor: usuario },
  });
  await db.ajuste.upsert({
    where: { clave: CLAVE_SECRETA },
    update: { valor: cifrar(clave) },
    create: { clave: CLAVE_SECRETA, valor: cifrar(clave) },
  });
}

/** Desactiva el envío de correos (borra usuario y contraseña). */
export async function borrarConfigCorreo(): Promise<void> {
  const { db } = await import("@/lib/db");
  await db.ajuste.deleteMany({
    where: { clave: { in: [CLAVE_USUARIO, CLAVE_SECRETA] } },
  });
}

// ------------------------------------------------------------
//  Envío por SMTP (Gmail)
// ------------------------------------------------------------

function crearTransporte(usuario: string, clave: string) {
  const host = process.env.CORREO_SMTP_HOST?.trim() || "smtp.gmail.com";
  const puerto = Number(process.env.CORREO_SMTP_PORT) || 465;
  return nodemailer.createTransport({
    host,
    port: puerto,
    secure: puerto === 465,
    auth: { user: usuario, pass: clave },
    // Tiempos cortos: el pedido no debe quedar esperando a Gmail.
    connectionTimeout: 6000,
    greetingTimeout: 6000,
    socketTimeout: 8000,
  });
}

export type ResultadoVerificacion = { ok: true } | { ok: false; error: string };

/** Comprueba que Gmail acepte el usuario y la contraseña de aplicación. */
export async function verificarCredenciales(
  usuario: string,
  clave: string
): Promise<ResultadoVerificacion> {
  const transporte = crearTransporte(usuario, limpiarClave(clave));
  try {
    await transporte.verify();
    return { ok: true };
  } catch (error) {
    const e = error as { code?: string; responseCode?: number };
    if (e.code === "EAUTH" || e.responseCode === 535) {
      return {
        ok: false,
        error:
          "Gmail no aceptó la cuenta o la contraseña. Usa una «contraseña de aplicación» de Google (no la contraseña normal del correo).",
      };
    }
    console.error("[correo] verificación", error);
    return {
      ok: false,
      error: "No se pudo conectar con Gmail. Intenta de nuevo en unos minutos.",
    };
  } finally {
    transporte.close();
  }
}

export async function enviarCorreo(
  config: ConfigCorreo,
  mensaje: { para: string; asunto: string; texto: string; html: string }
): Promise<void> {
  const transporte = crearTransporte(config.usuario, config.clave);
  try {
    await transporte.sendMail({
      from: { name: MARCA_LARGA, address: config.usuario },
      to: mensaje.para,
      subject: mensaje.asunto,
      text: mensaje.texto,
      html: mensaje.html,
    });
  } finally {
    transporte.close();
  }
}

// ------------------------------------------------------------
//  Contenido del correo: mismo formato que el mensaje de WhatsApp
// ------------------------------------------------------------

function esc(valor: string): string {
  return valor
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export interface EntradaCorreoPedido {
  codigo: string;
  cliente: DatosCliente;
  lineas: LineaPedido[];
}

export function construirCorreoPedido(entrada: EntradaCorreoPedido): {
  asunto: string;
  texto: string;
  html: string;
} {
  const { codigo, cliente, lineas } = entrada;
  const fecha = new Date().toLocaleDateString("es-CR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/Costa_Rica",
  });
  const asunto = `Tu pedido ${codigo} · ${MARCA_LARGA}`;

  const intro = `¡Gracias por tu pedido, ${cliente.nombre}! Te enviamos este respaldo con el resumen de lo que solicitaste. Confirmaremos disponibilidad, pago y entrega por WhatsApp.`;
  const cierre =
    "Si algún dato no es correcto, escríbenos por WhatsApp. ¡Gracias por elegir By-Sil! \u{1f33f}";

  // ---- Versión de texto plano: igual al mensaje de WhatsApp ----
  const cuerpoTexto = construirMensajePedido(lineas, cliente, codigo)
    .replace(/\*/g, "")
    .replace("NUEVO PEDIDO", "TU PEDIDO");
  const texto = `${intro}\n\n${cuerpoTexto}\n\n${cierre}`;

  // ---- Versión HTML ----
  const linea = "border-top:1px solid #d9d2c0;margin:14px 0;";
  const bloqueLineas = lineas
    .map((l, i) => {
      const detalle = [
        l.aroma
          ? `Aroma: ${
              l.aroma === SORPRENDEME
                ? "Sorpréndeme (a elección de By-Sil)"
                : l.aroma
            }`
          : null,
        l.piel ? `Piel: ${l.piel.nombre}` : null,
        l.tamano ? `${l.tamano.gramos} g × ${l.cantidad}` : null,
      ]
        .filter(Boolean)
        .join(" · ");
      return `<p style="margin:0 0 10px 0;"><strong>${i + 1}. ${esc(
        nombreProducto(l)
      )}</strong> — ${esc(formatoCRC(subtotalLinea(l)))}<br><span style="color:#5a6b5c;font-size:14px;">${esc(
        detalle
      )}</span></p>`;
    })
    .join("");

  const filaDato = (icono: string, etiqueta: string, valor: string) =>
    `<p style="margin:0 0 6px 0;">${icono} <strong>${etiqueta}:</strong> ${esc(valor)}</p>`;

  const html = `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:24px 12px;background:#f6f1e7;font-family:Arial,Helvetica,sans-serif;color:#2b2b2b;font-size:16px;line-height:1.45;">
<div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5ded0;border-radius:14px;padding:24px;">
<p style="margin:0 0 16px 0;color:#2d4a3e;">${esc(intro)}</p>
<div style="background:#eef3e6;border-radius:10px;padding:16px;">
<p style="margin:0 0 6px 0;font-size:17px;"><strong>\u{1f33f} TU PEDIDO — ${esc(MARCA_LARGA)} \u{1f33f}</strong></p>
<p style="margin:0;">\u{1f9fe} Pedido: <strong>${esc(codigo)}</strong> &nbsp;·&nbsp; ${esc(fecha)}</p>
<div style="${linea}"></div>
<p style="margin:0 0 10px 0;">\u{1f9fc} <strong>Jabones solicitados (${unidadesPedido(lineas)}):</strong></p>
${bloqueLineas}
<div style="${linea}"></div>
<p style="margin:0;font-size:18px;">\u{1f4b0} <strong>Total: ${esc(formatoCRC(totalPedido(lineas)))}</strong></p>
<div style="${linea}"></div>
${filaDato("\u{1f464}", "Cliente", cliente.nombre)}
${filaDato("\u{1f4f1}", "Teléfono", cliente.telefono)}
${cliente.email ? filaDato("\u{1f4e7}", "Email", cliente.email) : ""}
${filaDato("\u{1f4cd}", "Dirección de envío", cliente.direccion)}
${filaDato("\u{1f4b3}", "Método de pago", cliente.metodoPago)}
</div>
<p style="margin:16px 0 0 0;color:#2d4a3e;">${esc(cierre)}</p>
</div>
<p style="max-width:560px;margin:12px auto 0 auto;text-align:center;font-size:12px;color:#8c7a6b;">Este correo es un respaldo automático de tu pedido; no es necesario responderlo.</p>
</body></html>`;

  return { asunto, texto, html };
}

/** Envía el respaldo al cliente. Devuelve "sin_configurar" si la
 *  administradora todavía no ha puesto una cuenta de Gmail en Ajustes. */
export async function enviarConfirmacionPedido(entrada: {
  codigo: string;
  nombre: string;
  telefono: string;
  email: string;
  direccion: string;
  metodoPago: string;
  lineas: LineaPedido[];
}): Promise<"enviado" | "sin_configurar"> {
  const config = await obtenerConfigCorreo();
  if (!config) return "sin_configurar";

  const cliente: DatosCliente = {
    nombre: entrada.nombre,
    telefono: entrada.telefono,
    email: entrada.email,
    direccion: entrada.direccion,
    metodoPago: entrada.metodoPago as MetodoPago,
  };
  const contenido = construirCorreoPedido({
    codigo: entrada.codigo,
    cliente,
    lineas: entrada.lineas,
  });
  await enviarCorreo(config, { para: entrada.email, ...contenido });
  return "enviado";
}
