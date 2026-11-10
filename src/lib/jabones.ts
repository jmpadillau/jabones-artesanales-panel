export interface TipoPiel {
  id: string
  nombre: string
  descripcion: string
  colorHex: string
}

export interface AceiteEsencial {
  id: string
  nombre: string
  propiedades: string
  tiposPielIds: string[]
}

export interface Aroma {
  id: string
  nombre: string
}

export interface TamanoJabones {
  id: string
  gramos: number
  precio: number
  etiqueta: string
}

export const TIPOS_PIEL: TipoPiel[] = [
  {
    id: "grasa-mixta",
    nombre: "Grasa, Mixta o con Tendencia al Acné",
    descripcion: "Controla el brillo, minimiza los poros y equilibra la piel con tendencia al acné.",
    colorHex: "#e69d24",
  },
  {
    id: "sensible",
    nombre: "Sensible, Irritada o con Afecciones Cutáneas",
    descripcion: "Calma irritaciones y rojeces con fórmulas suaves, naturales y equilibrantes.",
    colorHex: "#9b51e0",
  },
  {
    id: "madura",
    nombre: "Madura o con Pérdida de Firmeza",
    descripcion: "Aporta firmeza y luminosidad, y ayuda a suavizar las líneas de expresión.",
    colorHex: "#e91e63",
  },
  {
    id: "seca",
    nombre: "Seca o con Pérdida de Hidratación",
    descripcion: "Nutrición profunda para restaurar la barrera cutánea e hidratación duradera.",
    colorHex: "#2196f3",
  },
]

export const ACEITES: AceiteEsencial[] = [
  {
    id: "1",
    nombre: "Zacate de Limón",
    propiedades: "Purificante, astringente y tonificante. Ayuda a controlar el exceso de grasa y a minimizar los poros.",
    tiposPielIds: ["grasa-mixta"],
  },
  {
    id: "2",
    nombre: "Manzanilla",
    propiedades: "Calmante y antiinflamatoria. Alivia irritaciones, rojeces, sensibilidad y afecciones como dermatitis o eccema.",
    tiposPielIds: ["sensible"],
  },
  {
    id: "3",
    nombre: "Jengibre",
    propiedades: "Antioxidante y revitalizante. Aporta luminosidad, mejora la circulación y ayuda a la firmeza.",
    tiposPielIds: ["madura", "seca"],
  },
  {
    id: "4",
    nombre: "Lavanda",
    propiedades: "Regeneradora, cicatrizante y equilibrante. Calma la piel irritada y favorece la curación de marcas.",
    tiposPielIds: ["sensible"],
  },
  {
    id: "5",
    nombre: "Árbol de Té",
    propiedades: "Antiséptico, antibacteriano y antiinflamatorio. Ideal para combatir el acné y limpiar en profundidad.",
    tiposPielIds: ["grasa-mixta"],
  },
  {
    id: "6",
    nombre: "Salvia",
    propiedades: "Reguladora del sebo y astringente. Ayuda a equilibrar pieles mixtas o grasas y promueve el rejuvenecimiento.",
    tiposPielIds: ["grasa-mixta", "madura"],
  },
  {
    id: "7",
    nombre: "Menta Piperita",
    propiedades: "Refrescante, descongestionante y antiséptica. Calma el picor, tonifica y estimula la microcirculación.",
    tiposPielIds: ["grasa-mixta"],
  },
  {
    id: "8",
    nombre: "Albahaca",
    propiedades: "Purificante, tonificante y antioxidante. Limpia los poros, unifica el tono y revitaliza pieles apagadas.",
    tiposPielIds: ["grasa-mixta", "seca"],
  },
  {
    id: "9",
    nombre: "Eucalipto Limón",
    propiedades: "Antiséptico, purificante y calmante. Ayuda a aliviar picaduras y protege la piel expuesta a agentes externos.",
    tiposPielIds: ["sensible"],
  },
  {
    id: "10",
    nombre: "Rosas (Damascena)",
    propiedades: "Hidratante, antiedad y regeneradora. Aporta elasticidad, suaviza líneas de expresión y calma pieles secas o maduras.",
    tiposPielIds: ["madura"],
  },
]

export const AROMAS: Aroma[] = [
  { id: "1", nombre: "Frambuesa" },
  { id: "2", nombre: "Chicle" },
  { id: "3", nombre: "Lemon Grass" },
  { id: "4", nombre: "Maracuyá" },
  { id: "5", nombre: "Manzana Canela" },
  { id: "6", nombre: "Frappuchino" },
  { id: "7", nombre: "Árbol de Té y Manzana" },
  { id: "8", nombre: "Ciprés Navideño" },
  { id: "9", nombre: "Navidad Dorada" },
  { id: "10", nombre: "Bambú Otoñal" },
  { id: "11", nombre: "Herbal" },
  { id: "12", nombre: "Brisa Marina" },
  { id: "13", nombre: "Frutas Exóticas" },
  { id: "14", nombre: "Campos de Lavanda" },
  { id: "15", nombre: "Rompope" },
  { id: "16", nombre: "Fantasía Naranja" },
  { id: "17", nombre: "Explosión Sandía" },
  { id: "18", nombre: "Bosque Navideño" },
]

export const TAMANOS: TamanoJabones[] = [
  { id: "1", gramos: 50, precio: 1000, etiqueta: "PEQUEÑO" },
  { id: "2", gramos: 75, precio: 1500, etiqueta: "MEDIANO" },
  { id: "3", gramos: 100, precio: 2000, etiqueta: "CLÁSICO" },
  { id: "4", gramos: 150, precio: 3000, etiqueta: "GRANDE" },
]

export function nombreProducto(tamanoGramos: number, aceiteNombre: string) {
  return `Jabón de ${aceiteNombre} (${tamanoGramos}g)`
}
