import type { NextConfig } from "next";

/**
 * Configuración de despliegue:
 *
 * ▶ VERCEL (producción recomendada): build normal de Next.js. Las rutas API
 *   y el panel de administración funcionan con la base de datos PostgreSQL
 *   (DATABASE_URL la inyecta la integración de Vercel Postgres / Neon).
 *   No se necesita ninguna variable especial.
 *
 * ▶ GITHUB PAGES (solo la tienda, sin panel admin): exportación estática.
 *   Actívala con la variable de entorno NEXT_STATIC_EXPORT=1; el `basePath`
 *   se toma de NEXT_PUBLIC_BASE_PATH para que funcione en
 *   usuario.github.io/<repo> (déjala vacía si usas dominio propio).
 *   Las imágenes van sin optimizar porque Pages no ejecuta servidor.
 */
const nextConfig: NextConfig = {
  // Servidor autocontenido para `npm run start` local (.next/standalone).
  // Vercel ignora esta opción y usa su propio empaquetado.
  output: process.env.NEXT_STATIC_EXPORT === "1" ? ("export" as const) : "standalone",
  trailingSlash: true,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
