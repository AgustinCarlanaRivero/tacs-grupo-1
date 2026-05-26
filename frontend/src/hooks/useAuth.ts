"use client";

import { useGetMeQuery } from "@/store/api/authApi";
import {
    useAuth0,
    type LogoutOptions,
    type RedirectLoginOptions,
} from "@auth0/auth0-react";

const isAuthDisabled = process.env.NEXT_PUBLIC_DISABLE_AUTH === "true";
const mockUserId =
    process.env.NEXT_PUBLIC_MOCK_USER_ID ?? "665000000000000000000002";
const mockUserRole =
    process.env.NEXT_PUBLIC_MOCK_USER_ROLE === "ADMIN" ? "ADMIN" : "STANDARD";

const noopAsync = async () => undefined;

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

const DISABLE_AUTH = process.env.NEXT_PUBLIC_DISABLE_AUTH === "true";

const MOCK_USER: AuthUser = {
    id: "seed-user-ana",
    name: "Ana Lopez",
    email: "ana@seed.local",
    sub: "dev|seed-user-ana",
    role: "ADMIN",
};

export function useAuth(): UseAuthResult {
    // ── Modo dev sin Auth0 ──────────────────────────────────────────────────────
    if (DISABLE_AUTH) {
        return {
            isAuthenticated: true,
            isLoading: false,
            user: MOCK_USER,
            loginWithRedirect: async () => {},
            logout: async () => {},
            getAccessTokenSilently: async () => "dev-token",
        };
    }

    // ── Modo normal con Auth0 ───────────────────────────────────────────────────
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const {
        isAuthenticated,
        isLoading: auth0Loading,
        user: auth0User,
        loginWithRedirect,
        logout,
        getAccessTokenSilently,
    } = useAuth0();

    const { data: internalUser, isLoading: meLoading } = useGetMeQuery(
        undefined,
        {
            skip: isAuthDisabled || !isAuthenticated,
        }
    );

    if (isAuthDisabled) {
        return {
            isAuthenticated: true,
            isLoading: false,
            user: {
                id: mockUserId,
                name: "Usuario Dev",
                email: "dev@example.com",
                sub: mockUserId,
                role: mockUserRole,
            },
            loginWithRedirect: noopAsync,
            logout: noopAsync,
            getAccessTokenSilently: async () => "",
        };
    }

    const user: AuthUser | null =
        isAuthenticated && auth0User?.sub
            ? {
                  id: internalUser?.id ?? "",
                  name: internalUser
                      ? `${internalUser.firstName} ${internalUser.lastName}`.trim() ||
                        internalUser.username
                      : auth0User.name ??
                        auth0User.nickname ??
                        auth0User.email ??
                        "",
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
