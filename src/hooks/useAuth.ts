// src/hooks/useAuth.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
//import axios from "axios";

export type UserRole = "SUPERADMIN" | "ADMIN" | "FUNCIONARIO" | "ALUNO" | "RESPONSAVEL" | "ALUNO_CROSSFIT" | "ALUNO_FUTEBOL";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenantId: string | null;
  isActive: boolean;
};

export function useAuth() {
  const router = useRouter();

const { data: user, isLoading, error, refetch } = useQuery<AuthUser>({
  queryKey: ["auth", "me"],
queryFn: async () => {
  console.log("[useAuth] Iniciando fetch /auth/me");
  console.log("[useAuth] Token usado do localStorage:", localStorage.getItem("token"));
  try {
    const { data } = await api.get("/auth/me");
    console.log("[useAuth] Fetch sucesso:", data);
    localStorage.setItem("user", JSON.stringify(data));
    if (data.tenantId) {
      localStorage.setItem("tenantId", data.tenantId);
    }
    return data;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (fetchError: any) {
    console.error("[useAuth] ERRO TOTAL NO FETCH /auth/me:", fetchError);
    if (fetchError.response) {
      console.error("[useAuth] Status do erro:", fetchError.response.status);
      console.error("[useAuth] Dados do erro:", fetchError.response.data);
      console.error("[useAuth] Headers do request:", fetchError.config.headers);
    } else if (fetchError.request) {
      console.error("[useAuth] Sem resposta do servidor:", fetchError.request);
    } else {
      console.error("[useAuth] Erro ao configurar request:", fetchError.message);
    }
    throw fetchError;
  }
},
  staleTime: 1000 * 60 * 5,
  retry: 1,
  enabled: typeof window !== "undefined" && !!localStorage.getItem("token"),
});

if (error) {
  console.error("[useAuth] Erro final no useQuery:", error);
}

  const logout = () => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Strict";
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("tenantId");
    toast.success("Logout realizado com sucesso!", {
      description: "Você saiu da sua conta.",
    });
    window.location.href = "/login";
  };

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    refetch,
    logout,
  };
}