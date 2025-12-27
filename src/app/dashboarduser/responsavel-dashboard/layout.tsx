// src/app/dashboarduser/responsavel-dashboard/layout.tsx (ou onde estiver o layout do responsável)
import { Navbar } from "@/src/components/Layout/Navbar";
import { Sidebar } from "@/src/components/Layout/Sidebar";
import { EscolinhaConfigProvider } from "@/src/context/EscolinhaConfigContext";

const ResponsavelDashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const userType = "RESPONSAVEL" as const;
  const user = {
    name: "Ana Clara",
    email: "Anaclara@edupay.com",
  };

  // CONFIGURAÇÃO DA ESCOLINHA PARA O RESPONSÁVEL
  // Em produção: vem do Supabase com base na escolinha do responsável/filho
  const configEscolinha = {
    aulasExtrasAtivas: false,  // ← MUDE PARA FALSE PARA TESTAR O SUMIR
    crossfitAtivo: false,     // (pode usar no futuro se quiser mostrar algo pro pai)
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* PROVIDER ENVOLVE TUDO — AGORA O DASHBOARD DO RESPONSÁVEL SABE DAS CONFIGS */}
      <EscolinhaConfigProvider config={configEscolinha}>
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
      </EscolinhaConfigProvider>
    </div>
  );
};

export default ResponsavelDashboardLayout;