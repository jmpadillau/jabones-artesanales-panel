import { PrismaClient } from '@prisma/client'

/**
 * ============================================================
 *  CLIENTE PRISMA (SQLite local / PostgreSQL en Vercel)
 * ============================================================
 *  Normaliza DATABASE_URL para SQLite: una ruta relativa como
 *  "file:./db/custom.db" debe resolverse SIEMPRE respecto a la
 *  carpeta del proyecto. En el servidor autocontenido
 *  (.next/standalone) la resolución por defecto cambia y fallaba
 *  con «Unable to open the database file»; con la ruta absoluta
 *  funciona igual en desarrollo y en producción.
 *  En Vercel la URL es de PostgreSQL (no empieza por "file:") y
 *  se usa tal cual.
 *  (Sin imports de node:path/node:fs: Turbopack no los permite
 *  en este contexto; la lógica es puro JS sobre process.cwd().)
 * ============================================================
 */

function urlBaseDeDatos(): string | undefined {
  const url = process.env.DATABASE_URL
  if (!url || !url.startsWith("file:")) return url

  const ruta = url.slice(5)
  // ¿Ya es absoluta? ("/…" en Unix o "C:\…" en Windows)
  if (ruta.startsWith("/") || /^[a-zA-Z]:[\\/]/.test(ruta)) return url

  // Relativa → absoluta respecto a la RAÍZ del proyecto.
  // Ojo: el servidor autocontenido (.next/standalone/server.js) cambia el
  // directorio de trabajo a su propia carpeta (process.chdir(__dirname)),
  // así que la raíz queda DOS niveles arriba cuando el CWD termina en
  // .next/standalone. En desarrollo (`bun run dev`) el CWD ya es la raíz.
  let raiz = process.cwd()
  for (const sufijo of ["/.next/standalone", "\\.next\\standalone"]) {
    if (raiz.endsWith(sufijo)) {
      raiz = raiz.slice(0, -sufijo.length)
      break
    }
  }
  const relativa = ruta.replace(/^\.\//, "").replace(/^\/+/, "")
  return `file:${raiz}/${relativa}`
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const urlNormalizada = urlBaseDeDatos()

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(urlNormalizada ? { datasources: { db: { url: urlNormalizada } } } : {}),
    // El registro de consultas solo en desarrollo: en producción llena
    // server.log de ruido.
    log: process.env.NODE_ENV === "production" ? [] : ["query"],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
