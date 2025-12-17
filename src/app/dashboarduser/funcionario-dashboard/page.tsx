// src/app/dashboard/treinador/page.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Calendar, Clock, Trophy, Users } from "lucide-react";


const FuncionarioDashboardPage = () => {  //Inicio da Função

    const treinador = {
    name: "Rafael Lima",
    treinosHoje: 4,
    alunosTotais: 68,
    alunosPresentesHoje: 52,
    horario: "08:00 - 19:00",
  };

  const treinosHoje = [
    { hora: "09:00", treino: "Técnica Sub-11", alunosEsperados: 18, alunosPresentes: 16 },
    { hora: "14:00", treino: "Jogo Coletivo Sub-13", alunosEsperados: 20, alunosPresentes: 18 },
    { hora: "17:00", treino: "Preparação Física Sub-15", alunosEsperados: 15, alunosPresentes: 14 },
    { hora: "18:30", treino: "Finalização Avançada", alunosEsperados: 15, alunosPresentes: 4 },
  ];
    return ( 
        <div className="p-4 lg:p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Olá, {treinador.name}!</h1>
        <p className="text-gray-600 text-lg mt-2">Bem-vindo ao seu painel de treinador</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Treinos Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{treinador.treinosHoje}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Alunos Totais</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{treinador.alunosTotais}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Presença Hoje</CardTitle>
            <Trophy className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{treinador.alunosPresentesHoje}</div>
            <p className="text-xs text-gray-500 mt-1">alunos presentes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Horário</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{treinador.horario}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Treinos de Hoje</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {treinosHoje.map((treino, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-linear-to-r from-orange-50 to-red-50 rounded-lg">
                <div>
                  <p className="font-medium">{treino.treino}</p>
                  <p className="text-sm text-gray-600">{treino.hora}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{treino.alunosPresentes}/{treino.alunosEsperados}</p>
                  <p className="text-xs text-gray-600">presentes</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
    );
}
 
export default FuncionarioDashboardPage;