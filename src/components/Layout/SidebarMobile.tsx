// src/components/layout/SidebarMobile.tsx
"use client";

import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { Sidebar } from "./Sidebar";
import { useState } from "react";

interface MobileSidebarProps {
  userType: "ADMIN" | "SUPERADMIN" | "ALUNO" | "RESPONSAVEL" | "FUNCIONARIO" | "CROSSFIT";
  userName: string;
  // Novos props para os módulos extras
  aulasExtrasAtivas?: boolean;
  crossfitAtivo?: boolean;
}

export function SidebarMobile({ 
  userType, 
  userName, 
  aulasExtrasAtivas = false, 
  crossfitAtivo = false 
}: MobileSidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* BOTÃO HAMBURGER — VISÍVEL NO MOBILE */}
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 bg-white shadow-lg rounded-full lg:hidden hover:bg-gray-100"
        >
          <Menu className="h-6 w-6 text-gray-800" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </SheetTrigger>

      {/* DRAWER MOBILE — PASSANDO OS PROPS PARA A SIDEBAR */}
      <SheetContent 
        side="left" 
        className="p-0 w-64 bg-white border-r border-gray-200 overflow-hidden"
      >
        <div className="h-full flex flex-col">
          <Sidebar 
            userType={userType} 
            userName={userName}
            aulasExtrasAtivas={aulasExtrasAtivas}
            crossfitAtivo={crossfitAtivo}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}