// src/app/dashboarduser/aluno-dashboard/progresso/page.tsx
"use client";

import { TrendingUp, Trophy, Target, Star, Calendar, Flame } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Progress } from "@/src/components/ui/progress";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";

const MeuProgressoPage = () => {
  const aluno = {
    name: "Pedro Henrique Silva",
    categoria: "Sub-13",
    nivelAtual: "Avançado",
    pontosTotais: 2850,
    nivel: 12,
    pontosParaProximoNivel: 500,
    frequenciaMedia: 92,
    golsMarcados: 18,
    assistencias: 12,
    presencasMes: 18,
    metaMensal: 20,
    streakDias: 45, // dias consecutivos de treino
  };

  // Evolução mensal (mock)
  const evolucaoMensal = [
    { mes: "Ago", frequencia: 85, gols: 3, assistencias: 2 },
    { mes: "Set", frequencia: 88, gols: 4, assistencias: 3 },
    { mes: "Out", frequencia: 90, gols: 5, assistencias: 4 },
    { mes: "Nov", frequencia: 92, gols: 6, assistencias: 3 },
  ];

  return (
    <div className="p-2 lg:p-4 space-y-4">
      {/* Cabeçalho */}
      <div className="flex items-center gap-6">
        <Avatar className="h-20 w-20 ring-4 ring-green-400">
          <AvatarFallback className="bg-linear-to-br from-green-400 to-emerald-600 text-white text-3xl font-bold">
            {aluno.name.split(" ").map(n => n[0]).join("")}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">Meu Progresso</h1>
          <p className="text-gray-600 text-lg mt-2">Acompanhe sua evolução</p>
          <div className="flex items-center gap-4 mt-2">
            <Badge className="bg-linear-to-br from-green-400 to-emerald-600 text-xs px-4 py-1">
              Nível {aluno.nivel} - {aluno.nivelAtual}
            </Badge>
            <div className="text-center text-2x1 font-medium">
              <Flame className="h-6 w-6 text-orange-600" />
              <span className="text-lg font-bold text-orange-600">{aluno.streakDias} dias de streak!</span>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Progresso para Próximo Nível */}

      <Card>
        <CardHeader >
          <CardTitle className="text-center text-2x1 font-medium">
            <TrendingUp className="h-5 w-5" />
            Progresso para o Próximo Nível
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{aluno.pontosTotais} pontos</span>
              <span className="text-gray-600">+{aluno.pontosParaProximoNivel} para o nível {aluno.nivel + 1}</span>
            </div>
            <Progress value={(aluno.pontosTotais % 500) / 5} className="h-6" />
            <p className="text-sm text-gray-600 text-center">
              Continue treinando forte! Você está quase lá!
            </p>
          </div>
        </CardContent>
      </Card>
      {/* Cards de Estatísticas */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-center text-3x1">
              <Trophy className="h-4 w-4 text-yellow-600" />
              Gols Marcados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-center  text-yellow-600">{aluno.golsMarcados}</div>
            <p className="text-xs text-gray-500 mt-1">esta temporada</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-center text-3x1">
              <Target className="h-4 w-4 text-green-600" />
              Assistências
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-center  text-green-600">{aluno.assistencias}</div>
            <p className="text-xs text-gray-500 mt-1">esta temporada</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-center text-3x1">
              <Calendar className="h-4 w-4 text-blue-600" />
              Frequência Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-center  text-blue-600">{aluno.frequenciaMedia}%</div>
            <div className="text-center text-3x1 font-medium mt-2">
              <Progress value={aluno.presencasMes / aluno.metaMensal * 100} className="h-3 flex-1" />
              <span className="text-sm">{aluno.presencasMes}/{aluno.metaMensal}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-center text-3x1">
              <Star className="h-4 w-4 text-purple-600" />
              Avaliação Média
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-center  text-purple-600">4.8</div>
            <p className="text-xs text-gray-500 mt-1">dos treinadores</p>
          </CardContent>
        </Card>
      </div>

      {/* Evolução Mensal (Tabela Simples) */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução nos Últimos Meses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {evolucaoMensal.map((mes) => (
              <div key={mes.mes} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="font-medium">{mes.mes}/2025</div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="text-gray-600">Frequência</p>
                    <p className="font-bold">{mes.frequencia}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600">Gols</p>
                    <p className="font-bold text-yellow-600">{mes.gols}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600">Assistências</p>
                    <p className="font-bold text-green-600">{mes.assistencias}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Motivação Final */}
      <Card className="bg-linear-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-center text-3x1 font-medium text-purple-800">
            <Trophy className="h-6 w-6" />
            Parabéns pelo esforço!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-purple-700 text-lg">
            Você está no caminho certo, Pedro! Com {aluno.streakDias} dias seguidos de treino e {aluno.frequenciaMedia}% de frequência, 
            você é um exemplo para a equipe. Continue assim que o próximo nível está logo ali!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MeuProgressoPage;