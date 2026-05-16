import { useEffect } from "react";

export function useScrollLock(): void {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);
}
