"use client";

import { Menu } from "./Menu";
import { Shield } from "lucide-react";

export function Sidebar() {
  // Depois vem do useAuth
  const userRole = "ADMIN";

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-slate-900 text-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-slate-800">
        <Shield className="h-8 w-8 text-blue-500" />
        <span className="text-xl font-bold">Meu SaaS</span>
      </div>

      {/* Menu */}
      <div className="flex-1 overflow-y-auto py-6 px-3">
        <Menu role={userRole} />
      </div>

      {/* Footer (opcional) */}
      <div className="p-4 border-t border-slate-800 text-center text-xs text-slate-400">
        © 2025 Todos os direitos reservados
      </div>
    </aside>
  );
}