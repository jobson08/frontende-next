/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/treinos/[id]/page.tsx
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast, Toaster } from "sonner";

import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Badge } from "@/src/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { ChevronLeft, Calendar, Users, Edit, Trash2, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import api from "@/src/lib/api";

interface Treino {
  id: string;
  nome: string;
  categoria: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  local: string;
  descricao?: string | null;
  treinador: {
    nome: string;
  } | null;
}

interface Aluno {
  id: string;
  nome: string;
  idade: number | null;
  categoria: string;
}

// Função de formatação de data robusta
const formatDate = (dateStr: string): string => {
  if (!dateStr) return "—";

  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
};

const TreinoDetalhePage = () => {
  const { id } = useParams();
  const router = useRouter();

  const { 
    data: treino, 
    isLoading, 
    error 
  } = useQuery<Treino>({
    queryKey: ["treino", id],
    queryFn: async () => {
      const res = await api.get(`/tenant/treinos/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });

  const { data: alunosDaCategoria = [], isLoading: loadingAlunos } = useQuery<Aluno[]>({
    queryKey: ["alunos-categoria", treino?.categoria],
    queryFn: async () => {
      const res = await api.get(`/tenant/alunos?categoria=${treino?.categoria}`);
      return res.data.data || [];
    },
    enabled: !!treino?.categoria,
  });

  const deleteMutation = useMutation({
    mutationFn: async () => api.delete(`/tenant/treinos/${id}`),
    onSuccess: () => {
      toast.success("Treino excluído com sucesso!");
      router.push("/treinos");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Erro ao excluir treino");
    },
  });

  const handleDelete = () => {
    if (!confirm("Deseja realmente excluir este treino?")) return;
    deleteMutation.mutate();
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
        <p className="mt-2">{(error as Error)?.message || "Treino não encontrado"}</p>
        <Button asChild className="mt-6">
          <Link href="/treinos">Voltar para lista</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/treinos">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{treino.nome}</h1>
            <p className="text-gray-600">
              {treino.categoria} • {formatDate(treino.data)} • {treino.horaInicio} às {treino.horaFim}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link href={`/treinos/${id}/editar`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
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
            <p className="text-3xl font-bold">{formatDate(treino.data)}</p>
            <p className="text-gray-600 text-lg">{treino.horaInicio} - {treino.horaFim}</p>
          </CardContent>
        </Card>

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
                  {treino.treinador?.nome?.split(" ").map(n => n[0]).join("") || "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xl font-bold">{treino.treinador?.nome || "—"}</p>
                <Badge variant="secondary">Treinador</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Local</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{treino.local}</p>
          </CardContent>
        </Card>
      </div>

      {/* Descrição */}
      {treino.descricao && (
        <Card>
          <CardHeader>
            <CardTitle>Descrição do Treino</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {treino.descricao}
            </p>
          </CardContent>
        </Card>
      )}

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
                {alunosDaCategoria.map((aluno: Aluno) => (   // ← Tipagem explícita
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

      <Toaster position="top-right" richColors closeButton />
    </div>
  );
};

export default TreinoDetalhePage;