import { COLOR_ESTADO, ETIQUETA_ESTADO, type Estado } from "@/lib/estadisticas";
import { cn } from "@/lib/utils";

/** Etiqueta visual del estado del pedido (línea visual botánica). */
export function EstadoBadge({
  estado,
  className,
}: {
  estado: string;
  className?: string;
}) {
  const e = (estado as Estado) in COLOR_ESTADO ? (estado as Estado) : "Pendiente";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium",
        className
      )}
      style={{
        color: COLOR_ESTADO[e],
        borderColor: `${COLOR_ESTADO[e]}55`,
        backgroundColor: `${COLOR_ESTADO[e]}14`,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: COLOR_ESTADO[e] }}
        aria-hidden
      />
      {ETIQUETA_ESTADO[e]}
    </span>
  );
}
