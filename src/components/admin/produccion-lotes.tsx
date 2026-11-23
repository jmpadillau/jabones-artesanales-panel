"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, ChevronDown, Circle, ClipboardList, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  agruparProduccion,
  etiquetaLote,
  opcionesFiltro,
  SIN_ACEITE,
  SIN_AROMA,
  type Dimensiones,
  type FilaProduccion,
  type FiltrosProduccion,
} from "@/lib/produccion";

/** Botón para marcar UN jabón (línea) como Pendiente o Realizado. */
export function ToggleItem({
  linea,
  bloqueado,
  ocupado,
  onCambiar,
}: {
  linea: { id: string; estadoItem: string };
  bloqueado: boolean;
  ocupado: boolean;
  onCambiar: (nuevo: "Pendiente" | "Realizado") => void;
}) {
  const hecho = linea.estadoItem === "Realizado";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={hecho}
      disabled={bloqueado || ocupado}
      onClick={() => onCambiar(hecho ? "Pendiente" : "Realizado")}
      title={hecho ? "Realizado — toca para volver a Pendiente" : "Pendiente — toca para marcar Realizado"}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        hecho
          ? "border-salvia/40 bg-secondary text-salvia"
          : "border-border bg-card text-muted-foreground hover:bg-secondary"
      )}
    >
      {ocupado ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
      ) : hecho ? (
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
      ) : (
        <Circle className="h-3.5 w-3.5" aria-hidden />
      )}
      {hecho ? "Realizado" : "Pendiente"}
    </button>
  );
}

const campoSelect =
  "h-9 w-full rounded-full border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40";

