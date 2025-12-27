// src/components/layout/Sidebar.tsx
"use client";

import { BarChart3, Building2, Clock, CreditCard, LifeBuoy, UserPlus, Trophy, Activity } from "lucide-react";
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

type UserType = "ADMIN" | "ALUNO" | "RESPONSAVEL" | "FUNCIONARIO" |  "SUPERADMIN" | "CROSSFIT";

interface SidebarProps {
  userType: UserType;
  userName: string;
  // Novos props para controlar os módulos extras
  aulasExtrasAtivas?: boolean;
  crossfitAtivo?: boolean;
}

const menuItems = {
  SUPERADMIN: [
    { icon: Home, label: "Dashboard Global", href: "/superadmin" },
    { icon: Building2, label: "Escolinhas", href: "/superadmin/tenants" },
    { icon: UserPlus, label: "Criar Nova Escolinha", href: "/superadmin/tenants/novo" },
    { icon: DollarSign, label: "Pagamentos SaaS", href: "/superadmin/pagamentos" },
    { icon: BarChart3, label: "Relatórios Globais", href: "/superadmin/relatorios" },
    { icon: CreditCard, label: "Assinaturas", href: "/superadmin/assinaturas" },
    { icon: Settings, label: "Configurações SaaS", href: "/superadmin/configuracoes" },
    { icon: LifeBuoy, label: "Suporte", href: "/superadmin/suporte" },
  ],
  ADMIN: [
    { icon: Home, label: "Dashboard", href: "/admin" },
    { icon: Users, label: "Alunos", href: "/alunos" },
    { icon: User, label: "Responsáveis", href: "/responsavel" },
    { icon: Users, label: "Funcionários", href: "/funcionario" },
    { icon: Calendar, label: "Treinos", href: "/treinos" },
    { icon: DollarSign, label: "Financeiro", href: "/financeiro" },
    { icon: DollarSign, label: "Inadimplentes", href: "/iadimplentes" },
    { icon: Settings, label: "Configurações", href: "/configuracoes" },
  ],
  ALUNO: [
    { icon: Home, label: "Meu Dashboard", href: "/dashboarduser/aluno-dashboard" },
    { icon: Trophy, label: "Meu Progresso", href: "/dashboarduser/aluno-dashboard/progresso" },
    { icon: BookOpen, label: "Treinos", href: "/dashboarduser/aluno-dashboard/treinos" },
    { icon: MessageSquare, label: "Mensagens", href: "/dashboarduser/aluno-dashboard/mensagens" },
  ],
  RESPONSAVEL: [
    { icon: Home, label: "Meu Dashboard", href: "/dashboarduser/responsavel-dashboard" },
    { icon: Users, label: "Meus Filhos", href: "/dashboarduser/responsavel-dashboard/filhos" },
    { icon: DollarSign, label: "Pagamentos", href: "/dashboarduser/responsavel-dashboard/pagamentos" },
    { icon: MessageSquare, label: "Comunicados", href: "/dashboarduser/responsavel-dashboard/comunicados" },
  ],
  FUNCIONARIO: [
    { icon: Home, label: "Meu Dashboard", href: "/dashboarduser/funcionario-dashboard" },
    { icon: Calendar, label: "Minhas Aulas", href: "/dashboarduser/funcionario-dashboard/aulas" },
    { icon: Users, label: "Meus Alunos", href: "/dashboarduser/funcionario-dashboard/alunos" },
    { icon: Clock, label: "Horário", href: "/dashboarduser/funcionario-dashboard/horario" },
    { icon: MessageSquare, label: "Mensagens", href: "/dashboarduser/funcionario-dashboard/mensagens" },
  ],
  CROSSFIT:[
    { icon: Home, label: "Meu Dashboard", href: "/dashboarduser/crossfit-dashboard" },
    { icon: DollarSign, label: "Pagamentos", href: "/dashboarduser/crossfit-dashboard/pagamentos" },
  ],
};

export function Sidebar({ userType, userName, aulasExtrasAtivas = false, crossfitAtivo = false }: SidebarProps) {
  const pathname = usePathname();

  let items = menuItems[userType];

  // Se for ADMIN, adiciona os itens extras condicionalmente
  if (userType === "ADMIN") {
    const itensExtras = [];

    if (aulasExtrasAtivas) {
      itensExtras.push({ icon: Trophy, label: "Aulas Extras", href: "/aulas-extras" });
    }

    if (crossfitAtivo) {
      itensExtras.push({ icon: Activity, label: "CrossFit Adultos", href: "/crossfit" });
    }

    // Insere os itens extras antes das Configurações
    const configuracoesIndex = items.findIndex(item => item.label === "Configurações");
    if (configuracoesIndex !== -1) {
      items = [
        ...items.slice(0, configuracoesIndex),
        ...itensExtras,
        ...items.slice(configuracoesIndex),
      ];
    } else {
      items = [...items, ...itensExtras];
    }
  }

  return (
    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-slate-900 text-white lg:border-r lg:border-gray-200">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <h1 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            EDUPAY
          </h1>
        </div>

        {/* Menu com scroll nativo */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <nav className="space-y-2">
            {items.map((item) => (
              <Button
                key={item.href}
                asChild
                variant={pathname.startsWith(item.href) ? "secondary" : "ghost"} // melhor pra sub-rotas
                className="w-full justify-start text-left font-medium"
              >
                <Link href={item.href}>
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Link>
              </Button>
            ))}
          </nav>
        </div>

        {/* Perfil do usuário */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className="bg-linear-to-r from-blue-600 to-purple-600 text-white">
                {userName.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-gray-500">{userType}</p>
            </div>
            <Button variant="ghost" size="icon">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}