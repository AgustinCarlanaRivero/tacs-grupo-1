"use client";

import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { setTokenGetter } from "@/store/tokenStore";

const DISABLE_AUTH = process.env.NEXT_PUBLIC_DISABLE_AUTH === "true";

export default function TokenBridge() {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    if (DISABLE_AUTH) {
      // En modo dev el back no valida el token, se manda cualquier valor
      setTokenGetter(async () => "dev-token");
      return;
    }

    setTokenGetter(async () => {
      if (!isAuthenticated) return null;
      try {
        return await getAccessTokenSilently();
      } catch {
        return null;
      }
    });
  }, [isAuthenticated, getAccessTokenSilently]);

  return null;
}
