// src/hooks/useAuth.ts
"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";


export type UserRole = "SUPER_ADMIN" | "ADMIN" | "FUNCIONARIO" | "ALUNO" | "RESPONSAVEL";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenantId: string | null;
  isActive: boolean;
};

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading, error, refetch } = useQuery<AuthUser>({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const { data } = await api.get("/auth/me");
      // Salva no localStorage pra usar no interceptors
      localStorage.setItem("user", JSON.stringify(data));
      if (data.tenantId) {
        localStorage.setItem("tenantId", data.tenantId);
      }
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 1,
  });

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("tenantId");
    queryClient.clear();
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