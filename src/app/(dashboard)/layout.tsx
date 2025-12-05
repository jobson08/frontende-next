//import Navbar from "@/src/components/Navbar";
import Link from "next/link";
import Image from "next/image"
import { Sidebar } from "@/src/components/Sidebar";
import { Navbar } from "@/src/components/Navbar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
     <div className="flex h-screen bg-gray-50">
      {/* Sidebar Desktop */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-64">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}