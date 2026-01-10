"use client";

import { useEffect, useState } from "react";

export function useMobile(breakpoint: number = 640): boolean | null {
  const [isMobile, setIsMobile] = useState<boolean | null>(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < breakpoint;
    }
    return null;
  });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < breakpoint);

    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, [breakpoint]);

  return isMobile;
}
