"use client";

import { Suspense, useEffect, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLinkTelegramMutation } from "@/store/api/telegramApi";

const TG_TOKEN_KEY = "telegram_link_token";

const BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME?.replace(/^@/, "");
const BOT_DEEP_LINK = BOT_USERNAME ? `https://t.me/${BOT_USERNAME}` : "https://t.me";

function Spinner() {
  return (
    <div className="w-8 h-8 mx-auto border-4 border-[#002B5E] border-t-transparent rounded-full animate-spin" />
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-slate-200 shadow-lg p-8 text-center">
          {children}
        </div>
      </div>
    </div>
  );
}

const MOBILE_UA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

// Detecta dispositivos móviles por user agent. Usa `useSyncExternalStore` para
// resolver en cliente sin romper la hidratación: en SSR devuelve `false` y, ya
// montado, lee el `navigator.userAgent`. El valor no cambia, así que no hay
// suscripción real.
function useIsMobile() {
  return useSyncExternalStore(
    () => () => {},
    () => MOBILE_UA.test(navigator.userAgent),
    () => false
  );
}

// En mobile el deep link abre la app de Telegram (funciona). En PC abre el
// Telegram web, donde "Start Bot" no hace nada, así que mostramos un texto.
function BackToTelegram({
  desktopHint = "Ya podés cerrar esta pestaña.",
}: {
  desktopHint?: string;
}) {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return <p className="text-slate-400 mt-6 text-sm font-medium">{desktopHint}</p>;
  }

  return (
    <Link
      href={BOT_DEEP_LINK}
      className={cn(
        buttonVariants(),
        "w-full h-11 mt-6 bg-slate-900 hover:bg-slate-800 text-white font-semibold"
      )}
    >
      Volver a Telegram
    </Link>
  );
}

function TelegramLinker() {
  const params = useSearchParams();
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth();
  const [linkTelegram, { isLoading: linking, isSuccess, isError, error }] =
    useLinkTelegramMutation();
  const triedRef = useRef(false);

  // 1) Token de la URL o del sessionStorage (sobrevive al redirect de Auth0).
  const token =
    params.get("token") ??
    (typeof window !== "undefined" ? sessionStorage.getItem(TG_TOKEN_KEY) : null);

  // Persistir el token apenas carga, antes de cualquier redirect.
  useEffect(() => {
    const q = params.get("token");
    if (q) sessionStorage.setItem(TG_TOKEN_KEY, q);
  }, [params]);

  // 2) Login si hace falta.
  useEffect(() => {
    if (isLoading || !token) return;
    if (!isAuthenticated) {
      loginWithRedirect({ appState: { returnTo: "/telegram" } });
    }
  }, [isLoading, isAuthenticated, token, loginWithRedirect]);

  // 3) Llamar al backend una sola vez ya autenticado.
  useEffect(() => {
    if (isAuthenticated && token && !triedRef.current) {
      triedRef.current = true;
      linkTelegram({ token })
        .unwrap()
        .catch(() => {})
        .finally(() => sessionStorage.removeItem(TG_TOKEN_KEY));
    }
  }, [isAuthenticated, token, linkTelegram]);

  // ── Render por estado ──────────────────────────────────────────────────────
  // El resultado de la vinculación se evalúa primero: al terminar borramos el
  // token del sessionStorage, así que el guard de "sin token" no debe taparlo.

  // Éxito.
  if (isSuccess) {
    return (
      <Shell>
        <div className="text-3xl">✓</div>
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight mt-2">
          ¡Cuenta vinculada!
        </h2>
        <p className="text-slate-500 mt-3 text-sm">
          Sesión iniciada con éxito. Podés cerrar esta ventana.
        </p>
        <BackToTelegram />
      </Shell>
    );
  }

  // Error.
  if (isError) {
    const status =
      error && typeof error === "object" && "status" in error
        ? (error as { status: unknown }).status
        : undefined;
    const expired = status === 400;
    return (
      <Shell>
        <div className="text-3xl">⚠️</div>
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight mt-2">
          No pudimos vincular
        </h2>
        <p className="text-slate-500 mt-3 text-sm">
          {expired
            ? "El link expiró o es inválido. Volvé a Telegram y reintentá con /start."
            : "Ocurrió un error inesperado. Volvé a Telegram y reintentá."}
        </p>
        <BackToTelegram desktopHint="Reintentá desde Telegram en tu celular." />
      </Shell>
    );
  }

  // Sin token: entraron a /telegram a mano.
  if (!token) {
    return (
      <Shell>
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
          Vinculación de Telegram
        </h2>
        <p className="text-slate-500 mt-3 text-sm">
          Abrí este link desde el bot de Telegram para vincular tu cuenta.
        </p>
        <BackToTelegram desktopHint="Abrí este link desde Telegram en tu celular." />
      </Shell>
    );
  }

  // Esperando login (redirigiendo).
  if (!isLoading && !isAuthenticated) {
    return (
      <Shell>
        <Spinner />
        <p className="text-slate-500 mt-4 text-sm">Redirigiendo al login…</p>
      </Shell>
    );
  }

  // Resolviendo auth o ejecutando la mutation.
  return (
    <Shell>
      <Spinner />
      <p className="text-slate-500 mt-4 text-sm">
        {linking ? "Vinculando tu cuenta…" : "Cargando…"}
      </p>
    </Shell>
  );
}

export default function TelegramPage() {
  return (
    <Suspense
      fallback={
        <Shell>
          <Spinner />
        </Shell>
      }
    >
      <TelegramLinker />
    </Suspense>
  );
}
