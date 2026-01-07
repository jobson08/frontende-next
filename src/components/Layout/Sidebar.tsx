// src/components/layout/Sidebar.tsx
"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { BarChart3, Building2, CreditCard, LifeBuoy, UserPlus, Trophy, Activity, Star } from "lucide-react";
import {
  Home,
  Users,
  User,
  Calendar,
  DollarSign,
  Settings,
  LogOut,
  BookOpen,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { LucideIcon } from "lucide-react";

type UserType = "ADMIN" | "ALUNO" | "RESPONSAVEL" | "FUNCIONARIO" | "SUPERADMIN" | "CROSSFIT";

interface MenuItem {
  icon: LucideIcon;
  label: string;
  href: string;
}

interface SidebarProps {
  userType: UserType;
  userName: string;
  aulasExtrasAtivas?: boolean;
  crossfitAtivo?: boolean;
  role?: string; // "treinador", "admin", etc
}

export function Sidebar({ 
  userType, 
  userName, 
  aulasExtrasAtivas = false, 
  crossfitAtivo = false,
  role 
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  let items: MenuItem[] = [];

  // === ADMIN ===
  if (userType === "ADMIN" || (userType === "FUNCIONARIO" && role === "admin")) {
    items = [
      { icon: Home, label: "Dashboard", href: "/dashboard" },
      { icon: Users, label: "Alunos", href: "/alunos" },
      { icon: User, label: "Responsáveis", href: "/responsavel" },
      { icon: Users, label: "Funcionários", href: "/funcionario" },
      { icon: Calendar, label: "Treinos", href: "/treinos" },
      { icon: DollarSign, label: "Financeiro", href: "/financeiro" },
      { icon: DollarSign, label: "Inadimplentes", href: "/iadimplentes" },
      { icon: Settings, label: "Configurações", href: "/configuracoes" },
    ];

    const itensExtras: MenuItem[] = [];
    if (aulasExtrasAtivas) itensExtras.push({ icon: Trophy, label: "Aulas Extras", href: "/aulas-extras" });
    if (crossfitAtivo) itensExtras.push({ icon: Activity, label: "CrossFit Adultos", href: "/crossfit" });

    const configIndex = items.findIndex(item => item.label === "Configurações");
    if (configIndex !== -1 && itensExtras.length > 0) {
      items = [
        ...items.slice(0, configIndex),
        ...itensExtras,
        ...items.slice(configIndex),
      ];
    }
  } 
  // === TREINADOR ===
  else if (userType === "FUNCIONARIO" && role === "treinador") {
    items = [
      { icon: Home, label: "Meu Dashboard", href: "/treinador" },
      { icon: Calendar, label: "Planos de Treinos", href: "/treinador/plano-treino" },
      { icon: Users, label: "Marcar Presença", href: "/treinador/marcar-presenca" },
      { icon: Users, label: "Meus Alunos", href: "/treinador/meus-alunos" },
      { icon: MessageSquare, label: "Mensagens", href: "/treinador/mensagens" },
    ];

    if (aulasExtrasAtivas) {
      items.splice(4, 0, { icon: Trophy, label: "Aulas Extras", href: "/treinador/aulas-extras" });
    }
  }
  // === ALUNO ===
  else if (userType === "ALUNO") {
    items = [
      { icon: Home, label: "Meu Dashboard", href: "/dashboarduser/aluno-dashboard" },
      { icon: Trophy, label: "Meu Progresso", href: "/dashboarduser/aluno-dashboard/progresso" },
      { icon: BookOpen, label: "Treinos", href: "/dashboarduser/aluno-dashboard/treinos" },
      { icon: MessageSquare, label: "Mensagens", href: "/dashboarduser/aluno-dashboard/mensagens" },
    ];
  }
  // === RESPONSÁVEL ===
  else if (userType === "RESPONSAVEL") {
    items = [
      { icon: Home, label: "Meu Dashboard", href: "/dashboarduser/responsavel-dashboard" },
      { icon: Users, label: "Meus Filhos", href: "/dashboarduser/responsavel-dashboard/filhos" },
      { icon: DollarSign, label: "Pagamentos", href: "/dashboarduser/responsavel-dashboard/pagamentos" },
      { icon: MessageSquare, label: "Comunicados", href: "/dashboarduser/responsavel-dashboard/comunicados" },
    ];
  }
  // === CROSSFIT ===
  else if (userType === "CROSSFIT") {
    items = [
      { icon: Home, label: "Meu Dashboard", href: "/dashboarduser/crossfit-dashboard" },
      { icon: DollarSign, label: "Pagamentos", href: "/dashboarduser/crossfit-dashboard/pagamentos" },
    ];
  }
  // === SUPERADMIN ===
  else if (userType === "SUPERADMIN") {
    items = [
      { icon: Building2, label: "Escolinhas", href: "/superadmin/tenants" },
      { icon: UserPlus, label: "Criar Nova Escolinha", href: "/superadmin/tenants/novo" },
      { icon: DollarSign, label: "Pagamentos SaaS", href: "/superadmin/pagamentos" },
      { icon: BarChart3, label: "Relatórios Globais", href: "/superadmin/relatorios" },
      { icon: CreditCard, label: "Assinaturas", href: "/superadmin/assinaturas" },
      { icon: Settings, label: "Configurações SaaS", href: "/superadmin/configuracoes" },
      { icon: LifeBuoy, label: "Suporte", href: "/superadmin/suporte" },
    ];
  }

  // FUNÇÃO DE LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logout realizado com sucesso!", {
      description: "Você saiu da sua conta.",
    });
    router.push("/login");
  };

  return (
    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-slate-900 text-white lg:border-r lg:border-gray-200">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b border-gray-700">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            EDUPAY
          </h1>
        </div>

        {/* Menu */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <nav className="space-y-2">
            {items.map((item) => (
              <Button
                key={item.href}
                asChild
                variant={pathname.startsWith(item.href) ? "secondary" : "ghost"}
                className="w-full justify-start text-left font-medium hover:bg-slate-800"
              >
                <Link href={item.href}>
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Link>
              </Button>
            ))}
          </nav>
        </div>

        {/* Perfil + Logout */}
        <div className="border-t border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                {userName.split(" ").map((n) => n[0]).join("").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{userName}</p>
              <p className="text-xs text-gray-400">
                {role ? role.charAt(0).toUpperCase() + role.slice(1) : userType}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleLogout}
              className="text-gray-400 hover:text-white hover:bg-slate-800"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}