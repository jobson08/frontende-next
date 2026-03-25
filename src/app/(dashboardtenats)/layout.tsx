// src/app/(dashboardtenats)/layout.tsx
"use client";

import { QueryProvider } from "@/src/components/QueryProvider";
import Header from "@/src/components/Layout/Header";
import { Sidebar } from "@/src/components/Layout/Sidebar";
import { EscolinhaConfigProvider } from "@/src/context/EscolinhaConfigContext";
import { useAuth } from "@/src/hooks/useAuth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

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

  // Redirecionamento só acontece no cliente
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login");
      } else if (!["ADMIN", "FUNCIONARIO"].includes(user.role?.toUpperCase() || "")) {
        router.push("/login");
      }
    }
  }, [user, isLoading, router]);

  // Loading - HTML idêntico no server e client
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50" suppressHydrationWarning>
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-6" />
        <p className="text-xl font-medium text-gray-700">Carregando...</p>
      </div>
    );
  }

  // Acesso negado - só renderizado no cliente
  if (!user || !["ADMIN", "FUNCIONARIO"].includes(user.role?.toUpperCase() || "")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" suppressHydrationWarning>
        <div className="text-red-600 text-center p-8">
          <p className="text-2xl font-bold mb-4">Acesso negado</p>
          <Button onClick={() => router.push("/login")}>Voltar ao login</Button>
        </div>
      </div>
    );
  }

  const safeUser = {
    name: user.name || user.email || "Admin",
    email: user.email || "",
  };

  const role = user.role?.toLowerCase() || "admin";

  return (
    <EscolinhaConfigProvider>
      <div className="min-h-screen bg-gray-50">
        <Header userType="ADMIN" user={safeUser} role={role} inadimplentesCount={12} />
        
        <div className="flex">
          <div className="hidden lg:flex lg:w-64 lg:fixed lg:inset-y-0 lg:pt-16">
            <Sidebar userType="ADMIN" userName={safeUser.name} role={role} />
          </div>

          <main className="flex-1 pt-16 lg:ml-64">
            <div className="p-4 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </EscolinhaConfigProvider>
  );
}