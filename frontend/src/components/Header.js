"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "/", label: "Mi Colección" },
  { href: "/auctions", label: "Subastas" },
  { href: "/profile", label: "Perfil" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <h1 className="text-xl font-extrabold tracking-tight text-slate-800">Mundial 2026</h1>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`px-4 py-2 text-sm font-medium transition-colors ${isActive ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {label}
              </Link>
            );
          })}

          <Link href="/login" className="ml-4">
            <Button variant="outline" size="sm" className="text-sm font-medium">
              Iniciar Sesión
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
