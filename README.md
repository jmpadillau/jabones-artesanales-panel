# 🌿 By-Sil · Jabones Artesanales — Tienda en línea + Panel de administración

Sitio web completo para **By-Sil · Jabones Artesanales** (Costa Rica), donde
cada cliente puede crear su jabón a la medida: elige su **tipo de piel**, el
**aceite esencial**, el **aroma**, el **tamaño** y la **cantidad**, y envía su
pedido directo por **WhatsApp**. Además incluye un **panel privado de
administración** para gestionar pedidos, ingresos, costos, ganancias y los
**ajustes del sitio** (contraseña y número de WhatsApp).

- 🎨 **Identidad gráfica botánica de la web**: verde bosque `#2E5A44`, crema
  `#FBF7EF`, salvia `#4A7A61` y arena `#F1EBDD`, con las tipografías
  Cormorant Garamond y Work Sans, y el logo oficial de By-Sil (colibrí y flor
  de cala).
- 🗂️ **Catálogo sincronizado con el panel By-Sil** (proyecto «panel bySil» y
  su Excel *Control Jabones Artesanales*, actualizado): 4 tipos de piel, 10
  aceites esenciales con sus propiedades oficiales, 18 aromas y 4 tamaños con
  precios.
- 🐦 **Cursor colibrí**: el puntero de la tienda es el colibrí del logo oficial
  (con chispa dorada sobre botones y enlaces). El panel de administración
  mantiene el cursor normal.
- 📱 **Número de WhatsApp configurable desde el panel** y leído por la web en
  cada visita: se cambia en *Panel → Ajustes* y todos los botones de la tienda
  se actualizan al instante.

---

## ✨ Qué incluye

| Sección | Descripción |
| --- | --- |
| **Hero** | Marca By-Sil con sellos: 100% artesanal, hecho en Costa Rica |
| **Configurador** | 4 pasos por jabón: tipo de piel → aceite esencial → aroma (+ «Sorpréndeme») → tamaño y cantidad, con filtrado automático | 
| **Pedido de varios jabones** | Botón «Agregar al pedido»: combina cuantos jabones quieras (distintos aceites, aromas y tamaños) en UN solo pedido y envíalo todo junto | 
| **Resumen del pedido** | Lista de jabones agregados (editable: cantidad y quitar), total en colones (₡) al instante, datos de envío y método de pago | 
| **Envío por WhatsApp** | Abre WhatsApp con el pedido precargado (ID incluido) y botón para copiar el resumen |
| **Registro automático** | Al enviar el pedido queda guardado y aparece en el panel como «Pendiente» |
| **Guía botánica** | Las 4 familias de piel del catálogo oficial con sus aceites y aromas |
| **Aceites esenciales** | Los 10 aceites con las propiedades oficiales de By-Sil |
| **Esencias y aromas** | Los 18 aromas del catálogo oficial |
| **Pagos y envíos** | Sinpe Móvil, efectivo y tarjeta |

### Catálogo (fuente: panel By-Sil)

**Tipos de piel** → aceites compatibles:
- **Seca o con Pérdida de Hidratación** → Jengibre, Albahaca
- **Grasa, Mixta o con Tendencia al Acné** → Zacate de Limón, Árbol de Té,
  Salvia, Menta Piperita, Albahaca
- **Madura o con Pérdida de Firmeza** → Jengibre, Salvia, Rosas (Damascena)
- **Sensible, Irritada o con Afecciones Cutáneas** → Manzanilla, Lavanda,
  Eucalipto Limón

**Aromas (18, disponibles para cualquier tipo de piel)**: Frambuesa, Chicle,
Lemon Grass, Maracuyá, Manzana Canela, Frappuchino, Árbol de Té y Manzana,
Ciprés Navideño, Navidad Dorada, Bambú Otoñal, Herbal, Brisa Marina, Frutas
Exóticas, Campos de Lavanda, Rompope, Fantasía Naranja, Explosión Sandía y
Bosque Navideño.

**Tamaños y precios**: 50 g ₡1.000 · 75 g ₡1.500 · 100 g ₡2.000 · 150 g ₡3.000.

## 🔐 Panel de administración (`/admin`)

Accede con el enlace del pie de página o directamente en `/admin`.

