// src/components/layout/SidebarMobile.tsx
"use client";

import { Shield } from "lucide-react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { Sidebar } from "./Sidebar";
import { useState } from "react";

interface MobileSidebarProps {
  userType: "ADMIN" | "SUPERADMIN" | "ALUNO" | "RESPONSAVEL" | "FUNCIONARIO";
  userName: string;
}
export function SidebarMobile({ userType, userName }: MobileSidebarProps) {   //Inicio da função

  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50 bg-white shadow-lg rounded-full">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64 bg-slate-900 text-white lg:border-r lg:border-gray-200">
        <Sidebar userType={userType} userName={userName} />
      </SheetContent>
    </Sheet>
  );
}