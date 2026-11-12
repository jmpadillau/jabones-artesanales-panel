/**
 * /admin/ganancias — contabiliza ingresos por unidades vendidas (Entregado)
 * y las compara con los costos de producción para mostrar la ganancia
 * neta, el margen y los desgloses, con selector de periodo.
 */

import Link from "next/link";
import { db } from "@/lib/db";
import { mapaCostosPorTamano } from "@/lib/costos";
import {
  calcularTotales,
  desglosePorTamano,
  NOMBRES_PERIODO,
  periodoPorId,
  serieMensual,
  topPor,
  type PedidoParaCalculo,
} from "@/lib/estadisticas";
import { formatoCRC } from "@/lib/jabones";
import { GraficoVentas } from "@/components/admin/grafico-ventas";
import { SelectorPeriodo } from "@/components/admin/selector-periodo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

const PERIODO_VALIDO = new Set(Object.keys(NOMBRES_PERIODO));

export default async function AdminGananciasPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string }>;
}) {
  const { periodo: periodoParam } = await searchParams;
  const periodoId = periodoParam && PERIODO_VALIDO.has(periodoParam) ? periodoParam : "mes-actual";

  const [pedidosBrutos, costosPorTamano] = await Promise.all([
    db.pedido.findMany({ orderBy: { entregadoEn: "desc" } }),
    mapaCostosPorTamano(),
  ]);

  // Solo los pedidos entregados cuentan como ventas
  const entregados: PedidoParaCalculo[] = pedidosBrutos
    .filter((p) => p.estado === "Entregado")
    .map((p) => ({
      estado: p.estado,
      tamanoId: p.tamanoId,
      cantidad: p.cantidad,
      total: p.total,
      aceite: p.aceite,
      aroma: p.aroma,
      entregadoEn: p.entregadoEn,
      realizadoEn: p.realizadoEn,
      creadoEn: p.creadoEn,
    }));

  const periodo = periodoPorId(periodoId);
  const delPeriodo = entregados.filter(
    (p) =>
      p.entregadoEn !== null &&
      p.entregadoEn >= periodo.desde &&
      p.entregadoEn <= periodo.hasta
  );

  const totales = calcularTotales(delPeriodo, costosPorTamano);
  const desglose = desglosePorTamano(delPeriodo, costosPorTamano);
  const topAceites = topPor(delPeriodo, "aceite", 5);
  const topAromas = topPor(delPeriodo, "aroma", 5);
  const serie = serieMensual(entregados, costosPorTamano, 6);

  const metricas = [
    {
      titulo: "Ingresos",
      valor: formatoCRC(totales.ingresos),
      detalle: `${totales.pedidos} pedidos · ${totales.unidades} unidades`,
      color: "#2E5A44",
    },
    {
      titulo: "Costos de producción",
      valor: formatoCRC(totales.costoProduccion),
      detalle: "Costo por tamaño × unidades",
      color: "#F39C12",
    },
    {
      titulo: "Ganancia neta",
      valor: formatoCRC(totales.ganancia),
      detalle: `Margen del ${totales.margen.toFixed(0)} %`,
      color: totales.ganancia >= 0 ? "#4A7A61" : "#B3413B",
    },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-primary sm:text-4xl">
            Ganancias
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
            Las cifras consideran únicamente los pedidos <strong>Entregado</strong>{" "}
            (ventas concretadas). Ajusta los costos en{" "}
            <Link href="/admin/costos" className="underline underline-offset-2 hover:text-foreground">
              Costos
            </Link>{" "}
            para afinar el cálculo.
          </p>
        </div>
        <SelectorPeriodo actual={periodoId} opciones={NOMBRES_PERIODO} />
      </header>

      {/* Métricas del periodo */}
      <section aria-label="Cifras del periodo" className="grid gap-4 sm:grid-cols-3">
        {metricas.map((m) => (
          <Card key={m.titulo} className="border-border bg-card">
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {m.titulo}
              </p>
              <p
                className="font-display mt-1 text-3xl font-semibold leading-none"
                style={{ color: m.color }}
              >
                {m.valor}
              </p>
              <p className="mt-1.5 text-xs text-muted-foreground">{m.detalle}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <p className="rounded-2xl bg-secondary px-4 py-3 text-sm text-bosque">
        📌 Periodo: <strong>{NOMBRES_PERIODO[periodoId]}</strong> — si la ganancia
        sale en ₡0 con ventas registradas, define el costo por tamaño en la
        sección Costos.
      </p>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Desglose por tamaño */}
        <Card className="border-border bg-card lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-xl text-primary">
              Desglose por tamaño
            </CardTitle>
          </CardHeader>
          <CardContent>
            {desglose.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No hay ventas entregadas en este periodo.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <th scope="col" className="py-2 pr-3 font-semibold">Tamaño</th>
                      <th scope="col" className="py-2 pr-3 font-semibold text-right">Pedidos</th>
                      <th scope="col" className="py-2 pr-3 font-semibold text-right">Unidades</th>
                      <th scope="col" className="py-2 pr-3 font-semibold text-right">Ingresos</th>
                      <th scope="col" className="py-2 font-semibold text-right">Ganancia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {desglose.map((d) => (
                      <tr key={d.tamanoId} className="border-b border-border/60 last:border-0">
                        <td className="py-2.5 pr-3 font-medium">{d.etiqueta}</td>
                        <td className="py-2.5 pr-3 text-right tabular-nums">{d.pedidos}</td>
                        <td className="py-2.5 pr-3 text-right tabular-nums">{d.unidades}</td>
                        <td className="py-2.5 pr-3 text-right tabular-nums">{formatoCRC(d.ingresos)}</td>
                        <td className="py-2.5 text-right font-semibold tabular-nums text-primary">
                          {formatoCRC(d.ganancia)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-border font-semibold">
                      <td className="py-2.5 pr-3">Total</td>
                      <td className="py-2.5 pr-3 text-right tabular-nums">{totales.pedidos}</td>
                      <td className="py-2.5 pr-3 text-right tabular-nums">{totales.unidades}</td>
                      <td className="py-2.5 pr-3 text-right tabular-nums">{formatoCRC(totales.ingresos)}</td>
                      <td className="py-2.5 text-right tabular-nums text-primary">
                        {formatoCRC(totales.ganancia)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Favoritos del periodo */}
        <Card className="border-border bg-card lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-xl text-primary">
              Qué vendió más este periodo
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
                  <p className="text-sm text-muted-foreground">Sin datos en este periodo.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {grupo.datos.map((d) => (
                      <li key={d.nombre} className="flex items-center gap-2.5 text-sm">
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

      {/* Evolución general (siempre últimos 6 meses) */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-xl text-primary">
            Evolución de los últimos 6 meses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <GraficoVentas datos={serie} />
        </CardContent>
      </Card>
    </div>
  );
}
