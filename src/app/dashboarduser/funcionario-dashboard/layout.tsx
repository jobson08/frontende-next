// src/app/dashboarduser/funcionario-dashboard/layout.tsx
"use client";

import { QueryProvider } from "@/src/components/QueryProvider";

import { Navbar } from "@/src/components/Layout/Navbar";
import { Sidebar } from "@/src/components/Layout/Sidebar";
import { useAuth } from "@/src/hooks/useAuth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const FuncionarioDashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryProvider> {/* ENVOLVE TODO O LAYOUT */}
      <InnerFuncionarioDashboardLayout>{children}</InnerFuncionarioDashboardLayout>
    </QueryProvider>
  );
};

// Componente interno (onde o useAuth roda — AGORA FUNCIONA SEM ERRO!)
function InnerFuncionarioDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Proteção: só FUNCIONARIO
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "FUNCIONARIO") {
        router.push("/login");
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) return null;

  const safeUser = {
    name: user.name || user.email || "Funcionário",
    email: user.email || "",
  };

  const role = user.role === "FUNCIONARIO" ? "admin" : "treinador";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAVBAR COM MOBILE SIDEBAR */}
      <Navbar userType="FUNCIONARIO" user={safeUser} />

      <div className="flex">
        {/* SIDEBAR DESKTOP — SÓ NO LG+ */}
        <div className="hidden lg:flex lg:w-64 lg:fixed lg:inset-y-0 lg:pt-16">
          <Sidebar 
            userType="FUNCIONARIO" 
            userName={safeUser.name} 
            role={role}
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

export default FuncionarioDashboardLayout;