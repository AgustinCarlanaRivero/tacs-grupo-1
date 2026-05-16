"use client";

import { useState, useRef, useCallback, type MouseEvent } from "react";

export interface Glare {
  x: number;
  y: number;
  opacity: number;
}

export function useMouseTilt() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [transform, setTransform] = useState<string>("");
  const [glare, setGlare] = useState<Glare>({ x: 50, y: 50, opacity: 0 });

  const onMouseMove = useCallback((e: MouseEvent<HTMLElement>) => {
    const card = ref.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -15;
    const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 15;
    setTransform(`perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
    setGlare({ x: (x / rect.width) * 100, y: (y / rect.height) * 100, opacity: 0.15 });
  }, []);

  const onMouseLeave = useCallback(() => {
    setTransform("perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
    setGlare({ x: 50, y: 50, opacity: 0 });
  }, []);

  return { ref, transform, glare, onMouseMove, onMouseLeave };
}
