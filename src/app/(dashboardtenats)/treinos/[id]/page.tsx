// src/app/(dashboard)/treinos/[id]/page.tsx
"use client";

import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Badge } from "@/src/components/ui/badge";
import { Checkbox } from "@/src/components/ui/checkbox";
import { ChevronLeft, Calendar, Users, CheckCircle, XCircle, Edit, Save } from "lucide-react";
import Link from "next/link";
//import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

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
    { id: "5", name: "João Pedro Alves", idade: 10, presente: true },
    { id: "6", name: "Enzo Gabriel", idade: 11, presente: false },
  ] as AlunoPresenca[],
};

const TreinoDetalhePage = () => {   //Inicio da função

   // const { id } = useParams();

  const treino = treinoDetalheMock; // Em produção, buscar por id

  const [alunosPresenca, setAlunosPresenca] = useState<AlunoPresenca[]>(treino.alunos);

  const presentes = treino.alunos.filter(a => a.presente).length;
  const ausentes = treino.alunos.filter(a => !a.presente).length;

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
      description: `${presentes} presentes • ${ausentes} ausentes`,
    });
  };
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

      {/* Lista de Presença COM CHECKBOX */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Lista de Presença ({alunosPresenca.length} alunos)</CardTitle>
          <Button onClick={salvarPresenca} className="bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
            <Save className="mr-2 h-4 w-4" />
            Salvar Presença
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alunosPresenca.map((aluno) => (
              <div key={aluno.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
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
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
     );
}
 
export default TreinoDetalhePage;