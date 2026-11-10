"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Copy,
  Download,
  MessageCircle,
  NotebookPen,
  Package,
  Search,
  Timer,
  Truck,
  Undo2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { formatoCRC } from "@/lib/jabones";
import {
  ESTADOS,
  formatoFechaHora,
  transicionesPermitidas,
  type Estado,
} from "@/lib/estadisticas";
import { EstadoBadge } from "@/components/admin/estado-badge";

/** Una fila de la tabla pedidos (una LÍNEA del pedido). */
export interface PedidoAdmin {
  id: string;
  codigo: string;
  lineaNum: number;
  estado: string;
  creadoEn: string;
  realizadoEn: string | null;
  entregadoEn: string | null;
  canceladoEn: string | null;
  notasAdmin: string | null;
  clienteNombre: string;
  clienteTelefono: string;
  clienteEmail: string | null;
  direccion: string;
  metodoPago: string;
  producto: string;
  tipoPiel: string | null;
  aceite: string | null;
  aroma: string | null;
  tamanoEtiqueta: string;
  cantidad: number;
  precioUnit: number;
  total: number;
}

/** Un pedido completo: todas sus líneas agrupadas por código. */
interface PedidoGrupo {
  codigo: string;
  estado: string;
  creadoEn: string;
  realizadoEn: string | null;
  entregadoEn: string | null;
  canceladoEn: string | null;
  notasAdmin: string | null;
  clienteNombre: string;
  clienteTelefono: string;
  clienteEmail: string | null;
  direccion: string;
  metodoPago: string;
  lineas: PedidoAdmin[];
  unidades: number;
  total: number;
}

/** Agrupa las filas por código de pedido (una fila = una línea). */
function agrupar(filas: PedidoAdmin[]): PedidoGrupo[] {
  const mapa = new Map<string, PedidoAdmin[]>();
  for (const f of filas) {
    const lista = mapa.get(f.codigo) ?? [];
    lista.push(f);
    mapa.set(f.codigo, lista);
  }
  return [...mapa.entries()].map(([codigo, lineas]) => {
    const ordenadas = [...lineas].sort((a, b) => a.lineaNum - b.lineaNum);
    const primera = ordenadas[0];
    return {
      codigo,
      estado: primera.estado,
      creadoEn: primera.creadoEn,
      realizadoEn: primera.realizadoEn,
      entregadoEn: primera.entregadoEn,
      canceladoEn: primera.canceladoEn,
      notasAdmin: primera.notasAdmin,
      clienteNombre: primera.clienteNombre,
      clienteTelefono: primera.clienteTelefono,
      clienteEmail: primera.clienteEmail,
      direccion: primera.direccion,
      metodoPago: primera.metodoPago,
      lineas: ordenadas,
      unidades: ordenadas.reduce((s, l) => s + l.cantidad, 0),
      total: ordenadas.reduce((s, l) => s + l.total, 0),
    };
  });
}

const ICONO_ACCION: Partial<Record<Estado, React.ReactNode>> = {
  Realizado: <Timer className="h-4 w-4" aria-hidden />,
  Entregado: <Truck className="h-4 w-4" aria-hidden />,
  Pendiente: <Undo2 className="h-4 w-4" aria-hidden />,
  Cancelado: <XCircle className="h-4 w-4" aria-hidden />,
};

