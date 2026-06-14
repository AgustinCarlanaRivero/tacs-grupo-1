"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Auth0Provider, type AppState } from "@auth0/auth0-react";
import TokenBridge from "./TokenBridge";

interface Auth0ProviderWrapperProps {
  children: ReactNode;
}

export default function Auth0ProviderWrapper({ children }: Auth0ProviderWrapperProps) {
  const router = useRouter();

  return (
    <Auth0Provider
      domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN ?? ""}
      clientId={process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID ?? ""}
      authorizationParams={{
        redirect_uri: typeof window !== "undefined" ? window.location.origin : "",
        audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
      }}
      onRedirectCallback={(appState?: AppState) =>
        router.replace(appState?.returnTo ?? "/")
      }
    >
      <TokenBridge />
      {children}
    </Auth0Provider>
  );
}
