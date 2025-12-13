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
const alunoMock = {
  id: "1",
  name: "Enzo Gabriel Silva",
  birthDate: "2018-05-12",
  phone: "1198888-7777",
  email: "enzo@email.com",
  responsavel: "Ana Clara Santos",
  responsavelPhone: "1199999-8888",
  responsavelEmail: "ana@email.com",
  status: "ATIVO",
  temLogin: true,
  dataMatricula: "2024-03-15",
  observacoes: "Alergia a amendoim. Usa óculos. Muito educado!",
};
const AlunoDetalhePage = () => {
    const { id } = useParams();

  const idade = new Date().getFullYear() - new Date(alunoMock.birthDate).getFullYear();
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
          <p className="text-gray-600">Todas as informações de {alunoMock.name}</p>
        </div>
      </div>

      {/* Perfil Principal */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32" />
        <CardContent className="relative pt-0">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16">
            <Avatar className="h-32 w-32 ring-8 ring-white shadow-2xl">
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-4xl font-bold">
                {alunoMock.name.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <h2 className="text-3xl font-bold">{alunoMock.name}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-2 justify-center sm:justify-start">
                <Badge variant={alunoMock.status === "ATIVO" ? "default" : "secondary"} className="text-sm">
                  {alunoMock.status}
                </Badge>
                {isMaior && <Badge variant="outline" className="text-sm ml-2">Maior de idade</Badge>}
                {alunoMock.temLogin && <Badge className="bg-green-600 ml-2 text-sm">Tem acesso ao app</Badge>}
              </div>
            </div>
            {/* Botão ediar*/}
            <div className="ml-auto flex gap-3">
              <Button size="lg" asChild>
                <Link href={`/aluno/${alunoMock.id}/editar`}>
                  <Edit className="mr-2 h-5 w-5" />
                  Editar Aluno
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações em Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Dados Pessoais */}
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
                {new Date(alunoMock.birthDate).toLocaleDateString("pt-BR")} ({idade} anos)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Telefone</span>
              <span className="font-medium flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {alunoMock.phone}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">E-mail</span>
              <span className="font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {alunoMock.email || "Não informado"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Data de Matrícula</span>
              <span className="font-medium">
                {new Date(alunoMock.dataMatricula).toLocaleDateString("pt-BR")}
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
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-purple-600 text-white">
                  {alunoMock.responsavel.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{alunoMock.responsavel}</p>
                <p className="text-sm text-gray-500">Responsável legal</p>
              </div>
            </div>
            <div className="space-y-2 pt-4 border-t">
              <div className="flex justify-between">
                <span className="text-gray-600">Telefone</span>
                <span className="font-medium">{alunoMock.responsavelPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">E-mail</span>
                <span className="font-medium">{alunoMock.responsavelEmail}</span>
              </div>
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
            {alunoMock.observacoes || "Nenhuma observação cadastrada."}
          </p>
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <div className="p-2 lg:p-2 max-w-5xl mx-auto space-y-2">
        <Button className="flex-1" size="lg">
          Enviar Mensagem
        </Button>
        <Button variant="outline" className="flex-1" size="lg">
          Histórico de Pagamentos
        </Button>
        <Button variant="outline" className="flex-1" size="lg">
          Frequência
        </Button>
      </div>
    </div>
     );
}
 
export default AlunoDetalhePage;