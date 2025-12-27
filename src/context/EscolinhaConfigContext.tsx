// src/context/EscolinhaConfigContext.tsx
"use client";

import { createContext, useContext } from "react";

interface EscolinhaConfig {
  aulasExtrasAtivas: boolean;
  crossfitAtivo: boolean;
}

const EscolinhaConfigContext = createContext<EscolinhaConfig>({
  aulasExtrasAtivas: false,
  crossfitAtivo: false,
});

export function EscolinhaConfigProvider({
  children,
  config,
}: {
  children: React.ReactNode;
  config: EscolinhaConfig;
}) {
  return (
    <EscolinhaConfigContext.Provider value={config}>
      {children}
    </EscolinhaConfigContext.Provider>
  );
}

export function useEscolinhaConfig() {
  return useContext(EscolinhaConfigContext);
}