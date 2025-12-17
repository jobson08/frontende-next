// src/app/superadmin/layout.tsx

//type UserType = "ADMIN" | "ALUNO" | "RESPONSAVEL" | "FUNCIONARIO" | "SUPERADMIN"; para der usado para conectar 

import { Navbar } from "@/src/components/Layout/Navbar";
import { Sidebar } from "@/src/components/Layout/Sidebar";
import { SidebarMobile } from "@/src/components/Layout/SidebarMobile";
import { Toaster } from "@/src/components/ui/sonner";

const SuperAdminLayout = ({children,}: {children: React.ReactNode;}) => { // iNICIO DA FUNÇÃO
  // Defina aqui o tipo de usuário (depois vem do auth)
  const userType = "SUPERADMIN" as const;
 const user = {
    name: "João Silva",
    email: "admin@escolinha.com",
  };
    return ( 
    <div className="min-h-screen bg-gray-50">
      {/* NAVBAR COM MOBILE SIDEBAR */}
      <Navbar userType={userType} user={user} />

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
 
export default SuperAdminLayout;