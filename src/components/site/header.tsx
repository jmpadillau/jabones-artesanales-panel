"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Menu, X, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

const navLinks = [
  { href: "#configurador", label: "Crear mi jabón" },
  { href: "#guia-botanica", label: "Guía botánica" },
  { href: "#aceites", label: "Aceites" },
  { href: "#aromas", label: "Aromas" },
  { href: "#pagos", label: "Pagos y envíos" },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#e5ded0] bg-[#f9f6f0]/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        
        {/* Logo de la marca */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative h-14 w-14 sm:h-16 sm:w-16 transition-transform duration-300 group-hover:scale-105">
            <Image
              src="/logo.png"
              alt="Logo By-Sil Jabones Artesanales"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#2d4a3e]">
              By-Sil
            </span>
            <span className="text-[10px] sm:text-xs font-semibold tracking-widest text-[#8c7a6b] uppercase">
              Jabones Artesanales
            </span>
          </div>
        </Link>

        {/* Navegación Desktop */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[#4a5d4e] hover:text-[#1e3329] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Botón WhatsApp Header */}
        <div className="hidden md:flex items-center gap-3">
          <Button
            asChild
            className="bg-[#2d4a3e] hover:bg-[#1e3329] text-white font-medium rounded-full px-5 py-2 text-sm shadow-sm transition-all"
          >
            <a
              href="https://wa.me/50688419135"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              <span>WhatsApp</span>
            </a>
          </Button>
        </div>

        {/* Botón Menú Móvil */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-[#2d4a3e] hover:bg-[#eae3d2] rounded-lg transition-colors"
          aria-label="Abrir menú"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Menú Desplegable Móvil */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#e5ded0] bg-[#f9f6f0] px-4 pt-3 pb-6 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-[#2d4a3e] hover:text-[#1e3329]"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2">
            <Button
              asChild
              className="w-full bg-[#2d4a3e] hover:bg-[#1e3329] text-white font-medium rounded-full py-2.5"
            >
              <a
                href="https://wa.me/50688419135"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Contactar por WhatsApp</span>
              </a>
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
