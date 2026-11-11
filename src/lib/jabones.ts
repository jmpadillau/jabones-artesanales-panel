/**
 * ============================================================
 *  DATOS DE LA TIENDA — BY-SIL · JABONES ARTESANALES
 * ============================================================
 *  Este archivo centraliza TODA la información del catálogo:
 *  tipos de piel, aceites esenciales, aromas, tamaños y precios.
 *
 *  ⭐ Contenido sincronizado con el panel de administración
 *  (proyecto "panel bySil" y su Excel "Control Jabones
 *  Artesanales"): 4 tipos de piel, 10 aceites esenciales,
 *  18 aromas y 4 tamaños con sus precios.
 *
 *  ✏️  PARA EDITAR: modifica solo este archivo y la web se
 *      actualiza automáticamente (filtros, precios y mensaje
 *      de WhatsApp incluidos).
 *
 *  📱 El número de WhatsApp NO se edita aquí: se guarda en la
 *  base de datos (tabla Ajuste) y se cambia desde
 *  Panel → Ajustes. WHATSAPP_TIENDA es solo el valor inicial.
 * ============================================================
 */

/** WhatsApp de la administración (código de país + número, sin espacios).
 *  Valor inicial: el número real de By-Sil. En tiempo de ejecución la web
 *  lee el número vigente de la tabla Ajuste (Panel → Ajustes). */
export const WHATSAPP_TIENDA = "50688419135";

export const MARCA = "By-Sil";
export const MARCA_LARGA = "By-Sil · Jabones Artesanales";
export const LEMA = "Jabones Artesanales · Esencias y aromas naturales";

/** Aroma comodín del panel: la administradora elige al prepararlo. */
export const SORPRENDEME = "Sorpréndeme";

export type PielId = "seca" | "grasa" | "madura" | "sensible";

export interface TipoPiel {
  id: PielId;
  nombre: string;
  descripcion: string;
  color: string; // color de acento de la línea visual botánica
  aceites: string[]; // aceites esenciales compatibles
  aromas: string[]; // aromas recomendados
}

export interface Aroma {
  nombre: string;
  descripcion: string;
}

/** Los 18 aromas oficiales del catálogo de By-Sil (disponibles para cualquier tipo de piel). */
export const AROMAS: Aroma[] = [
  { nombre: "Frambuesa", descripcion: "Dulce y frutal, con notas frescas de bayas." },
  { nombre: "Chicle", descripcion: "Dulce y jugoso, con un toque retro y divertido." },
  { nombre: "Lemon Grass", descripcion: "Cítrico y herbal, fresco y energizante." },
  { nombre: "Maracuyá", descripcion: "Tropical y exótico, intenso como la fruta fresca." },
  { nombre: "Manzana Canela", descripcion: "Cálido y acogedor: manzana dulce con un toque de especia." },
  { nombre: "Frappuchino", descripcion: "Cremoso y delicioso, con notas de café y caramelo." },
  { nombre: "Árbol de Té y Manzana", descripcion: "Herbal y afrutado: frescura con un toque dulce." },
  { nombre: "Ciprés Navideño", descripcion: "Amaderado y reconfortante, con esencia de bosque." },
  { nombre: "Navidad Dorada", descripcion: "Cálido y especiado, con un toque festivo." },
  { nombre: "Bambú Otoñal", descripcion: "Verde y sereno, con notas suaves y naturales." },
  { nombre: "Herbal", descripcion: "Aromático y terroso, un abrazo de hierbas frescas." },
  { nombre: "Brisa Marina", descripcion: "Fresco y acuático, con la ligereza de la brisa del mar." },
  { nombre: "Frutas Exóticas", descripcion: "Tropical y vibrante, una mezcla jugosa de frutas del trópico." },
  { nombre: "Campos de Lavanda", descripcion: "Floral y sereno, como un campo de lavanda al atardecer." },
  { nombre: "Rompope", descripcion: "Cremoso y reconfortante, con un toque de canela y vainilla." },
  { nombre: "Fantasía Naranja", descripcion: "Cítrico y luminoso, con la frescura de la naranja recién pelada." },
  { nombre: "Explosión Sandía", descripcion: "Fresco y jugoso, con la dulzura acuosa de la sandía madura." },
  { nombre: "Bosque Navideño", descripcion: "Fresco y boscoso, con aroma de pinos y un aire festivo." },
];

/** Los aromas están disponibles para cualquier tipo de piel. */
function aromasTodos(): string[] {
  return AROMAS.map((a) => a.nombre);
}

/**
 * MAPA BOTÁNICO — los 4 tipos de piel del catálogo oficial de By-Sil.
 * Cada tipo define qué aceites esenciales y aromas se ofrecen.
 */
