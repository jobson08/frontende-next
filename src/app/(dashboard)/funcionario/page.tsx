// src/app/(dashboard)/funcionarios/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { Mail, Phone, Search, Shield, UserPlus } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import CreateLoginModal from "@/src/components/common/CreateLoginModal";
interface Funcionario {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  role: "PROFESSOR" | "RECEPCAO" | "ADMINISTRATIVO" | "TREINADOR" | "GERENTE";
  status: "ATIVO" | "INATIVO";
  temLogin: boolean;
}

const funcionariosMock: Funcionario[] = [
  { id: "1", name: "Mariana Costa", phone: "11999998888", email: "mariana@academia.com", role: "PROFESSOR", status: "ATIVO", temLogin: true },
  { id: "2", name: "Rafael Lima", phone: "11988887777", email: "rafael@academia.com", role: "TREINADOR", status: "ATIVO", temLogin: true },
  { id: "3", name: "Beatriz Souza", phone: "11977776666", email: null, role: "RECEPCAO", status: "ATIVO", temLogin: false },
];
const FuncionariosPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [openModalId, setOpenModalId] = useState<string | null>(null);

  const filtered = funcionariosMock.filter(f =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.phone.includes(searchTerm) ||
    f.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  //const funcionaioSelecionado = filtered.find(r => r.id === openModalId);

    return ( 
     <div className="space-y-6 p-4 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Funcionários</h1>
          <p className="text-gray-600">Gerencie a equipe da sua academia</p>
        </div>
        <Button asChild className="bg-linear-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
          <Link href="/funcionario/novo">
            <UserPlus className="mr-2 h-4 w-4" />
            Novo Funcionário
          </Link>
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar por nome, telefone ou e-mail..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((f) => (
          <Card key={f.id} className="hover:shadow-xl transition-shadow border-orange-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-14 w-14 ring-4 ring-orange-100">
                    <AvatarFallback className="bg-linear-to-br from-orange-600 to-red-600 text-white font-bold">
                      {f.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl">{f.name}</CardTitle>
                    <Badge variant="outline" className="mt-1">
                      {f.role}
                    </Badge>
                  </div>
                </div>
                <Badge variant={f.status === "ATIVO" ? "default" : "secondary"}>
                  {f.status}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-gray-500" />
                {f.phone}
              </div>
              {f.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-500" />
                  {f.email}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-gray-500" />
                {f.temLogin ? "Tem acesso ao sistema" : "Sem acesso"}
              </div>

              <div className="pt-4 flex gap-2">
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/funcionario/${f.id}`}>
                    Ver detalhes
                  </Link>
                </Button>
                {!f.temLogin ? (
                            <Button
                  size="sm"
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium shadow-lg"
                  onClick={() => setOpenModalId(f.id)}
                >
                  Criar login
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-orange-500 text-orange-600 hover:bg-orange-50"
                  onClick={() => setOpenModalId(f.id)}
                >
                  Editar login
                </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* MODAL FORA DO CARD */}
        {openModalId && (
        <CreateLoginModal
          name={funcionariosMock.find(f => f.id === openModalId)?.name || ""}
          currentEmail={funcionariosMock.find(f => f.id === openModalId)?.email || null}
          open={!!openModalId}
          onOpenChange={(open) => !open && setOpenModalId(null)}
        />
      )}
    </div>
     );
}
 
export default FuncionariosPage;