import { useState, useEffect } from "react";

export function useCountdown(endsAt) {
  const [timeLeft, setTimeLeft] = useState(endsAt.getTime() - Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(endsAt.getTime() - Date.now());
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
