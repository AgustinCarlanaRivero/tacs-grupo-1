"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Gavel, User } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Mi Colección", icon: LayoutGrid },
  { href: "/auctions", label: "Subastas", icon: Gavel },
  { href: "/profile", label: "Perfil", icon: User },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop top bar */}
      <header className="bg-[#002B5E] sticky top-0 z-10">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-1 h-6 bg-[#BF0A30] rounded-full"></div>
            <h1 className="text-lg font-extrabold tracking-tight text-white">Mundial 2026</h1>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {NAV_LINKS.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-4 py-1.5 text-sm font-medium transition-colors rounded-sm ${isActive ? 'bg-white/15 text-white' : 'text-blue-200/70 hover:text-white'}`}
                >
                  {label}
                </Link>
              );
            })}

            <Link href="/login" className="ml-3">
              <Button size="sm" className="text-sm font-semibold bg-[#BF0A30] hover:bg-[#a00828] text-white border-none">
                Iniciar Sesión
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Mobile bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200">
        <div className="flex items-center justify-around h-14">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex flex-col items-center justify-center gap-0.5 w-full h-full transition-colors ${isActive ? 'text-[#002B5E]' : 'text-slate-400'}`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                <span className={`text-[9px] font-semibold uppercase tracking-wider ${isActive ? 'text-[#002B5E]' : 'text-slate-400'}`}>
                  {label}
                </span>
                {isActive && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-[3px] bg-[#BF0A30] rounded-b-full"></div>}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
