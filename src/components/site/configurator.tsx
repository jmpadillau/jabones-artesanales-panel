"use client"

import { useState } from "react"
import { Sparkles, ShoppingBag, Trash2, Check, Send, Copy, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { TIPOS_PIEL, AROMAS, TAMANOS, ACEITES } from "@/lib/jabones"

interface ItemPedido {
  id: string
  tipoPielId: string
  tipoPielNombre: string
  aceiteId: string
  aceiteNombre: string
  aromaId: string
  aromaNombre: string
  tamanoId: string
  tamanoGramos: number
  precioUnitario: number
  cantidad: number
}

export function Configurator() {
  const { toast } = useToast()

  // Selección en progreso
  const [selectedPiel, setSelectedPiel] = useState<string>("grasa-mixta")
  const [selectedAceite, setSelectedAceite] = useState<string>("1") // Zacate de Limón por defecto
  const [selectedAroma, setSelectedAroma] = useState<string>("3") // Lemon Grass por defecto
  const [selectedTamano, setSelectedTamano] = useState<string>("3") // 100g por defecto
  const [cantidad, setCantidad] = useState<number>(1)

  // Lista de ítems agregados al pedido
  const [items, setItems] = useState<ItemPedido[]>([])

  // Datos del cliente
  const [nombre, setNombre] = useState("")
  const [telefono, setTelefono] = useState("")
  const [correo, setCorreo] = useState("")
  const [direccion, setDireccion] = useState("")
  const [metodoPago, setMetodoPago] = useState("Sinpe Móvil")
  const [isSending, setIsSending] = useState(false)

  // Aceites filtrados según tipo de piel seleccionado
  const aceitesCompatibles = ACEITES.filter((a) => a.tiposPielIds.includes(selectedPiel))

  // Manejar cambio de tipo de piel (resetea aceite si el actual no es compatible)
  const handlePielChange = (pielId: string) => {
    setSelectedPiel(pielId)
    const nuevosCompatibles = ACEITES.filter((a) => a.tiposPielIds.includes(pielId))
    if (nuevosCompatibles.length > 0 && !nuevosCompatibles.some((a) => a.id === selectedAceite)) {
      setSelectedAceite(nuevosCompatibles[0].id)
    }
  }

  // Agregar jabón al pedido
  const handleAgregarAlPedido = () => {
    const pielObj = TIPOS_PIEL.find((p) => p.id === selectedPiel)
    const aceiteObj = ACEITES.find((a) => a.id === selectedAceite)
    const aromaObj = AROMAS.find((a) => a.id === selectedAroma)
    const tamanoObj = TAMANOS.find((t) => t.id === selectedTamano)

    if (!pielObj || !aceiteObj || !aromaObj || !tamanoObj) return

    const nuevoItem: ItemPedido = {
      id: Date.now().toString(),
      tipoPielId: pielObj.id,
      tipoPielNombre: pielObj.nombre,
      aceiteId: aceiteObj.id,
      aceiteNombre: aceiteObj.nombre,
      aromaId: aromaObj.id,
      aromaNombre: aromaObj.nombre,
      tamanoId: tamanoObj.id,
      tamanoGramos: tamanoObj.gramos,
      precioUnitario: tamanoObj.precio,
      cantidad: cantidad,
    }

    setItems([...items, nuevoItem])
    toast({
      title: "¡Jabón agregado!",
      description: `${nuevoItem.aceiteNombre} (${nuevoItem.tamanoGramos}g) se añadió a tu pedido.`,
    })
  }

  const handleEliminarItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const handleCambiarCantidadItem = (id: string, delta: number) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const nuevaCant = Math.max(1, item.cantidad + delta)
          return { ...item, cantidad: nuevaCant }
        }
        return item
      })
    )
  }

  const totalPedido = items.reduce((sum, item) => sum + item.precioUnitario * item.cantidad, 0)
  const totalJabones = items.reduce((sum, item) => sum + item.cantidad, 0)

  // Generación de texto para el mensaje de WhatsApp
  const generarTextoPedido = () => {
    const fecha = new Date().toLocaleDateString("es-CR")
    const idPedido = `PED-${Date.now().toString().slice(-6)}`

    let texto = `🍃 *NUEVO PEDIDO – By-Sil · Jabones Artesanales* 🍃\n`
    texto += `🧾 Pedido: *${idPedido}* · ${fecha}\n`
    texto += `------------------------------------\n\n`

    items.forEach((item, index) => {
      texto += `🧼 *Producto ${index + 1}: Jabón de ${item.aceiteNombre} (${item.tamanoGramos} g)*\n`
      texto += `✨ *Tipo de piel:* ${item.tipoPielNombre}\n`
      texto += `🌿 *Aceite esencial:* ${item.aceiteNombre}\n`
      texto += `🌸 *Aroma:* ${item.aromaNombre}\n`
      texto += `⚖️ *Tamaño:* ${item.tamanoGramos} g\n`
      texto += `🔢 *Cantidad:* ${item.cantidad}\n`
      texto += `💰 *Total:* ₡${(item.precioUnitario * item.cantidad).toLocaleString("es-CR")}\n\n`
    })

    texto += `------------------------------------\n`
    texto += `👤 *Cliente:* ${nombre || "No especificado"}\n`
    texto += `📱 *Teléfono:* ${telefono || "No especificado"}\n`
    if (correo) texto += `📧 *Email:* ${correo}\n`
    texto += `📍 *Dirección de envío:* ${direccion || "Por coordinar"}\n`
    texto += `💳 *Método de pago:* ${metodoPago}\n`
    texto += `------------------------------------\n`
    texto += `💵 *TOTAL FINAL:* *₡${totalPedido.toLocaleString("es-CR")}* (${totalJabones} jabón${totalJabones > 1 ? "es" : ""})\n`

    return { texto, idPedido }
  }

  const handleEnviarPedidoWhatsApp = async () => {
    if (items.length === 0) {
      toast({
        title: "Tu pedido está vacío",
        description: "Agrega al menos un jabón personalizado antes de enviar.",
        variant: "destructive",
      })
      return
    }

    if (!nombre.trim() || !telefono.trim() || !direccion.trim()) {
      toast({
        title: "Completa los datos de envío",
        description: "Nombre, teléfono y dirección son requeridos.",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)
    const { texto, idPedido } = generarTextoPedido()

    // 1. Enviar correo de confirmación al cliente vía API si ingresó email
    if (correo) {
      try {
        await fetch("/api/pedidos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idPedido,
            nombre,
            telefono,
            correo,
            direccion,
            metodoPago,
            items,
            totalPedido,
          }),
        })
      } catch (error) {
        console.error("Error al enviar copia de correo:", error)
      }
    }

    // 2. Abrir WhatsApp con el pedido precargado
    const numeroWA = "50688419135"
    const url = `https://wa.me/${numeroWA}?text=${encodeURIComponent(texto)}`
    window.open(url, "_blank")
    setIsSending(false)

    toast({
      title: "¡Pedido procesado!",
      description: correo ? "Te enviamos una copia a tu correo electrónico." : "Se ha abierto WhatsApp con tu pedido.",
    })
  }

  const handleCopiarResumen = () => {
    if (items.length === 0) return
    const { texto } = generarTextoPedido()
    navigator.clipboard.writeText(texto)
    toast({
      title: "Resumen copiado",
      description: "Copiado al portapapeles con éxito.",
    })
  }

  const handleReiniciar = () => {
    setItems([])
    setNombre("")
    setTelefono("")
    setCorreo("")
    setDireccion("")
    toast({ description: "Se ha reiniciado el configurador." })
  }

  return (
    <section id="configurador" className="py-12 bg-[#fdfbf7]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado del Configurador */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#eae3d2] text-[#2d4a3e] text-xs font-semibold tracking-wider uppercase mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Configurador</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2d4a3e] mb-4">
            Crea tus jabones a tu medida
          </h2>
          <p className="text-base sm:text-lg text-[#5a6b5c] leading-relaxed">
            Cuatro pasos sencillos por cada jabón: elige tu tipo de piel, descubre los aceites compatibles, selecciona el aroma de tu preferencia, el tamaño y agrégalos a tu pedido. Combina cuantos jabones quieras y envíanos tu pedido.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* PASOS DEL CONFIGURADOR (Izquierda) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* PASO 1: Tipo de piel */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e5ded0]">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2d4a3e] text-white font-serif font-bold text-sm">
                  1
                </span>
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#2d4a3e]">
                    ¿Cuál es tu tipo de piel?
                  </h3>
                  <p className="text-xs text-[#6b7c6d]">
                    Define qué aceites y propiedades te convienen.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TIPOS_PIEL.map((piel) => {
                  const isSelected = selectedPiel === piel.id
                  return (
                    <button
                      key={piel.id}
                      type="button"
                      onClick={() => handlePielChange(piel.id)}
                      className={`text-left p-4 rounded-xl border transition-all ${
                        isSelected
                          ? "border-[#2d4a3e] bg-[#f4f1ea] shadow-sm"
                          : "border-[#e5ded0] bg-white hover:border-[#b8a898]"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: piel.colorHex }}
                        />
                        <span className="font-semibold text-sm text-[#2d4a3e]">
                          {piel.nombre}
                        </span>
                      </div>
                      <p className="text-xs text-[#6b7c6d] leading-relaxed">
                        {piel.descripcion}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* PASO 2: Aceite esencial */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e5ded0]">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2d4a3e] text-white font-serif font-bold text-sm">
                  2
                </span>
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#2d4a3e]">
                    Selecciona tu aceite esencial
                  </h3>
                  <p className="text-xs text-[#6b7c6d]">
                    Aceites beneficiosos recomendados para tu tipo de piel.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {aceitesCompatibles.map((aceite) => {
                  const isSelected = selectedAceite === aceite.id
                  return (
                    <button
                      key={aceite.id}
                      type="button"
                      onClick={() => setSelectedAceite(aceite.id)}
                      className={`text-left p-4 rounded-xl border transition-all ${
                        isSelected
                          ? "border-[#2d4a3e] bg-[#f4f1ea] shadow-sm"
                          : "border-[#e5ded0] bg-white hover:border-[#b8a898]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm text-[#2d4a3e]">
                          {aceite.nombre}
                        </span>
                        {isSelected && <Check className="h-4 w-4 text-[#2d4a3e]" />}
                      </div>
                      <p className="text-xs text-[#6b7c6d] line-clamp-2">
                        {aceite.propiedades}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* PASO 3: Aroma (18 aromas independientes) */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e5ded0]">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2d4a3e] text-white font-serif font-bold text-sm">
                  3
                </span>
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#2d4a3e]">
                    Escoge tu aroma favorito
                  </h3>
                  <p className="text-xs text-[#6b7c6d]">
                    Cualquiera de nuestras fragancias de catálogo.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {AROMAS.map((aroma) => {
                  const isSelected = selectedAroma === aroma.id
                  return (
                    <button
                      key={aroma.id}
                      type="button"
                      onClick={() => setSelectedAroma(aroma.id)}
                      className={`px-3.5 py-2 rounded-full text-xs font-medium border transition-all ${
                        isSelected
                          ? "bg-[#2d4a3e] text-white border-[#2d4a3e] shadow-xs"
                          : "bg-[#fdfbf7] text-[#4a5d4e] border-[#e5ded0] hover:border-[#2d4a3e]"
                      }`}
                    >
                      🌸 {aroma.nombre}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* PASO 4: Tamaño y cantidad */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e5ded0]">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2d4a3e] text-white font-serif font-bold text-sm">
                  4
                </span>
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#2d4a3e]">
                    Tamaño y cantidad
                  </h3>
                  <p className="text-xs text-[#6b7c6d]">
                    Precios según el peso del jabón.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {TAMANOS.map((tamano) => {
                  const isSelected = selectedTamano === tamano.id
                  return (
                    <button
                      key={tamano.id}
                      type="button"
                      onClick={() => setSelectedTamano(tamano.id)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        isSelected
                          ? "border-[#2d4a3e] bg-[#f4f1ea] shadow-sm"
                          : "border-[#e5ded0] bg-white hover:border-[#b8a898]"
                      }`}
                    >
                      <span className="block font-serif text-lg font-bold text-[#2d4a3e]">
                        {tamano.gramos} g
                      </span>
                      <span className="block text-[10px] font-semibold tracking-wider text-[#8c7a6b] uppercase mb-1">
                        {tamano.etiqueta}
                      </span>
                      <span className="block font-bold text-sm text-[#2d4a3e]">
                        ₡{tamano.precio.toLocaleString("es-CR")}
                      </span>
                    </button>
                  )
                })}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#f0eae0]">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-[#2d4a3e]">Cantidad:</span>
                  <div className="flex items-center rounded-lg border border-[#e5ded0] bg-[#fdfbf7]">
                    <button
                      type="button"
                      onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                      className="px-3 py-1.5 text-sm font-bold text-[#2d4a3e] hover:bg-[#eae3d2]"
                    >
                      -
                    </button>
                    <span className="px-3 text-sm font-bold text-[#2d4a3e]">{cantidad}</span>
                    <button
                      type="button"
                      onClick={() => setCantidad(cantidad + 1)}
                      className="px-3 py-1.5 text-sm font-bold text-[#2d4a3e] hover:bg-[#eae3d2]"
                    >
                      +
                    </button>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleAgregarAlPedido}
                  className="bg-[#2d4a3e] hover:bg-[#1e3329] text-white rounded-full px-6 py-2.5 font-medium shadow-sm"
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Agregar al pedido
                </Button>
              </div>
            </div>

          </div>

          {/* RESUMEN DE PEDIDO Y DATOS DE ENVÍO (Derecha) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            
            <div className="bg-white rounded-2xl p-6 shadow-md border border-[#e5ded0]">
              <h3 className="font-serif text-2xl font-bold text-[#2d4a3e] mb-1">
                Mi Pedido
              </h3>
              <p className="text-xs text-[#6b7c6d] mb-4">
                {items.length === 0
                  ? "Aún no has agregado jabones."
                  : `${totalJabones} jabón${totalJabones > 1 ? "es" : ""} seleccionado${totalJabones > 1 ? "s" : ""}.`}
              </p>

              {/* Lista de jabones agregados */}
              {items.length > 0 ? (
                <div className="space-y-3 mb-6 max-h-72 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#fdfbf7] border border-[#e5ded0]"
                    >
                      <div className="space-y-0.5">
                        <span className="font-semibold text-sm text-[#2d4a3e] block">
                          Jabón de {item.aceiteNombre} ({item.tamanoGramos}g)
                        </span>
                        <span className="text-xs text-[#6b7c6d] block">
                          Aroma: {item.aromaNombre}
                        </span>
                        <span className="text-xs font-bold text-[#2d4a3e] block">
                          ₡{(item.precioUnitario * item.cantidad).toLocaleString("es-CR")}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center rounded-md border border-[#e5ded0] bg-white">
                          <button
                            type="button"
                            onClick={() => handleCambiarCantidadItem(item.id, -1)}
                            className="px-2 py-0.5 text-xs font-bold text-[#2d4a3e]"
                          >
                            -
                          </button>
                          <span className="px-1.5 text-xs font-bold">{item.cantidad}</span>
                          <button
                            type="button"
                            onClick={() => handleCambiarCantidadItem(item.id, 1)}
                            className="px-2 py-0.5 text-xs font-bold text-[#2d4a3e]"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleEliminarItem(item.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="pt-3 border-t border-[#e5ded0] flex items-center justify-between">
                    <span className="font-serif text-lg font-bold text-[#2d4a3e]">TOTAL</span>
                    <span className="font-serif text-xl font-bold text-[#2d4a3e]">
                      ₡{totalPedido.toLocaleString("es-CR")}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center border-2 border-dashed border-[#e5ded0] rounded-xl mb-6">
                  <p className="text-sm text-[#8c7a6b]">
                    Configura tu primer jabón a la izquierda y presiona "Agregar al pedido".
                  </p>
                </div>
              )}

              {/* Formulario Datos de Envío */}
              <div className="space-y-4 pt-4 border-t border-[#e5ded0]">
                <h4 className="font-serif text-lg font-bold text-[#2d4a3e]">
                  Tus datos de envío
                </h4>

                <div>
                  <Label htmlFor="nombre" className="text-xs font-semibold text-[#2d4a3e]">
                    Nombre completo *
                  </Label>
                  <Input
                    id="nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. María Rodríguez"
                    className="mt-1 bg-[#fdfbf7] border-[#e5ded0]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="telefono" className="text-xs font-semibold text-[#2d4a3e]">
                      Teléfono / WhatsApp *
                    </Label>
                    <Input
                      id="telefono"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="8888-8888"
                      className="mt-1 bg-[#fdfbf7] border-[#e5ded0]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="correo" className="text-xs font-semibold text-[#2d4a3e]">
                      Correo (opcional)
                    </Label>
                    <Input
                      id="correo"
                      type="email"
                      value={correo}
                      onChange={(e) => setCorreo(e.target.value)}
                      placeholder="tucorreo@ejemplo.com"
                      className="mt-1 bg-[#fdfbf7] border-[#e5ded0]"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="direccion" className="text-xs font-semibold text-[#2d4a3e]">
                    Dirección exacta de envío *
                  </Label>
                  <Textarea
                    id="direccion"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    placeholder="Provincia, cantón, distrito, señas exactas"
                    className="mt-1 bg-[#fdfbf7] border-[#e5ded0] h-20 text-xs"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-[#2d4a3e] mb-2 block">
                    Método de pago *
                  </Label>
                  <RadioGroup
                    value={metodoPago}
                    onValueChange={setMetodoPago}
                    className="grid grid-cols-3 gap-2"
                  >
                    {["Sinpe Móvil", "Efectivo", "Tarjeta"].map((metodo) => (
                      <div key={metodo} className="flex items-center space-x-2 border border-[#e5ded0] p-2 rounded-lg bg-[#fdfbf7]">
                        <RadioGroupItem value={metodo} id={metodo} />
                        <Label htmlFor={metodo} className="text-xs cursor-pointer text-[#2d4a3e]">
                          {metodo}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Acciones de envío */}
                <div className="space-y-2 pt-2">
                  <Button
                    type="button"
                    disabled={isSending}
                    onClick={handleEnviarPedidoWhatsApp}
                    className="w-full bg-[#2d4a3e] hover:bg-[#1e3329] text-white font-medium py-3 rounded-full shadow-sm text-sm"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Enviar pedido por WhatsApp
                  </Button>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCopiarResumen}
                      className="flex-1 border-[#e5ded0] text-[#2d4a3e] hover:bg-[#f4f1ea] rounded-full text-xs"
                    >
                      <Copy className="h-3.5 w-3.5 mr-1" />
                      Copiar resumen
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleReiniciar}
                      className="text-[#8c7a6b] hover:bg-[#f4f1ea] rounded-full text-xs"
                    >
                      <RotateCcw className="h-3.5 w-3.5 mr-1" />
                      Reiniciar
                    </Button>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  )
}
