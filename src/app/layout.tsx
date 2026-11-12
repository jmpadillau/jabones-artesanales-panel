import type { Metadata } from "next";
import { Cormorant_Garamond, Work_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const titulos = Cormorant_Garamond({
  variable: "--font-titulos",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});

const cuerpo = Work_Sans({
  variable: "--font-cuerpo",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "By-Sil · Jabones Artesanales | Crea tu jabón a tu medida",
  description:
    "Jabones artesanales By-Sil hechos a mano en Costa Rica. Elige tu tipo de piel, el aceite esencial, el aroma y el tamaño ideal. Pedidos por WhatsApp con pagos por Sinpe Móvil, efectivo o tarjeta.",
  keywords: [
    "By-Sil",
    "jabones artesanales",
    "Costa Rica",
    "aceites esenciales",
    "jabón natural",
    "aromas",
    "cuidado de la piel",
    "Sinpe Móvil",
  ],
  icons: {
    icon: [
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-64.png", type: "image/png", sizes: "64x64" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "By-Sil · Jabones Artesanales",
    description:
      "Elige tu tipo de piel, aceite esencial, aroma y tamaño. Hecho a mano con ingredientes naturales en Costa Rica.",
    type: "website",
    locale: "es_CR",
    images: [{ url: "/images/hero-jabones.png", width: 1344, height: 768 }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${titulos.variable} ${cuerpo.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
