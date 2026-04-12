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
      <InnerDashboardLayout>{children}</InnerDashboardLayout>
    </QueryProvider>
  );
}

function InnerDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Redirecionamento apenas no cliente
  useEffect(() => {
    if (!isLoading && user) {
      if (!["ADMIN", "FUNCIONARIO"].includes(user.role?.toUpperCase() || "")) {
        router.push("/login");
      }
    }
  }, [user, isLoading, router]);

  return (
    <EscolinhaConfigProvider>
      <ClientOnly
        fallback={
          <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-6" />
            <p className="text-xl font-medium text-gray-700">Carregando...</p>
          </div>
        }
      >
        {/* Acesso Negado */}
        {(!user || !["ADMIN", "FUNCIONARIO"].includes(user.role?.toUpperCase() || "")) && (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-red-600 text-center p-8 max-w-md">
              <p className="text-2xl font-bold mb-4">Acesso negado</p>
              <p className="mb-6 text-gray-600">
                Você não tem permissão para acessar esta área ou sua sessão expirou.
              </p>
              <Button onClick={() => router.push("/login")}>
                Voltar ao login
              </Button>
            </div>
          </div>
        )}

        {/* Layout Principal - Só aparece quando usuário está logado corretamente */}
        {user && ["ADMIN", "FUNCIONARIO"].includes(user.role?.toUpperCase() || "") && (
          <div className="min-h-screen bg-gray-50">
            <Header 
              userType="ADMIN" 
              user={{
                name: user.name || user.email || "Admin",
                email: user.email || "",
              }} 
              role={user.role?.toLowerCase() || "admin"} 
              inadimplentesCount={12} 
            />
            
            <div className="flex">
              <div className="hidden lg:flex lg:w-64 lg:fixed lg:inset-y-0 lg:pt-16">
                <Sidebar 
                  userType="ADMIN" 
                  userName={user.name || user.email || "Admin"} 
                  role={user.role?.toLowerCase() || "admin"} 
                />
              </div>

              <main className="flex-1 pt-16 lg:ml-64">
                <div className="p-4 lg:p-8">
                  {children}
                </div>
              </main>
            </div>
          </div>
        )}
      </ClientOnly>
    </EscolinhaConfigProvider>
  );
}