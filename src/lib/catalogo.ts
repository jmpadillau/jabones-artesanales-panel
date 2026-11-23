/**
 * ============================================================
 *  CATÁLOGO DINÁMICO — ACEITES ESENCIALES Y AROMAS (servidor)
 * ============================================================
 *  Los aceites y aromas viven en la base de datos (tablas
 *  AceiteEsencial y Aroma) y se editan en Panel → Catálogo.
 *  La tienda los lee en cada visita, así que los cambios se
 *  reflejan al instante en el configurador.
 *
 *  La primera vez que se consulta, la base se llena con los
 *  valores originales de lib/jabones.ts (una sola vez: si luego
 *  la artesana elimina todo, no se vuelve a sembrar).
 *  Si la base falla, la tienda usa los valores originales.
 * ============================================================
 */

import { db } from "@/lib/db";
import {
  ACEITES,
  AROMAS,
  catalogoPorDefecto,
  construirCatalogo,
  pielesDeAceite,
  pielesDesdeTexto,
  type AceiteCatalogo,
  type AromaCatalogo,
  type CatalogoTienda,
} from "@/lib/jabones";

const CLAVE_SEMBRADO = "catalogo_sembrado";

/** Llena las tablas con el catálogo original la primera vez. */
export async function asegurarCatalogoInicial(): Promise<void> {
  const marca = await db.ajuste.findUnique({ where: { clave: CLAVE_SEMBRADO } });
  if (marca) return;

  for (let i = 0; i < ACEITES.length; i++) {
    const a = ACEITES[i];
    await db.aceiteEsencial.upsert({
      where: { nombre: a.nombre },
      update: {},
      create: {
        nombre: a.nombre,
        propiedades: a.propiedades,
        pieles: pielesDeAceite(a.nombre).join(","),
        orden: i,
      },
    });
  }
  for (let i = 0; i < AROMAS.length; i++) {
    const a = AROMAS[i];
    await db.aroma.upsert({
      where: { nombre: a.nombre },
      update: {},
      create: { nombre: a.nombre, descripcion: a.descripcion, orden: i },
    });
  }
  await db.ajuste.upsert({
    where: { clave: CLAVE_SEMBRADO },
    update: { valor: "1" },
    create: { clave: CLAVE_SEMBRADO, valor: "1" },
  });
}

/** Aceites para el panel de administración (con id). */
export async function listarAceites(): Promise<AceiteCatalogo[]> {
  await asegurarCatalogoInicial();
  const filas = await db.aceiteEsencial.findMany({
    orderBy: [{ orden: "asc" }, { nombre: "asc" }],
  });
  return filas.map((f) => ({
    id: f.id,
    nombre: f.nombre,
    propiedades: f.propiedades,
    pieles: pielesDesdeTexto(f.pieles),
  }));
}

/** Aromas para el panel de administración (con id). */
export async function listarAromas(): Promise<AromaCatalogo[]> {
  await asegurarCatalogoInicial();
  const filas = await db.aroma.findMany({
    orderBy: [{ orden: "asc" }, { nombre: "asc" }],
  });
  return filas.map((f) => ({
    id: f.id,
    nombre: f.nombre,
    descripcion: f.descripcion,
  }));
}

/** Catálogo que usa la tienda pública (con respaldo si la base falla). */
export async function obtenerCatalogoTienda(): Promise<CatalogoTienda> {
  try {
    const [aceites, aromas] = await Promise.all([listarAceites(), listarAromas()]);
    return construirCatalogo(aceites, aromas);
  } catch (error) {
    console.error("[catalogo] usando catálogo por defecto", error);
    return catalogoPorDefecto();
  }
}

/** Siguiente número de orden (al final de la lista). */
export async function siguienteOrden(tabla: "aceite" | "aroma"): Promise<number> {
  const ultimo =
    tabla === "aceite"
      ? await db.aceiteEsencial.findFirst({ orderBy: { orden: "desc" }, select: { orden: true } })
      : await db.aroma.findFirst({ orderBy: { orden: "desc" }, select: { orden: true } });
  return (ultimo?.orden ?? -1) + 1;
}
