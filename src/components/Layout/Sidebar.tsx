// src/components/layout/Sidebar.tsx (atualizado para treinador)
"use client";

import { BarChart3, Building2, Clock, CreditCard, LifeBuoy, UserPlus, Trophy, Activity, Star } from "lucide-react";
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

type UserType = "ADMIN" | "ALUNO" | "RESPONSAVEL" | "FUNCIONARIO" | "SUPERADMIN" | "CROSSFIT";

interface SidebarProps {
  userType: UserType;
  userName: string;
  // Props para módulos extras
  aulasExtrasAtivas?: boolean;
  crossfitAtivo?: boolean;
  // Novo prop: role do funcionário (treinador, administrativo, etc)
  role?: string; // ou "treinador" | "admin" | "administrativo" | undefined
}

export function Sidebar({ 
  userType, 
  userName, 
  aulasExtrasAtivas = false, 
  crossfitAtivo = false,
  role // ← pode vir do login ou contexto
}: SidebarProps) {
  const pathname = usePathname();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let items: Array<{ icon: any; label: string; href: string }> = [];

  // === ADMIN (DONO DA ESCOLINHA) ===
  if (userType === "ADMIN" || (userType === "FUNCIONARIO" && role === "admin")) {
  // MENU COMPLETO DO ADMIN
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

  // Itens extras (aula extra e crossfit)
  const itensExtras = [];
  if (aulasExtrasAtivas) {
    itensExtras.push({ icon: Trophy, label: "Aulas Extras", href: "/aulas-extras" });
  }
  if (crossfitAtivo) {
    itensExtras.push({ icon: Activity, label: "CrossFit Adultos", href: "/crossfit" });
  }

  const configIndex = items.findIndex(item => item.label === "Configurações");
  if (configIndex !== -1 && itensExtras.length > 0) {
    items = [
      ...items.slice(0, configIndex),
      ...itensExtras,
      ...items.slice(configIndex),
    ];
  }
} 
  // === TREINADOR (FUNCIONÁRIO COM ROLE "treinador") ===
  else if (userType === "FUNCIONARIO" && role === "treinador") {
    items = [
      { icon: Home, label: "Meu Dashboard", href: "/treinador" },
      { icon: Calendar, label: "Planos de Treinos", href: "/treinador/plano-treino" },
      { icon: Users, label: "Marcar Presença", href: "/treinador/marcar-presenca" },
      //{ icon: Star, label: "Avaliar Alunos", href: "/treinador/avaliar-aluno" },
      { icon: Users, label: "Meus Alunos", href: "/treinador/meus-alunos" },
      { icon: MessageSquare, label: "Mensagens", href: "/treinador/mensagens" },
    ];

    // Aula extra só aparece se ativada
    if (aulasExtrasAtivas) {
      items.splice(4, 0, { icon: Trophy, label: "Aulas Extras", href: "/treinador/aulas-extras" });
    }
  }

  // === OUTROS TIPOS (ALUNO, RESPONSÁVEL, CROSSFIT, etc) ===
  else if (userType === "ALUNO") {
    items = [
      { icon: Home, label: "Meu Dashboard", href: "/dashboarduser/aluno-dashboard" },
      { icon: Trophy, label: "Meu Progresso", href: "/dashboarduser/aluno-dashboard/progresso" },
      { icon: BookOpen, label: "Treinos", href: "/dashboarduser/aluno-dashboard/treinos" },
      { icon: MessageSquare, label: "Mensagens", href: "/dashboarduser/aluno-dashboard/mensagens" },
    ];
  }
  else if (userType === "RESPONSAVEL") {
    items = [
      { icon: Home, label: "Meu Dashboard", href: "/dashboarduser/responsavel-dashboard" },
      { icon: Users, label: "Meus Filhos", href: "/dashboarduser/responsavel-dashboard/filhos" },
      { icon: DollarSign, label: "Pagamentos", href: "/dashboarduser/responsavel-dashboard/pagamentos" },
      { icon: MessageSquare, label: "Comunicados", href: "/dashboarduser/responsavel-dashboard/comunicados" },
    ];
  }
  else if (userType === "CROSSFIT") {
    items = [
      { icon: Home, label: "Meu Dashboard", href: "/dashboarduser/crossfit-dashboard" },
      { icon: DollarSign, label: "Pagamentos", href: "/dashboarduser/crossfit-dashboard/pagamentos" },
    ];
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

        {/* Perfil */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className="bg-linear-to-r from-blue-600 to-purple-600 text-white">
                {userName.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-gray-500">
                {role ? role.charAt(0).toUpperCase() + role.slice(1) : userType}
              </p>
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