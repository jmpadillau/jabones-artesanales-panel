"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

/** Cierra la sesión del panel (POST /api/admin/logout). */
export function LogoutButton({
  className,
  icono,
  etiqueta,
}: {
  className?: string;
  icono: React.ReactNode;
  etiqueta: string;
}) {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);

  async function salir() {
    setCargando(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  }

  return (
    <button type="button" onClick={salir} className={className} disabled={cargando}>
      {cargando ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
      ) : (
        icono
      )}
      {etiqueta}
    </button>
  );
}
