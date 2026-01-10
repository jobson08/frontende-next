// src/app/layout.tsx (Server Component - versão mínima)
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FutElite",
  description: "Plataforma de Escolinhas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}