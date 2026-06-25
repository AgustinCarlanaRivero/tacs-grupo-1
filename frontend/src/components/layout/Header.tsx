"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Library, Gavel, ArrowLeftRight, User, LogOut, Shield, type LucideIcon } from "lucide-react";
import NotificationBell from "@/components/notification/NotificationBell";

interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Mi Colección", icon: LayoutGrid },
  { href: "/catalog", label: "Catálogo", icon: Library },
  { href: "/auctions", label: "Subastas", icon: Gavel },
  { href: "/trades", label: "Intercambios", icon: ArrowLeftRight },
  { href: "/profile", label: "Perfil", icon: User },
];

const ADMIN_LINK: NavLink = { href: "/admin", label: "Admin", icon: Shield };

export default function Header() {
  const pathname = usePathname();
  const { isAuthenticated, isLoading, user, loginWithRedirect, logout } = useAuth();
  const isAdmin = isAuthenticated && user?.role === "ADMIN";
  const navLinks = isAdmin ? [...NAV_LINKS, ADMIN_LINK] : NAV_LINKS;

  return (
    <>
      <header className="bg-[#002B5E] sticky top-0 z-40">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-1 h-6 bg-[#BF0A30] rounded-full" />
            <h1 className="text-lg font-extrabold tracking-tight text-white">Mundial 2026</h1>
          </Link>

          <div className="flex items-center gap-2 md:gap-4">
            <nav className="hidden md:flex items-center gap-0.5">
              {isAuthenticated &&
                navLinks.map(({ href, label }) => {
                  const isActive = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`px-4 py-1.5 text-sm font-medium transition-colors rounded-sm ${
                        isActive ? "bg-white/15 text-white" : "text-blue-200/70 hover:text-white"
                      }`}
                    >
                      {label}
                    </Link>
                  );
                })}

              {!isLoading &&
                (isAuthenticated ? (
                  <div className="flex items-center gap-2 ml-3">
                    {user?.picture && (
                      <img
                        src={user.picture}
                        alt={user.name}
                        className="w-7 h-7 rounded-full border border-white/30"
                      />
                    )}
                    <span className="text-sm text-blue-100 font-medium hidden lg:block">
                      {user?.name}
                    </span>
                    <Button
                      size="sm"
                      onClick={() =>
                        logout({
                          logoutParams: {
                            returnTo:
                              typeof window !== "undefined" ? window.location.origin : "",
                          },
                        })
                      }
                      className="text-sm font-semibold bg-white/10 hover:bg-white/20 text-white border-none"
                    >
                      <LogOut size={14} className="mr-1" />
                      Salir
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => loginWithRedirect()}
                    className="ml-3 text-sm font-semibold bg-[#BF0A30] hover:bg-[#a00828] text-white border-none"
                  >
                    Iniciar Sesión
                  </Button>
                ))}
            </nav>
            {isAuthenticated && <NotificationBell />}
          </div>
        </div>
      </header>

      {isAuthenticated && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200">
          <div className="flex items-center justify-around h-14">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative flex flex-col items-center justify-center gap-0.5 w-full h-full transition-colors ${
                    isActive ? "text-[#002B5E]" : "text-slate-400"
                  }`}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                  <span
                    className={`text-[9px] font-semibold uppercase tracking-wider ${
                      isActive ? "text-[#002B5E]" : "text-slate-400"
                    }`}
                  >
                    {label}
                  </span>
                  {isActive && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-[3px] bg-[#BF0A30] rounded-b-full" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </>
  );
}
