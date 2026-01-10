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
  const { user, isLoading } = useAuth(); // ← AGORA FUNCIONA (dentro do provider)
  const router = useRouter();

  // Proteção
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login");
      } else if (!["ADMIN", "FUNCIONARIO"].includes(user.role)) {
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
    name: user.name || user.email || "Admin",
    email: user.email || "",
  };

  const role = user.role === "FUNCIONARIO" ? "admin" : "admin";

  const configEscolinha = {
    aulasExtrasAtivas: true,
    crossfitAtivo: false,
  };

  return (
    <div className="min-h-screen bg-gray-50">
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