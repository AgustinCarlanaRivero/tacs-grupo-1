"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { NotificationDTO } from "@/store/api/notificationApi";

interface StreamMessage {
  type?: string;
  id?: string;
  userId?: string;
  message?: string;
  read?: boolean;
  payload?: Record<string, unknown>;
  createdAt?: string;
}

const RECONNECT_BASE_MS = 2000;
const RECONNECT_MAX_MS = 30000;

/**
 * Consume el endpoint SSE `/users/:userId/notifications/stream` con el token
 * Bearer de Auth0. Usa `fetch` + ReadableStream porque EventSource nativo no
 * acepta headers. Maneja reconexión con backoff exponencial.
 *
 * El handler se invoca por cada notificación nueva (no por el "connected"
 * inicial ni por los heartbeats).
 */
export function useNotificationStream(
  userId: string | undefined,
  onNotification: (n: NotificationDTO) => void
) {
  const { getAccessTokenSilently, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!userId || !isAuthenticated) return;

    const controller = new AbortController();
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let attempts = 0;
    let cancelled = false;

    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

    const connect = async () => {
      if (cancelled) return;
      try {
        const token = await getAccessTokenSilently();
        const res = await fetch(
          `${baseUrl}/users/${userId}/notifications/stream`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "text/event-stream",
            },
            signal: controller.signal,
            cache: "no-store",
          }
        );

        if (!res.ok || !res.body) {
          throw new Error(`SSE failed: ${res.status}`);
        }

        attempts = 0;
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let sepIdx;
          while ((sepIdx = buffer.indexOf("\n\n")) >= 0) {
            const rawEvent = buffer.slice(0, sepIdx);
            buffer = buffer.slice(sepIdx + 2);

            const dataLine = rawEvent
              .split("\n")
              .find((l) => l.startsWith("data:"));
            if (!dataLine) continue;

            const json = dataLine.slice(5).trim();
            if (!json) continue;

            try {
              const parsed: StreamMessage = JSON.parse(json);
              if (parsed.type === "connected") continue;
              if (parsed.id && parsed.message) {
                onNotification(parsed as NotificationDTO);
              }
            } catch {
              // chunk malformado, ignorar
            }
          }
        }
      } catch (err) {
        if (cancelled || (err as Error)?.name === "AbortError") return;
      }

      if (!cancelled) {
        const delay = Math.min(
          RECONNECT_BASE_MS * Math.pow(2, attempts),
          RECONNECT_MAX_MS
        );
        attempts += 1;
        reconnectTimer = setTimeout(connect, delay);
      }
    };

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      controller.abort();
    };
  }, [userId, isAuthenticated, getAccessTokenSilently, onNotification]);
}
