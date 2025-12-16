// src/components/layout/MobileMenu.tsx
"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/src/components/ui/sheet";
import { Menu as MenuIcon, Shield } from "lucide-react";
import { Menu } from "./Menu";

export function MobileMenu() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="lg:hidden p-2 rounded-md hover:bg-gray-100">
          <MenuIcon className="h-6 w-6" />
          <span className="sr-only">Abrir menu</span>
        </button>
      </SheetTrigger>

      <SheetContent side="left" className="w-64 p-0 bg-slate-900">
        <div className="flex h-16 items-center gap-3 px-6 border-b border-slate-800">
          <Shield className="h-8 w-8 text-blue-500" />
          <span className="text-xl font-bold text-white">Meu SaaS</span>
        </div>

        <div className="py-6 px-3">
          <Menu role="SUPERADMIN" />
        </div>
      </SheetContent>
    </Sheet>
  );
}