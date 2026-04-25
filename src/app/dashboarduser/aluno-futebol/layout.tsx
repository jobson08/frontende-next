// src/app/dashboarduser/aluno-futebol/layout.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "@/src/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
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

export default function AlunoFutebolLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <InnerAlunoFutebolLayout>{children}</InnerAlunoFutebolLayout>
    </QueryClientProvider>
  );
}

function InnerAlunoFutebolLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user || user.role?.toUpperCase() !== "ALUNO_FUTEBOL") {
        router.push("/login");
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="h-16 w-16 animate-spin text-blue-600 mb-6" />
        <p className="text-xl font-medium text-gray-700">Carregando seu dashboard...</p>
      </div>
    );
  }

  if (!user || user.role?.toUpperCase() !== "ALUNO_FUTEBOL") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-red-600 text-center max-w-md">
          <p className="text-2xl font-bold mb-4">Acesso negado</p>
          <p className="text-lg mb-2">Este dashboard é exclusivo para alunos de Futebol.</p>
          <Button onClick={() => router.push("/login")}>
            Voltar ao Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarUser
        userType="ALUNO_FUTEBOL"
        name={user.name || user.email?.split("@")[0] || "Aluno"} 
        email={user.email || ""} 
       // fotoUrl={user.fotoUrl || ""}
      />

      <div className="flex">
        <div className="hidden lg:flex lg:w-64 lg:fixed lg:inset-y-0 lg:pt-16 bg-white border-r shadow-sm">
          <SidebarUser 
            userType="ALUNO_FUTEBOL" 
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