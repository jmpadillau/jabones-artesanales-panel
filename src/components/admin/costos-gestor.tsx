"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, PiggyBank, Plus, Save, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { formatoCRC } from "@/lib/jabones";
import { formatoFecha } from "@/lib/estadisticas";
import { CATEGORIAS_MATERIA, UNIDADES_MATERIA } from "@/lib/costos";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface MateriaAdmin {
  id: string;
  nombre: string;
  categoria: string;
  cantidadCompra: number;
  unidad: string;
  costoTotal: number;
  actualizadoEn: string;
}

export interface CostoTamanoAdmin {
  tamanoId: string;
  etiqueta: string;
  costoUnitario: number;
  actualizadoEn: string;
}

/* ==================== Costo por tamaño ==================== */

function CostosTamano({
  costos,
  disabled,
  onGuardar,
}: {
  costos: CostoTamanoAdmin[];
  disabled: boolean;
  onGuardar: (tamanoId: string, costo: number) => void;
}) {
  const [borradores, setBorradores] = useState<Record<string, string>>(
    Object.fromEntries(costos.map((c) => [c.tamanoId, String(c.costoUnitario)]))
  );

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="font-display flex items-center gap-2 text-xl text-primary">
          <PiggyBank className="h-5 w-5 text-salvia" aria-hidden />
          Costo de producir cada jabón
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Incluye base, aceite esencial, aroma, empaque y etiqueta. Se usa para
          calcular la ganancia de cada venta entregada.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {costos.map((c) => (
          <div
            key={c.tamanoId}
            className="flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-border bg-background/60 p-3"
          >
            <div className="min-w-0">
              <p className="font-medium">{c.etiqueta}</p>
              <p className="text-xs text-muted-foreground">
                Actualizado el {formatoFecha(c.actualizadoEn)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-36">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  ₡
                </span>
                <Input
                  type="number"
                  min={0}
                  value={borradores[c.tamanoId] ?? ""}
                  onChange={(e) =>
                    setBorradores((b) => ({ ...b, [c.tamanoId]: e.target.value }))
                  }
                  className="pl-7"
                  aria-label={`Costo de producción ${c.etiqueta}`}
                />
              </div>
              <Button
                type="button"
                size="sm"
                className="rounded-full"
                disabled={disabled || (borradores[c.tamanoId] ?? "") === String(c.costoUnitario)}
                onClick={() => onGuardar(c.tamanoId, Number(borradores[c.tamanoId] ?? 0))}
              >
                <Save className="h-4 w-4" aria-hidden />
                Guardar
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/* ==================== Materias primas ==================== */

interface Formulario {
  nombre: string;
  categoria: string;
  cantidadCompra: string;
  unidad: string;
  costoTotal: string;
}

const VACIO: Formulario = {
  nombre: "",
  categoria: CATEGORIAS_MATERIA[0],
  cantidadCompra: "",
  unidad: "g",
  costoTotal: "",
};

function costoUnitario(m: MateriaAdmin): number {
  return m.cantidadCompra > 0 ? m.costoTotal / m.cantidadCompra : 0;
}

export function CostosGestor({
  materias,
  costos,
}: {
  materias: MateriaAdmin[];
  costos: CostoTamanoAdmin[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [cargandoAPI, setCargandoAPI] = useState(false);
  const [, iniciarTransicion] = useTransition();
  const [formulario, setFormulario] = useState<Formulario>(VACIO);
  const [editando, setEditando] = useState<MateriaAdmin | null>(null);
  const [borradorEdicion, setBorradorEdicion] = useState<Formulario>(VACIO);

  function refrescar(mensaje?: string) {
    if (mensaje) toast({ title: mensaje });
    iniciarTransicion(() => router.refresh());
  }

  async function llamar(url: string, metodo: string, cuerpo?: unknown, mensaje?: string) {
    setCargandoAPI(true);
    try {
      const res = await fetch(url, {
        method: metodo,
        headers: cuerpo ? { "Content-Type": "application/json" } : undefined,
        body: cuerpo ? JSON.stringify(cuerpo) : undefined,
      });
      const datos = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !datos.ok) {
        toast({ variant: "destructive", title: "Error", description: datos.error });
        return false;
      }
      refrescar(mensaje);
      return true;
    } catch {
      toast({ variant: "destructive", title: "Error de conexión" });
      return false;
    } finally {
      setCargandoAPI(false);
    }
  }

  const formularioValido =
    formulario.nombre.trim().length >= 2 &&
    Number(formulario.cantidadCompra) > 0 &&
    formulario.costoTotal !== "" &&
    Number(formulario.costoTotal) >= 0;

  async function crearMateria() {
    if (!formularioValido) return;
    const ok = await llamar(
      "/api/admin/materias",
      "POST",
      {
        nombre: formulario.nombre.trim(),
        categoria: formulario.categoria,
        cantidadCompra: Number(formulario.cantidadCompra),
        unidad: formulario.unidad,
        costoTotal: Number(formulario.costoTotal),
      },
      "Materia prima registrada"
    );
    if (ok) setFormulario(VACIO);
  }

  async function guardarCostoTamano(tamanoId: string, costo: number) {
    await llamar(
      "/api/admin/costos",
      "PUT",
      { tamanoId, costoUnitario: costo },
      "Costo de producción actualizado"
    );
  }

  const campo =
    "w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40";

  return (
    <div className="space-y-6">
      <CostosTamano
        costos={costos}
        disabled={cargandoAPI}
        onGuardar={guardarCostoTamano}
      />

      {/* Nueva materia prima */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-xl text-primary">
            Registrar materia prima
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Anota la compra completa (p. ej. 1.000 g de base por ₡12.000) y el
            costo por gramo se calcula solo.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-1.5 lg:col-span-2">
              <Label htmlFor="m-nombre">Nombre</Label>
              <Input
                id="m-nombre"
                value={formulario.nombre}
                onChange={(e) => setFormulario((f) => ({ ...f, nombre: e.target.value }))}
                placeholder="Ej. Base de jabón Glicerina"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="m-cat">Categoría</Label>
              <Select
                value={formulario.categoria}
                onValueChange={(v) => setFormulario((f) => ({ ...f, categoria: v }))}
              >
                <SelectTrigger id="m-cat" aria-label="Categoría">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIAS_MATERIA.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-[1fr_88px] gap-2">
              <div className="space-y-1.5">
                <Label htmlFor="m-cant">Cantidad</Label>
                <Input
                  id="m-cant"
                  type="number"
                  min={0}
                  step="any"
                  value={formulario.cantidadCompra}
                  onChange={(e) =>
                    setFormulario((f) => ({ ...f, cantidadCompra: e.target.value }))
                  }
                  placeholder="1000"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="m-unidad">Unidad</Label>
                <Select
                  value={formulario.unidad}
                  onValueChange={(v) => setFormulario((f) => ({ ...f, unidad: v }))}
                >
                  <SelectTrigger id="m-unidad" aria-label="Unidad">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIDADES_MATERIA.map((u) => (
                      <SelectItem key={u} value={u}>{u}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="m-costo">Costo de la compra (₡)</Label>
              <Input
                id="m-costo"
                type="number"
                min={0}
                step="any"
                value={formulario.costoTotal}
                onChange={(e) => setFormulario((f) => ({ ...f, costoTotal: e.target.value }))}
                placeholder="12000"
              />
            </div>
          </div>
          <Button
            type="button"
            className="mt-4 rounded-full"
            disabled={!formularioValido || cargandoAPI}
            onClick={crearMateria}
          >
            {cargandoAPI ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Plus className="h-4 w-4" aria-hidden />}
            Agregar al registro
          </Button>
        </CardContent>
      </Card>

      {/* Tabla de materias primas */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-xl text-primary">
            Registro de materias primas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {materias.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Aún no hay materias primas registradas.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th scope="col" className="py-2 pr-3 font-semibold">Nombre</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Categoría</th>
                    <th scope="col" className="py-2 pr-3 font-semibold text-right">Compra</th>
                    <th scope="col" className="py-2 pr-3 font-semibold text-right">Costo total</th>
                    <th scope="col" className="py-2 pr-3 font-semibold text-right">Costo unitario</th>
                    <th scope="col" className="py-2 font-semibold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {materias.map((m) => (
                    <tr key={m.id} className="border-b border-border/60 last:border-0">
                      <td className="py-2.5 pr-3 font-medium">{m.nombre}</td>
                      <td className="py-2.5 pr-3 text-muted-foreground">{m.categoria}</td>
                      <td className="py-2.5 pr-3 text-right tabular-nums">
                        {m.cantidadCompra} {m.unidad}
                      </td>
                      <td className="py-2.5 pr-3 text-right tabular-nums">{formatoCRC(m.costoTotal)}</td>
                      <td className="py-2.5 pr-3 text-right font-semibold tabular-nums text-primary">
                        {formatoCRC(costoUnitario(m))} / {m.unidad}
                      </td>
                      <td className="py-2.5 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            aria-label={`Editar ${m.nombre}`}
                            onClick={() => {
                              setEditando(m);
                              setBorradorEdicion({
                                nombre: m.nombre,
                                categoria: m.categoria,
                                cantidadCompra: String(m.cantidadCompra),
                                unidad: m.unidad,
                                costoTotal: String(m.costoTotal),
                              });
                            }}
                          >
                            <Pencil className="h-4 w-4" aria-hidden />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full text-destructive hover:text-destructive"
                            aria-label={`Eliminar ${m.nombre}`}
                            onClick={() => {
                              if (confirm(`¿Eliminar ${m.nombre} del registro?`))
                                llamar(`/api/admin/materias/${m.id}`, "DELETE", undefined, "Materia prima eliminada");
                            }}
                          >
                            <Trash2 className="h-4 w-4" aria-hidden />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de edición */}
      {editando && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Editar ${editando.nombre}`}
          onClick={(e) => e.target === e.currentTarget && setEditando(null)}
        >
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-xl font-semibold text-primary">
                Editar materia prima
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                aria-label="Cerrar"
                onClick={() => setEditando(null)}
              >
                <X className="h-4 w-4" aria-hidden />
              </Button>
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="e-nombre">Nombre</Label>
                <Input
                  id="e-nombre"
                  value={borradorEdicion.nombre}
                  onChange={(e) => setBorradorEdicion((f) => ({ ...f, nombre: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="e-cant">Cantidad</Label>
                  <Input
                    id="e-cant"
                    type="number"
                    min={0}
                    step="any"
                    value={borradorEdicion.cantidadCompra}
                    onChange={(e) =>
                      setBorradorEdicion((f) => ({ ...f, cantidadCompra: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="e-costo">Costo total (₡)</Label>
                  <Input
                    id="e-costo"
                    type="number"
                    min={0}
                    step="any"
                    value={borradorEdicion.costoTotal}
                    onChange={(e) =>
                      setBorradorEdicion((f) => ({ ...f, costoTotal: e.target.value }))
                    }
                  />
                </div>
              </div>
              <Button
                type="button"
                className="w-full rounded-full"
                disabled={cargandoAPI}
                onClick={async () => {
                  const ok = await llamar(
                    `/api/admin/materias/${editando.id}`,
                    "PATCH",
                    {
                      nombre: borradorEdicion.nombre.trim(),
                      cantidadCompra: Number(borradorEdicion.cantidadCompra),
                      unidad: borradorEdicion.unidad,
                      costoTotal: Number(borradorEdicion.costoTotal),
                    },
                    "Materia prima actualizada"
                  );
                  if (ok) setEditando(null);
                }}
              >
                {cargandoAPI ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}
                Guardar cambios
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
