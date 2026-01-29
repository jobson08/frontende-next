// src/app/(dashboard)/responsaveis/[id]/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/src/lib/api";
import { useParams, useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { ChevronLeft, Edit, Mail, Phone, Users, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

// Função para formatar telefone
const formatarTelefone = (phone: string | null) => {
  if (!phone) return "Não informado";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
};

interface Responsavel {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  cpf: string | null;
  observacoes: string | null;
  createdAt: string;
  filhos: { id: string; nome: string }[]; // alunos vinculados
}

const ResponsavelDetalhePage = () => {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const { data: responsavel, isLoading, error } = useQuery<Responsavel>({
    queryKey: ["responsavel", id],
    queryFn: async () => {
      const { data } = await api.get(`/tenant/responsaveis/${id}`);
      return data.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
        <span className="ml-4 text-xl">Carregando detalhes...</span>
      </div>
    );
  }

  if (error || !responsavel) {
    toast.error("Erro ao carregar responsável");
    return (
      <div className="p-8 text-center text-red-600">
        <AlertCircle className="h-12 w-12 mx-auto mb-4" />
        <h1 className="text-2xl font-bold">Responsável não encontrado</h1>
        <Button asChild className="mt-4">
          <Link href="/responsavel">Voltar para lista</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Cabeçalho */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/responsavel">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Detalhes do Responsável</h1>
          <p className="text-gray-600">Todas as informações de {responsavel.nome}</p>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 h-32" />
        <CardContent className="relative pt-0">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16">
            <Avatar className="h-32 w-32 ring-8 ring-white shadow-2xl">
              <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white text-4xl font-bold">
                {responsavel.nome.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <h2 className="text-3xl font-bold">{responsavel.nome}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-2 justify-center sm:justify-start">
                {responsavel.email ? (
                  <Badge className="bg-green-600 text-white">Tem acesso ao app</Badge>
                ) : (
                  <Badge variant="outline">Sem login</Badge>
                )}
              </div>
            </div>
            <div className="ml-auto">
              <Button
                size="lg"
                asChild
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Link href={`/responsavel/${responsavel.id}/editar`}>
                  <Edit className="mr-2 h-5 w-5" />
                  Editar Responsável
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Telefone</span>
              <span className="font-medium flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {formatarTelefone(responsavel.telefone)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">E-mail</span>
              <span className="font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {responsavel.email || "Não informado"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">CPF</span>
              <span className="font-medium">{responsavel.cpf || "Não informado"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Data de Cadastro</span>
              <span className="font-medium">
                {new Date(responsavel.createdAt).toLocaleDateString("pt-BR")}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Alunos Vinculados ({responsavel.filhos?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {responsavel.filhos?.length ? (
              <div className="space-y-3">
                {responsavel.filhos.map((aluno) => (
                  <div key={aluno.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{aluno.nome}</span>
                    <Badge variant="secondary">Ativo</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                Nenhum aluno vinculado ainda.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResponsavelDetalhePage;