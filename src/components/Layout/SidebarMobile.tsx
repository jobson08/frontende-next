// src/components/layout/SidebarMobile.tsx
"use client";

import { Shield } from "lucide-react";
import { Menu } from "./Menu";

export function SidebarMobile() {
  return (
    <div className="flex flex-col w-64 bg-slate-900 text-white h-full">
      <div className="flex h-16 items-center gap-3 px-6 border-b border-slate-800">
        <Shield className="h-8 w-8 text-blue-500" />
        <span className="text-xl font-bold">Meu SaaS</span>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-3">
        <Menu role="ADMIN" />
      </div>
    </div>
  );
}