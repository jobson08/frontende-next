// src/app/(dashboard)/funcionarios/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { ChevronLeft, Edit, Phone, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Badge } from "@/src/components/ui/badge";

const funcionariosMock = [
  {
    id: "1",
    name: "Mariana Costa",
    phone: "11999998888",
    email: "mariana@academia.com",
    role: "PROFESSOR",
    status: "ATIVO",
    temLogin: true,
    dataAdmissao: "2023-15",
    observacoes: "Especialista em musculação. Turmas às terças e quintas.",
  },
  {
    id: "2",
    name: "Rafael Lima",
    phone: "11988887777",
    email: "rafael@academia.com",
    role: "TREINADOR",
    status: "ATIVO",
    temLogin: true,
    dataAdmissao: "2024-01-20",
    observacoes: "Treinador de crossfit. Campeão regional 2023.",
  },
];

const FuncionarioDetalhePage = () => {
    const { id } = useParams();
  const funcionario = funcionariosMock.find(f => f.id === id);

  if (!funcionario) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold">Funcionário não encontrado</h1>
        <Button asChild className="mt-4">
          <Link href="/funcionario">Voltar</Link>
        </Button>
      </div>
    );
  }
    return ( 
        <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Cabeçalho */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/funcionario">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Detalhes do Funcionário</h1>
          <p className="text-gray-600">Informações completas de {funcionario.name}</p>
        </div>
      </div>

      {/* Perfil Principal */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-orange-600 to-red-600 h-32" />
        <CardContent className="relative pt-0">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16">
            <Avatar className="h-32 w-32 ring-8 ring-white shadow-2xl">
              <AvatarFallback className="bg-linear-to-br from-orange-600 to-red-600 text-white text-4xl font-bold">
                {funcionario.name.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <h2 className="text-3xl font-bold">{funcionario.name}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-2 justify-center sm:justify-start">
                <Badge className="bg-orange-600 text-white text-lg px-4 py-1">
                  {funcionario.role}
                </Badge>
                <Badge variant={funcionario.status === "ATIVO" ? "default" : "secondary"}>
                  {funcionario.status}
                </Badge>
                {funcionario.temLogin && <Badge className="bg-green-600">Tem acesso ao sistema</Badge>}
              </div>
            </div>
            <div className="ml-auto">
              <Button size="lg" asChild className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
                <Link href={`/funcionario/${funcionario.id}/editar`}>
                  <Edit className="mr-2 h-5 w-5" />
                  Editar Funcionário
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Telefone</span>
              <span className="font-medium">{funcionario.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">E-mail</span>
              <span className="font-medium">{funcionario.email || "Não informado"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Data de Admissão</span>
              <span className="font-medium">
                {new Date(funcionario.dataAdmissao).toLocaleDateString("pt-BR")}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Acesso ao Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              {funcionario.temLogin ? (
                <div>
                  <Badge className="bg-green-600 text-lg px-6 py-3">ACESSO LIBERADO</Badge>
                  <p className="text-sm text-gray-600 mt-2">Pode logar no painel</p>
                </div>
              ) : (
                <div>
                  <Badge variant="outline" className="text-orange-600 border-orange-600 text-lg px-6 py-3">
                    SEM ACESSO
                  </Badge>
                  <p className="text-sm text-gray-600 mt-2">Clique em Criar login na lista</p>
                </div>
              )}
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
            {funcionario.observacoes || "Nenhuma observação cadastrada."}
          </p>
        </CardContent>
      </Card>
    </div>
     );
}
 
export default FuncionarioDetalhePage;