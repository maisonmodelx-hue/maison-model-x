"use client";

import Lenis from "lenis";
import { useEffect } from "react";

export default function MotionProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return;

    const lenis = new Lenis({
      autoRaf: true,
      duration: 1.15,
      smoothWheel: true,
      wheelMultiplier: 0.92,
      touchMultiplier: 1.1,
      anchors: { offset: -72 },
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    return () => lenis.destroy();
  }, []);

  return <>{children}</>;
}
