"use client";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeftRight, BookOpen, Trophy } from "lucide-react";

const FEATURES = [
  {
    icon: ArrowLeftRight,
    title: "Intercambiá figuritas",
    description: "Conectá con coleccionistas de todo el mundo.",
  },
  {
    icon: BookOpen,
    title: "Completá tu álbum",
    description: "Organizá tus figuritas y llevá tu colección al día.",
  },
  {
    icon: Trophy,
    title: "Viví la pasión del Mundial",
    description: "Participá en subastas, intercambios y mucho más.",
  },
];

export default function LoginPage() {
  const { loginWithRedirect, isLoading } = useAuth();

  return (
    <div className="min-h-screen !pb-0 bg-[#002B5E] flex flex-col justify-center items-center lg:flex-row">
      {/* Hero panel */}
      <div
        className={
          "mx-4 rounded-xl border border-[#1a4a7a] shadow-md shadow-black/15 bg-[#0a3568] px-6 py-6 " +
          "lg:m-0 lg:w-1/2 lg:min-h-screen lg:rounded-none lg:border-0 lg:shadow-none lg:bg-white " +
          "lg:flex lg:flex-col lg:justify-center lg:px-14 xl:lg:px-20 lg:py-12"
        }
      >
        <Image
          src="/images/figuswap-logo.png"
          alt="FiguSwap"
          width={140}
          height={140}
          className="mb-6 lg:mb-10 object-contain w-20 h-auto lg:w-[140px]"
          priority
        />

        <h2
          className={
            "text-3xl font-extrabold leading-tight tracking-tight " +
            "text-white lg:text-[#001d42] lg:text-5xl xl:text-6xl"
          }
        >
          ¡Comenzá tu{" "}
          <span className="text-[#BF0A30]">colección</span>!
        </h2>

        <p className="mt-2 lg:mt-4 text-white/60 lg:text-[#001d42]/60 text-sm lg:text-lg max-w-md">
          Unite a cientos de personas que comparten tu pasión por las figuritas
          del Mundial.
        </p>

        <div className="mt-6 lg:mt-10 space-y-4 lg:space-y-6">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex items-start gap-3 lg:gap-4">
              <div
                className={
                  "flex-shrink-0 w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center " +
                  "bg-white/10 lg:bg-[#001d42]/10"
                }
              >
                <Icon
                  size={16}
                  className="text-white lg:text-[#001d42] lg:!w-5 lg:!h-5"
                />
              </div>
              <div>
                <p className="font-bold text-sm lg:text-base text-white lg:text-[#001d42]">
                  {title}
                </p>
                <p className="text-xs lg:text-sm text-white/50 lg:text-[#001d42]/60">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Login card panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-6 lg:px-6 lg:py-12 lg:min-h-screen">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-extrabold text-[#001d42] tracking-tight">
                Iniciar Sesión
              </h2>
              <p className="text-[#001d42]/50 mt-2 text-sm">
                Ingresá a tu cuenta para ver tu colección.
              </p>
            </div>

            <Button
              onClick={() => loginWithRedirect()}
              disabled={isLoading}
              className="w-full h-11 bg-[#002B5E] hover:bg-[#001d42] text-white font-semibold rounded-lg"
            >
              {isLoading ? "Cargando..." : "Iniciar Sesión"}
            </Button>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-slate-400 text-xs">o</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <p className="text-center text-sm text-[#001d42]/50">
              ¿No tenés cuenta?{" "}
              <Link
                href="/register"
                className="font-semibold text-[#001d42] hover:underline"
              >
                Registrate
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