> ### 🔑 Credenciales iniciales
> - **Usuario:** `admin`
> - **Contraseña:** `BySil8841`
>
> Son las mismas credenciales del panel By-Sil original. La pantalla de
> login las muestra mientras el sitio siga usando la contraseña inicial.
> **Cámbialas en Panel → Ajustes → Cambiar contraseña** al primer ingreso.
>
> **¿No puedes entrar?** Revisa esta lista:
> 1. La contraseña inicial lleva **«Sil» con L minúscula** (`BySil8841`), no
>    el número 1 — al leerla es fácil confundir `l` con `1`. Usa el botón
>    **«Copiar»** del recuadro naranja del login y pégala en el campo
>    Contraseña: evita cualquier error de tipeo.
> 2. Escribe usuario y contraseña **exactos**, sin espacios antes ni después
>    (distingue mayúsculas de minúsculas).
> 3. Si ya cambiaste la contraseña desde Ajustes, usa la nueva; si la
>    olvidaste, mira «Olvidé la contraseña» más abajo.
> 4. Si entraste y el panel te devuelve al login, borra las cookies del
>    sitio y vuelve a intentar (o prueba en ventana incógnito).
> 5. **¿Ves un error rojo «Runtime TypeError … cannot have a negative time
>    stamp»?** Es un aviso conocido del modo desarrollo de Next.js (la venta
>    con el borde rosa): NO afecta a la tienda ni a las credenciales, solo
>    ciérralo con la **X** y continúa. Este proyecto ya incluye Next.js
>    16.4.x, donde el aviso fue corregido. En modo producción
>    (`bun run build && bun start`) ese aviso no existe.
>
> **Olvidé la contraseña:** el hash vive en la tabla `admin_users` de la
> base de datos. Para resembrar la inicial: borra la fila de esa tabla
> (p. ej. `DELETE FROM admin_users;` en SQLite/Postgres) y recarga el
> login — la cuenta se crea de nuevo con la contraseña inicial.

- **Inicio de sesión** con la cuenta guardada en la base de datos
  (tabla `AdminUser`, hash scrypt). La primera vez se crea automáticamente con
  usuario `admin` y contraseña inicial **`BySil8841`** (la misma del panel
  By-Sil; se puede cambiar). El login avisa mientras sigas usando la
  contraseña inicial e incluye un **botón «Copiar»** para pegarla sin
  errores. Si defines `ADMIN_PASSWORD` en el entorno, ese valor
  se usa como contraseña inicial en lugar del predeterminado.
- **Resumen**: ingresos, unidades vendidas, ganancia estimada y pedidos por
  atender, con evolución de los últimos 6 meses y favoritos.
- **Pedidos**: estados `Pendiente → Realizado → Entregado` (y `Cancelado`).
  Cada cambio guarda su **marca de fecha y hora**. Los pedidos con varios
  jabones aparecen como una sola tarjeta con sus líneas (variedades) y el
  total del pedido. Incluye notas internas, buscador, filtros, contacto
  directo por WhatsApp con el cliente y **exportación a CSV** para Excel
  (una fila por línea del pedido).
- **Costos**: registro de **materias primas** con costo unitario calculado, y
  **costo de producir cada tamaño** (precargado: 50 g ₡400 · 75 g ₡600 ·
  100 g ₡800 · 150 g ₡1.200).
- **Ganancias**: ingresos − costos de producción, con margen, desglose por
  tamaño, favoritos del periodo y gráfico de los últimos 6 meses.
- **Ajustes** ⭐ nuevo:
  - **Cambiar contraseña** de la administradora (verifica la actual, mínimo
    8 caracteres) — botón «Actualizar contraseña».
  - **Actualizar el número de WhatsApp de la tienda** — botón «Guardar número
    de WhatsApp». El número se guarda en la base de datos (tabla `Ajuste`) y
    la web pública lo usa al instante en encabezado, configurador y pie de
    página.

## 📂 Estructura del proyecto

```
├── src/
│   ├── app/
│   │   ├── page.tsx               # Tienda (lee el WhatsApp vigente de la BD)
│   │   ├── admin/                 # 🔐 Panel de la administradora
│   │   │   ├── login/
│   │   │   ├── (panel)/           # Resumen · Pedidos · Costos · Ganancias · Ajustes
│   │   └── api/
│   │       ├── pedidos/           # POST público: registra el pedido
│   │       ├── ajustes/           # GET público / PUT admin: número de WhatsApp
│   │       └── admin/             # login · logout · password · costos · materias · pedidos
│   ├── components/site/           # Secciones de la tienda
│   ├── components/admin/          # Módulos del panel (incluye ajustes-panel)
│   ├── lib/jabones.ts             # ⭐ Catálogo, precios y textos de marca (EDITAR AQUÍ)
│   ├── lib/ajustes.ts             # ⭐ Cuenta admin (scrypt) + WhatsApp (tabla Ajuste)
│   ├── lib/estadisticas.ts        # Estados, ingresos, costos y ganancias
│   └── lib/auth.ts                # Sesión firmada del panel
├── prisma/
│   ├── schema.prisma              # Base de datos local (SQLite)
│   └── schema.postgres.prisma     # Base de datos de producción (PostgreSQL)
├── public/
│   ├── logo.png · logo-256.png    # Logo oficial de By-Sil
│   ├── favicon-32.png · icon-64.png · apple-touch-icon.png
│   └── images/                    # Imágenes botánicas del sitio
└── .env.example                   # Variables de entorno de ejemplo
```

## 🛠️ Desarrollo local

