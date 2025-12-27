// src/components/layout/Navbar.tsx (atualizado)
"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/src/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "@/src/components/ui/badge";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BarChart3, BookOpen, Building2, Calendar, Clock, CreditCard, DollarSign, Home, 
  LifeBuoy, LogOut, Menu, MessageSquare, Settings, Trophy, User, UserPlus, Users, 
  Bell, Activity  // ← Adicionado Activity para CrossFit
} from "lucide-react";

interface NavbarProps {
  userType: "ADMIN" | "SUPERADMIN" | "ALUNO" | "RESPONSAVEL" | "FUNCIONARIO";
  user: {
    name: string;
    email: string;
  };
  inadimplentesCount?: number;
  // Novos props para módulos extras
  aulasExtrasAtivas?: boolean;
  crossfitAtivo?: boolean;
}

const Header = ({ 
  userType, 
  user, 
  inadimplentesCount = 0,
  aulasExtrasAtivas = false,
  crossfitAtivo = false 
}: NavbarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Menu base para ADMIN
  let items = [
    { icon: Home, label: "Admin", href: "/admin" },
    { icon: Users, label: "Alunos", href: "/aluno" },
    { icon: User, label: "Responsáveis", href: "/responsavel" },
    { icon: Users, label: "Funcionários", href: "/funcionario" },
    { icon: Calendar, label: "Treinos", href: "/treinos" },
    { icon: DollarSign, label: "Financeiro", href: "/financeiro" },
    { icon: Settings, label: "Configurações", href: "/configuracoes" },
  ];

  // Adiciona itens condicionais para ADMIN
  if (userType === "ADMIN") {
    const itensExtras = [];

    if (aulasExtrasAtivas) {
      itensExtras.push({ icon: Trophy, label: "Aulas Extras", href: "/aulas-extras" });
    }

    if (crossfitAtivo) {
      itensExtras.push({ icon: Activity, label: "CrossFit Adultos", href: "/crossfit" });
    }

    // Insere antes das Configurações
    const configIndex = items.findIndex(item => item.label === "Configurações");
    if (configIndex !== -1) {
      items = [
        ...items.slice(0, configIndex),
        ...itensExtras,
        ...items.slice(configIndex),
      ];
    } else {
      items = [...items, ...itensExtras];
    }
  }

  const isAdmin = userType === "ADMIN";

  return ( 
    <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 lg:px-8">
        {/* MOBILE MENU */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon-lg" className="lg:hidden">
              <Menu className="h-6 w-6 text-gray-800" />
              <span className="sr-only">Abrir menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 bg-white">
            <div className="flex flex-col h-full">
              {/* LOGO */}
              <div className="flex items-center justify-center h-16 border-b border-gray-200">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  EDUPAY
                </h1>
              </div>

              {/* MENU MOBILE — COM ITENS DINÂMICOS */}
              <nav className="flex-1 overflow-y-auto py-4">
                <div className="px-3 space-y-1">
                  {items.map((item) => (
                    <Button
                      key={item.href}
                      asChild
                      variant={pathname === item.href || pathname.startsWith(item.href) ? "secondary" : "ghost"}
                      className="w-full justify-start h-11"
                      onClick={() => setMobileOpen(false)}
                    >
                      <Link href={item.href}>
                        <item.icon className="mr-3 h-5 w-5 text-gray-700" />
                        <span className="text-gray-900">{item.label}</span>
                      </Link>
                    </Button>
                  ))}
                </div>
              </nav>

              {/* PERFIL NO FINAL */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                      {user.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500">{userType}</p>
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* LOGO CENTRAL */}
        <div className="flex items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            EDUPAY
          </h1>
        </div>

        {/* DIREITA: NOTIFICAÇÕES + AVATAR */}
        <div className="flex items-center gap-4">
          {/* SINO COM BADGE — SÓ PARA ADMIN */}
          {isAdmin && (
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link href="/inadimplentes">
                <Bell className="h-5 w-5 text-gray-700" />
                {inadimplentesCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-600 text-white">
                    {inadimplentesCount > 99 ? "99+" : inadimplentesCount}
                  </Badge>
                )}
                <span className="sr-only">Inadimplentes pendentes</span>
              </Link>
            </Button>
          )}

          {/* AVATAR DROPDOWN */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-3 rounded-full focus:outline-none">
              <Avatar className="h-9 w-9 ring-2 ring-offset-2 ring-purple-400">
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-sm font-medium">
                  {user.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header> 
  );
}

export default Header;