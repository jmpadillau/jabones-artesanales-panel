/**
 * ============================================================
 *  CÁLCULOS DEL PANEL — estados, ingresos, costos y ganancias
 * ============================================================
 *  Estados del pedido (flujo solicitado por la administradora):
 *    Pendiente → Realizado → Entregado   (+ Cancelado como extra)
 *  Cada transición guarda su propia marca de fecha y hora.
 *
 *  Ingresos: solo pedidos EN ESTADO "Entregado" (unidades vendidas).
 *  Ganancia: ingresos − costo de producción de las unidades entregadas.
 * ============================================================
 */

import { TAMANOS } from "@/lib/jabones";

export const ESTADOS = ["Pendiente", "Realizado", "Entregado", "Cancelado"] as const;
export type Estado = (typeof ESTADOS)[number];

export const ETIQUETA_ESTADO: Record<Estado, string> = {
  Pendiente: "Pendiente",
  Realizado: "Realizado",
  Entregado: "Entregado",
  Cancelado: "Cancelado",
};

/** Color del badge por estado (línea visual botánica). */
export const COLOR_ESTADO: Record<Estado, string> = {
  Pendiente: "#F39C12",
  Realizado: "#4A7A61",
  Entregado: "#2E5A44",
  Cancelado: "#B3413B",
};

export function esEstado(v: string): v is Estado {
  return (ESTADOS as readonly string[]).includes(v);
}

/** Transiciones permitidas en el panel. */
export function transicionesPermitidas(estado: Estado): Estado[] {
  switch (estado) {
    case "Pendiente":
      return ["Realizado", "Entregado", "Cancelado"];
    case "Realizado":
      return ["Entregado", "Pendiente", "Cancelado"];
    case "Entregado":
      return ["Pendiente"]; // corrección puntual (p. ej. entregó y devolvió)
    case "Cancelado":
      return ["Pendiente"]; // reactivar
  }
}

/** Fecha del hito principal del estado (para ordenar y filtrar). */
export function fechaDeEstado(p: {
  estado: string;
  entregadoEn: Date | null;
  canceladoEn: Date | null;
  realizadoEn: Date | null;
  creadoEn: Date;
}): Date {
  if (p.estado === "Entregado" && p.entregadoEn) return p.entregadoEn;
  if (p.estado === "Cancelado" && p.canceladoEn) return p.canceladoEn;
  if (p.estado === "Realizado" && p.realizadoEn) return p.realizadoEn;
  return p.creadoEn;
}

export interface PedidoParaCalculo {
  estado: string;
  tamanoId: string;
  cantidad: number;
  total: number;
  aceite: string | null;
  aroma: string | null;
  entregadoEn: Date | null;
  realizadoEn: Date | null;
  creadoEn: Date;
}

export interface Periodo {
  desde: Date;
  hasta: Date;
}

/** Devuelve {desde, hasta} para los periodos del selector de ganancias. */
export function periodoPorId(id: string, ahora = new Date()): Periodo {
  const inicioMes = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
  const mes = inicioMes(ahora);
  switch (id) {
    case "mes-actual":
      return { desde: mes, hasta: ahora };
    case "mes-pasado": {
      const desde = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);
      const hasta = new Date(ahora.getFullYear(), ahora.getMonth(), 0, 23, 59, 59, 999);
      return { desde, hasta };
    }
    case "trimestre": {
      const desde = new Date(ahora.getFullYear(), ahora.getMonth() - 2, 1);
      return { desde, hasta: ahora };
    }
    case "anio":
      return { desde: new Date(ahora.getFullYear(), 0, 1), hasta: ahora };
    default: // "todo"
      return { desde: new Date(2000, 0, 1), hasta: ahora };
  }
}

export const NOMBRES_PERIODO: Record<string, string> = {
  "mes-actual": "Este mes",
  "mes-pasado": "Mes pasado",
  trimestre: "Últimos 3 meses",
  anio: "Este año",
  todo: "Todo el historial",
};

