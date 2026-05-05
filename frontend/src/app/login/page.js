"use client";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LoginPage() {
  const { loginWithRedirect, isLoading } = useAuth();

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-slate-200 shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Iniciar Sesión</h2>
            <p className="text-slate-500 mt-2 text-sm">Ingresá a tu cuenta para ver tu colección.</p>
          </div>

          <Button
            onClick={() => loginWithRedirect()}
            disabled={isLoading}
            className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-semibold"
          >
            {isLoading ? "Cargando..." : "Iniciar Sesión"}
          </Button>

          <p className="text-center text-sm text-slate-500 mt-6">
            ¿No tenés cuenta?{" "}
            <Link href="/register" className="font-semibold text-slate-800 hover:underline">
              Registrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
