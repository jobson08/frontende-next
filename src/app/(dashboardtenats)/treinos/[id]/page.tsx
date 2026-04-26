/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/src/lib/api";

import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Badge } from "@/src/components/ui/badge";
import { Checkbox } from "@/src/components/ui/checkbox";
import { ChevronLeft, Calendar, Users, CheckCircle, XCircle, Edit, Save, Loader2, AlertCircle, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import Link from "next/link";
import { toast } from "sonner";

// Interface baseada no retorno real do Prisma
interface Treino {
  id: string;
  nome: string;
  categoria: string;
  data: string; // já formatada como "YYYY-MM-DD" pelo backend
  horaInicio: string;
  horaFim: string;
  local: string;
  descricao?: string | null;
  funcionarioTreinador: {
    nome: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

interface AlunoPresenca {
  id: string;
  nome: string;
  idade: number;
  presente: boolean;
  observacao?: string | null;
}

const TreinoDetalhePage = () => {
const { id } = useParams();
const router = useRouter();

  //Data formatada
  const formatDate = (dateStr: string) => {
  if (!dateStr) return "—";
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

  // Busca o treino por ID
  const { 
    data: treino, 
    isLoading, 
    error 
  } = useQuery<Treino>({
    queryKey: ["treino", id],
    queryFn: async () => {
      const res = await api.get(`/tenant/treinos-futebol/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });

 const handleDelete = async () => {
    if (!confirm("Deseja realmente excluir este treino ?")) return;

    try {
      await api.delete(`/tenant/treinos-futebol/${id}`);
      toast.success("Treino  excluído com sucesso!");
      router.push("/treinos");
    } catch (err: any) {
      toast.error("Erro ao excluir treino ");
    }
  };

  // Busca alunos da mesma categoria
  const { data: alunosDaCategoria = [], isLoading: loadingAlunos } = useQuery<Aluno[]>({
    queryKey: ["alunos-categoria", treino?.categoria],
    queryFn: async () => {
      const res = await api.get(`/tenant/alunos?categoria=${treino?.categoria}`);
      return res.data.data || [];
    },
    enabled: !!treino?.categoria,
  });


  const togglePresenca = (alunoId: string) => {
    setAlunosPresenca(prev =>
      prev.map(aluno =>
        aluno.id === alunoId ? { ...aluno, presente: !aluno.presente } : aluno
      )
    );
  };

  const salvarPresenca = () => {
    console.log("Presença salva:", alunosPresenca);
    toast.success("Presença salva com sucesso!", {
      description: `${alunosPresenca.filter(a => a.presente).length} presentes • ${alunosPresenca.filter(a => !a.presente).length} ausentes`,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <span className="ml-4 text-xl">Carregando treino...</span>
      </div>
    );
  }

  if (error || !treino) {
    return (
      <div className="p-8 text-center text-red-600">
        <AlertCircle className="h-12 w-12 mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Erro ao carregar treino</h2>
        <p className="mt-2">{(error as Error)?.message || "Treino não encontrado ou acesso negado"}</p>
        <Button asChild className="mt-6">
          <Link href="/treinos">Voltar para lista</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Cabeçalho */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/treinos">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{treino.nome}</h1>
          <p className="text-gray-600">{treino.categoria} • {treino.data} • {treino.horaInicio} às {treino.horaFim}</p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link href={`/treinos/recorrentes/${id}/editar`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </Button>
        </div>
      </div>

      {/* Informações Gerais */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Data e Horário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatDate(treino.data)}</p>
            <p className="text-gray-600">{treino.horaInicio} - {treino.horaFim}</p>
          </CardContent>
        </Card>

        {/*<Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Presença
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Presentes
                </span>
                <span className="text-2xl font-bold text-green-600">{presentes}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  Ausentes
                </span>
                <span className="text-2xl font-bold text-red-600">{ausentes}</span>
              </div>
              <p className="text-sm text-gray-600 pt-2">
                Local: {treino.local}
              </p>
            </div>
          </CardContent>
        </Card>*/}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Treinador
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-gradient-to-br from-orange-600 to-red-600 text-white text-2xl">
                  {treino.funcionarioTreinador?.nome?.split(" ").map(n => n[0]).join("") || "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xl font-bold">{treino.funcionarioTreinador?.nome || "—"}</p>
                <Badge variant="secondary">Funcionário Treinador</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Descrição do Treino */}
      <Card>
        <CardHeader>
          <CardTitle>Descrição do Treino</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">
            {treino.descricao || "Nenhuma descrição cadastrada."}
          </p>
        </CardContent>
      </Card>

     {/* Alunos da Categoria */}
      <Card>
        <CardHeader>
          <CardTitle>Alunos da Categoria {treino.categoria}</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingAlunos ? (
            <p>Carregando alunos...</p>
          ) : alunosDaCategoria.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Idade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alunosDaCategoria.map((aluno) => (
                  <TableRow key={aluno.id}>
                    <TableCell className="font-medium">{aluno.nome}</TableCell>
                    <TableCell>{aluno.idade || "?"} anos</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-gray-500 py-8 text-center">Nenhum aluno encontrado nesta categoria.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TreinoDetalhePage;