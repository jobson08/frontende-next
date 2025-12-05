// src/components/layout/MobileMenu.tsx
"use client";

//import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";

export function MobileMenu() {
  return (
    <Sheet>
      <SheetTrigger className="lg:hidden">
        <Menu className="w-6 h-6" />
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64">
        <Sidebar />
      </SheetContent>
    </Sheet>
  );
}