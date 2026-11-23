"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Flower2, Leaf, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  TIPOS_PIEL,
  type AceiteCatalogo,
  type AromaCatalogo,
  type PielId,
} from "@/lib/jabones";

type Pestana = "aceites" | "aromas";

/** Elemento en edición: null = cerrado; sin id = nuevo. */
type Edicion =
  | { tipo: "aceite"; id?: string; nombre: string; texto: string; pieles: PielId[] }
  | { tipo: "aroma"; id?: string; nombre: string; texto: string; pieles: PielId[] };

interface PorEliminar {
  tipo: "aceite" | "aroma";
  id: string;
  nombre: string;
}

export function CatalogoGestor({
  aceites,
  aromas,
}: {
  aceites: AceiteCatalogo[];
  aromas: AromaCatalogo[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [, iniciarTransicion] = useTransition();
  const [pestana, setPestana] = useState<Pestana>("aceites");
  const [edicion, setEdicion] = useState<Edicion | null>(null);
  const [eliminar, setEliminar] = useState<PorEliminar | null>(null);
  const [guardando, setGuardando] = useState(false);

  const rutaBase = (tipo: "aceite" | "aroma") =>
    tipo === "aceite" ? "/api/admin/aceites" : "/api/admin/aromas";

  async function llamar(
    url: string,
    metodo: string,
    cuerpo: unknown,
    mensaje: string
  ): Promise<boolean> {
    setGuardando(true);
    try {
      const res = await fetch(url, {
        method: metodo,
        headers: cuerpo ? { "Content-Type": "application/json" } : undefined,
        body: cuerpo ? JSON.stringify(cuerpo) : undefined,
      });
      const datos = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !datos.ok) {
        toast({ variant: "destructive", title: "No se pudo guardar", description: datos.error });
        return false;
      }
      toast({ title: mensaje });
      iniciarTransicion(() => router.refresh());
      return true;
    } catch {
      toast({ variant: "destructive", title: "Error de conexión" });
      return false;
    } finally {
      setGuardando(false);
    }
  }

  function nuevo() {
    setEdicion(
      pestana === "aceites"
        ? { tipo: "aceite", nombre: "", texto: "", pieles: [] }
        : { tipo: "aroma", nombre: "", texto: "", pieles: [] }
    );
  }

  async function guardar() {
    if (!edicion) return;
    const nombre = edicion.nombre.trim();
    if (nombre.length < 2) {
      toast({
        variant: "destructive",
        title: "Falta el nombre",
        description: "Escribe al menos 2 letras.",
      });
      return;
    }
    const esAceite = edicion.tipo === "aceite";
    const cuerpo = esAceite
      ? { nombre, propiedades: edicion.texto.trim(), pieles: edicion.pieles }
      : { nombre, descripcion: edicion.texto.trim() };
    const etiqueta = esAceite ? "Aceite" : "Aroma";
    const ok = edicion.id
      ? await llamar(
          `${rutaBase(edicion.tipo)}/${edicion.id}`,
          "PATCH",
          cuerpo,
          `${etiqueta} actualizado`
        )
      : await llamar(rutaBase(edicion.tipo), "POST", cuerpo, `${etiqueta} agregado`);
    if (ok) setEdicion(null);
  }

  async function confirmarEliminar() {
    if (!eliminar) return;
    const ok = await llamar(
      `${rutaBase(eliminar.tipo)}/${eliminar.id}`,
      "DELETE",
      undefined,
      eliminar.tipo === "aceite" ? "Aceite eliminado" : "Aroma eliminado"
    );
    if (ok) setEliminar(null);
  }

  function alternarPiel(id: PielId) {
    setEdicion((e) =>
      e && e.tipo === "aceite"
        ? {
            ...e,
            pieles: e.pieles.includes(id)
              ? e.pieles.filter((p) => p !== id)
              : [...e.pieles, id],
          }
        : e
    );
  }

  const nombrePiel = (id: PielId) =>
    TIPOS_PIEL.find((t) => t.id === id)?.nombre ?? id;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1.5" role="tablist" aria-label="Sección del catálogo">
          {(
            [
              ["aceites", `Aceites esenciales (${aceites.length})`, Leaf],
              ["aromas", `Aromas (${aromas.length})`, Flower2],
            ] as const
          ).map(([id, etiqueta, Icono]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={pestana === id}
              onClick={() => setPestana(id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm transition-colors",
                pestana === id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:bg-secondary"
              )}
            >
              <Icono className="h-4 w-4" aria-hidden />
              {etiqueta}
            </button>
          ))}
        </div>
        <Button type="button" className="rounded-full sm:ml-auto" onClick={nuevo}>
          <Plus className="h-4 w-4" aria-hidden />
          {pestana === "aceites" ? "Agregar aceite" : "Agregar aroma"}
        </Button>
      </div>

      {pestana === "aceites" ? (
        aceites.length === 0 ? (
          <Vacio texto="Aún no hay aceites esenciales. Agrega el primero." />
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {aceites.map((a) => (
              <li
                key={a.id}
                className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-5"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-display text-xl font-semibold text-primary">
                    {a.nombre}
                  </p>
                  <Acciones
                    nombre={a.nombre}
                    onEditar={() =>
                      setEdicion({
                        tipo: "aceite",
                        id: a.id,
                        nombre: a.nombre,
                        texto: a.propiedades,
                        pieles: a.pieles,
                      })
                    }
                    onEliminar={() =>
                      setEliminar({ tipo: "aceite", id: a.id, nombre: a.nombre })
                    }
                  />
                </div>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {a.propiedades || "Sin descripción."}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {a.pieles.length === 0 ? (
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                      No se ofrece en ningún tipo de piel
                    </span>
                  ) : (
                    a.pieles.map((p) => (
                      <span
                        key={p}
                        className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-semibold text-salvia"
                      >
                        {nombrePiel(p)}
                      </span>
                    ))
                  )}
                </div>
              </li>
            ))}
          </ul>
        )
      ) : aromas.length === 0 ? (
        <Vacio texto="Aún no hay aromas. Agrega el primero." />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {aromas.map((a) => (
            <li
              key={a.id}
              className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-display text-xl font-semibold text-primary">
                  {a.nombre}
                </p>
                <Acciones
                  nombre={a.nombre}
                  onEditar={() =>
                    setEdicion({
                      tipo: "aroma",
                      id: a.id,
                      nombre: a.nombre,
                      texto: a.descripcion,
                      pieles: [],
                    })
                  }
                  onEliminar={() =>
                    setEliminar({ tipo: "aroma", id: a.id, nombre: a.nombre })
                  }
                />
              </div>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {a.descripcion || "Sin descripción."}
              </p>
            </li>
          ))}
        </ul>
      )}

      {/* Agregar / editar */}
      <Dialog open={edicion !== null} onOpenChange={(abierto) => !abierto && setEdicion(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          {edicion && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl text-primary">
                  {edicion.id ? "Editar" : "Agregar"}{" "}
                  {edicion.tipo === "aceite" ? "aceite esencial" : "aroma"}
                </DialogTitle>
                <DialogDescription>
                  {edicion.tipo === "aceite"
                    ? "Elige en qué tipos de piel se ofrece este aceite."
                    : "Los aromas se ofrecen para cualquier tipo de piel."}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="cat-nombre">Nombre *</Label>
                  <Input
                    id="cat-nombre"
                    value={edicion.nombre}
                    maxLength={80}
                    onChange={(e) => setEdicion({ ...edicion, nombre: e.target.value })}
                    placeholder={edicion.tipo === "aceite" ? "Ej. Romero" : "Ej. Coco y Vainilla"}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cat-texto">
                    {edicion.tipo === "aceite" ? "Propiedades" : "Descripción"}
                  </Label>
                  <Textarea
                    id="cat-texto"
                    rows={3}
                    value={edicion.texto}
                    maxLength={edicion.tipo === "aceite" ? 500 : 300}
                    onChange={(e) => setEdicion({ ...edicion, texto: e.target.value })}
                    placeholder={
                      edicion.tipo === "aceite"
                        ? "Qué beneficios aporta a la piel…"
                        : "Cómo huele: dulce, fresco, cítrico…"
                    }
                  />
                </div>
                {edicion.tipo === "aceite" && (
                  <fieldset className="space-y-2">
                    <legend className="text-sm font-medium">Se ofrece en estos tipos de piel</legend>
                    <div className="grid gap-2">
                      {TIPOS_PIEL.map((t) => {
                        const activo = edicion.pieles.includes(t.id);
                        return (
                          <button
                            key={t.id}
                            type="button"
                            aria-pressed={activo}
                            onClick={() => alternarPiel(t.id)}
                            className={cn(
                              "flex items-center gap-2.5 rounded-xl border p-3 text-left text-sm transition-colors",
                              activo
                                ? "border-primary bg-secondary/60 font-medium"
                                : "border-border hover:bg-muted/60"
                            )}
                          >
                            <span
                              className="h-3 w-3 shrink-0 rounded-full"
                              style={{ backgroundColor: t.color }}
                              aria-hidden
                            />
                            {t.nombre}
                            <span className="ml-auto text-xs text-muted-foreground">
                              {activo ? "Sí" : "No"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                )}
              </div>

              <DialogFooter className="gap-2 sm:gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setEdicion(null)}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  className="rounded-full"
                  disabled={guardando}
                  onClick={guardar}
                >
                  {guardando && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                  {edicion.id ? "Guardar cambios" : "Agregar"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmar eliminación */}
      <AlertDialog open={eliminar !== null} onOpenChange={(abierto) => !abierto && setEliminar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar «{eliminar?.nombre}»?</AlertDialogTitle>
            <AlertDialogDescription>
              Dejará de aparecer en la tienda. Los pedidos que ya lo incluyen no
              cambian.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void confirmarEliminar();
              }}
              disabled={guardando}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Acciones({
  nombre,
  onEditar,
  onEliminar,
}: {
  nombre: string;
  onEditar: () => void;
  onEliminar: () => void;
}) {
  return (
    <div className="flex shrink-0 gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full"
        aria-label={`Editar ${nombre}`}
        onClick={onEditar}
      >
        <Pencil className="h-4 w-4" aria-hidden />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full text-destructive hover:text-destructive"
        aria-label={`Eliminar ${nombre}`}
        onClick={onEliminar}
      >
        <Trash2 className="h-4 w-4" aria-hidden />
      </Button>
    </div>
  );
}

function Vacio({ texto }: { texto: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card/60 p-12 text-center text-sm text-muted-foreground">
      {texto}
    </div>
  );
}
