// src/components/ClientOnly.tsx
"use client";

import { ReactNode } from "react";

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  // Renderiza o fallback no servidor (SSR)
  // Renderiza o conteúdo real apenas no cliente
  if (typeof window === "undefined") {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}