Necesitas [Node.js](https://nodejs.org) o [Bun](https://bun.sh) instalado.

```bash
# 1. Instalar dependencias
bun install        # o: npm install

# 2. Configurar variables de entorno
cp .env.example .env   # y edita los valores si quieres

# 3. Crear la base de datos local
bun run db:push

# 4. Iniciar el servidor de desarrollo
bun run dev        # o: npm run dev

# 5. Abrir http://localhost:3000  ·  Panel: http://localhost:3000/admin
#    Cuenta inicial: admin / BySil8841 → cámbiala en Panel → Ajustes
```

## 🚀 Desplegar en Vercel (paso a paso)

El sitio vive en **GitHub** y se despliega desde **Vercel**, así el panel de
administración y el registro automático de pedidos funcionan con base de
datos real.

### 1. Sube el proyecto a GitHub

```bash
git init
git add .
git commit -m "By-Sil: tienda + panel con ajustes"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/by-sil-jabones.git
git push -u origin main
```

> El `.gitignore` ya excluye `.env`, la base de datos local y los datos
> privados del negocio; nunca se suben a GitHub.

### 2. Importa el repo en Vercel

Entra a [vercel.com](https://vercel.com) → **Add New… → Project** →
selecciona el repositorio → **Import**. Vercel detecta Next.js solo; no
cambies nada en la configuración de build.

### 3. Crea la base de datos (una sola vez)

Antes del primer despliegue: dentro del proyecto en Vercel, pestaña
**Storage** → **Create Database** → elige **Neon Postgres** (plan gratuito) →
**Connect**. Vercel agrega automáticamente la variable `DATABASE_URL`.

### 4. Define las variables del panel

Pestaña **Settings → Environment Variables** (aplicando a *Production*):

| Variable | ¿Obligatoria? | Valor |
| --- | --- | --- |
| `ADMIN_USER` | No (por defecto `admin`) | El usuario de la administradora |
| `ADMIN_PASSWORD` | No | Contraseña **inicial** si no quieres usar `BySil8841` |
| `AUTH_SECRET` | Recomendada | Un secreto largo y aleatorio (`openssl rand -hex 32`) |

> La contraseña definitiva se cambia desde **Panel → Ajustes** y queda
> guardada en la base de datos; las variables solo siembran la cuenta la
> primera vez.

### 5. ¡Despliega!

Presiona **Deploy** (o simplemente haz `git push` a `main`). El build aplica
el esquema a la base de datos y publica la tienda. Tu sitio quedará en
`https://TU-PROYECTO.vercel.app` y el panel en
`https://TU-PROYECTO.vercel.app/admin`.

## 📱 Número de WhatsApp de la tienda

Ya viene configurado con el número real de By-Sil: **`50688419135`**
(+506 8841-9135). Para cambiarlo **no hace falta tocar el código**:

1. Entra al panel (`/admin`) → **Ajustes**.
2. Escribe el nuevo número con código de país y solo dígitos
   (ej. `50688881234`).
3. Pulsa **«Guardar número de WhatsApp»**.

Los botones de WhatsApp del encabezado, del configurador y del pie de página
usan el número vigente **en cada visita** (se lee de la base de datos).
El valor de respaldo vive en `src/lib/jabones.ts` (`WHATSAPP_TIENDA`).

## ✏️ Editar catálogo, precios o aromas

Todo vive en **`src/lib/jabones.ts`** (sincronizado hoy con el panel By-Sil):

- `TAMANOS` — tamaños y precios en colones.
- `TIPOS_PIEL` — mapa botánico: aceites y aromas recomendados por tipo de piel.
- `ACEITES` — propiedades oficiales de cada aceite esencial.
- `AROMAS` — catálogo de fragancias y su descripción.

Los cambios se reflejan solos en los filtros del configurador, en los precios,
en el mensaje de WhatsApp y en el registro de pedidos del panel.

## 🔒 Seguridad del panel

- La cuenta de la administradora se guarda con **scrypt + salt** (mismo
  formato que el panel By-Sil) en la tabla `AdminUser`.
- La sesión se guarda en una cookie **HttpOnly firmada** (vence en 12 h).
- El login tiene límite de intentos y las rutas del panel y las API
  administrativas rechazan cualquier petición sin sesión válida.
- El cambio de contraseña verifica la contraseña actual antes de actualizar.
- Los pedidos del público solo pueden crearse (nunca editarse) desde la
  tienda; los estados y notas los cambia únicamente la administradora.
- Nunca subas `.env` ni credenciales al repo: ya están en `.gitignore`.

## 🤝 Cómo conviven la tienda y el panel

El cliente configura y envía su pedido → WhatsApp llega a la administradora y
**al mismo tiempo el pedido queda registrado en el panel como
«Pendiente»**. Ella lo marca *Realizado* mientras prepara y *Entregado* al
concluir; en ese momento la venta pasa a contar para **ingresos, unidades
vendidas y ganancias**. Los costos se administran en la sección *Costos* y la
cuenta y el WhatsApp en *Ajustes*.

## 🧰 Tecnologías

[Next.js 16](https://nextjs.org) (App Router) ·
[TypeScript](https://www.typescriptlang.org) ·
[Tailwind CSS 4](https://tailwindcss.com) ·
[shadcn/ui](https://ui.shadcn.com) ·
[Prisma](https://www.prisma.io) (SQLite local / PostgreSQL en Vercel) ·
Fuentes: Cormorant Garamond + Work Sans (Google Fonts)
