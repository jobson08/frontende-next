// src/app/(dashboard)/layout.tsx
import Header from "@/src/components/Layout/Header";
import { Sidebar } from "@/src/components/Layout/Sidebar";
import { EscolinhaConfigProvider } from "@/src/context/EscolinhaConfigContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const userType = "ADMIN" as const;
  const user = {
    name: "João Silva",
    email: "admin@escolinha.com",
  };

  const inadimplentesCount = 12;

  // CONFIGURAÇÃO DA ESCOLINHA
  const configEscolinha = {
    aulasExtrasAtivas: false,
    crossfitAtivo: false, // ← MUDE AQUI PARA TESTAR
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <EscolinhaConfigProvider config={configEscolinha}>
        <Header 
          userType={userType} 
          user={user} 
          inadimplentesCount={inadimplentesCount}
          aulasExtrasAtivas={configEscolinha.aulasExtrasAtivas}
          crossfitAtivo={configEscolinha.crossfitAtivo}
        />

        <div className="flex">
          <div className="hidden lg:flex lg:w-64 lg:fixed lg:inset-y-0 lg:pt-16">
            <Sidebar 
              userType={userType} 
              userName={user.name}
              aulasExtrasAtivas={configEscolinha.aulasExtrasAtivas}
              crossfitAtivo={configEscolinha.crossfitAtivo}
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