export function ProduccionLotes({
  filas,
  itemOcupado,
  deshabilitado,
  onCambiarItem,
}: {
  filas: (FilaProduccion & { id: string })[];
  itemOcupado: string | null;
  deshabilitado: boolean;
  onCambiarItem: (id: string, nuevo: "Pendiente" | "Realizado") => void;
}) {
  const [dims, setDims] = useState<Dimensiones>({ tamano: true, aceite: true, aroma: true });
  const [filtros, setFiltros] = useState<FiltrosProduccion>({ tamanoId: "", aceite: "", aroma: "" });
  const [abiertos, setAbiertos] = useState<Set<string>>(new Set());

  const opciones = useMemo(() => opcionesFiltro(filas), [filas]);
  const lotes = useMemo(() => agruparProduccion(filas, dims, filtros), [filas, dims, filtros]);

  const totalUnidades = lotes.reduce((s, l) => s + l.unidades, 0);
  const totalPedidos = new Set(lotes.flatMap((l) => l.lineas.map((x) => x.codigo))).size;
  const hayFiltros = filtros.tamanoId !== "" || filtros.aceite !== "" || filtros.aroma !== "";

  function alternarDim(k: keyof Dimensiones) {
    setDims((d) => {
      const nuevo = { ...d, [k]: !d[k] };
      // Siempre debe quedar al menos un criterio activo.
      return nuevo.tamano || nuevo.aceite || nuevo.aroma ? nuevo : d;
    });
  }

  function alternarLote(clave: string) {
    setAbiertos((a) => {
      const n = new Set(a);
      if (n.has(clave)) n.delete(clave);
      else n.add(clave);
      return n;
    });
  }

  const criterios: [keyof Dimensiones, string][] = [
    ["tamano", "Tamaño"],
    ["aceite", "Aceite esencial"],
    ["aroma", "Aroma"],
  ];

  return (
    <div className="space-y-4">
      {/* Herramientas */}
      <div className="space-y-4 rounded-3xl border border-border bg-card p-4 sm:p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-salvia">
            Agrupar lotes por
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Criterios de agrupación">
            {criterios.map(([k, etiqueta]) => (
              <button
                key={k}
                type="button"
                aria-pressed={dims[k]}
                onClick={() => alternarDim(k)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                  dims[k]
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:bg-secondary"
                )}
              >
                {etiqueta}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Quita un criterio para juntar más pedidos en un mismo lote (por
            ejemplo, solo por aceite).
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="space-y-1 text-xs font-medium text-muted-foreground">
            Tamaño
            <select
              className={campoSelect}
              value={filtros.tamanoId}
              onChange={(e) => setFiltros((f) => ({ ...f, tamanoId: e.target.value }))}
            >
              <option value="">Todos</option>
              {opciones.tamanos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.gramos} g
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-xs font-medium text-muted-foreground">
            Aceite esencial
            <select
              className={campoSelect}
              value={filtros.aceite}
              onChange={(e) => setFiltros((f) => ({ ...f, aceite: e.target.value }))}
            >
              <option value="">Todos</option>
              {opciones.aceites.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-xs font-medium text-muted-foreground">
            Aroma
            <select
              className={campoSelect}
              value={filtros.aroma}
              onChange={(e) => setFiltros((f) => ({ ...f, aroma: e.target.value }))}
            >
              <option value="">Todos</option>
              {opciones.aromas.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </label>
        </div>

        {hayFiltros && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-full"
            onClick={() => setFiltros({ tamanoId: "", aceite: "", aroma: "" })}
          >
            Quitar filtros
          </Button>
        )}
      </div>

      {/* Resumen */}
      <p className="px-1 text-sm text-muted-foreground">
        <strong className="text-foreground">{totalUnidades}</strong>{" "}
        {totalUnidades === 1 ? "jabón" : "jabones"} por fabricar en{" "}
        <strong className="text-foreground">{lotes.length}</strong>{" "}
        {lotes.length === 1 ? "lote" : "lotes"} · {totalPedidos}{" "}
        {totalPedidos === 1 ? "pedido" : "pedidos"}
      </p>

      {lotes.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card/60 p-12 text-center">
          <ClipboardList className="mx-auto h-10 w-10 text-muted-foreground/50" aria-hidden />
          <p className="mt-2 font-medium">Nada pendiente de fabricar</p>
          <p className="text-sm text-muted-foreground">
            {hayFiltros
              ? "Ningún jabón pendiente coincide con los filtros."
              : "Los jabones de los pedidos Pendiente aparecerán aquí."}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {lotes.map((l) => {
            const abierto = abiertos.has(l.clave);
            return (
              <li
                key={l.clave}
                className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-display text-2xl font-semibold leading-tight text-primary">
                      {l.unidades} {l.unidades === 1 ? "jabón" : "jabones"}
                      {l.gramos ? ` de ${l.gramos} g` : ""}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {l.aceite !== null && (
                        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-salvia">
                          Aceite: {l.aceite || SIN_ACEITE}
                        </span>
                      )}
                      {l.aroma !== null && (
                        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-foreground/80">
                          Aroma: {l.aroma || SIN_AROMA}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p>
                      {l.pedidos} {l.pedidos === 1 ? "pedido" : "pedidos"}
                    </p>
                    {l.gramosTotales !== null && l.gramosTotales > 0 && (
                      <p>{l.gramosTotales.toLocaleString("es-CR")} g en total</p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => alternarLote(l.clave)}
                  aria-expanded={abierto}
                  aria-label={`${abierto ? "Ocultar" : "Ver"} pedidos de: ${etiquetaLote(l)}`}
                  className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                >
                  <ChevronDown
                    className={cn("h-3.5 w-3.5 transition-transform", abierto && "rotate-180")}
                    aria-hidden
                  />
                  {abierto ? "Ocultar pedidos" : "Ver pedidos de este lote"}
                </button>

                {abierto && (
                  <ul className="mt-3 divide-y divide-border/60 rounded-2xl border border-border">
                    {l.lineas.map((x) => (
                      <li
                        key={x.id}
                        className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 text-sm"
                      >
                        <p className="min-w-0">
                          <span className="font-mono text-xs text-muted-foreground">{x.codigo}</span>
                          <span className="mx-1.5">·</span>
                          <span className="font-medium">{x.clienteNombre}</span>
                          <span className="ml-1.5 text-muted-foreground">
                            × {x.cantidad}
                            {l.tamanoId === null ? ` · ${x.tamanoId}` : ""}
                            {l.aceite === null && x.aceite ? ` · ${x.aceite}` : ""}
                            {l.aroma === null && x.aroma ? ` · ${x.aroma}` : ""}
                          </span>
                        </p>
                        <ToggleItem
                          linea={x}
                          bloqueado={deshabilitado}
                          ocupado={itemOcupado === x.id}
                          onCambiar={(nuevo) => onCambiarItem(x.id, nuevo)}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
