// src/app/(dashboard)/layout.tsx
import Header from "@/src/components/Layout/Header";
import { Sidebar } from "@/src/components/Layout/Sidebar";
import { EscolinhaConfigProvider } from "@/src/context/EscolinhaConfigContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const userType = "FUNCIONARIO" as const;

  // STRING NORMAL — O TYPESCRIPT NÃO RECLAMA MAIS
  const role: string = "admin"; // mude pra "admin" ou "treinador" pra testar

  const user = {
    name: role === "treinador" ? "Rafael Lima" : "João Silva",
    email: role === "treinador" ? "rafael@escolinha.com" : "admin@escolinha.com",
  };

  // COMPARAÇÃO NORMAL — FUNCIONA PERFEITO
  const inadimplentesCount = role === "admin" ? 12 : 0;

  const configEscolinha = {
    aulasExtrasAtivas: true,
    crossfitAtivo: false,
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
          role={role}
        />

        <div className="flex">
          <div className="hidden lg:flex lg:w-64 lg:fixed lg:inset-y-0 lg:pt-16">
            <Sidebar 
              userType={userType} 
              userName={user.name}
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