/**
 * POST /api/pedidos — endpoint PÚBLICO que recibe el pedido del configurador.
 * Acepta UNA o VARIAS líneas (distinto aceite/aroma/tamaño/cantidad): cada
 * línea se guarda como una fila con el MISMO código de pedido, y el panel las
 * agrupa por código. Todo queda en estado "Pendiente" y aparece de inmediato
 * en el panel de la administradora. El flujo de WhatsApp se mantiene igual;
 * este guardado es un respaldo automático para el panel.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { TAMANOS, nombreProducto } from "@/lib/jabones";

// Limitador simple en memoria: máx. 12 pedidos por IP cada hora (anti-abuso).
const VENTANA_MS = 60 * 60 * 1000;
const MAX_POR_VENTANA = 12;
const intentos = new Map<string, number[]>();

function excedeLimite(ip: string): boolean {
  const ahora = Date.now();
  const previos = (intentos.get(ip) ?? []).filter((t) => ahora - t < VENTANA_MS);
  previos.push(ahora);
  intentos.set(ip, previos);
  if (intentos.size > 500) {
    for (const [k, v] of intentos) {
      if (v.every((t) => ahora - t > VENTANA_MS)) intentos.delete(k);
    }
  }
  return previos.length > MAX_POR_VENTANA;
}

const esquemaLinea = z.object({
  tipoPiel: z.string().trim().max(80).optional().or(z.literal("")),
  aceite: z.string().trim().max(80).optional().or(z.literal("")),
  aroma: z.string().trim().max(80).optional().or(z.literal("")),
  tamanoId: z.string().trim().max(10),
  cantidad: z.number().int().min(1).max(50),
});

const esquemaPedido = z.object({
  codigo: z.string().trim().max(40).regex(/^PED-[A-Za-z0-9-]+$/),
  clienteNombre: z.string().trim().min(2).max(120),
  clienteTelefono: z.string().trim().min(6).max(30),
  clienteEmail: z.string().trim().max(160).optional().or(z.literal("")),
  direccion: z.string().trim().min(5).max(400),
  metodoPago: z.string().trim().max(60),
  lineas: z.array(esquemaLinea).min(1).max(20),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    if (excedeLimite(ip)) {
      return NextResponse.json(
        { ok: false, error: "Demasiados pedidos seguidos. Intenta más tarde." },
        { status: 429 }
      );
    }

    const cuerpo = await req.json();
    const datos = esquemaPedido.parse(cuerpo);

    // El precio SIEMPRE se calcula en el servidor con el catálogo oficial.
    const lineasValidadas = datos.lineas.map((l) => {
      const tamano = TAMANOS.find((t) => t.id === l.tamanoId);
      if (!tamano) throw new Error(`Tamaño no válido: ${l.tamanoId}`);
      return { ...l, tamano };
    });

    // Si el mismo código ya fue registrado (cliente reenvió), no duplicar.
    const existente = await db.pedido.findFirst({
      where: { codigo: datos.codigo },
      select: { id: true },
    });
    if (existente) {
      return NextResponse.json({ ok: true, duplicado: true }, { status: 200 });
    }

    const creadoEn = new Date();
    await db.pedido.createMany({
      data: lineasValidadas.map((l, i) => ({
        codigo: datos.codigo,
        lineaNum: i + 1,
        estado: "Pendiente",
        clienteNombre: datos.clienteNombre,
        clienteTelefono: datos.clienteTelefono,
        clienteEmail: datos.clienteEmail || null,
        direccion: datos.direccion,
        metodoPago: datos.metodoPago,
        producto: nombreProducto({ aceite: l.aceite, tamano: l.tamano }),
        tipoPiel: l.tipoPiel || null,
        aceite: l.aceite || null,
        aroma: l.aroma || null,
        tamanoId: l.tamano.id,
        tamanoEtiqueta: `${l.tamano.etiqueta} · ${l.tamano.gramos} g`,
        cantidad: l.cantidad,
        precioUnit: l.tamano.precio,
        total: l.tamano.precio * l.cantidad,
        creadoEn,
      })),
    });

    return NextResponse.json(
      { ok: true, id: datos.codigo, lineas: lineasValidadas.length },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Datos del pedido incompletos o inválidos." },
        { status: 400 }
      );
    }
    console.error("[POST /api/pedidos]", error);
    return NextResponse.json(
      { ok: false, error: "No pudimos registrar el pedido." },
      { status: 500 }
    );
  }
}
