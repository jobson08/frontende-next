// src/components/layout/Sidebar.tsx
"use client";

import { Menu } from "./Menu";
import { BarChart3, Building2, Clock, CreditCard, LifeBuoy, Shield, UserPlus } from "lucide-react";
import {
  Home,
  Users,
  User,
  Calendar,
  DollarSign,
  Settings,
  LogOut,
  Trophy,
  BookOpen,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import { Avatar } from "@radix-ui/react-avatar";
import { AvatarFallback } from "../ui/avatar";

type UserType = "ADMIN" | "ALUNO" | "RESPONSAVEL" | "FUNCIONARIO" | "SUPERADMIN";

interface SidebarProps {
  userType: UserType;
  userName: string;
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
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: Users, label: "Alunos", href: "/aluno" },
    { icon: User, label: "Responsáveis", href: "/responsavel" },
    { icon: Users, label: "Funcionários", href: "/funcionario" },
    { icon: DollarSign, label: "Financeiro", href: "/financeiro" },
    { icon: Settings, label: "Configurações", href: "/configuracoes" },
  ],
  ALUNO: [
    { icon: Home, label: "Meu Dashboard", href: "/aluno" },
    { icon: Calendar, label: "Minhas Aulas", href: "/aluno/aulas" },
    { icon: Trophy, label: "Meu Progresso", href: "/aluno/progresso" },
    { icon: BookOpen, label: "Treinos", href: "/aluno/treinos" },
    { icon: MessageSquare, label: "Mensagens", href: "/aluno/mensagens" },
  ],
  RESPONSAVEL: [
    { icon: Home, label: "Meu Dashboard", href: "/responsavel" },
    { icon: Users, label: "Meus Filhos", href: "/responsavel/filhos" },
    { icon: Calendar, label: "Aulas dos Filhos", href: "/responsavel/aulas" },
    { icon: DollarSign, label: "Pagamentos", href: "/responsavel/pagamentos" },
    { icon: MessageSquare, label: "Comunicados", href: "/responsavel/comunicados" },
  ],
  FUNCIONARIO: [
    { icon: Home, label: "Meu Dashboard", href: "/funcionario" },
    { icon: Calendar, label: "Minhas Aulas", href: "/funcionario/aulas" },
    { icon: Users, label: "Meus Alunos", href: "/funcionario/alunos" },
    { icon: Clock, label: "Horário", href: "/funcionario/horario" },
    { icon: MessageSquare, label: "Mensagens", href: "/funcionario/mensagens" },
  ],
};

export function Sidebar({ userType, userName }: SidebarProps) {
const pathname = usePathname();

  const items = menuItems[userType];

  return (
 <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-slate-900 text-white lg:border-r lg:border-gray-200">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            EDUPAY
          </h1>
        </div>

        {/* Menu com scroll nativo — SEM ScrollArea! */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <nav className="space-y-2">
            {items.map((item) => (
              <Button
                key={item.href}
                asChild
                variant={pathname === item.href ? "secondary" : "ghost"}
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
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
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