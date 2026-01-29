"use client"

import { useQuery } from "@tanstack/react-query";
import api from "@/src/lib/api";
import { useParams, useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { ChevronLeft, Edit, Mail, Phone, Shield, UserCheck, Calendar, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

// Função para formatar telefone
const formatarTelefone = (phone: string | null) => {
  if (!phone) return "Não informado";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
};

// Função para calcular idade
const calcularIdade = (birthDate: string | Date): number => {
  const hoje = new Date();
  const nascimento = new Date(birthDate);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mesAtual = hoje.getMonth();
  const mesNasc = nascimento.getMonth();

  if (mesAtual < mesNasc || (mesAtual === mesNasc && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }
  return idade;
};

// Interface baseada no retorno real do backend
interface AlunoDetalhe {
  id: string;
  nome: string;
  dataNascimento: string;
  telefone: string | null;
  email: string | null;
  status: "ATIVO" | "INATIVO" | "TRANCADO";
  observacoes: string | null;
  createdAt: string; // data de matrícula
  responsavel?: {
    nome: string;
    telefone: string | null;
    email: string | null;
  } | null;
  userId: string | null; // para saber se tem login
  categoria: string | null;
}

const AlunoDetalhePage = () => {
  const { id } = useParams();
  const router = useRouter();

  // Busca detalhes do aluno
  const { data: aluno, isLoading, error } = useQuery<AlunoDetalhe>({
    queryKey: ["aluno", id],
    queryFn: async () => {
      const res = await api.get(`/tenant/alunos/${id}`);
      return res.data.data; // ajuste conforme o formato da sua resposta
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="mt-4 text-gray-600">Carregando detalhes do aluno...</p>
      </div>
    );
  }

  if (error || !aluno) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-red-600">
        <AlertCircle className="h-16 w-16" />
        <h2 className="mt-4 text-2xl font-bold">Aluno não encontrado</h2>
        <p className="mt-2 text-gray-600">{(error as Error)?.message || "ID inválido ou aluno removido"}</p>
        <Button className="mt-6" asChild>
          <Link href="/aluno">Voltar para lista</Link>
        </Button>
      </div>
    );
  }

  const idade = calcularIdade(aluno.dataNascimento);
  const isMaior = idade >= 18;
  const temResponsavel = !!aluno.responsavel;

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
          <h1 className="text-2xl font-bold">Detalhes do Aluno</h1>
          <p className="text-gray-600">Informações completas de {aluno.nome}</p>
        </div>
      </div>

      {/* Perfil Principal */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32" />
        <CardContent className="relative pt-0">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16">
            <Avatar className="h-32 w-32 ring-8 ring-white shadow-2xl">
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-4xl font-bold">
                {aluno.nome.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold">{aluno.nome}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-2 justify-center sm:justify-start">
                <Badge className="text-xs bg-blue-400 text-white" variant={aluno.status === "ATIVO" ? "default" : aluno.status === "INATIVO" ? "secondary" : "destructive" }>
                  {aluno.status}
                </Badge>
                {isMaior && <Badge variant="outline">Maior de idade</Badge>}
                {aluno.userId && <Badge className="bg-green-600">Tem acesso ao app</Badge>}
                <Badge variant="outline">{aluno.categoria || "Sem categoria"}</Badge>
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
                {aluno.dataNascimento 
                  ? aluno.dataNascimento.split("T")[0].split("-").reverse().join("/") 
                  : "Não informado"} 
                ({calcularIdade(aluno.dataNascimento)} anos)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Telefone</span>
              <span className="font-medium flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {formatarTelefone(aluno.telefone)}
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
                {new Date(aluno.createdAt).toLocaleDateString("pt-BR")}
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
            {temResponsavel ? (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nome</span>
                  <span className="font-medium">{aluno.responsavel?.nome || "Sem responsável cadastrado"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Telefone</span>
                  <span className="font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {formatarTelefone(aluno.responsavel?.telefone || "Não informado")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">E-mail</span>
                  <span className="font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {aluno.responsavel?.email || "Não informado"}
                  </span>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Aluno  (sem responsável cadastrado)
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Observações */}
      <Card>
        <CardHeader>
          <CardTitle>Observações</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {aluno.observacoes || "Nenhuma observação cadastrada."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default AlunoDetalhePage;