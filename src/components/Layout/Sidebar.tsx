/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/layout/Sidebar.tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
//import { toast } from "sonner";

import {
  Home,
  Users,
  User,
  Calendar,
  DollarSign,
  Settings,
  LogOut,
  MessageSquare,
  Trophy,
  Activity,

  ChartSpline,
} from "lucide-react";

import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { useAuth } from "@/src/hooks/useAuth";
import { useEscolinhaConfig } from "@/src/context/EscolinhaConfigContext";

type UserType = "ADMIN" | "SUPERADMIN" | "ALUNO" | "RESPONSAVEL" | "FUNCIONARIO" | "CROSSFIT";

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

export function Sidebar({ userType, userName, role }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  

  // HOOK SEMPRE NO TOPO - nunca condicional
  const { config } = useEscolinhaConfig();

  const menuKey = JSON.stringify(config);

  // Valores seguros com fallback
  const aulasExtrasAtivas = config?.aulasExtrasAtivas ?? false;
  const crossfitAtivo = config?.crossfitAtivo ?? false;

  // Log para debug (opcional, remova depois)
  console.log('SIDEBAR - Valores do contexto:', { aulasExtrasAtivas, crossfitAtivo });

  let items: MenuItem[] = [];

  // Agora usa os valores dentro do if (sem chamar hook aqui)
  if (userType === "ADMIN" || (userType === "FUNCIONARIO" && role === "admin")) {
    const baseItems = [
      { icon: Home, label: "Dashboard", href: "/admin" },
      { icon: Users, label: "Alunos Futebol", href: "/aluno" },
      { icon: User, label: "Responsáveis", href: "/responsavel" },
      { icon: Users, label: "Funcionários", href: "/funcionario" },
      { icon: Users, label: "Treinador", href: "/treinador" },
      { icon: Calendar, label: "Treinos", href: "/treinos" },
      { icon: ChartSpline, label: "Financeiro", href: "/financeiro" },
      { icon: DollarSign, label: "Inadimplentes", href: "/inadimplentes" },
    ];

    const extraItems = [];

    if (aulasExtrasAtivas) {
      extraItems.push({ icon: Trophy, label: "Aulas Extras", href: "/aulasExtras" });
    }

    if (crossfitAtivo) {
      extraItems.push({ icon: Activity, label: "CrossFit Adultos", href: "/crossfit" });
    }

    items = [
      ...baseItems,
      ...extraItems,
      { icon: Settings, label: "Configurações", href: "/configuracoes" },
    ];

    console.log('Sidebar ADMIN montada:', items.map(i => i.label));
  }

  // === TREINADOR ===
  else if (userType === "FUNCIONARIO" && (role === "treinador" || role === "TREINADOR")) {
  items = [
    { icon: Home, label: "Meu Dashboard", href: "/treinador" },
    { icon: Calendar, label: "Meus Treinos", href: "/treinos" },
    { icon: Users, label: "Meus Alunos", href: "/treinador/meus-alunos" },
    { icon: Users, label: "Marcar Presença", href: "/treinador/marcar-presenca" },
    { icon: MessageSquare, label: "Mensagens", href: "/treinador/mensagens" },
  ];

    // Aulas Extras para treinador (se ativado)
    if (aulasExtrasAtivas) {
      items.splice(4, 0, { icon: Trophy, label: "Aulas Extras", href: "/treinador/aulas-extras" });
    }
    items.push({ icon: MessageSquare, label: "Mensagens", href: "/treinador/mensagens" });
  }

  return (
    <div key={menuKey} className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-slate-900 text-white lg:border-r lg:border-gray-200">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b border-gray-700">
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

        {/* Perfil + Logout */}
        <div className="border-t border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className="bg-linear-to-r from-blue-600 to-purple-600 text-white">
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