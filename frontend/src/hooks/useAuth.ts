"use client";

import { useAuth0, type RedirectLoginOptions, type LogoutOptions } from "@auth0/auth0-react";
import { useGetMeQuery } from "@/store/api/authApi";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  picture?: string;
  sub: string;
  role: "STANDARD" | "ADMIN";
}

export interface UseAuthResult {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  loginWithRedirect: (options?: RedirectLoginOptions) => Promise<void>;
  logout: (options?: LogoutOptions) => Promise<void>;
  getAccessTokenSilently: () => Promise<string>;
}

export function useAuth(): UseAuthResult {
  const {
    isAuthenticated,
    isLoading: auth0Loading,
    user: auth0User,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
  } = useAuth0();

  const { data: internalUser, isLoading: meLoading } = useGetMeQuery(undefined, {
    skip: !isAuthenticated,
  });

  const user: AuthUser | null =
    isAuthenticated && auth0User?.sub
      ? {
          id: internalUser?.id ?? "",
          name:
            internalUser
              ? `${internalUser.firstName} ${internalUser.lastName}`.trim() ||
                internalUser.username
              : auth0User.name ?? auth0User.nickname ?? auth0User.email ?? "",
          email: internalUser?.email ?? auth0User.email ?? "",
          picture: auth0User.picture,
          sub: auth0User.sub,
          role: internalUser?.role ?? "STANDARD",
        }
      : null;

  return {
    isAuthenticated,
    isLoading: auth0Loading || (isAuthenticated && meLoading),
    user,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
  };
}
