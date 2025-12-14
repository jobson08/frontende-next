// src/app/(dashboard)ss/[id]/page.tsx
"use client";

import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { ChevronLeft, Edit, Mail, Phone, Shield, UserCheck } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

// Mock de aluno (depois vem do backend)
const alunosMock = [
  {
    id: "1",
    name: "Enzo Gabriel Silva",
    birthDate: "2018-05-12",
    phone: "11988887777",
    email: "enzo@email.com",
    responsavel: "Ana Clara Santos",
    responsavelPhone: "11999998888",
    responsavelEmail: "ana@email.com",
    status: "ATIVO",
    temLogin: true,
    dataMatricula: "2024-03-15",
    observacoes: "Alergia a amendoim. Usa óculos.",
  },
   {
    id: "2",
    name: "Maria Luiza Costa",
    birthDate: "2019-02-20",
    phone: "11977778888",
    email: "enzo@email.com",
    responsavel: "Ana Clara Santos",
    responsavelPhone: "11999998888",
    responsavelEmail: "ana@email.com",
    status: "ATIVO",
    temLogin: true,
    dataMatricula: "2024-03-15",
    observacoes: "Adora natação!",
  },
];
const AlunoDetalhePage = () => {      //inicio da função

const { id } = useParams();

  const aluno = alunosMock.find(a => a.id === id);

  if (!aluno) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold">Aluno não encontrado</h1>
        <Button asChild className="mt-4">
          <Link href="/aluno">Voltar</Link>
        </Button>
      </div>
    );
  }

  const idade = new Date().getFullYear() - new Date(aluno.birthDate).getFullYear();
  const isMaior = idade >= 18;

    return ( 
      <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Cabeçalho */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/aluno">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Detalhes do Aluno</h1>
          <p className="text-gray-600">Informações completas de {aluno.name}</p>
        </div>
      </div>

      {/* Perfil Principal */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32" />
        <CardContent className="relative pt-0">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16">
            <Avatar className="h-32 w-32 ring-8 ring-white shadow-2xl">
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-4xl font-bold">
                {aluno.name.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <h2 className="text-3xl font-bold">{aluno.name}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-2 justify-center sm:justify-start">
                <Badge variant={aluno.status === "ATIVO" ? "default" : "secondary"}>
                  {aluno.status}
                </Badge>
                {isMaior && <Badge variant="outline">Maior de idade</Badge>}
                {aluno.temLogin && <Badge className="bg-green-600">Tem acesso ao app</Badge>}
              </div>
            </div>
            <div className="ml-auto">
              <Button size="lg" asChild>
                <Link href={`/aluno/${aluno.id}/editar`}>
                  <Edit className="mr-2 h-5 w-5" />
                  Editar Aluno
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dados Pessoais */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Dados Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Data de Nascimento</span>
              <span className="font-medium">
                {new Date(aluno.birthDate).toLocaleDateString("pt-BR")} ({idade} anos)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Telefone</span>
              <span className="font-medium flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {aluno.phone}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">E-mail</span>
              <span className="font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {aluno.email || "Não informado"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Data de Matrícula</span>
              <span className="font-medium">
                {new Date(aluno.dataMatricula).toLocaleDateString("pt-BR")}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Responsável */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Responsável
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              {aluno.responsavel || "Aluno maior de idade (sem responsável)"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Observações */}
      <Card>
        <CardHeader>
          <CardTitle>Observações</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">
            {aluno.observacoes || "Nenhuma observação cadastrada."}
          </p>
        </CardContent>
      </Card>
    </div>
     );
}
 
export default AlunoDetalhePage;