/**
 * /admin — RESUMEN GENERAL (dashboard) de la administradora:
 * pedidos por estado, ingresos y unidades vendidas (Entregado),
 * ganancia estimada, evolución mensual y productos más vendidos.
 */

import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  PackageCheck,
  PiggyBank,
  ShoppingBasket,
  TrendingUp,
} from "lucide-react";
import { db } from "@/lib/db";
import { mapaCostosPorTamano } from "@/lib/costos";
import {
  calcularTotales,
  formatoFechaHora,
  serieMensual,
  topPor,
} from "@/lib/estadisticas";
import { formatoCRC } from "@/lib/jabones";
import { EstadoBadge } from "@/components/admin/estado-badge";
import { GraficoVentas } from "@/components/admin/grafico-ventas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

function Metrica({
  titulo,
  valor,
  detalle,
  icono,
  color,
}: {
  titulo: string;
  valor: string;
  detalle: string;
  icono: React.ReactNode;
  color: string;
}) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="flex items-start gap-4 p-5">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
          style={{ backgroundColor: `${color}18`, color }}
        >
          {icono}
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {titulo}
          </p>
          <p className="font-display mt-1 truncate text-3xl font-semibold leading-none text-primary">
            {valor}
          </p>
          <p className="mt-1.5 text-xs text-muted-foreground">{detalle}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function AdminDashboard() {
  const [pedidos, costosPorTamano] = await Promise.all([
    db.pedido.findMany({ orderBy: { creadoEn: "desc" } }),
    mapaCostosPorTamano(),
  ]);

  const entregados = pedidos.filter((p) => p.estado === "Entregado");
  const pendientes = pedidos.filter((p) => p.estado === "Pendiente");
  const realizados = pedidos.filter((p) => p.estado === "Realizado");
  const cancelados = pedidos.filter((p) => p.estado === "Cancelado");

  const totEntregados = calcularTotales(entregados, costosPorTamano);

  const ahora = new Date();
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
  const entregadosMes = entregados.filter((p) => p.entregadoEn && p.entregadoEn >= inicioMes);
  const totMes = calcularTotales(entregadosMes, costosPorTamano);

  const serie = serieMensual(entregados, costosPorTamano, 6, ahora);
  const topAceites = topPor(entregados, "aceite", 5);
  const topAromas = topPor(entregados, "aroma", 5);
  const ultimos = pedidos.slice(0, 6);

  const haySinCosto = entregados.some((p) => !(p.tamanoId in costosPorTamano));

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-semibold text-primary sm:text-4xl">
          Resumen del negocio 🌿
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Todo lo que necesitas para decidir: pedidos, ingresos y ganancias al
          día. Actualizado ahora mismo.
        </p>
      </header>

      {/* Métricas principales */}
      <section aria-label="Métricas principales" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metrica
          titulo="Ingresos (Entregado)"
          valor={formatoCRC(totEntregados.ingresos)}
          detalle={`${formatoCRC(totMes.ingresos)} este mes · ${totEntregados.pedidos} pedidos entregados`}
          icono={<PiggyBank className="h-5 w-5" aria-hidden />}
          color="#2E5A44"
        />
        <Metrica
          titulo="Unidades vendidas"
          valor={String(totEntregados.unidades)}
          detalle={`${totMes.unidades} unidades este mes`}
          icono={<ShoppingBasket className="h-5 w-5" aria-hidden />}
          color="#F39C12"
        />
        <Metrica
          titulo="Ganancia estimada"
          valor={formatoCRC(totEntregados.ganancia)}
          detalle={`Margen ${totEntregados.margen.toFixed(0)}% · costos ${formatoCRC(totEntregados.costoProduccion)}`}
          icono={<TrendingUp className="h-5 w-5" aria-hidden />}
          color="#4A7A61"
        />
        <Metrica
          titulo="Por atender"
          valor={String(pendientes.length + realizados.length)}
          detalle={`${pendientes.length} pendientes · ${realizados.length} realizados`}
          icono={<Clock3 className="h-5 w-5" aria-hidden />}
          color="#9B59B6"
        />
      </section>

      {haySinCosto && (
        <p className="rounded-2xl border border-[#F39C12]/40 bg-[#F39C12]/10 px-4 py-3 text-sm text-[#9a6410]">
          Hay pedidos entregados con un tamaño sin costo definido. Define el
          costo por tamaño en la sección <Link href="/admin/costos" className="font-semibold underline underline-offset-2">Costos</Link> para
          que la ganancia sea exacta.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Evolución mensual */}
        <Card className="border-border bg-card lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-xl text-primary">
              Evolución de los últimos 6 meses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GraficoVentas datos={serie} />
          </CardContent>
        </Card>

        {/* Más vendidos */}
        <Card className="border-border bg-card lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-xl text-primary">
              Los favoritos (Entregado)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {[
              { titulo: "Aceites esenciales", datos: topAceites },
              { titulo: "Aromas", datos: topAromas },
            ].map((grupo) => (
              <div key={grupo.titulo}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {grupo.titulo}
                </p>
                {grupo.datos.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin ventas entregadas aún.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {grupo.datos.map((d, i) => (
                      <li key={d.nombre} className="flex items-center gap-2.5 text-sm">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-bosque">
                          {i + 1}
                        </span>
                        <span className="truncate font-medium">{d.nombre}</span>
                        <span className="ml-auto whitespace-nowrap text-xs text-muted-foreground">
                          {d.unidades} u · {formatoCRC(d.ingresos)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Últimos pedidos */}
      <section aria-label="Últimos pedidos">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-semibold text-primary">
            Últimos pedidos
          </h2>
          <Link
            href="/admin/pedidos"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-secondary"
          >
            Ver todos
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        {ultimos.length === 0 ? (
          <Card className="border-dashed border-border bg-card/60">
            <CardContent className="flex flex-col items-center gap-2 p-10 text-center">
              <PackageCheck className="h-10 w-10 text-muted-foreground/50" aria-hidden />
              <p className="font-medium">Todavía no hay pedidos</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Cuando un cliente envía su pedido desde la tienda, aparece aquí
                automáticamente como «Pendiente».
              </p>
            </CardContent>
          </Card>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {ultimos.map((p) => (
              <li
                key={p.id}
                className="rounded-2xl border border-border bg-card p-4 transition-shadow hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">
                      {p.clienteNombre}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {p.producto} × {p.cantidad}
                    </p>
                  </div>
                  <EstadoBadge estado={p.estado} />
                </div>
                <div className="mt-3 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span className="font-mono">{p.codigo}</span>
                  <span>{formatoFechaHora(p.creadoEn)}</span>
                  <span className="font-display text-base font-semibold text-primary">
                    {formatoCRC(p.total)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {cancelados.length > 0 && (
        <p className="text-xs text-muted-foreground">
          También hay {cancelados.length} pedido(s) cancelado(s) en el historial —
          revisa la sección Pedidos con el filtro «Cancelado».
        </p>
      )}
    </div>
  );
}
