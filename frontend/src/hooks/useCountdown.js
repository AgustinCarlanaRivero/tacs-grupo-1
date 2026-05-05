import { useState, useEffect } from "react";

function getEndsAtMs(endsAt) {
  if (endsAt instanceof Date) return endsAt.getTime();
  if (typeof endsAt === "string" || typeof endsAt === "number") {
    const parsed = new Date(endsAt).getTime();
    return Number.isNaN(parsed) ? Date.now() : parsed;
  }
  return Date.now();
}

export function useCountdown(endsAt) {
  const [timeLeft, setTimeLeft] = useState(getEndsAtMs(endsAt) - Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getEndsAtMs(endsAt) - Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, [endsAt]);

  return timeLeft;
}

export function formatCountdown(ms) {
  if (ms <= 0) return "Finalizada";
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / 1000 / 60) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}
