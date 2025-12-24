"use client";

import CreateLoginPopup from "@/src/components/common/CreateLoginPopup";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Mail, Phone, Search, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// Função pra formatar telefone (opcional, deixa bonito)
const formatarTelefone = (phone: string) => {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
};

interface Responsavel {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf?: string;
  observations?: string;
}

const responsaveisMock: Responsavel[] = [
 { id: "1", name: "Maria Oliveira Santos", email: "maria@email.com", phone: "11988887777" },
  { id: "2", name: "João Pedro Costa", email: "joao@email.com", phone: "11977778888" },
  { id: "3", name: "Ana Clara Lima", email: "ana@email.com", phone: "11966667777" },
  { id: "4", name: "Juliana Souza", email: "juliana@email.com", phone: "11955556666" },
  { id: "5", name: "Márcia Lima", email: "marcia@email.com", phone: "11944445555" },
];

const ResponsavelPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = responsaveisMock.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.phone.includes(searchTerm) ||
    r.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );


    return ( 
      <div className="space-y-6 p-4 lg:p-8">
        {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Responsáveis</h1>
          <p className="text-gray-600">Gerencie os responsáveis pelos alunos</p>
        </div>
        <Button asChild className="bg-blue-600 hover:bg-blue-700">
          <Link href="/responsavel/novo">
            <UserPlus className="mr-2 h-4 w-4" />
            Novo Responsável
          </Link>
        </Button>
      </div>
      {/* Busca */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar por nome, telefone ou e-mail..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      {/* Grid de Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((r) => (
          <Card key={r.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              
               {/* Badge fixo: todos têm login agora */}
             {/*  <div className="pt-2">
                 
                <Badge className="text-xs bg-green-600 text-white">
                  Tem login
                </Badge>
                </div>*/}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-purple-600 text-white">
                      {r.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-lg">{r.name}</CardTitle>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-gray-500" />
                {formatarTelefone(r.phone)}
              </div>
              {r.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-500" />
                  {r.email}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-gray-500" />
                {r.alunos} aluno{r.alunos > 1 ? "s" : ""}
              </div>

              <div className="pt-4 flex gap-2">
               {/* BOTÃO VER DETALHE */}
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/responsavel/${r.id}`}>
                    Ver detalhes
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
     );
}
 
export default ResponsavelPage;