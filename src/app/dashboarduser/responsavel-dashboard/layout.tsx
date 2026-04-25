// src/app/dashboarduser/responsavel-dashboard/layout.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { useAuth } from "@/src/hooks/useAuth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavbarUser } from "@/src/components/Layout/NavbarUser";
import { SidebarUser } from "@/src/components/Layout/SidebarUser";


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const ResponsavelDashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>{/* ENVOLVE TODO O LAYOUT */}
      <InnerResponsavelDashboardLayout>{children}</InnerResponsavelDashboardLayout>
    </QueryClientProvider>
  );
};

// Componente interno (onde o useAuth roda — AGORA FUNCIONA SEM ERRO!)
function InnerResponsavelDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Proteção: só RESPONSAVEL
  useEffect(() => {
    if (!isLoading) {
      if (!user || user.role?.toUpperCase() !== "RESPONSAVEL") {
        router.push("/login");
      }
    }
  }, [user, isLoading, router]);

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
      if (!user || user.role.toUpperCase() !== "RESPONSAVEL") {
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
    name: user.name || user.email || "Responsável",
    email: user.email || "",
  };

  const configEscolinha = {
    aulasExtrasAtivas: false,
    crossfitAtivo: false,
  };

  return (
  <div className="min-h-screen bg-gray-50">
      <NavbarUser
        userType="RESPONSAVEL"
        name={user.name || user.email?.split("@")[0] || "Aluno"} 
        email={user.email || ""} 
       // fotoUrl={user.fotoUrl || ""}
      />

      <div className="flex">
        <div className="hidden lg:flex lg:w-64 lg:fixed lg:inset-y-0 lg:pt-16 bg-white border-r shadow-sm">
          <SidebarUser 
            userType="RESPONSAVEL" 
            userName={user.name || user.email?.split("@")[0] || "Aluno"} 
          />
        </div>

        <main className="flex-1 pt-16 lg:ml-64">
          <div className="p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default ResponsavelDashboardLayout;