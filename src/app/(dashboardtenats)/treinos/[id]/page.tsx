// src/app/(dashboard)/treinos/[id]/page.tsx
"use client";

import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Badge } from "@/src/components/ui/badge";
import { ChevronLeft, Calendar, Users, CheckCircle, XCircle, Edit } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface AlunoPresenca {
  id: string;
  name: string;
  idade: number;
  presente: boolean;
  observacao?: string;
}

const treinoDetalheMock = {
  id: "1",
  nome: "Técnica Individual Sub-11",
  categoria: "Sub-11",
  diaSemana: "Segunda",
  hora: "18:00",
  treinador: "Rafael Lima",
  data: "2025-12-17",
  status: "AGENDADO",
  alunosInscritos: 16,
  alunosMax: 20,
  descricao: "Treino focado em drible, passe e controle de bola. Exercícios individuais com progressão para duplas.",
  alunos: [
    { id: "1", name: "Pedro Henrique Silva", idade: 10, presente: true },
    { id: "2", name: "Lucas Oliveira", idade: 11, presente: true },
    { id: "3", name: "Gabriel Santos", idade: 10, presente: false, observacao: "Lesão no tornozelo" },
    { id: "4", name: "Matheus Costa", idade: 11, presente: true },
    // mais alunos...
  ] as AlunoPresenca[],
};

const TreinoDetalhePage = () => {   //Inicio da função

    const { id } = useParams();

  const treino = treinoDetalheMock; // Em produção, buscar por id

  const presentes = treino.alunos.filter(a => a.presente).length;
  const ausentes = treino.alunos.filter(a => !a.presente).length;
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
          <p className="text-gray-600">{treino.categoria} • {treino.diaSemana} - {treino.hora}</p>
        </div>
        <div className="ml-auto">
          <Button asChild className="bg-linear-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
            <Link href={`/treinos/${id}/editar`}>
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
            <p className="text-2xl font-bold">{treino.data}</p>
            <p className="text-gray-600">{treino.diaSemana} - {treino.hora}</p>
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
                {treino.alunosInscritos}/{treino.alunosMax} inscritos ({Math.round((treino.alunosInscritos / treino.alunosMax) * 100)}% lotado)
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
                <AvatarFallback className="bg-linear-to-br from-orange-600 to-red-600 text-white text-2xl">
                  {treino.treinador.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xl font-bold">{treino.treinador}</p>
                <Badge variant="secondary">Treinador Principal</Badge>
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
            {treino.descricao}
          </p>
        </CardContent>
      </Card>

      {/* Lista de Alunos */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Presença ({treino.alunos.length} alunos)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {treino.alunos.map((aluno) => (
              <div key={aluno.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback className="bg-linear-to-br from-blue-600 to-purple-600 text-white">
                      {aluno.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{aluno.name}</p>
                    <p className="text-sm text-gray-600">{aluno.idade} anos</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {aluno.presente ? (
                    <Badge className="bg-green-600">Presente</Badge>
                  ) : (
                    <Badge variant="outline" className="text-red-600 border-red-600">
                      Ausente
                    </Badge>
                  )}
                  {aluno.observacao && (
                    <p className="text-sm text-gray-600 italic">{aluno.observacao}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
     );
}
 
export default TreinoDetalhePage;