// src/app/(dashboard)/treinador/plano-treino/page.tsx
"use client";

import { Clock, Dumbbell, PlayCircle, CheckCircle, Timer, Calendar, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";

const PlanoTreinoPage = () => {
  const treinoHoje = {
    nome: "Finalização Avançada",
    categoria: "Sub-15",
    data: "27/12/2025",
    duracaoTotal: "90 minutos",
    aquecimento: "15 min",
    partePrincipal: "60 min",
    voltaCalma: "15 min",
    objetivo: "Melhorar precisão e potência na finalização com ambas as pernas",
  };

  const exercicios = [
    {
      nome: "Aquecimento Dinâmico",
      duracao: "15 min",
      descricao: "Corrida leve, polichinelos, skipping alto/baixa, mobilidade de quadril e tornozelo",
      dica: "Mantenha ritmo leve para elevar frequência cardíaca sem fadiga",
    },
    {
      nome: "Chutes de Curta Distância",
      duracao: "20 min",
      repeticoes: "4 séries de 10 chutes por perna",
      descricao: "Posicionar cones a 8-10 metros do gol. Chute rasteiro com precisão nos cantos",
      videoDemo: "https://www.youtube.com/embed/dummy1", // link real em produção
      dica: "Foco na planta do pé e no contato com a bola no centro",
    },
    {
      nome: "Finalização em Movimento",
      duracao: "25 min",
      repeticoes: "6 séries (3 por perna)",
      descricao: "Condução em velocidade + passe do auxiliar + finalização de primeira",
      dica: "Ajuste o corpo antes do chute e use o pé de apoio para direcionar",
    },
    {
      nome: "Cabeceio Ofensivo",
      duracao: "15 min",
      repeticoes: "5 séries de 8 cabeceios",
      descricao: "Cruzamentos laterais + cabeceio direcionado para os cantos",
      dica: "Use a testa, olhos na bola até o impacto",
    },
    {
      nome: "Jogo Reduzido com Ênfase em Finalização",
      duracao: "15 min",
      descricao: "4x4 ou 5x5 em espaço reduzido. Ponto duplo ao marcar gol",
      dica: "Incentive tentativa de finalização sempre que possível",
    },
  ];

  return (
    <div className="p-4 lg:p-8 space-y-8">
      {/* Cabeçalho do Treino */}
      <div className="text-center lg:text-left">
        <h1 className="text-4xl font-bold flex items-center justify-center lg:justify-start gap-4">
          <BookOpen className="h-12 w-12 text-blue-600" />
          Plano de Treino
        </h1>
        <div className="mt-6 bg-blue-50 p-8 rounded-xl border-2 border-blue-200">
          <p className="text-3xl font-bold text-blue-900">{treinoHoje.nome}</p>
          <p className="text-xl text-blue-700 mt-2">{treinoHoje.categoria}</p>
          <div className="flex flex-wrap justify-center lg:justify-start gap-6 mt-4 text-blue-800">
            <div className="flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              <span className="font-medium">{treinoHoje.data}</span>
            </div>
            <div className="flex items-center gap-2">
              <Timer className="h-6 w-6" />
              <span className="font-medium">{treinoHoje.duracaoTotal}</span>
            </div>
          </div>
          <p className="text-lg text-blue-900 mt-6 font-medium">
            Objetivo do treino: {treinoHoje.objetivo}
          </p>
        </div>
      </div>

      {/* Estrutura do Treino */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-linear-to-br from-yellow-50 to-amber-50 border-yellow-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <Clock className="h-6 w-6" />
              Aquecimento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-700">{treinoHoje.aquecimento}</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-blue-50 to-indigo-50 border-blue-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Dumbbell className="h-6 w-6" />
              Parte Principal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-700">{treinoHoje.partePrincipal}</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-green-50 to-emerald-50 border-green-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-6 w-6" />
              Volta à Calma
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-700">{treinoHoje.voltaCalma}</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Exercícios */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Exercícios do Dia</h2>
        {exercicios.map((ex, index) => (
          <Card key={index} className="border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-3">
                  <Dumbbell className="h-7 w-7 text-blue-600" />
                  {ex.nome}
                </CardTitle>
                <Badge className="bg-blue-100 text-blue-800">
                  {ex.duracao || ex.repeticoes}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">{ex.descricao}</p>
              
              {ex.repeticoes && (
                <p className="font-medium text-blue-700">
                  Repetições: {ex.repeticoes}
                </p>
              )}

              {ex.videoDemo && (
                <Button variant="outline" className="gap-2">
                  <PlayCircle className="h-5 w-5" />
                  Ver Vídeo Demonstrativo
                </Button>
              )}

              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <p className="font-semibold text-amber-800">Dica do Professor:</p>
                <p className="text-amber-900 mt-1">{ex.dica}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Botão Final */}
      <div className="flex justify-center">
        <Button size="lg" className="px-10 py-6 text-lg bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
          <CheckCircle className="mr-3 h-6 w-6" />
          Treino Visualizado - Pronto para o Campo!
        </Button>
      </div>
    </div>
  );
};

export default PlanoTreinoPage;