export const TIPOS_PIEL: TipoPiel[] = [
  {
    id: "seca",
    nombre: "Seca o con Pérdida de Hidratación",
    descripcion:
      "Nutre en profundidad y devuelve suavidad e hidratación a la piel seca o apagada.",
    color: "#3498DB",
    aceites: ["Jengibre", "Albahaca"],
    aromas: aromasTodos(),
  },
  {
    id: "grasa",
    nombre: "Grasa, Mixta o con Tendencia al Acné",
    descripcion:
      "Controla el brillo, minimiza los poros y equilibra la piel con tendencia al acné.",
    color: "#F39C12",
    aceites: [
      "Zacate de Limón",
      "Árbol de Té",
      "Salvia",
      "Menta Piperita",
      "Albahaca",
    ],
    aromas: aromasTodos(),
  },
  {
    id: "madura",
    nombre: "Madura o con Pérdida de Firmeza",
    descripcion:
      "Aporta firmeza y luminosidad, y ayuda a suavizar las líneas de expresión.",
    color: "#E84393",
    aceites: ["Jengibre", "Salvia", "Rosas (Damascena)"],
    aromas: aromasTodos(),
  },
  {
    id: "sensible",
    nombre: "Sensible, Irritada o con Afecciones Cutáneas",
    descripcion:
      "Calma irritaciones y rojeces con fórmulas suaves, naturales y equilibrantes.",
    color: "#9B59B6",
    aceites: ["Manzanilla", "Lavanda", "Eucalipto Limón"],
    aromas: aromasTodos(),
  },
];

export interface Aceite {
  nombre: string;
  propiedades: string;
}

/** Catálogo de aceites con las propiedades oficiales de By-Sil. */
export const ACEITES: Aceite[] = [
  {
    nombre: "Zacate de Limón",
    propiedades:
      "Purificante, astringente y tonificante. Ayuda a controlar el exceso de grasa y a minimizar los poros.",
  },
  {
    nombre: "Manzanilla",
    propiedades:
      "Calmante y antiinflamatoria. Alivia irritaciones, rojeces, sensibilidad y afecciones como la dermatitis o el eccema.",
  },
  {
    nombre: "Jengibre",
    propiedades:
      "Antioxidante y revitalizante. Aporta luminosidad, mejora la circulación y ayuda a mejorar la firmeza del rostro.",
  },
  {
    nombre: "Lavanda",
    propiedades:
      "Regeneradora, cicatrizante y equilibrante. Calma la piel irritada, favorece la curación de marcas y acelera la regeneración celular.",
  },
  {
    nombre: "Árbol de Té",
    propiedades:
      "Antiséptico, antibacteriano y antiinflamatorio. Ideal para combatir el acné, reducir imperfecciones y limpiar en profundidad.",
  },
  {
    nombre: "Salvia",
    propiedades:
      "Reguladora del sebo y astringente. Ayuda a equilibrar pieles mixtas o grasas y promueve el rejuvenecimiento cutáneo.",
  },
  {
    nombre: "Menta Piperita",
    propiedades:
      "Refrescante, descongestionante y antiséptica. Calma la sensación de picor, tonifica y estimula la microcirculación.",
  },
  {
    nombre: "Albahaca",
    propiedades:
      "Purificante, tonificante y antioxidante. Limpia los poros, ayuda a unificar el tono y revitaliza las pieles apagadas.",
  },
  {
    nombre: "Eucalipto Limón",
    propiedades:
      "Antiséptico, purificante y calmante. Ayuda a aliviar picaduras, combate bacterias y protege la piel expuesta a agentes externos.",
  },
  {
    nombre: "Rosas (Damascena)",
    propiedades:
      "Hidratante, antiedad y regeneradora. Aporta elasticidad, suaviza líneas de expresión y calma pieles secas o maduras.",
  },
];

/** Devuelve las propiedades de un aceite por su nombre. */
export function propiedadesDe(nombre: string): string {
  return ACEITES.find((a) => a.nombre === nombre)?.propiedades ?? "";
}

/** Devuelve los tipos de piel compatibles con un aceite (para las etiquetas). */
export function pielesDeAceite(nombre: string): PielId[] {
  return TIPOS_PIEL.filter((t) => t.aceites.includes(nombre)).map((t) => t.id);
}

export interface Tamano {
  id: string;
  gramos: number;
  etiqueta: string;
  precio: number; // precio de venta en colones (₡)
  descripcion: string;
  popular?: boolean;
}

