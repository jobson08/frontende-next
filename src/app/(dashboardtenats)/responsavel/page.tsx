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


interface Responsavel {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  alunos: number;
  temLogin: boolean;
}

const responsaveisMock: Responsavel[] = [
  { id: "1", name: "Ana Clara Santos", phone: "11988887777", email: "ana@gmail.com", alunos: 2, temLogin: true },
  { id: "2", name: "Carlos Oliveira", phone: "11977778888", email: null, alunos: 1, temLogin: false },
  { id: "3", name: "Juliana Costa", phone: "11966667777", email: "ju@gmail.com", alunos: 3, temLogin: true },
  { id: "4", name: "Márcia Lima", phone: "11955556666", email: "marcia@gmail.com", alunos: 1, temLogin: true },
];

const ResponsavelPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [openModalId, setOpenModalId] = useState<string | null>(null);

  const filtered = responsaveisMock.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.phone.includes(searchTerm) ||
    r.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const responsavelSelecionado = filtered.find(r => r.id === openModalId);
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-purple-600 text-white">
                      {r.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-lg">{r.name}</CardTitle>
                </div>
                {r.temLogin ? (
                  <Badge className="bg-green-600">Tem login</Badge>
                ) : (
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    Sem login
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-gray-500" />
                {r.phone}
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
                              {/* BOTÃO MOAL CRIA EDITAR LOGIN */}
                {!r.temLogin ? (
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => setOpenModalId(r.id)}
                  >
                    Criar login
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setOpenModalId(r.id)}
                  >
                    Editar login
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

    {/* MODAL NO CENTRO DA TELA — FORA DE TUDO! */}
      {responsavelSelecionado && (
        <CreateLoginPopup
          type="RESPONSAVEL"
          name={responsavelSelecionado.name}
          currentEmail={responsavelSelecionado.email}
          open={!!openModalId}
          onOpenChange={(open) => !open && setOpenModalId(null)}
        />
      )}
    </div>
     );
}
 
export default ResponsavelPage;