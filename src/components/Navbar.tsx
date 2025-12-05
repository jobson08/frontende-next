"use client";

//import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MobileMenu } from "./MobileMenu";
import { LogOut, Settings, User } from "lucide-react";

export function Navbar() {
  // Simulação — depois vem do useAuth
  const user = {
    name: "João Silva",
    email: "joao@academia.com",
    role: "ADMIN", // SUPER_ADMIN | ADMIN | FUNCIONARIO | ALUNO | RESPONSAVEL
  };

  const roleLabel = {
    SUPER_ADMIN: "Super Admin",
    ADMIN: "Administrador",
    FUNCIONARIO: "Funcionário",
    ALUNO: "Aluno",
    RESPONSAVEL: "Responsável",
  }[user.role];

  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <div className="flex h-16 items-center justify-between px-4 lg:px-8">
        {/* Mobile Menu */}
        <MobileMenu />

        {/* Right Side */}
        <div className="flex items-center gap-4">
          <span className="hidden text-sm font-medium text-gray-600 sm:block">
            {roleLabel}
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-3 rounded-full focus:outline-none">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-blue-600 text-white text-sm font-medium">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
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