import { NextResponse } from "next/server";

// Necesario para que la ruta pueda exportarse en modo estático (GitHub Pages)
export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json({ message: "Hello, world!" });
}