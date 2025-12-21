// src/app/(dashboard)/layout.tsx


import Header from "@/src/components/Layout/Header";
import { Sidebar } from "@/src/components/Layout/Sidebar";



export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const userType = "ADMIN" as const;
 const user = {
    name: "João Silva",
    email: "admin@escolinha.com",
  };

// Só passa o count se for ADMIN
  const inadimplentesCount = userType === "ADMIN" ? 12 : 0;
  return (
   <div className="min-h-screen bg-gray-50">
      {/* Header COM MOBILE SIDEBAR */}
      <Header userType={userType} user={user} inadimplentesCount={inadimplentesCount} />

      <div className="flex">
        {/* SIDEBAR DESKTOP — SÓ NO LG+ */}
        <div className="hidden lg:flex lg:w-64 lg:fixed lg:inset-y-0 lg:pt-16">
          <Sidebar userType={userType} userName={user.name} />
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