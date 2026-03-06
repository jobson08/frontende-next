// src/context/EscolinhaConfigContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import api from "@/src/lib/api";

interface EscolinhaConfig {
  aulasExtrasAtivas: boolean;
  crossfitAtivo: boolean;
  mostrarCrossfitNavbar: boolean;
  mostrarCrossfitSidebar: boolean;
  // outros campos...
}

interface ContextValue {
  config: EscolinhaConfig | null;
  isLoading: boolean;
  refreshConfig: () => Promise<void>;
}

const EscolinhaConfigContext = createContext<ContextValue | undefined>(undefined);

export function EscolinhaConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<EscolinhaConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConfig = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/tenant/config/escolinha");
      const data = res.data.data;

      console.log("PROVIDER - Dados atualizados:", data);

      setConfig({
        aulasExtrasAtivas: data.aulasExtrasAtivas ?? false,
        crossfitAtivo: data.crossfitAtivo ?? false,
        mostrarCrossfitNavbar: data.mostrarCrossfitNavbar ?? false,
        mostrarCrossfitSidebar: data.mostrarCrossfitSidebar ?? false,
      });
    } catch (err) {
      console.error("PROVIDER - Erro:", err);
      setConfig({
        aulasExtrasAtivas: false,
        crossfitAtivo: false,
        mostrarCrossfitNavbar: false,
        mostrarCrossfitSidebar: false,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  return (
    <EscolinhaConfigContext.Provider value={{ config, isLoading, refreshConfig: fetchConfig }}>
      {children}
    </EscolinhaConfigContext.Provider>
  );
}

export function useEscolinhaConfig() {
  const context = useContext(EscolinhaConfigContext);
  if (!context) {
    throw new Error("useEscolinhaConfig deve ser usado dentro de EscolinhaConfigProvider");
  }
  return context;
}