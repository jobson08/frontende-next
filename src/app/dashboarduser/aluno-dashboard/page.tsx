// src/app/dashboard/aluno/page.tsx
"use client";

import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Calendar, Trophy, Target, MessageSquare, Star } from "lucide-react";
import Link from "next/link";

const AlunoDashboardPage = () => { //Inicio da função

    const aluno = {
    name: "Pedro Henrique Silva",
    idade: 12,
    categoria: "Sub-13",
    frequenciaMes: 18,
    metaSemanal: 4,
    treinosFeitosSemana: 3,
    proximosTreinos: 5,
    nivel: "Avançado",
  };

  const proximosTreinos = [
    { dia: "Quarta", hora: "18:00", treino: "Técnica Individual", treinador: "Rafael Lima" },
    { dia: "Quinta", hora: "17:30", treino: "Jogo Coletivo", treinador: "Mariana Costa" },
    { dia: "Sábado", hora: "09:00", treino: "Preparação Física", treinador: "Carlos Souza" },
  ];
    return ( 
    <div className="p-4 lg:p-8 space-y-8">
      {/* Cabeçalho */}
      <div className="flex items-center gap-6">
        <Avatar className="h-24 w-24 ring-4 ring-green-600">
          <AvatarFallback className="bg-linear-to-br from-green-600 to-emerald-600 text-white text-3xl font-bold">
            {aluno.name.split(" ").map(n => n[0]).join("")}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-4xl font-bold">Olá, {aluno.name}!</h1>
          <div className="flex items-center gap-4 mt-2">
            <Badge className="bg-linear-to-br from-green-600 to-emerald-600 text-lg px-4 py-1">
              {aluno.categoria}
            </Badge>
            <Badge variant="secondary" className="text-lg px-4 py-1">
              {aluno.nivel}
            </Badge>
          </div>
          <p className="text-gray-600 mt-2">{aluno.idade} anos • Frequência este mês: {aluno.frequenciaMes} treinos</p>
        </div>
      </div>

      {/* Cards Principais */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Treinos esta semana</CardTitle>
            <Trophy className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{aluno.treinosFeitosSemana}/{aluno.metaSemanal}</div>
            <p className="text-xs text-gray-500 mt-1">Meta semanal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Próximos treinos</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{aluno.proximosTreinos}</div>
            <p className="text-xs text-gray-500 mt-1">Esta semana</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Frequência mensal</CardTitle>
            <Target className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{aluno.frequenciaMes}</div>
            <p className="text-xs text-gray-500 mt-1">treinos realizados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avaliação</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-500">4.8</div>
            <p className="text-xs text-gray-500 mt-1">nota média dos treinadores</p>
          </CardContent>
        </Card>
      </div>

      {/* Próximos Treinos */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos Treinos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {proximosTreinos.map((treino, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-linear-to-r from-green-50 to-emerald-50 rounded-lg">
                <div>
                  <p className="font-medium">{treino.treino}</p>
                  <p className="text-sm text-gray-600">{treino.dia} - {treino.hora} • {treino.treinador}</p>
                </div>
                <Badge variant="secondary">Confirmado</Badge>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4" asChild>
            <Link href="/dashboard/aluno/treinos">Ver todos os treinos</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Mensagens ou Avisos */}
      <Card className="bg-linear-to-r from-blue-50 to-cyan-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comunicado do Treinador
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 italic">
            Parabéns pelo desempenho no último treino, Pedro! Continue assim que você vai chegar longe! Foco na finalização essa semana.
          </p>
          <p className="text-sm text-gray-600 mt-4">- Rafael Lima</p>
        </CardContent>
      </Card>
    </div>
);
}
 
export default AlunoDashboardPage;