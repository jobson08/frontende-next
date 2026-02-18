/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/src/lib/api";

import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Badge } from "@/src/components/ui/badge";
import { Checkbox } from "@/src/components/ui/checkbox";
import { ChevronLeft, Calendar, Users, CheckCircle, XCircle, Edit, Save, Loader2, AlertCircle } from "lucide-react";
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

  // Inicializa com mock (ou vazio) - sem useEffect
  const [alunosPresenca, setAlunosPresenca] = useState<AlunoPresenca[]>(() => [
    { id: "1", nome: "Pedro Henrique Silva", idade: 10, presente: true },
    { id: "2", nome: "Lucas Oliveira", idade: 11, presente: true },
    { id: "3", nome: "Gabriel Santos", idade: 10, presente: false, observacao: "Lesão no tornozelo" },
    { id: "4", nome: "Matheus Costa", idade: 11, presente: true },
    { id: "5", nome: "João Pedro Alves", idade: 10, presente: true },
    { id: "6", nome: "Enzo Gabriel", idade: 11, presente: false },
  ]);

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

  const presentes = alunosPresenca.filter(a => a.presente).length;
  const ausentes = alunosPresenca.filter(a => !a.presente).length;

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
        <div className="ml-auto">
          <Button asChild className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
            <Link href={`/treinos/${treino.id}/editar`}>
              <Edit className="mr-2 h-5 w-5" />
              Editar Treino
            </Link>
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

        <Card>
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

      {/* Lista de Presença COM CHECKBOX */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Lista de Presença ({alunosPresenca.length} alunos)</CardTitle>
          <Button onClick={salvarPresenca} className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
            <Save className="mr-2 h-4 w-4" />
            Salvar Presença
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alunosPresenca.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Nenhum aluno cadastrado neste treino</p>
            ) : (
              alunosPresenca.map((aluno) => (
                <div key={aluno.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                        {aluno.nome.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{aluno.nome}</p>
                      <p className="text-sm text-gray-600">{aluno.idade} anos</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {aluno.observacao && (
                      <p className="text-sm text-orange-600 italic max-w-xs">{aluno.observacao}</p>
                    )}
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={`presenca-${aluno.id}`}
                        checked={aluno.presente}
                        onCheckedChange={() => togglePresenca(aluno.id)}
                        className="h-6 w-6 rounded"
                      />
                      <label
                        htmlFor={`presenca-${aluno.id}`}
                        className="text-sm font-medium cursor-pointer select-none"
                      >
                        {aluno.presente ? "Presente" : "Ausente"}
                      </label>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TreinoDetalhePage;