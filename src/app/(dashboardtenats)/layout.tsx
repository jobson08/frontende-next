// src/app/(dashboard)/layout.tsx

import { Navbar } from "@/src/components/Layout/Navbar";
import { Sidebar } from "@/src/components/Layout/Sidebar";

import { Toaster } from "@/src/components/ui/sonner";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const userType = "ADMIN" as const;
 const user = {
    name: "João Silva",
    email: "admin@escolinha.com",
  };
  return (
<div className="min-h-screen bg-gray-50">
      {/* NAVBAR FIXA NO TOPO */}
      <Navbar userType={userType} user={user} />

      <div className="flex">
        {/* SIDEBAR DESKTOP */}
        <div className="hidden lg:flex lg:w-64 lg:fixed lg:inset-y-0 lg:pt-16">
          <Sidebar userType={userType} userName={user.name} />
        </div>

        {/* CONTEÚDO PRINCIPAL */}
        <main className="flex-1 lg:ml-64 pt-16">
          <div className="p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}