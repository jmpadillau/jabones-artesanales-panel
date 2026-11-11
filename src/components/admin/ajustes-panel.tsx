"use client";

import { useState } from "react";
import {
  BadgeCheck,
  Eye,
  EyeOff,
  Info,
  KeyRound,
  Loader2,
  MessageCircle,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { WHATSAPP_TIENDA } from "@/lib/jabones";

/**
 * Dos gestiones solicitadas por la administradora:
 *  1. Cambiar la contraseña de su cuenta.
 *  2. Actualizar el número de WhatsApp de la tienda.
 */

const soloDigitos = (v: string) => v.replace(/\D/g, "");

function formateaVista(numero: string): string {
  // 50688881234 → +506 8888 1234 (solo para mostrar)
  if (numero.length === 11 && numero.startsWith("506")) {
    return `+506 ${numero.slice(3, 7)} ${numero.slice(7)}`;
  }
  return `+${numero}`;
}

export function AjustesPanel({
  usuario,
  whatsappActual,
  contraseñaPorDefecto,
}: {
  usuario: string;
  whatsappActual: string;
  contraseñaPorDefecto: boolean;
}) {
  const { toast } = useToast();

  // ---- 1. Cambio de contraseña ----
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mostrarActual, setMostrarActual] = useState(false);
  const [mostrarNueva, setMostrarNueva] = useState(false);
  const [guardandoClave, setGuardandoClave] = useState(false);
  const [errorClave, setErrorClave] = useState<string | null>(null);

  async function cambiarContraseña(e: React.FormEvent) {
    e.preventDefault();
    setErrorClave(null);
    if (nueva.length < 8) {
      setErrorClave("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (nueva !== confirmar) {
      setErrorClave("La confirmación no coincide con la nueva contraseña.");
      return;
    }
    setGuardandoClave(true);
    try {
      const res = await fetch("/api/admin/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contraseñaActual: actual,
          contraseñaNueva: nueva,
        }),
      });
      const datos = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !datos.ok) {
        setErrorClave(datos.error ?? "No se pudo cambiar la contraseña.");
        return;
      }
      setActual("");
      setNueva("");
      setConfirmar("");
      toast({
        title: "Contraseña actualizada \u{1f512}",
        description:
          "Desde la próxima vez que entres al panel usa la contraseña nueva.",
      });
    } catch {
      setErrorClave("Error de conexión. Intenta de nuevo.");
    } finally {
      setGuardandoClave(false);
    }
  }

  // ---- 2. Número de WhatsApp ----
  const [numero, setNumero] = useState(whatsappActual || WHATSAPP_TIENDA);
  const [guardandoNumero, setGuardandoNumero] = useState(false);
  const numeroLimpio = soloDigitos(numero);
  const numeroValido = /^\d{8,15}$/.test(numeroLimpio);
  const cambiado = numeroLimpio !== whatsappActual;

  async function guardarNumero() {
    if (!numeroValido) {
      toast({
        variant: "destructive",
        title: "Número inválido",
        description:
          "Escribe el número con código de país y solo dígitos (ej. 50688888888).",
      });
      return;
    }
    setGuardandoNumero(true);
    try {
      const res = await fetch("/api/ajustes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsapp: numeroLimpio }),
      });
      const datos = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !datos.ok) {
        toast({
          variant: "destructive",
          title: "No se pudo guardar",
          description: datos.error ?? "Intenta de nuevo en unos minutos.",
        });
        return;
      }
      setNumero(numeroLimpio);
      toast({
        title: "Número de WhatsApp actualizado \u{1f4f1}",
        description:
          "Los botones de WhatsApp de la tienda ya usan el número nuevo.",
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Error de conexión",
        description: "No se pudo guardar el número. Intenta de nuevo.",
      });
    } finally {
      setGuardandoNumero(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* ======== 1. CONTRASEÑA ======== */}
      <section
        aria-labelledby="titulo-contrasena"
        className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6"
      >
        <div className="mb-1 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-salvia">
            <KeyRound className="h-5 w-5" aria-hidden />
          </span>
          <h2
            id="titulo-contrasena"
            className="font-display text-xl font-semibold text-foreground"
          >
            Cambiar contraseña
          </h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Cuenta de la administradora:{" "}
          <span className="font-mono font-medium text-foreground">{usuario}</span>
        </p>

        {contraseñaPorDefecto && (
          <Alert className="mt-4 border-[#F39C12]/50 bg-[#F39C12]/10">
            <Info className="h-4 w-4 text-[#B9770E]" aria-hidden />
            <AlertTitle className="text-[#B9770E]">
              Todavía usas la contraseña inicial
            </AlertTitle>
            <AlertDescription className="text-[#9a6410]">
              Por seguridad, cámbiala aquí la primera vez que entres al panel.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={cambiarContraseña} className="mt-4 space-y-4" aria-label="Cambiar contraseña">
          <div className="space-y-1.5">
            <Label htmlFor="clave-actual">Contraseña actual</Label>
            <div className="relative">
              <Input
                id="clave-actual"
                type={mostrarActual ? "text" : "password"}
                autoComplete="current-password"
                value={actual}
                onChange={(e) => setActual(e.target.value)}
                className="pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setMostrarActual((m) => !m)}
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label={mostrarActual ? "Ocultar contraseña actual" : "Mostrar contraseña actual"}
              >
                {mostrarActual ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="clave-nueva">Nueva contraseña</Label>
            <div className="relative">
              <Input
                id="clave-nueva"
                type={mostrarNueva ? "text" : "password"}
                autoComplete="new-password"
                value={nueva}
                onChange={(e) => setNueva(e.target.value)}
                className="pr-10"
                minLength={8}
                required
              />
              <button
                type="button"
                onClick={() => setMostrarNueva((m) => !m)}
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label={mostrarNueva ? "Ocultar nueva contraseña" : "Mostrar nueva contraseña"}
              >
                {mostrarNueva ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Mínimo 8 caracteres. Elige una que solo tú conozcas.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="clave-confirmar">Confirmar nueva contraseña</Label>
            <Input
              id="clave-confirmar"
              type={mostrarNueva ? "text" : "password"}
              autoComplete="new-password"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              minLength={8}
              required
            />
          </div>

          {errorClave && (
            <p role="alert" className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {errorClave}
            </p>
          )}

          <Button type="submit" className="w-full rounded-full" disabled={guardandoClave}>
            {guardandoClave ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            ) : (
              <KeyRound className="h-4 w-4" aria-hidden />
            )}
            Actualizar contraseña
          </Button>
        </form>
      </section>

      {/* ======== 2. WHATSAPP ======== */}
      <section
        aria-labelledby="titulo-whatsapp"
        className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6"
      >
        <div className="mb-1 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#25D366]/15 text-[#128C4B]">
            <MessageCircle className="h-5 w-5" aria-hidden />
          </span>
          <h2
            id="titulo-whatsapp"
            className="font-display text-xl font-semibold text-foreground"
          >
            Número de WhatsApp de la tienda
          </h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Es el número que recibirá los pedidos. Lo usan los botones de WhatsApp
          del encabezado, del configurador y del pie de página de la web.
        </p>

        <div className="mt-4 rounded-2xl bg-secondary/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-salvia">
            Número vigente
          </p>
          <p className="font-display mt-0.5 text-2xl font-semibold text-primary">
            {formateaVista(whatsappActual || WHATSAPP_TIENDA)}
          </p>
          <a
            href={`https://wa.me/${whatsappActual || WHATSAPP_TIENDA}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-salvia underline-offset-2 hover:underline"
          >
            <MessageCircle className="h-3.5 w-3.5" aria-hidden />
            Probar el enlace wa.me
          </a>
        </div>

        <div className="mt-4 space-y-1.5">
          <Label htmlFor="whatsapp-nuevo">Nuevo número (con código de país)</Label>
          <Input
            id="whatsapp-nuevo"
            inputMode="numeric"
            placeholder="Ej. 50688888888"
            value={numero}
            onChange={(e) => setNumero(soloDigitos(e.target.value))}
            className="font-mono"
            maxLength={15}
          />
          <p className="text-xs text-muted-foreground">
            Solo dígitos, sin espacios, guiones ni el signo +. Ejemplo Costa
            Rica: <span className="font-mono">506</span> + 8 dígitos.
          </p>
        </div>

        {numeroValido && (
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs text-foreground/80">
            <BadgeCheck className="h-3.5 w-3.5 text-salvia" aria-hidden />
            Vista previa del enlace:{" "}
            <span className="font-mono">wa.me/{numeroLimpio}</span>
          </p>
        )}

        <Button
          type="button"
          className="mt-4 w-full rounded-full"
          onClick={guardarNumero}
          disabled={guardandoNumero || !numeroValido || !cambiado}
        >
          {guardandoNumero ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          ) : (
            <Save className="h-4 w-4" aria-hidden />
          )}
          Guardar número de WhatsApp
        </Button>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          {cambiado
            ? "Al guardar, la tienda empieza a usar el número nuevo al instante."
            : "Escribe un número distinto para habilitar el botón."}
        </p>
      </section>
    </div>
  );
}
