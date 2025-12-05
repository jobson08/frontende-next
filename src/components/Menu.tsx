"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  UserCheck,
  Building2,
  Settings,
  LogOut,
  User,
} from "lucide-react";
import { cn } from "../lib/utils";

type MenuGroup = {
  title: string;
  items: {
    href: string;
    label: string;
    icon: React.ElementType;
    roles: string[];
  }[];
};

const menuItems: MenuGroup[] = [
  {
    title: "MENU",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: Home, roles: ["SUPER_ADMIN", "ADMIN", "FUNCIONARIO", "ALUNO", "RESPONSAVEL"] },
      { href: "/dashboard/alunos", label: "Alunos", icon: Users, roles: ["ADMIN", "FUNCIONARIO"] },
      { href: "/dashboard/responsaveis", label: "Responsáveis", icon: UserCheck, roles: ["ADMIN", "FUNCIONARIO"] },
      { href: "/dashboard/tenants", label: "Tenants", icon: Building2, roles: ["SUPER_ADMIN"] },
    ],
  },
  {
    title: "CONTA",
    items: [
      { href: "/dashboard/perfil", label: "Perfil", icon: User, roles: ["SUPER_ADMIN", "ADMIN", "FUNCIONARIO", "ALUNO", "RESPONSAVEL"] },
      { href: "/dashboard/configuracoes", label: "Configurações", icon: Settings, roles: ["ADMIN", "SUPER_ADMIN"] },
      { href: "/auth/logout", label: "Sair", icon: LogOut, roles: ["SUPER_ADMIN", "ADMIN", "FUNCIONARIO", "ALUNO", "RESPONSAVEL"] },
    ],
  },
];

interface MenuProps {
  role: string;
}

export function Menu({ role }: MenuProps) {
  const pathname = usePathname();

  return (
    <div className="space-y-8">
      {menuItems.map((group) => (
        <div key={group.title}>
          <span className="block px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
            {group.title}
          </span>

          <div className="mt-3 space-y-1">
            {group.items
              .filter((item) => item.roles.includes(role))
              .map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all",
                      isActive
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}