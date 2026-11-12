/**
 * POST /api/admin/logout — cierra la sesión del panel.
 */

import { NextResponse } from "next/server";
import { COOKIE_ADMIN, opcionesCookie } from "@/lib/auth";

export async function POST() {
  const respuesta = NextResponse.json({ ok: true });
  respuesta.cookies.set(COOKIE_ADMIN, "", opcionesCookie(0));
  return respuesta;
}
