// src/app/superadmin/layout.tsx

//type UserType = "ADMIN" | "ALUNO" | "RESPONSAVEL" | "FUNCIONARIO" | "SUPERADMIN"; para der usado para conectar 

import { Navbar } from "@/src/components/Layout/Navbar";
import { Sidebar } from "@/src/components/Layout/Sidebar";
import { Toaster } from "@/src/components/ui/sonner";

const SuperAdminLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
    return ( 
         <div className="flex h-screen bg-gray-50">
            {/* Sidebar do Admin da Academia */}
              <Sidebar 
                userType="SUPERADMIN" 
                userName="Admin da Academia Elite" // Pode vir do contexto/auth depois
              />
              {/* Mobile + Conteúdo */}
              <div className="flex-1 flex flex-col lg:ml-64">
                <Navbar />
                <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                  {children}
                  <Toaster />
                </main>
              </div>
            </div>
     );
}
 
export default SuperAdminLayout;