export interface Totales {
  pedidos: number;
  unidades: number;
  ingresos: number;
  costoProduccion: number;
  ganancia: number;
  margen: number; // %
}

/**
 * Totales de UN grupo de pedidos ya filtrado por estado (normalmente Entregado).
 * costoPorTamano: mapa tamanoId → costo unitario en ₡.
 */
export function calcularTotales(
  pedidos: PedidoParaCalculo[],
  costoPorTamano: Record<string, number>
): Totales {
  let unidades = 0;
  let ingresos = 0;
  let costoProduccion = 0;
  for (const p of pedidos) {
    unidades += p.cantidad;
    ingresos += p.total;
    const costo = costoPorTamano[p.tamanoId] ?? 0;
    costoProduccion += costo * p.cantidad;
  }
  const ganancia = ingresos - costoProduccion;
  const margen = ingresos > 0 ? (ganancia / ingresos) * 100 : 0;
  return {
    pedidos: pedidos.length,
    unidades,
    ingresos,
    costoProduccion,
    ganancia,
    margen,
  };
}

/** Desglose por tamaño (para la tabla de ganancias). */
export function desglosePorTamano(
  pedidos: PedidoParaCalculo[],
  costoPorTamano: Record<string, number>
) {
  return TAMANOS.map((t) => {
    const delTamano = pedidos.filter((p) => p.tamanoId === t.id);
    const tot = calcularTotales(delTamano, costoPorTamano);
    return {
      tamanoId: t.id,
      etiqueta: `${t.etiqueta} · ${t.gramos} g`,
      pedidos: tot.pedidos,
      unidades: tot.unidades,
      ingresos: tot.ingresos,
      costo: tot.costoProduccion,
      ganancia: tot.ganancia,
    };
  }).filter((d) => d.pedidos > 0);
}

/** Top productos (aceites/aromas) por ingresos de pedidos entregados. */
export function topPor(
  pedidos: PedidoParaCalculo[],
  campo: "aceite" | "aroma",
  limite = 5
) {
  const mapa = new Map<string, { unidades: number; ingresos: number }>();
  for (const p of pedidos) {
    const clave = p[campo];
    if (!clave) continue;
    const actual = mapa.get(clave) ?? { unidades: 0, ingresos: 0 };
    actual.unidades += p.cantidad;
    actual.ingresos += p.total;
    mapa.set(clave, actual);
  }
  return [...mapa.entries()]
    .map(([nombre, v]) => ({ nombre, ...v }))
    .sort((a, b) => b.ingresos - a.ingresos)
    .slice(0, limite);
}

/** Serie mensual (últimos N meses) de ingresos y ganancia de pedidos entregados. */
export function serieMensual(
  pedidos: PedidoParaCalculo[],
  costoPorTamano: Record<string, number>,
  meses = 6,
  ahora = new Date()
) {
  const serie: { mes: string; etiqueta: string; ingresos: number; ganancia: number }[] = [];
  const nombres = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  for (let i = meses - 1; i >= 0; i--) {
    const d = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
    const siguiente = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const delMes = pedidos.filter((p) => {
      const f = p.entregadoEn;
      return f && f >= d && f < siguiente;
    });
    const tot = calcularTotales(delMes, costoPorTamano);
    serie.push({
      mes: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      etiqueta: nombres[d.getMonth()],
      ingresos: tot.ingresos,
      ganancia: tot.ganancia,
    });
  }
  return serie;
}

/** Fecha larga es-CR con hora: 06/11/2025, 3:45 p. m. */
export function formatoFechaHora(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const fecha = typeof d === "string" ? new Date(d) : d;
  return fecha.toLocaleString("es-CR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/** Fecha corta es-CR: 06/11/2025. */
export function formatoFecha(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const fecha = typeof d === "string" ? new Date(d) : d;
  return fecha.toLocaleDateString("es-CR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
