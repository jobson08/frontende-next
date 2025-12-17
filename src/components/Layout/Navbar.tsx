"use client";

import { BarChart3, BookOpen, Building2, Calendar, Clock, CreditCard, DollarSign, Home, LifeBuoy, LogOut, Menu, MessageSquare, Settings, Trophy, User, UserPlus, Users } from "lucide-react";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { DropdownMenu, DropdownMenuContent } from "../ui/dropdown-menu";
import { DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";



interface NavbarProps {
  userType: "ADMIN" | "SUPERADMIN" | "ALUNO" | "RESPONSAVEL" | "FUNCIONARIO";
  user: {
    name: string;
    email: string;
  };
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
    { icon: Home, label: "Admin", href: "/admin" },
    { icon: Users, label: "Alunos", href: "/aluno" },
    { icon: User, label: "Responsáveis", href: "/responsavel" },
    { icon: Users, label: "Funcionarios", href: "/funcionario" },
    { icon: Calendar, label: "Treinos", href: "/treinos" },
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
export function Navbar({ userType, user }: NavbarProps) {
  // Simulação — depois vem do useAuth
const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const items = menuItems[userType] || [];

  return (
<header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 lg:px-8">
        {/* MOBILE MENU */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-6 w-6 text-gray-800" />
              <span className="sr-only">Abrir menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 bg-white">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-center h-16 border-b border-gray-200">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    EDUPAY
                  </h1>
              </div>

              <nav className="flex-1 overflow-y-auto py-4">
                <div className="px-3 space-y-1">
                  {items.map((item) => (
                    <Button
                      key={item.href}
                      asChild
                      variant={pathname === item.href ? "secondary" : "ghost"}
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

              <div className="border-t border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-br from-green-600 to-emerald-600 text-white">
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

        {/* LOGO */}
       <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            EDUPAY
          </h1>
       </div>

        {/* AVATAR DROPDOWN */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-3 rounded-full focus:outline-none">
            <Avatar className="h-9 w-9 ring-2 ring-offset-2 ring-green-600">
              <AvatarFallback className="bg-gradient-to-br from-green-600 to-emerald-600 text-white text-sm font-medium">
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
    </header>
  );
}