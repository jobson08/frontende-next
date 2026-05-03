// src/app/(dashboardtenats)/layout.tsx
"use client";

import { QueryProvider } from "@/src/components/QueryProvider";
import Header from "@/src/components/Layout/Header";
import { Sidebar } from "@/src/components/Layout/Sidebar";
import { EscolinhaConfigProvider } from "@/src/context/EscolinhaConfigContext";
import { useAuth } from "@/src/hooks/useAuth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import ClientOnly from "@/src/components/ClientOnly";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <EscolinhaConfigProvider>
        <InnerDashboardLayout>{children}</InnerDashboardLayout>
      </EscolinhaConfigProvider>
    </QueryProvider>
  );
}

function InnerDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Proteção: ADMIN ou TREINADOR ou FUNCIONARIO
  useEffect(() => {
    if (!isLoading && user) {
      const roleUpper = user.role?.toUpperCase();
      if (!["ADMIN", "TREINADOR", "FUNCIONARIO"].includes(roleUpper || "")) {
        router.push("/login");
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xl font-medium text-gray-700">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user || !["ADMIN", "TREINADOR", "FUNCIONARIO"].includes(user.role?.toUpperCase() || "")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-600 text-center p-8 max-w-md">
          <p className="text-2xl font-bold mb-4">Acesso negado</p>
          <p className="mb-6 text-gray-600">Você não tem permissão para acessar esta área.</p>
          <Button onClick={() => router.push("/login")}>Voltar ao login</Button>
        </div>
      </div>
    );
  }

  // ===================== DETECÇÃO DO ROLE =====================
  const roleUpper = user.role?.toUpperCase();

  const userRoleForSidebar = 
    roleUpper === "ADMIN" ? "admin" :
    roleUpper === "TREINADOR" ? "treinador" : "funcionario";

  const safeUser = {
    name: user.name || user.email || "Usuário",
    email: user.email || "",
  };

  console.log("🎯 LAYOUT - Usuário detectado:", {
    role: user.role,
    userRoleForSidebar
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <Header 
        userType="FUNCIONARIO" 
        user={safeUser} 
        role={userRoleForSidebar} 
        inadimplentesCount={12} 
      />

      <div className="flex">
        {/* SIDEBAR */}
        <div className="hidden lg:flex lg:w-64 lg:fixed lg:inset-y-0 lg:pt-16">
          <Sidebar 
            userType="FUNCIONARIO" 
            userName={safeUser.name} 
            role={userRoleForSidebar}        // "admin", "treinador" ou "funcionario"
          />
        </div>

        {/* CONTEÚDO PRINCIPAL */}
        <main className="flex-1 pt-16 lg:ml-64">
          <div className="p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}