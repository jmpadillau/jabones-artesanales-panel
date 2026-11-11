/**
 * ============================================================
 *  COSTOS DE PRODUCCIÓN
 * ============================================================
 *  - Costo por tamaño: ₡ de producir un jabón de cada tamaño.
 *    Precarga los valores estimados del panel de administración
 *    original (gestion_admin_jabones.py):
 *      50 g ₡400 · 75 g ₡600 · 100 g ₡800 · 150 g ₡1.200
 *  - Materias primas: registro de compras con costo unitario
 *    calculado (costo total ÷ cantidad comprada).
 * ============================================================
 */

import { db } from "@/lib/db";
import { TAMANOS } from "@/lib/jabones";

/** Crea los costos por tamaño iniciales si la tabla está vacía. */
export async function asegurarCostosIniciales(): Promise<void> {
  const existentes = await db.costoTamano.count();
  if (existentes > 0) return;
  const estimados: Record<string, number> = {
    "50g": 400,
    "75g": 600,
    "100g": 800,
    "150g": 1200,
  };
  for (const t of TAMANOS) {
    await db.costoTamano.upsert({
      where: { tamanoId: t.id },
      update: {},
      create: {
        tamanoId: t.id,
        etiqueta: `${t.etiqueta} · ${t.gramos} g`,
        costoUnitario: estimados[t.id] ?? 0,
      },
    });
  }
}

/** Mapa tamanoId → costo unitario (asegura la precarga primero). */
export async function mapaCostosPorTamano(): Promise<Record<string, number>> {
  await asegurarCostosIniciales();
  const filas = await db.costoTamano.findMany();
  return Object.fromEntries(filas.map((f) => [f.tamanoId, f.costoUnitario]));
}

export const CATEGORIAS_MATERIA = [
  "Base de jabón",
  "Aceite esencial",
  "Esencia / Aroma",
  "Colorante",
  "Botánicos / Aditivos",
  "Envase / Empaque",
  "Etiqueta",
  "Otros",
] as const;

export const UNIDADES_MATERIA = ["g", "ml", "unidad"] as const;