/** Tamaños y precios oficiales de By-Sil (₡). */
export const TAMANOS: Tamano[] = [
  {
    id: "50g",
    gramos: 50,
    etiqueta: "Pequeño",
    precio: 1000,
    descripcion: "Ideal para probar o regalar",
  },
  {
    id: "75g",
    gramos: 75,
    etiqueta: "Mediano",
    precio: 1500,
    descripcion: "Práctico para el uso diario",
  },
  {
    id: "100g",
    gramos: 100,
    etiqueta: "Clásico",
    precio: 2000,
    descripcion: "El favorito de nuestros clientes",
    popular: true,
  },
  {
    id: "150g",
    gramos: 150,
    etiqueta: "Grande",
    precio: 3000,
    descripcion: "Más jabón, más duración",
  },
];

export const METODOS_PAGO = [
  "Sinpe Móvil",
  "Efectivo",
  "Tarjeta",
] as const;
export type MetodoPago = (typeof METODOS_PAGO)[number];

/** Formatea montos en colones con separador de miles: 4000 → "₡4.000" */
export function formatoCRC(monto: number): string {
  return "₡" + Math.round(monto).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/** Una línea del pedido: UN jabón configurado (piel, aceite, aroma,
 *  tamaño y cantidad). Un pedido puede tener varias líneas. */
export interface LineaPedido {
  piel: TipoPiel | null;
  aceite: string | null;
  aroma: string | null;
  tamano: Tamano | null;
  cantidad: number;
}

/** Datos de contacto y envío del cliente (comunes a todo el pedido). */
export interface DatosCliente {
  nombre: string;
  telefono: string;
  email: string;
  direccion: string;
  metodoPago: MetodoPago;
}

/** Subtotal de una línea: precio del tamaño × cantidad. */
export function subtotalLinea(l: LineaPedido): number {
  return (l.tamano?.precio ?? 0) * l.cantidad;
}

/** Total del pedido: suma de todas las líneas. */
export function totalPedido(lineas: LineaPedido[]): number {
  return lineas.reduce((suma, l) => suma + subtotalLinea(l), 0);
}

/** Cantidad total de jabones del pedido. */
export function unidadesPedido(lineas: LineaPedido[]): number {
  return lineas.reduce((suma, l) => suma + l.cantidad, 0);
}

/** Construye el nombre comercial del producto, igual que el panel admin. */
export function nombreProducto(d: {
  aceite?: string | null;
  tamano?: Tamano | null;
}): string {
  if (!d.aceite || !d.tamano) return "Jabón personalizado";
  return `Jabón de ${d.aceite} (${d.tamano.gramos} g)`;
}

/** Construye el mensaje de pedido (una o varias líneas) listo para WhatsApp. */
export function construirMensajePedido(
  lineas: LineaPedido[],
  cliente: DatosCliente,
  idPedido: string
): string {
  const fecha = new Date().toLocaleDateString("es-CR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const bloqueLineas = lineas.map((l, i) => {
    const detalle = [
      l.aroma
        ? `Aroma: ${
            l.aroma === SORPRENDEME
              ? "Sorpréndeme (a elección de By-Sil)"
              : l.aroma
          }`
        : null,
      l.piel ? `Piel: ${l.piel.nombre}` : null,
      l.tamano ? `${l.tamano.gramos} g × ${l.cantidad}` : null,
    ]
      .filter(Boolean)
      .join(" · ");
    return `${i + 1}. *${nombreProducto(l)}* — ${formatoCRC(subtotalLinea(l))}\n    ${detalle}`;
  });

  const lineasMensaje = [
    "\u{1f33f} *NUEVO PEDIDO — By-Sil · Jabones Artesanales* \u{1f33f}",
    `\u{1f9fe} Pedido: *${idPedido}*  ·  ${fecha}`,
    "━━━━━━━━━━━━━━━━━━",
    `\u{1f9fc} *Jabones solicitados (${unidadesPedido(lineas)}):*`,
    ...bloqueLineas,
    "━━━━━━━━━━━━━━━━━━",
    `\u{1f4b0} *Total: ${formatoCRC(totalPedido(lineas))}*`,
    "━━━━━━━━━━━━━━━━━━",
    `\u{1f464} *Cliente:* ${cliente.nombre}`,
    `\u{1f4f1} *Teléfono:* ${cliente.telefono}`,
    cliente.email ? `\u{1f4e7} *Email:* ${cliente.email}` : null,
    `\u{1f4cd} *Dirección de envío:* ${cliente.direccion}`,
    `\u{1f4b3} *Método de pago:* ${cliente.metodoPago}`,
  ].filter(Boolean);
  return lineasMensaje.join("\n");
}

/** Genera el enlace de WhatsApp con el pedido precargado. */
export function enlaceWhatsApp(numero: string, mensaje: string): string {
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}

/** Genera un identificador de pedido tipo PED-1700000000000 */
export function generarIdPedido(): string {
  return `PED-${Date.now()}`;
}
