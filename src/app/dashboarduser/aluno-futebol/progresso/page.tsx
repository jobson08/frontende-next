// src/app/dashboarduser/aluno-futebol/progresso/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/src/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Progress } from "@/src/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { TrendingUp, Trophy, Target, Star, Calendar, Flame } from "lucide-react";

const MeuProgressoPage = ()=> {
  // Busca dados completos do aluno + progresso
  const { data: alunoData, isLoading } = useQuery({
    queryKey: ["aluno-futebol-progresso"],
    queryFn: async () => {
      const res = await api.get("/tenant/aluno-futebol/me");
      return res.data;
    },
  });

  const aluno = alunoData?.data;

  // Busca presenças (frequência)
  const { data: presencas = [] } = useQuery({
    queryKey: ["presencas-aluno"],
    queryFn: async () => {
      const res = await api.get("/tenant/aluno-futebol/presencas");
      console.log("✅ Dados do aluno presenca recebidos:", res.data);
      return res.data;
    },
    enabled: !!aluno,
  });

  // Busca avaliações
  const { data: avaliacoes = [] } = useQuery({
    queryKey: ["avaliacoes-aluno"],
    queryFn: async () => {
      const res = await api.get("/tenant/aluno-futebol/avaliacoes");
      console.log("✅ Dados do aluno avaliacao recebidos:", res.data);
      return res.data;
    },
    enabled: !!aluno,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-6" />
        <p className="text-xl font-medium text-gray-700">Carregando seu progresso...</p>
      </div>
    );
  }

  if (!aluno) {
    return <div className="text-center py-20 text-red-600">Erro ao carregar dados.</div>;
  }

 // Cálculos de Progresso
  const taxaFrequencia = aluno.taxaFrequencia || '';
  const mediaAvaliacao = aluno.mediaAvaliacao || '';
  const streakDias = aluno.streakDias || '';
  const golsMarcados = aluno.golsMarcados || '';
  const assistencias = aluno.assistencias || '';

  // Cálculo da barra de progresso (exemplo: 65%)
  const progressoNivel = 65; // Substitua por cálculo real quando tiver pontos

  // Cor da barra
  const corBarra = progressoNivel < 40 ? 'bg-red-500' : 
                   progressoNivel < 70 ? 'bg-orange-500' : 'bg-green-500';

  const textoProgresso = progressoNivel < 40 ? "Ainda longe..." : 
                        progressoNivel < 70 ? "Quase lá!" : "Ótimo progresso!";

  return (
    <div className="p-2 lg:p-4 space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center gap-6">
        <Avatar className="h-20 w-20 ring-4 ring-green-400">
           <AvatarImage src={aluno.fotoUrl} onError={(e) => e.currentTarget.style.display = 'none'}/>
          <AvatarFallback className="bg-gradient-to-br from-green-400 to-emerald-600 text-white text-3xl font-bold">
            {aluno.name?.split(" ").map((n: string) => n[0]).join("") || "A"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">Meu Progresso</h1>
          <p className="text-gray-600">Acompanhe sua evolução no Futebol</p>
          <div className="flex items-center gap-4 mt-3">
            <Badge className="bg-green-600">{aluno.categoria}</Badge>
            <Badge variant="secondary">{aluno.nivel}</Badge>
            <div className="flex items-center gap-1 text-orange-600">
              <Flame className="h-5 w-5" />
              <span className="font-bold">{streakDias} dias de streak</span>
            </div>
          </div>
        </div>
      </div>

     {/* Barra de Progresso Colorida */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Progresso para o Próximo Nível
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-lg">
              <span className="font-bold">Pontos Totais</span>
              <span>{aluno.pontosTotais || ''}</span>
            </div>

            <Progress value={progressoNivel} className={`h-6 ${corBarra}`} />

            <p className="text-sm text-center font-medium" style={{ color: corBarra.replace('bg-', '') }}>
              {textoProgresso}
            </p>

            <p className="text-sm text-gray-600 text-center">
              Faltam <strong>{aluno.pontosParaProximoNivel || ''} pontos</strong> para o próximo nível
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Estatísticas */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Frequência</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600">{taxaFrequencia}%</div>
            <p className="text-xs text-gray-500 mt-1">Presença nos treinos</p>
            <Progress value={taxaFrequencia} className="mt-3 h-3" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-yellow-500">{mediaAvaliacao}</div>
            <p className="text-xs text-gray-500 mt-1">dos treinadores</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Gols Marcados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-yellow-600">{golsMarcados}</div>
            <p className="text-xs text-gray-500 mt-1">esta temporada</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Assistências</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600">{assistencias}</div>
            <p className="text-xs text-gray-500 mt-1">esta temporada</p>
          </CardContent>
        </Card>
      </div>

      {/* Evolução Mensal */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução nos Últimos Meses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Aqui você pode mapear dados reais de Avaliacao */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="font-medium">Novembro 2025</div>
              <div className="flex gap-8 text-sm">
                <div>Frequência: <span className="font-bold">{taxaFrequencia}%</span></div>
                <div>Gols: <span className="font-bold text-yellow-600">{golsMarcados}</span></div>
                <div>Assistências: <span className="font-bold text-green-600">{assistencias}</span></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Motivação */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-center text-purple-800">Parabéns pelo esforço!</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-purple-700">
          Você está no caminho certo. Com {taxaFrequencia}% de frequência e streak de {streakDias} dias, 
          você é um exemplo para o time. Continue assim!
        </CardContent>
      </Card>
    </div>
  );
}

export default MeuProgressoPage;