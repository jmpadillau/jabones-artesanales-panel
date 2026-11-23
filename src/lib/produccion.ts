/**
 * ============================================================
 *  PRODUCCIÓN POR LOTES — agrupa lo pendiente de fabricar
 * ============================================================
 *  Toma las líneas de los pedidos que todavía están Pendiente
 *  (y cuyo jabón aún no está Realizado) y las agrupa por
 *  tamaño, aceite esencial y/o aroma, sumando las unidades de
 *  distintos pedidos. Ejemplo: «5 jabones de 100 g · Lavanda».
 *  Funciones puras: se pueden usar en servidor y en cliente.
 * ============================================================
 */

import { TAMANOS } from "@/lib/jabones";

/** Datos mínimos de una línea de pedido para planificar producción. */
export interface FilaProduccion {
  id: string;
  codigo: string;
  estado: string; // estado del pedido
  estadoItem: string; // estatus del jabón: Pendiente | Realizado
  clienteNombre: string;
  tamanoId: string;
  aceite: string | null;
  aroma: string | null;
  cantidad: number;
}

/** Qué datos se usan para formar cada lote. */
export interface Dimensiones {
  tamano: boolean;
  aceite: boolean;
  aroma: boolean;
}

export interface FiltrosProduccion {
  tamanoId: string; // "" = todos
  aceite: string; // "" = todos
  aroma: string; // "" = todos
}

export interface LoteProduccion {
  clave: string;
  tamanoId: string | null;
  gramos: number | null;
  aceite: string | null;
  aroma: string | null;
  unidades: number;
  gramosTotales: number | null;
  pedidos: number;
  lineas: FilaProduccion[];
}

export const SIN_ACEITE = "Sin aceite definido";
export const SIN_AROMA = "Sin aroma definido";

/** Una línea cuenta como «pendiente de fabricar» si su pedido está
 *  Pendiente y su jabón todavía no se marcó como Realizado. */
export function esPendienteDeFabricar(f: FilaProduccion): boolean {
  return f.estado === "Pendiente" && f.estadoItem !== "Realizado";
}

export function gramosDe(tamanoId: string): number | null {
  return TAMANOS.find((t) => t.id === tamanoId)?.gramos ?? null;
}

/** Opciones disponibles para los filtros (según lo que hay pendiente). */
export function opcionesFiltro(filas: FilaProduccion[]) {
  const pendientes = filas.filter(esPendienteDeFabricar);
  const unicos = (valores: (string | null)[]) =>
    [...new Set(valores.map((v) => v ?? ""))].filter(Boolean).sort((a, b) => a.localeCompare(b, "es"));
  const tamanos = TAMANOS.filter((t) => pendientes.some((f) => f.tamanoId === t.id));
  return {
    tamanos,
    aceites: unicos(pendientes.map((f) => f.aceite)),
    aromas: unicos(pendientes.map((f) => f.aroma)),
  };
}

/** Agrupa las líneas pendientes en lotes según las dimensiones elegidas. */
export function agruparProduccion(
  filas: FilaProduccion[],
  dims: Dimensiones,
  filtros: FiltrosProduccion
): LoteProduccion[] {
  const mapa = new Map<string, LoteProduccion>();

  for (const f of filas) {
    if (!esPendienteDeFabricar(f)) continue;
    if (filtros.tamanoId && f.tamanoId !== filtros.tamanoId) continue;
    if (filtros.aceite && (f.aceite ?? "") !== filtros.aceite) continue;
    if (filtros.aroma && (f.aroma ?? "") !== filtros.aroma) continue;

    const tamanoId = dims.tamano ? f.tamanoId : null;
    const aceite = dims.aceite ? (f.aceite ?? "") : null;
    const aroma = dims.aroma ? (f.aroma ?? "") : null;
    const clave = JSON.stringify([tamanoId, aceite, aroma]);

    let lote = mapa.get(clave);
    if (!lote) {
      lote = {
        clave,
        tamanoId,
        gramos: tamanoId ? gramosDe(tamanoId) : null,
        aceite,
        aroma,
        unidades: 0,
        gramosTotales: tamanoId ? 0 : null,
        pedidos: 0,
        lineas: [],
      };
      mapa.set(clave, lote);
    }
    lote.unidades += f.cantidad;
    if (lote.gramosTotales !== null) {
      lote.gramosTotales += (gramosDe(f.tamanoId) ?? 0) * f.cantidad;
    }
    lote.lineas.push(f);
  }

  const lotes = [...mapa.values()];
  for (const l of lotes) {
    l.pedidos = new Set(l.lineas.map((x) => x.codigo)).size;
  }
  return lotes.sort(
    (a, b) =>
      b.unidades - a.unidades ||
      (b.gramos ?? 0) - (a.gramos ?? 0) ||
      etiquetaLote(a).localeCompare(etiquetaLote(b), "es")
  );
}

/** Texto del lote, p. ej. «5 jabones de 100 g · Lavanda · Campos de Lavanda». */
export function etiquetaLote(l: LoteProduccion): string {
  const base =
    `${l.unidades} ${l.unidades === 1 ? "jabón" : "jabones"}` +
    (l.gramos ? ` de ${l.gramos} g` : "");
  const partes = [
    l.aceite !== null ? l.aceite || SIN_ACEITE : null,
    l.aroma !== null ? l.aroma || SIN_AROMA : null,
  ].filter(Boolean);
  return partes.length > 0 ? `${base} · ${partes.join(" · ")}` : base;
}
