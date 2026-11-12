"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Copy,
  Eye,
  EyeOff,
  Loader2,
  LogIn,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function LoginForm({
  contraseñaPorDefecto,
}: {
  contraseñaPorDefecto: boolean;
}) {
  const router = useRouter();
  const [usuario, setUsuario] = useState("admin");
  const [contraseña, setContraseña] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  const CONTRASENA_INICIAL = "BySil8841";

  async function copiarContraseña() {
    try {
      await navigator.clipboard.writeText(CONTRASENA_INICIAL);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Sin permiso del portapapeles: la contraseña sigue visible arriba.
    }
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, contraseña }),
      });
      const datos = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !datos.ok) {
        setError(datos.error ?? "No se pudo iniciar sesión.");
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="space-y-4">
      {contraseñaPorDefecto && (
        <Alert className="border-[#F39C12]/50 bg-[#F39C12]/10">
          <ShieldAlert className="h-4 w-4 text-[#B9770E]" aria-hidden />
          <AlertTitle className="text-[#B9770E]">Credenciales iniciales</AlertTitle>
          <AlertDescription className="text-[#9a6410]">
            El sitio aún usa la contraseña inicial. Ingresa exactamente con:
            <span className="mt-1 flex items-center justify-between gap-2 rounded-lg border border-[#F39C12]/40 bg-card px-3 py-2">
              <span className="font-mono text-[13px] text-foreground">
                Usuario: admin · Contraseña: {CONTRASENA_INICIAL}
              </span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={copiarContraseña}
                className="h-7 shrink-0 gap-1 rounded-full px-2.5 text-xs"
                aria-label="Copiar la contraseña inicial al portapapeles"
              >
                {copiado ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-primary" aria-hidden />
                    Copiada
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" aria-hidden />
                    Copiar
                  </>
                )}
              </Button>
            </span>
            <span className="mt-1.5 block">
              Ojo: lleva <strong>«Sil» con L minúscula</strong> (By-Sil), no el
              número 1. Usa el botón «Copiar» y pégala para evitar errores.
            </span>
            Después cámbiala en{" "}
            <strong>Panel → Ajustes → Cambiar contraseña</strong>
          </AlertDescription>
        </Alert>
      )}

      <form
        onSubmit={enviar}
        className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-lg sm:p-8"
        aria-label="Iniciar sesión en el panel"
      >
        <div className="space-y-1.5">
          <Label htmlFor="usuario">Usuario</Label>
          <Input
            id="usuario"
            name="usuario"
            autoComplete="username"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contraseña">Contraseña</Label>
          <div className="relative">
            <Input
              id="contraseña"
              name="contraseña"
              type={mostrar ? "text" : "password"}
              autoComplete="current-password"
              value={contraseña}
              onChange={(e) => setContraseña(e.target.value)}
              className="pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setMostrar((m) => !m)}
              className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
              aria-label={mostrar ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {mostrar ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
            </button>
          </div>
        </div>

        {error && (
          <div role="alert" className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <p>{error}</p>
            {contraseñaPorDefecto && error.includes("incorrectos") && (
              <p className="mt-1 text-xs opacity-90">
                Pista: la contraseña inicial es «BySil8841» con L minúscula —
                usa el botón «Copiar» del recuadro naranja y pégala aquí.
              </p>
            )}
          </div>
        )}

        <Button type="submit" className="w-full rounded-full" size="lg" disabled={cargando}>
          {cargando ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          ) : (
            <LogIn className="h-5 w-5" aria-hidden />
          )}
          Entrar al panel
        </Button>
      </form>
    </div>
  );
}
