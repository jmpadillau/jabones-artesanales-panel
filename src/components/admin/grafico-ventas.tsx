"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatoCRC } from "@/lib/jabones";

interface Punto {
  etiqueta: string;
  ingresos: number;
  ganancia: number;
}

/** Gráfico de barras: ingresos vs. ganancia de los últimos 6 meses. */
export function GraficoVentas({ datos }: { datos: Punto[] }) {
  const vacio = datos.every((d) => d.ingresos === 0 && d.ganancia === 0);
  return (
    <div className="h-64 w-full sm:h-72" role="img" aria-label="Ingresos y ganancia por mes">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={datos} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e4d4" vertical={false} />
          <XAxis dataKey="etiqueta" tick={{ fontSize: 12, fill: "#66755f" }} tickLine={false} axisLine={{ stroke: "#e0e4d4" }} />
          <YAxis
            tick={{ fontSize: 11, fill: "#66755f" }}
            tickLine={false}
            axisLine={false}
            width={70}
            tickFormatter={(v: number) => formatoCRC(v)}
          />
          <Tooltip
            formatter={(valor) => formatoCRC(Number(valor))}
            contentStyle={{
              borderRadius: 16,
              border: "1px solid #e0e4d4",
              background: "#fffdf8",
              fontSize: 13,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="ingresos" name="Ingresos (entregados)" fill="#2e5a44" radius={[6, 6, 0, 0]} maxBarSize={36} />
          <Bar dataKey="ganancia" name="Ganancia estimada" fill="#8fb59d" radius={[6, 6, 0, 0]} maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>
      {vacio && (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Aún no hay entregados registrados; cuando marques pedidos como
          «Entregado» verás aquí la evolución mensual.
        </p>
      )}
    </div>
  );
}
