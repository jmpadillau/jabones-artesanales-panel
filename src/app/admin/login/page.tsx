import type { Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "@/components/admin/login-form";
import { MARCA_LARGA } from "@/lib/jabones";
import { usaContraseñaPorDefecto } from "@/lib/ajustes";

export const metadata: Metadata = {
  title: "Panel de administración · By-Sil",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className="fondo-botanico flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Image
            src="/logo.png"
            alt="Logo de By-Sil: colibrí y flor de cala"
            width={144}
            height={144}
            priority
            className="mx-auto mb-4 h-24 w-24 rounded-full border-4 border-card bg-card object-cover shadow-md"
          />
          <h1 className="font-display text-3xl font-semibold text-primary">
            {MARCA_LARGA}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Panel privado de la administradora
          </p>
        </div>
        <LoginForm contraseñaPorDefecto={usaContraseñaPorDefecto()} />
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Área exclusiva del personal. Si no eres la administradora,{" "}
          <a href="/" className="underline underline-offset-2 hover:text-foreground">
            vuelve a la tienda
          </a>
          .
        </p>
      </div>
    </main>
  );
}
