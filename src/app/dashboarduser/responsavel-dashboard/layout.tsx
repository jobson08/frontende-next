// src/app/dashboarduser/responsavel-dashboard/layout.tsx
"use client";

import { QueryProvider } from "@/src/components/QueryProvider";

import { Navbar } from "@/src/components/Layout/Navbar";
import { Sidebar } from "@/src/components/Layout/Sidebar";
import { EscolinhaConfigProvider } from "@/src/context/EscolinhaConfigContext";
import { useAuth } from "@/src/hooks/useAuth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const ResponsavelDashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryProvider> {/* ENVOLVE TODO O LAYOUT */}
      <InnerResponsavelDashboardLayout>{children}</InnerResponsavelDashboardLayout>
    </QueryProvider>
  );
};

// Componente interno (onde o useAuth roda — AGORA FUNCIONA SEM ERRO!)
function InnerResponsavelDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Proteção: só RESPONSAVEL
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "RESPONSAVEL") {
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
    name: user.name || user.email || "Responsável",
    email: user.email || "",
  };

  const configEscolinha = {
    aulasExtrasAtivas: false,
    crossfitAtivo: false,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <EscolinhaConfigProvider config={configEscolinha}>
        <Navbar userType="RESPONSAVEL" user={safeUser} />
        <div className="flex">
          <div className="hidden lg:flex lg:w-64 lg:fixed lg:inset-y-0 lg:pt-16">
            <Sidebar userType="RESPONSAVEL" userName={safeUser.name} />
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

export default ResponsavelDashboardLayout;