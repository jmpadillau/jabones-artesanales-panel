"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Check,
  Copy,
  Flower2,
  Leaf,
  MessageCircle,
  Minus,
  MousePointerClick,
  PackageOpen,
  Plus,
  RotateCcw,
  Scale,
  ShoppingBag,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  construirMensajePedido,
  formatoCRC,
  generarIdPedido,
  enlaceWhatsApp,
  METODOS_PAGO,
  nombreProducto,
  propiedadesDe,
  subtotalLinea,
  SORPRENDEME,
  TAMANOS,
  TIPOS_PIEL,
  totalPedido,
  unidadesPedido,
  type DatosCliente,
  type LineaPedido,
  type MetodoPago,
  type Tamano,
  type TipoPiel,
} from "@/lib/jabones";

/** Línea del carrito: los datos del jabón + identificador local. */
type LineaCarrito = LineaPedido & { id: string };

/** Contador local para dar un identificador a cada línea agregada. */
let contadorLineas = 0;

export function Configurator({ whatsapp }: { whatsapp: string }) {
  // ====== Selección en curso (el "constructor" de una línea) ======
  const [piel, setPiel] = useState<TipoPiel | null>(null);
  const [aceite, setAceite] = useState<string | null>(null);
  const [aroma, setAroma] = useState<string | null>(null);
  const [tamano, setTamano] = useState<Tamano | null>(null);
  const [cantidad, setCantidad] = useState(1);

  // ====== Mi pedido: lista de jabones agregados ======
  const [lineas, setLineas] = useState<LineaCarrito[]>([]);

  // ====== Datos del cliente ======
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [direccion, setDireccion] = useState("");
  const [metodoPago, setMetodoPago] = useState<MetodoPago>("Sinpe Móvil");
  const [errores, setErrores] = useState<string[]>([]);
  const [idPedido, setIdPedido] = useState<string | null>(null);
  const { toast } = useToast();

  const completo = Boolean(piel && aceite && aroma && tamano);
  const total = totalPedido(lineas);

  const conError = (campo: string) => errores.includes(campo);
  const quitarError = (campo: string) =>
    setErrores((e) => e.filter((x) => x !== campo));

  function seleccionarPiel(t: TipoPiel) {
    setPiel(t);
    setErrores([]);
    // Al cambiar de piel, limpia selecciones que ya no sean compatibles
    if (aceite && !t.aceites.includes(aceite)) setAceite(null);
    if (aroma && !t.aromas.includes(aroma)) setAroma(null);
  }

  /** Agrega la selección actual como una nueva línea de "Mi pedido". */
  function agregarAlPedido() {
    if (!completo) {
      const faltantes: string[] = [];
      if (!piel) faltantes.push("tipo de piel");
      if (!aceite) faltantes.push("aceite esencial");
      if (!aroma) faltantes.push("aroma");
      if (!tamano) faltantes.push("tamaño");
      toast({
        variant: "destructive",
        title: "Completa los 4 pasos",
        description: `Falta elegir: ${faltantes.join(", ")}.`,
      });
      return;
    }
    const nueva: LineaCarrito = {
      id: `L${++contadorLineas}`,
      piel,
      aceite,
      aroma,
      tamano,
      cantidad,
    };
    setLineas((ls) => [...ls, nueva]);
    // Prepara el constructor para el siguiente jabón (conserva la piel,
    // que suele repetirse entre jabones de un mismo cliente).
    setAceite(null);
    setAroma(null);
    setTamano(null);
    setCantidad(1);
    setErrores([]);
    toast({
      title: "Jabón agregado a tu pedido \u{1f9fc}",
      description:
        "Puedes seguir agregando jabones con otros aromas, tamaños y aceites.",
    });
    document
      .getElementById("resumen")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function quitarLinea(id: string) {
    setLineas((ls) => ls.filter((l) => l.id !== id));
  }

  function ajustarCantidadLinea(id: string, delta: number) {
    setLineas((ls) =>
      ls.map((l) =>
        l.id === id
          ? { ...l, cantidad: Math.max(1, Math.min(50, l.cantidad + delta)) }
          : l
      )
    );
  }

  function reiniciar() {
    setPiel(null);
    setAceite(null);
    setAroma(null);
    setTamano(null);
    setCantidad(1);
    setLineas([]);
    setNombre("");
    setTelefono("");
    setEmail("");
    setDireccion("");
    setMetodoPago("Sinpe Móvil");
    setErrores([]);
    setIdPedido(null);
  }

  function prepararMensaje():
    | { ok: true; mensaje: string; id: string }
    | { ok: false; faltantes: string[] } {
    const faltantes: string[] = [];
    if (lineas.length === 0) faltantes.push("al menos un jabón en tu pedido");
    if (!nombre.trim()) faltantes.push("tu nombre");
    if (!telefono.trim()) faltantes.push("tu teléfono");
    if (!direccion.trim()) faltantes.push("tu dirección de envío");
    if (faltantes.length > 0) {
      setErrores(faltantes.map((f) => f.replace("tu ", "")));
      return { ok: false, faltantes };
    }
    setErrores([]);
    const cliente: DatosCliente = {
      nombre: nombre.trim(),
      telefono: telefono.trim(),
      email: email.trim(),
      direccion: direccion.trim(),
      metodoPago,
    };
    const id = idPedido ?? generarIdPedido();
    if (!idPedido) setIdPedido(id);
    return {
      ok: true,
      mensaje: construirMensajePedido(lineas, cliente, id),
      id,
    };
  }

  /** Registra el pedido en el panel de la administradora (respaldo automático). */
  function registrarPedidoEnPanel(codigo: string) {
    const cuerpo = {
      codigo,
      clienteNombre: nombre.trim(),
      clienteTelefono: telefono.trim(),
      clienteEmail: email.trim(),
      direccion: direccion.trim(),
      metodoPago,
      lineas: lineas.map((l) => ({
        tipoPiel: l.piel?.nombre ?? "",
        aceite: l.aceite ?? "",
        aroma: l.aroma ?? "",
        tamanoId: l.tamano?.id ?? "",
        cantidad: l.cantidad,
      })),
    };
    fetch("/api/pedidos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cuerpo),
      keepalive: true,
    }).catch(() => {
      // Silencioso: el pedido igual llega por WhatsApp.
    });
  }

  function enviarWhatsApp() {
    const r = prepararMensaje();
    if (!r.ok) {
      toast({
        variant: "destructive",
        title: "Falta información del pedido",
        description: `Por favor completa: ${r.faltantes.join(", ")}.`,
      });
      return;
    }
    registrarPedidoEnPanel(r.id);
    window.open(enlaceWhatsApp(whatsapp, r.mensaje), "_blank", "noopener,noreferrer");
    toast({
      title: "¡Tu pedido está listo en WhatsApp! \u{1f33f}",
      description:
        "Se abrió WhatsApp con el resumen precargado; solo presiona enviar.",
    });
  }

  async function copiarResumen() {
    const r = prepararMensaje();
    if (!r.ok) {
      toast({
        variant: "destructive",
        title: "Falta información del pedido",
        description: `Por favor completa: ${r.faltantes.join(", ")}.`,
      });
      return;
    }
    try {
      await navigator.clipboard.writeText(r.mensaje);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = r.mensaje;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    toast({
      title: "Resumen copiado al portapapeles",
      description: "Pégalo en WhatsApp o donde lo necesites.",
    });
  }

  const pasosResumen = [
    { n: 1, label: "Tipo de piel", valor: piel?.nombre },
    { n: 2, label: "Aceite esencial", valor: aceite },
    { n: 3, label: "Aroma", valor: aroma },
    {
      n: 4,
      label: "Tamaño y cantidad",
      valor: tamano ? `${tamano.gramos} g × ${cantidad}` : null,
    },
  ];

  return (
    <section id="configurar" className="scroll-mt-20 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-salvia">
            <Sparkles className="h-4 w-4" aria-hidden />
            Configurador
          </p>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-primary sm:text-4xl lg:text-5xl">
            Crea tus jabones a tu medida
          </h2>
          <p className="mt-4 text-muted-foreground">
            Cuatro pasos sencillos por cada jabón: elige tu tipo de piel,
            descubre los aceites y aromas compatibles, selecciona el tamaño y
            agrégalos a tu pedido. Combina cuantos jabones quieras y envía todo
            junto por WhatsApp.
          </p>
        </div>

        <div className="grid items-start gap-10 lg:grid-cols-[1fr_400px]">
          {/* ============ PASOS ============ */}
          <div className="space-y-10">
            {/* Paso 1: tipo de piel */}
            <article aria-labelledby="paso-1">
              <PasoEncabezado
                numero={1}
                id="paso-1"
                titulo="¿Cuál es tu tipo de piel?"
                descripcion="Define qué aceites y aromas te convienen."
              />
              <div className="grid gap-3 sm:grid-cols-2">
                {TIPOS_PIEL.map((t) => {
                  const activo = piel?.id === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => seleccionarPiel(t)}
                      aria-pressed={activo}
                      className={cn(
                        "group relative w-full rounded-2xl border-2 bg-card p-4 text-left transition-all sm:p-5",
                        activo
                          ? "shadow-md"
                          : "border-border hover:-translate-y-0.5 hover:shadow-sm"
                      )}
                      style={
                        activo
                          ? {
                              borderColor: t.color,
                              backgroundColor: `${t.color}12`,
                            }
                          : undefined
                      }
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2.5">
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: t.color }}
                            aria-hidden
                          />
                          <span className="font-semibold text-foreground">
                            {t.nombre}
                          </span>
                        </span>
                        {activo && (
                          <Check
                            className="h-5 w-5 shrink-0"
                            style={{ color: t.color }}
                            aria-hidden
                          />
                        )}
                      </span>
                      <span className="mt-1.5 block text-sm leading-relaxed text-muted-foreground">
                        {t.descripcion}
                      </span>
                    </button>
                  );
                })}
              </div>
            </article>

            {/* Paso 2: aceite esencial */}
            <article aria-labelledby="paso-2">
              <PasoEncabezado
                numero={2}
                id="paso-2"
                titulo="Elige tu aceite esencial"
                descripcion={
                  piel
                    ? `Opciones compatibles con ${piel.nombre.toLowerCase()}.`
                    : "Se activa al elegir tu tipo de piel."
                }
                atenuado={!piel}
              />
              {piel ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {piel.aceites.map((nombreAceite) => {
                    const activo = aceite === nombreAceite;
                    return (
                      <button
                        key={nombreAceite}
                        type="button"
                        onClick={() => {
                          setAceite(nombreAceite);
                          setErrores([]);
                        }}
                        aria-pressed={activo}
                        className={cn(
                          "w-full rounded-2xl border-2 bg-card p-4 text-left transition-all sm:p-5",
                          activo
                            ? "border-primary bg-secondary/60 shadow-md"
                            : "border-border hover:-translate-y-0.5 hover:border-salvia/60 hover:shadow-sm"
                        )}
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-2.5">
                            <span
                              className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-lg",
                                activo
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-secondary text-salvia"
                              )}
                            >
                              <Leaf className="h-4 w-4" aria-hidden />
                            </span>
                            <span className="font-semibold text-foreground">
                              {nombreAceite}
                            </span>
                          </span>
                          {activo && (
                            <Check className="h-5 w-5 text-primary" aria-hidden />
                          )}
                        </span>
                        <span className="mt-2 block text-xs leading-relaxed text-muted-foreground sm:text-sm">
                          {propiedadesDe(nombreAceite)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <MarcadorPendiente texto="Primero selecciona tu tipo de piel para ver los aceites compatibles." />
              )}
            </article>

            {/* Paso 3: aroma */}
            <article aria-labelledby="paso-3">
              <PasoEncabezado
                numero={3}
                id="paso-3"
                titulo="Escoge tu aroma favorito"
                descripcion={
                  piel
                    ? "Fragancias recomendadas para tu tipo de piel."
                    : "Se activa al elegir tu tipo de piel."
                }
                atenuado={!piel}
              />
              {piel ? (
                <div className="flex flex-wrap gap-2.5" role="group" aria-label="Aromas disponibles">
                  {/* Sorpréndeme: la administradora elige el aroma al preparar el pedido */}
                  <button
                    type="button"
                    onClick={() => {
                      setAroma(SORPRENDEME);
                      setErrores([]);
                    }}
                    aria-pressed={aroma === SORPRENDEME}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border-2 border-dashed px-4 py-2.5 text-sm font-medium transition-all",
                      aroma === SORPRENDEME
                        ? "border-primary bg-primary text-primary-foreground shadow-md"
                        : "border-salvia/50 bg-card text-salvia hover:bg-secondary"
                    )}
                  >
                    <Sparkles className="h-4 w-4" aria-hidden />
                    Sorpréndeme
                    {aroma === SORPRENDEME && <Check className="h-4 w-4" aria-hidden />}
                  </button>
                  {piel.aromas.map((nombreAroma) => {
                    const activo = aroma === nombreAroma;
                    return (
                      <button
                        key={nombreAroma}
                        type="button"
                        onClick={() => {
                          setAroma(nombreAroma);
                          setErrores([]);
                        }}
                        aria-pressed={activo}
                        className={cn(
                          "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-all",
                          activo
                            ? "border-primary bg-primary text-primary-foreground shadow-md"
                            : "border-border bg-card text-foreground/85 hover:border-salvia/60 hover:bg-secondary"
                        )}
                      >
                        <Flower2 className="h-4 w-4" aria-hidden />
                        {nombreAroma}
                        {activo && <Check className="h-4 w-4" aria-hidden />}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <MarcadorPendiente texto="Primero selecciona tu tipo de piel para ver los aromas compatibles." />
              )}
            </article>

            {/* Paso 4: tamaño y cantidad */}
            <article aria-labelledby="paso-4">
              <PasoEncabezado
                numero={4}
                id="paso-4"
                titulo="Tamaño y cantidad"
                descripcion="Precios según el peso del jabón."
              />
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {TAMANOS.map((t) => {
                  const activo = tamano?.id === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setTamano(t);
                        setErrores([]);
                      }}
                      aria-pressed={activo}
                      className={cn(
                        "relative w-full rounded-2xl border-2 bg-card p-4 text-center transition-all",
                        activo
                          ? "border-primary bg-secondary/60 shadow-md"
                          : "border-border hover:-translate-y-0.5 hover:border-salvia/60 hover:shadow-sm"
                      )}
                    >
                      {t.popular && (
                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-primary-foreground uppercase">
                          Más pedido
                        </span>
                      )}
                      <span className="font-display text-3xl font-semibold text-primary">
                        {t.gramos}
                        <span className="text-base"> g</span>
                      </span>
                      <span className="mt-0.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {t.etiqueta}
                      </span>
                      <span className="mt-2 block font-semibold text-foreground">
                        {formatoCRC(t.precio)}
                      </span>
                      <span className="mt-1 block text-xs leading-snug text-muted-foreground">
                        {t.descripcion}
                      </span>
                      {activo && (
                        <Check
                          className="mx-auto mt-2 h-4 w-4 text-primary"
                          aria-hidden
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Scale className="h-4 w-4 text-salvia" aria-hidden />
                  Cantidad
                </div>
                <div className="flex items-center gap-1 rounded-full border border-input bg-background p-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                    disabled={cantidad <= 1}
                    aria-label="Disminuir cantidad"
                  >
                    <Minus className="h-4 w-4" aria-hidden />
                  </Button>
                  <span
                    className="w-10 text-center text-base font-semibold tabular-nums"
                    aria-live="polite"
                  >
                    {cantidad}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => setCantidad((c) => Math.min(50, c + 1))}
                    aria-label="Aumentar cantidad"
                  >
                    <Plus className="h-4 w-4" aria-hidden />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Al terminar, agrega este jabón a tu pedido; puedes combinar
                  varios distintos.
                </p>
              </div>

              <Button
                type="button"
                size="lg"
                className="mt-5 w-full rounded-full text-base sm:w-auto sm:px-8"
                onClick={agregarAlPedido}
              >
                <ShoppingBag className="h-5 w-5" aria-hidden />
                Agregar al pedido
              </Button>
            </article>
          </div>

          {/* ============ MI PEDIDO ============ */}
          <aside
            id="resumen"
            className="scroll-mt-24 lg:sticky lg:top-24"
            aria-label="Mi pedido"
          >
            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-lg">
              <div className="flex items-center gap-4 border-b border-border bg-secondary/50 p-5">
                <Image
                  src="/images/jabon-artesanal.png"
                  alt="Jabón artesanal envuelto en papel kraft con lavanda"
                  width={200}
                  height={200}
                  className="h-20 w-20 rounded-2xl border border-border object-cover"
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-salvia">
                    Mi pedido
                  </p>
                  {lineas.length === 0 ? (
                    <p className="font-display truncate text-xl font-semibold text-primary">
                      Aún no agregas jabones
                    </p>
                  ) : (
                    <p className="font-display text-xl font-semibold text-primary">
                      {unidadesPedido(lineas)}{" "}
                      {unidadesPedido(lineas) === 1 ? "jabón" : "jabones"} ·{" "}
                      {lineas.length}{" "}
                      {lineas.length === 1 ? "variedad" : "variedades"}
                    </p>
                  )}
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {lineas.length === 0
                      ? "Configura tu primer jabón en los 4 pasos"
                      : "Puedes seguir agregando más jabones"}
                  </p>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                {/* Selección en curso */}
                <ul className="space-y-2.5">
                  {pasosResumen.map((p) => (
                    <li key={p.n} className="flex items-center gap-3 text-sm">
                      <span
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                          p.valor
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {p.valor ? <Check className="h-3.5 w-3.5" aria-hidden /> : p.n}
                      </span>
                      <span className="text-muted-foreground">{p.label}:</span>
                      <span
                        className={cn(
                          "ml-auto truncate font-medium",
                          p.valor ? "text-foreground" : "text-muted-foreground/60"
                        )}
                      >
                        {p.valor ?? "Por elegir"}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Líneas agregadas */}
                <div className="mt-5">
                  {lineas.length === 0 ? (
                    <div className="flex items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                      <PackageOpen className="h-5 w-5 shrink-0 text-salvia" aria-hidden />
                      Tu pedido está vacío: agrega el primer jabón con el botón
                      «Agregar al pedido».
                    </div>
                  ) : (
                    <ul className="space-y-2.5" aria-label="Jabones agregados al pedido">
                      {lineas.map((l, i) => (
                        <li
                          key={l.id}
                          className="rounded-2xl border border-border bg-background p-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="min-w-0 text-sm font-semibold text-foreground">
                              <span className="mr-1.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-bold text-salvia">
                                {i + 1}
                              </span>
                              {nombreProducto(l)}
                            </p>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 shrink-0 rounded-full text-muted-foreground hover:text-destructive"
                              onClick={() => quitarLinea(l.id)}
                              aria-label={`Quitar ${nombreProducto(l)} del pedido`}
                            >
                              <Trash2 className="h-4 w-4" aria-hidden />
                            </Button>
                          </div>
                          <p className="mt-1 truncate pl-7 text-xs text-muted-foreground">
                            {l.aroma === SORPRENDEME
                              ? "Aroma a elección de By-Sil"
                              : `Aroma ${l.aroma}`}
                            {l.piel ? ` · Piel ${l.piel.nombre}` : ""}
                          </p>
                          <div className="mt-2 flex items-center justify-between gap-2 pl-1">
                            <div className="flex items-center gap-1 rounded-full border border-input bg-card p-0.5">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 rounded-full"
                                onClick={() => ajustarCantidadLinea(l.id, -1)}
                                disabled={l.cantidad <= 1}
                                aria-label="Disminuir cantidad de esta línea"
                              >
                                <Minus className="h-3.5 w-3.5" aria-hidden />
                              </Button>
                              <span className="w-7 text-center text-sm font-semibold tabular-nums">
                                ×{l.cantidad}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 rounded-full"
                                onClick={() => ajustarCantidadLinea(l.id, 1)}
                                aria-label="Aumentar cantidad de esta línea"
                              >
                                <Plus className="h-3.5 w-3.5" aria-hidden />
                              </Button>
                            </div>
                            <p className="text-sm font-semibold text-primary">
                              {formatoCRC(subtotalLinea(l))}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="mt-5 rounded-2xl bg-primary p-4 text-primary-foreground">
                  <div className="flex items-end justify-between gap-2">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider opacity-80">
                        Total
                      </p>
                      {lineas.length > 0 && (
                        <p className="text-xs opacity-80">
                          {unidadesPedido(lineas)}{" "}
                          {unidadesPedido(lineas) === 1 ? "jabón" : "jabones"}
                        </p>
                      )}
                    </div>
                    <p className="font-display text-4xl font-semibold leading-none">
                      {formatoCRC(total)}
                    </p>
                  </div>
                </div>

                <Separator className="my-6" />

                <h3 className="font-display mb-4 text-xl font-semibold text-foreground">
                  Tus datos de envío
                </h3>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="nombre">Nombre completo *</Label>
                    <Input
                      id="nombre"
                      placeholder="Ej. María Rodríguez"
                      value={nombre}
                      onChange={(e) => {
                        setNombre(e.target.value);
                        quitarError("nombre");
                      }}
                      className={cn(conError("nombre") && "border-destructive focus-visible:ring-destructive/40")}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="telefono">Teléfono / WhatsApp *</Label>
                      <Input
                        id="telefono"
                        type="tel"
                        inputMode="tel"
                        placeholder="8888-8888"
                        value={telefono}
                        onChange={(e) => {
                          setTelefono(e.target.value);
                          quitarError("teléfono");
                        }}
                        className={cn(conError("teléfono") && "border-destructive focus-visible:ring-destructive/40")}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email">
                        Correo{" "}
                        <span className="text-muted-foreground">(opcional)</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="tucorreo@ejemplo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="direccion">Dirección exacta de envío *</Label>
                    <Textarea
                      id="direccion"
                      placeholder="Provincia, cantón, distrito, señas exactas"
                      rows={2}
                      value={direccion}
                      onChange={(e) => {
                        setDireccion(e.target.value);
                        quitarError("dirección");
                      }}
                      className={cn(conError("dirección") && "border-destructive focus-visible:ring-destructive/40")}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Método de pago *</Label>
                    <RadioGroup
                      value={metodoPago}
                      onValueChange={(v) => setMetodoPago(v as MetodoPago)}
                      className="grid gap-2 sm:grid-cols-3"
                    >
                      {METODOS_PAGO.map((m) => (
                        <Label
                          key={m}
                          htmlFor={`pago-${m}`}
                          className={cn(
                            "flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm font-normal transition-colors",
                            metodoPago === m
                              ? "border-primary bg-secondary/60 font-medium"
                              : "hover:bg-muted/60"
                          )}
                        >
                          <RadioGroupItem value={m} id={`pago-${m}`} />
                          {m}
                        </Label>
                      ))}
                    </RadioGroup>
                  </div>
                </div>

                <div className="mt-6 space-y-2.5">
                  <Button
                    type="button"
                    size="lg"
                    className="w-full rounded-full text-base"
                    onClick={enviarWhatsApp}
                  >
                    <MessageCircle className="h-5 w-5" aria-hidden />
                    Enviar pedido por WhatsApp
                  </Button>
                  <Button
                    type="button"
                    size="lg"
                    variant="outline"
                    className="w-full rounded-full"
                    onClick={copiarResumen}
                  >
                    <Copy className="h-4 w-4" aria-hidden />
                    Copiar resumen del pedido
                  </Button>
                  <div className="flex items-center justify-between pt-1">
                    <p className="text-xs leading-snug text-muted-foreground">
                      Al enviar se abre WhatsApp con tu pedido completo
                      precargado. Confirmamos disponibilidad, pago y entrega.
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 shrink-0 gap-1.5 rounded-full text-xs text-muted-foreground"
                      onClick={reiniciar}
                    >
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                      Reiniciar
                    </Button>
                  </div>
                  {idPedido && (
                    <p className="text-center text-xs text-muted-foreground">
                      N.º de pedido:{" "}
                      <span className="font-mono font-medium text-foreground">
                        {idPedido}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Barra móvil fija con el total */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Total estimado · {unidadesPedido(lineas)}{" "}
              {unidadesPedido(lineas) === 1 ? "jabón" : "jabones"}
            </p>
            <p className="font-display text-2xl font-semibold leading-none text-primary">
              {formatoCRC(total)}
            </p>
          </div>
          <Button
            type="button"
            className="rounded-full"
            onClick={() =>
              document
                .getElementById("resumen")
                ?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
          >
            <ShoppingBag className="h-4 w-4" aria-hidden />
            Ver mi pedido
          </Button>
        </div>
      </div>
    </section>
  );
}

function PasoEncabezado({
  numero,
  id,
  titulo,
  descripcion,
  atenuado = false,
}: {
  numero: number;
  id: string;
  titulo: string;
  descripcion: string;
  atenuado?: boolean;
}) {
  return (
    <div className="mb-4 flex items-start gap-3.5">
      <span
        className={cn(
          "font-display flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-semibold",
          atenuado ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground"
        )}
        aria-hidden
      >
        {numero}
      </span>
      <div>
        <h3
          id={id}
          className={cn(
            "font-display text-2xl font-semibold tracking-tight",
            atenuado ? "text-muted-foreground" : "text-foreground"
          )}
        >
          {titulo}
        </h3>
        <p className="text-sm text-muted-foreground">{descripcion}</p>
      </div>
    </div>
  );
}

function MarcadorPendiente({ texto }: { texto: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-muted/40 p-5 text-sm text-muted-foreground">
      <MousePointerClick className="h-5 w-5 shrink-0 text-salvia" aria-hidden />
      {texto}
    </div>
  );
}
