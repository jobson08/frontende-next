// src/app/dashboarduser/aluno-dashboard/layout.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "@/src/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const queryClient = new QueryClient();

export default function AlunoDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <InnerAlunoDashboardLayout>{children}</InnerAlunoDashboardLayout>
    </QueryClientProvider>
  );
}

function InnerAlunoDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || !user.role?.toUpperCase().includes("ALUNO"))) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="h-16 w-16 animate-spin text-blue-600 mb-6" />
        <p className="text-xl font-medium text-gray-700">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-2">Bem-vindo, {user?.name?.split(" ")[0]}!</h1>
        <p className="text-gray-600 mb-10">Escolha sua modalidade para continuar</p>

        <div className="grid gap-6 md:grid-cols-2">
          <Link href="/dashboarduser/aluno-futebol">
            <div className="bg-white p-10 rounded-2xl shadow hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-green-500">
              <div className="text-6xl mb-6">⚽</div>
              <h2 className="text-2xl font-semibold mb-2">Futebol</h2>
              <p className="text-gray-600">Treinos, jogos e progresso no futebol</p>
            </div>
          </Link>

          <Link href="/dashboarduser/aluno-crossfit">
            <div className="bg-white p-10 rounded-2xl shadow hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-orange-500">
              <div className="text-6xl mb-6">🏋️</div>
              <h2 className="text-2xl font-semibold mb-2">CrossFit</h2>
              <p className="text-gray-600">Treinos funcionais e performance</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}