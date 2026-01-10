// src/app/superadmin/layout.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { Navbar } from "@/src/components/Layout/Navbar";
import { Sidebar } from "@/src/components/Layout/Sidebar";
import { useAuth } from "@/src/hooks/useAuth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

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
  const { user, isLoading } = useAuth(); // ← CHAMADO AQUI, DEPOIS DO PROVIDER
  console.log("[SuperAdminLayout] useAuth retornou:", { user, isLoading });
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "SUPERADMIN")) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user || user.role !== "SUPERADMIN") return null;

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