export function PedidosGestor({ pedidos }: { pedidos: PedidoAdmin[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pendienteAPI, iniciarTransicion] = useTransition();
  const [filtro, setFiltro] = useState<"Todos" | Estado>("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [detalle, setDetalle] = useState<PedidoGrupo | null>(null);
  const [notasBorrador, setNotasBorrador] = useState("");

  // Todas las filas del pedido actualmente abierto en el diálogo.
  const idsDe = (g: PedidoGrupo | null) => (g ? g.lineas.map((l) => l.id) : []);

  const grupos = useMemo(() => agrupar(pedidos), [pedidos]);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return grupos.filter((g) => {
      if (filtro !== "Todos" && g.estado !== filtro) return false;
      if (!q) return true;
      return (
        g.codigo.toLowerCase().includes(q) ||
        g.clienteNombre.toLowerCase().includes(q) ||
        g.clienteTelefono.toLowerCase().includes(q) ||
        g.lineas.some(
          (l) =>
            l.producto.toLowerCase().includes(q) ||
            (l.aroma ?? "").toLowerCase().includes(q)
        )
      );
    });
  }, [grupos, filtro, busqueda]);

  const conteo = useMemo(() => {
    const c: Record<string, number> = { Todos: grupos.length };
    for (const e of ESTADOS) c[e] = 0;
    for (const g of grupos) c[g.estado] = (c[g.estado] ?? 0) + 1;
    return c;
  }, [grupos]);

  async function cambiarEstado(pedido: PedidoGrupo, nuevo: Estado) {
    const res = await fetch(`/api/admin/pedidos/${pedido.lineas[0].id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: nuevo, ids: idsDe(pedido) }),
    });
    const datos = (await res.json()) as { ok: boolean; error?: string };
    if (!res.ok || !datos.ok) {
      toast({
        variant: "destructive",
        title: "No se pudo actualizar",
        description: datos.error,
      });
      return;
    }
    toast({
      title: `Pedido ${pedido.codigo} → ${nuevo}`,
      description:
        nuevo === "Entregado"
          ? "La venta ya cuenta para los ingresos y las ganancias. 🎉"
          : "Se guardó la fecha y hora del cambio.",
    });
    setDetalle(null);
    iniciarTransicion(() => router.refresh());
  }

  function abrirNotas(pedido: PedidoGrupo) {
    setDetalle(pedido);
    setNotasBorrador(pedido.notasAdmin ?? "");
  }

  async function guardarNotas() {
    if (!detalle) return;
    const res = await fetch(`/api/admin/pedidos/${detalle.lineas[0].id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notasAdmin: notasBorrador, ids: idsDe(detalle) }),
    });
    const datos = (await res.json()) as { ok: boolean; error?: string };
    if (!res.ok || !datos.ok) {
      toast({ variant: "destructive", title: "No se pudieron guardar las notas", description: datos.error });
      return;
    }
    toast({ title: "Notas internas guardadas" });
    setDetalle(null);
    iniciarTransicion(() => router.refresh());
  }

  async function eliminarPedido(pedido: PedidoGrupo) {
    if (!confirm(`¿Eliminar definitivamente el pedido ${pedido.codigo}? Esta acción no se puede deshacer.`)) return;
    const res = await fetch(`/api/admin/pedidos/${pedido.lineas[0].id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: idsDe(pedido) }),
    });
    const datos = (await res.json()) as { ok: boolean; error?: string };
    if (!res.ok || !datos.ok) {
      toast({ variant: "destructive", title: "No se pudo eliminar", description: datos.error });
      return;
    }
    toast({ title: "Pedido eliminado" });
    setDetalle(null);
    iniciarTransicion(() => router.refresh());
  }

  /** Resumen de una línea para tarjetas y exportación manual. */
  const etiquetaLinea = (l: PedidoAdmin) =>
    `${l.cantidad}× ${l.producto}${l.aroma ? ` · ${l.aroma}` : ""}`;

  return (
    <div className="space-y-4">
      {/* Filtros y búsqueda */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por estado">
          {(["Todos", ...ESTADOS] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFiltro(f)}
              aria-pressed={filtro === f}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                filtro === f
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:bg-secondary"
              )}
            >
              {f} <span className="opacity-60">({conteo[f] ?? 0})</span>
            </button>
          ))}
        </div>
        <div className="relative sm:ml-auto sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar cliente, código…"
            className="rounded-full pl-9"
            aria-label="Buscar pedidos"
          />
        </div>
        <a
          href="/api/admin/pedidos/export"
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-4 text-sm font-medium text-primary transition-colors hover:bg-secondary"
        >
          <Download className="h-4 w-4" aria-hidden />
          CSV
        </a>
      </div>

      {/* Lista de pedidos */}
      {filtrados.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card/60 p-12 text-center">
          <Package className="mx-auto h-10 w-10 text-muted-foreground/50" aria-hidden />
          <p className="mt-2 font-medium">Sin pedidos que coincidan</p>
          <p className="text-sm text-muted-foreground">
            Prueba otro filtro o búsqueda; los nuevos pedidos aparecen solos.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtrados.map((p) => {
            const acciones = transicionesPermitidas(
              (ESTADOS as readonly string[]).includes(p.estado) ? (p.estado as Estado) : "Pendiente"
            );
            const varias = p.lineas.length > 1;
            return (
              <li
                key={p.codigo}
                className="rounded-3xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">{p.codigo}</span>
                      <EstadoBadge estado={p.estado} />
                      {varias && (
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-salvia">
                          {p.lineas.length} variedades · {p.unidades} jabones
                        </span>
                      )}
                    </div>
                    <p className="mt-1 truncate font-semibold text-foreground">
                      {p.clienteNombre} ·{" "}
                      <span className="font-normal">
                        {varias
                          ? p.lineas.map(etiquetaLinea).slice(0, 2).join(" · ") +
                            (p.lineas.length > 2 ? ` +${p.lineas.length - 2} más` : "")
                          : `${p.lineas[0].producto} × ${p.lineas[0].cantidad}`}
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {varias
                        ? "Varios tamaños"
                        : p.lineas[0].tamanoEtiqueta}{" "}
                      · {p.metodoPago}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-2xl font-semibold leading-none text-primary">
                      {formatoCRC(p.total)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {varias ? `${p.unidades} jabones` : `${formatoCRC(p.lineas[0].precioUnit)} c/u`}
                    </p>
                  </div>
                </div>

                {/* Marcas de tiempo por etapa */}
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
                  <span>📝 Solicitado: {formatoFechaHora(p.creadoEn)}</span>
                  {p.realizadoEn && <span>⏳ Realizado: {formatoFechaHora(p.realizadoEn)}</span>}
                  {p.entregadoEn && <span className="font-medium text-bosque">✅ Entregado: {formatoFechaHora(p.entregadoEn)}</span>}
                  {p.canceladoEn && <span className="text-destructive">🚫 Cancelado: {formatoFechaHora(p.canceladoEn)}</span>}
                </div>

                {p.notasAdmin && (
                  <p className="mt-3 rounded-xl bg-muted px-3 py-2 text-xs text-foreground">
                    <NotebookPen className="mr-1 inline h-3.5 w-3.5" aria-hidden />
                    {p.notasAdmin}
                  </p>
                )}

                {/* Acciones */}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {acciones.map((a) => (
                    <Button
                      key={a}
                      type="button"
                      size="sm"
                      variant={a === "Entregado" ? "default" : a === "Cancelado" ? "outline" : "secondary"}
                      className={cn(
                        "rounded-full",
                        a === "Entregado" && "bg-bosque hover:bg-bosque/90",
                        a === "Cancelado" && "text-destructive hover:text-destructive"
                      )}
                      disabled={pendienteAPI}
                      onClick={() => cambiarEstado(p, a)}
                    >
                      {ICONO_ACCION[a]}
                      Marcar {a.toLowerCase()}
                    </Button>
                  ))}
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="rounded-full"
                    onClick={() => abrirNotas(p)}
                  >
                    <NotebookPen className="h-4 w-4" aria-hidden />
                    Notas
                  </Button>
                  <a
                    href={`https://wa.me/506${p.clienteTelefono.replace(/\D/g, "").slice(-8)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-medium text-primary transition-colors hover:bg-secondary"
                  >
                    <MessageCircle className="h-3.5 w-3.5" aria-hidden />
                    Contactar
                  </a>
                  <button
                    type="button"
                    onClick={() => abrirNotas(p)}
                    className="ml-auto text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                  >
                    Ver detalle completo
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Detalle + notas internas */}
      <Dialog open={detalle !== null} onOpenChange={(abierto) => !abierto && setDetalle(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          {detalle && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display flex flex-wrap items-center gap-2 text-2xl text-primary">
                  {detalle.codigo} <EstadoBadge estado={detalle.estado} />
                </DialogTitle>
                <DialogDescription>
                  Solicitado el {formatoFechaHora(detalle.creadoEn)}
                </DialogDescription>
              </DialogHeader>

              <dl className="space-y-3 rounded-2xl bg-muted/60 p-4 text-sm">
                {[
                  ["Cliente", detalle.clienteNombre],
                  ["Teléfono", detalle.clienteTelefono],
                  ["Correo", detalle.clienteEmail ?? "—"],
                  ["Dirección", detalle.direccion],
                  ["Método de pago", detalle.metodoPago],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4">
                    <dt className="shrink-0 text-muted-foreground">{k}</dt>
                    <dd className="text-right font-medium">{v}</dd>
                  </div>
                ))}
              </dl>

              {/* Líneas del pedido */}
              <div className="rounded-2xl border border-border">
                <p className="border-b border-border bg-secondary/50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-salvia">
                  Jabones del pedido ({detalle.unidades} en {detalle.lineas.length}{" "}
                  {detalle.lineas.length === 1 ? "línea" : "líneas"})
                </p>
                <ul className="divide-y divide-border/60">
                  {detalle.lineas.map((l, i) => (
                    <li key={l.id} className="space-y-1 px-4 py-3 text-sm">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-medium">
                          <span className="mr-1.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-bold text-salvia">
                            {i + 1}
                          </span>
                          {l.producto}
                        </p>
                        <p className="shrink-0 font-semibold text-primary">
                          {formatoCRC(l.total)}
                        </p>
                      </div>
                      <p className="pl-7 text-xs text-muted-foreground">
                        {l.aroma ? `Aroma ${l.aroma}` : "Sin aroma definido"}
                        {l.tipoPiel ? ` · Piel ${l.tipoPiel}` : ""} ·{" "}
                        {l.tamanoEtiqueta} · {l.cantidad} × {formatoCRC(l.precioUnit)}
                      </p>
                    </li>
                  ))}
                </ul>
                <p className="flex justify-between border-t border-border bg-secondary/40 px-4 py-2.5 text-sm font-semibold">
                  <span>Total del pedido</span>
                  <span className="text-primary">{formatoCRC(detalle.total)}</span>
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notas">Notas internas (solo para ti)</Label>
                <Textarea
                  id="notas"
                  rows={3}
                  value={notasBorrador}
                  onChange={(e) => setNotasBorrador(e.target.value)}
                  placeholder="Ej. paga por Sinpe Móvil al confirmar, entregar en la tarde…"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button type="button" className="rounded-full" onClick={guardarNotas}>
                  <CheckCircle2 className="h-4 w-4" aria-hidden />
                  Guardar notas
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => {
                    const texto = [
                      `Pedido ${detalle.codigo}`,
                      `${detalle.clienteNombre} · ${detalle.clienteTelefono}`,
                      detalle.direccion,
                      ...detalle.lineas.map(
                        (l) => `${l.cantidad}× ${l.producto} (${l.aroma ?? "sin aroma"}) = ${formatoCRC(l.total)}`
                      ),
                      `Total: ${formatoCRC(detalle.total)}`,
                      `Pago: ${detalle.metodoPago}`,
                    ].join("\n");
                    navigator.clipboard.writeText(texto).catch(() => undefined);
                  }}
                >
                  <Copy className="h-4 w-4" aria-hidden />
                  Copiar resumen
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="ml-auto rounded-full text-destructive hover:text-destructive"
                  onClick={() => eliminarPedido(detalle)}
                >
                  <XCircle className="h-4 w-4" aria-hidden />
                  Eliminar
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
