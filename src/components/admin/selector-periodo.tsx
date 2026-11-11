"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CalendarRange } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/** Selector del periodo de las ganancias (actualiza ?periodo=…). */
export function SelectorPeriodo({
  actual,
  opciones,
}: {
  actual: string;
  opciones: Record<string, string>;
}) {
  const router = useRouter();
  const parametros = useSearchParams();

  return (
    <div className="flex items-center gap-2">
      <CalendarRange className="h-4 w-4 text-salvia" aria-hidden />
      <Select
        value={actual}
        onValueChange={(v) => {
          const q = new URLSearchParams(parametros.toString());
          q.set("periodo", v);
          router.push(`/admin/ganancias?${q.toString()}`);
        }}
      >
        <SelectTrigger
          className="w-44 rounded-full"
          aria-label="Seleccionar periodo de ganancias"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(opciones).map(([id, nombre]) => (
            <SelectItem key={id} value={id}>
              {nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
