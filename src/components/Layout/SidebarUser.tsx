/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/layout/Sidebar.tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

import {
  Home,
  Users,
  DollarSign,
  Settings,
  LogOut,
  BookOpen,
  MessageSquare,
  Trophy,
  Building2,
  BarChart3,
  UserPlus,
  CreditCard,
  LifeBuoy,
} from "lucide-react";

import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { useAuth } from "@/src/hooks/useAuth";


type UserType = "SUPERADMIN" | "ALUNO_FUTEBOL" | "ALUNO_CROSSFIT" | "RESPONSAVEL" ;

interface MenuItem {
  icon: any; // LucideIcon
  label: string;
  href: string;
}

interface SidebarProps {
  userType: UserType;
  userName: string;
  role?: string; // "treinador", "admin", "administrativo", etc.
}

export function SidebarUser({ userType, userName, role }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  // Pega as configurações reais do contexto (vindas do backend)
  //const { aulasExtrasAtivas, crossfitAtivo } = useEscolinhaConfig();

  let items: MenuItem[] = [];
  // === SUPERADMIN ===
  if (userType === "SUPERADMIN") {
    items = [
      { icon: Home, label: "Dashboard", href: "/superadmin" },
      { icon: Building2, label: "Escolinhas", href: "/superadmin/tenants" },
      { icon: UserPlus, label: "Criar Nova Escolinha", href: "/superadmin/tenants/novo" },
      { icon: DollarSign, label: "Pagamentos SaaS", href: "/superadmin/pagamentos" },
      { icon: CreditCard, label: "Assinaturas", href: "/superadmin/assinaturas" },
      { icon: BarChart3, label: "Relatórios Globais", href: "/superadmin/relatorios" },
      { icon: Settings, label: "Configurações SaaS", href: "/superadmin/configuracoes" },
      { icon: LifeBuoy, label: "Suporte", href: "/superadmin/suporte" },
    ];
  }

  // === ALUNO FUTEBOL ===
 else if (userType === "ALUNO_FUTEBOL") {
    items = [
      { icon: Home, label: "Meu Dashboard", href: "/dashboarduser/aluno-futebol" },
      { icon: Trophy, label: "Meu Progresso", href: "/dashboarduser/aluno-futebol/progresso" },
      { icon: BookOpen, label: "Treinos", href: "/dashboarduser/aluno-futebol/treinos" },
      { icon: MessageSquare, label: "Mensagens", href: "/dashboarduser/aluno-futebol/mensagens" },
    ];
  }

 // === ALUNO CROSSFIT ===
  else if (userType === "ALUNO_CROSSFIT") {
    items = [
      { icon: Home, label: "Meu Dashboard", href: "/dashboarduser/aluno-crossfit" },
      { icon: DollarSign, label: "Pagamentos", href: "/dashboarduser/aluno-crossfit/pagamentos" },
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
              onClick={logout}
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