// src/app/superadmin/layout.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { Navbar } from "@/src/components/Layout/Navbar";
import { Sidebar } from "@/src/components/Layout/Sidebar";
import { useAuth } from "@/src/hooks/useAuth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Client criado fora
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
});

const SuperAdminLayout = ({ children }: { children: React.ReactNode }) => {
  console.log("[SuperAdminLayout] Iniciando render do layout SuperAdmin");
  return (
    <QueryClientProvider client={queryClient}>
      <InnerSuperAdminLayout>{children}</InnerSuperAdminLayout>
    </QueryClientProvider>
  );
};

// Componente interno (onde o useAuth roda — AGORA FUNCIONA!)
function InnerSuperAdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Só verifica permissão DEPOIS do loading terminar
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login");
      } else if (user.role.toUpperCase() !== "SUPERADMIN") {
        router.push("/login");
      }
    }
  }, [user, isLoading, router]);

  // Enquanto carrega → mostra APENAS o spinner bonito (sem mensagem de erro!)
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="h-16 w-16 animate-spin text-blue-600 mb-6" />
        <p className="text-xl font-medium text-gray-700">Carregando sua conta...</p>
        <p className="text-sm text-gray-500 mt-2">Aguarde um instante...</p>
      </div>
    );
  }

  // Agora que o loading terminou, verifica se tem permissão
  if (!user || user.role.toUpperCase() !== "SUPERADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-600 text-center p-8 max-w-md">
          <AlertCircle className="h-16 w-16 mx-auto mb-6 text-red-500" />
          <h2 className="text-2xl font-bold mb-4">Acesso negado</h2>
          <p className="text-lg mb-4">
            Usuário autenticado, mas sem permissão para esta área
          </p>
          <p className="text-sm text-gray-600 mb-6">
            Role recebido: <strong>{user?.role || 'Nenhum'}</strong>
          </p>
          <Button 
            variant="destructive" 
            size="lg"
            onClick={() => router.push("/login")}
          >
            Voltar ao login
          </Button>
        </div>
      </div>
    );
  }

  // Tudo OK → renderiza o dashboard normal (sem flash!)
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userType="SUPERADMIN" user={{ name: user.name || user.email, email: user.email }} />
      <div className="flex">
        <div className="hidden lg:flex lg:w-64 lg:fixed lg:inset-y-0 lg:pt-16">
          <Sidebar userType="SUPERADMIN" userName={user.name || user.email} />
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
export default SuperAdminLayout;