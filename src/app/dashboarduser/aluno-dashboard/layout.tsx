// src/app/dashboarduser/aluno-dashboard/layout.tsx
"use client";

import { QueryProvider } from "@/src/components/QueryProvider"; // ← Certifique-se de que esse wrapper existe

import { Navbar } from "@/src/components/Layout/Navbar";
import { Sidebar } from "@/src/components/Layout/Sidebar";
import { useAuth } from "@/src/hooks/useAuth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const AlunoDashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryProvider> {/* ← ENVOLVE TUDO */}
      <InnerAlunoDashboardLayout>{children}</InnerAlunoDashboardLayout>
    </QueryProvider>
  );
};

// Componente interno (onde o useAuth roda — AGORA FUNCIONA!)
function InnerAlunoDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Proteção: só ALUNO (ou ALUNO_FUTEBOL se tiver role específico)
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "ALUNO") { // ajuste se tiver "ALUNO_FUTEBOL"
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
    name: user.name || user.email || "Aluno",
    email: user.email || "",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAVBAR COM MOBILE SIDEBAR */}
      <Navbar userType="ALUNO" user={safeUser} />

      <div className="flex">
        {/* SIDEBAR DESKTOP — SÓ NO LG+ */}
        <div className="hidden lg:flex lg:w-64 lg:fixed lg:inset-y-0 lg:pt-16">
          <Sidebar userType="ALUNO" userName={safeUser.name} />
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

export default AlunoDashboardLayout;