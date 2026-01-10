"use client";

import { type ReactNode } from "react";
import { CustomInstallPrompt } from "./CustomInstallPrompt";

export function PWAProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <CustomInstallPrompt />
    </>
  );
}
