import { useEffect } from "react";

export function useClickOutside(ref, handler) {
  useEffect(() => {
    function onMouseDown(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        handler();
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [ref, handler]);
}
