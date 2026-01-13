// src/app/(dashboardtenats)/layout.tsx
"use client";

import { QueryProvider } from "@/src/components/QueryProvider"; // ← IMPORTA O WRAPPER

import Header from "@/src/components/Layout/Header";
import { Sidebar } from "@/src/components/Layout/Sidebar";
import { EscolinhaConfigProvider } from "@/src/context/EscolinhaConfigContext";
import { useAuth } from "@/src/hooks/useAuth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // O QueryProvider deve envolver TODO o componente
  return (
    <QueryProvider>
      <InnerDashboardLayout>{children}</InnerDashboardLayout>
    </QueryProvider>
  );
}

// Componente interno (onde o useAuth roda)
function InnerDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Proteção
 useEffect(() => {
  if (!isLoading) {
    if (!user) {
      router.push("/login");
    } else if (!["ADMIN", "FUNCIONARIO"].includes(user.role.toUpperCase())) {
      router.push("/login");
    }
  }
}, [user, isLoading, router]);


 // Enquanto carrega → mostra spinner bonito
if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="h-16 w-16 animate-spin text-blue-600 mb-6" />
        <p className="text-xl font-medium text-gray-700">Carregando sua conta...</p>
        <p className="text-sm text-gray-500 mt-2">Aguarde um instante...</p>
      </div>
    );
  }
  
  // Após carregar: se user OK → renderiza dashboard
 if (!user || !["ADMIN", "FUNCIONARIO"].includes(user.role.toUpperCase())) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-red-600 text-center p-8">
        <p className="text-2xl font-bold mb-4">Acesso negado</p>
        <p className="text-lg">Usuário autenticado, mas sem permissão para esta área</p>
        <p className="mt-4 text-sm">Role recebido: {user?.role || 'Nenhum'}</p>
        <Button className="mt-6" onClick={() => router.push("/login")}>
          Voltar ao login
        </Button>
      </div>
    </div>
  );
}


  if (!user) return null;

  const safeUser = {
    name: user.name || user.email || "Admin",
    email: user.email || "",
  };

  const role = user.role === "FUNCIONARIO" ? "admin" : "admin";

  const configEscolinha = {
    aulasExtrasAtivas: true,
    crossfitAtivo: false,
  };

  return (
    <div suppressHydrationWarning className="min-h-screen bg-gray-50">
      <EscolinhaConfigProvider config={configEscolinha}>
        <Header 
          userType="ADMIN"
          user={safeUser}
          inadimplentesCount={12}
          aulasExtrasAtivas={configEscolinha.aulasExtrasAtivas}
          crossfitAtivo={configEscolinha.crossfitAtivo}
          role={role}
        />

        <div className="flex">
          <div className="hidden lg:flex lg:w-64 lg:fixed lg:inset-y-0 lg:pt-16">
            <Sidebar 
              userType="ADMIN"
              userName={safeUser.name}
              aulasExtrasAtivas={configEscolinha.aulasExtrasAtivas}
              crossfitAtivo={configEscolinha.crossfitAtivo}
              role={role}
            />
          </div>

          <main className="flex-1 pt-16 lg:ml-64">
            <div className="p-4 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      </EscolinhaConfigProvider>
    </div>
  );
}