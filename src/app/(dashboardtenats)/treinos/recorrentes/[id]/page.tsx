/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/treinos/recorrentes/[id]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/src/lib/api";

import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Badge } from "@/src/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { ChevronLeft, Calendar, Clock, MapPin, User, Trash2, AlertCircle, Edit } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

// Função para calcular idade
const calcularIdade = (birthDate: string): number => {
  if (!birthDate) return 0;
  const [ano, mes, dia] = birthDate.split("T")[0].split("-");
  const nascimento = new Date(Number(ano), Number(mes) - 1, Number(dia));
  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const m = hoje.getMonth() - nascimento.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }
  return idade;
};

interface TreinoRecorrente {
  id: string;
  nome: string;
  categoria: string;
  diasSemana: number[];
  horaInicio: string;
  horaFim: string;
  local: string;
  descricao?: string | null;
  ativo: boolean;
  treinador: {
    nome: string;
  }
}

interface Aluno {
  id: string;
  nome: string;
  idade: number | null;
  categoria: string;
}

const diasNomes = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

const TreinoRecorrenteDetalhePage = () => {
  const { id } = useParams();
  const router = useRouter();

  const { data: treino, isLoading: loadingTreino } = useQuery<TreinoRecorrente>({
    queryKey: ["treino-recorrente", id],
    queryFn: async () => {
      const res = await api.get(`/tenant/treinos-recorrentes/${id}`);
      return res.data.data || res.data;
    },
  });

  // Busca alunos da mesma categoria
  const { data: alunosDaCategoria = [], isLoading: loadingAlunos } = useQuery<Aluno[]>({
    queryKey: ["alunos-categoria", treino?.categoria],
    queryFn: async () => {
      const res = await api.get(`/tenant/alunos?categoria=${treino?.categoria}`);
      return res.data.data || [];
    },
    enabled: !!treino?.categoria,
  });

  const handleDelete = async () => {
    if (!confirm("Deseja realmente excluir este treino recorrente?")) return;

    try {
      await api.delete(`/tenant/treinos-recorrentes/${id}`);
      toast.success("Treino recorrente excluído com sucesso!");
      router.push("/treinos");
    } catch (err: any) {
      toast.error("Erro ao excluir treino recorrente");
    }
  };

  if (loadingTreino) return <div className="text-center py-20">Carregando...</div>;

  if (!treino) {
    return <div className="text-center py-20 text-red-600">Treino não encontrado</div>;
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
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{treino.nome}</h1>
          <p className="text-gray-600">{treino.categoria} • Treino Recorrente</p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link href={`/treinos/recorrentes/${id}/editarTreinoRecorrente`}>
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

      {/* Informações */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Dias da Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {treino.diasSemana.map((dia) => (
                <Badge key={dia} variant="secondary">
                  {diasNomes[dia]}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Horário</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{treino.horaInicio} - {treino.horaFim}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Local e Treinador</CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Local:</strong> {treino.local}</p>
            <p><strong>Treinador:</strong> {treino.treinador.nome}</p>
          </CardContent>
        </Card>
      </div>

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

export default TreinoRecorrenteDetalhePage;