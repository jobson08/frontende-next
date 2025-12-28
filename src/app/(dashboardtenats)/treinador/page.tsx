// src/app/(dashboard)/treinador/page.tsx
"use client";

import { Calendar, Users, Trophy, Star, BookOpen} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import Link from "next/link";
import { useEscolinhaConfig } from "@/src/context/EscolinhaConfigContext";

const TreinadorDashboardPage = () => {
  const { aulasExtrasAtivas } = useEscolinhaConfig();

  const stats = {
    treinosHoje: 4,
    alunosTotais: 68,
    frequenciaMedia: 88,
    alunosParaAvaliar: 7,
    aulasExtrasHoje: 2,
  };

  const proximoTreino = {
    hora: "18:30",
    nome: "Finalização Avançada",
    categoria: "Sub-15",
    local: "Campo 1",
  };

  return (
    <div className="p-4 lg:p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Olá, Professor Rafael!</h1>
        <p className="text-gray-600 text-lg mt-2">Tudo pronto para os treinos de hoje</p>
      </div>

      {/* CARD PRÓXIMO TREINO */}
      <Card className="border-2 border-blue-400 bg-linear-to-r from-blue-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-3">
            <Calendar className="h-8 w-8 text-blue-600" />
            Próximo Treino: {proximoTreino.hora}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-lg">
            <div>
              <p className="font-medium">{proximoTreino.nome}</p>
              <p className="text-gray-600">{proximoTreino.categoria}</p>
            </div>
            <div className="text-right">
              <p className="font-medium">{proximoTreino.local}</p>
              <p className="text-gray-600">15 alunos esperados</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Button asChild size="lg" className="flex-1">
              <Link href="/treinador/marcar-presenca">
                <Users className="mr-2 h-5 w-5" />
                Marcar Presença
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="flex-1">
              <Link href="/treinador/plano-treino">
                <BookOpen className="mr-2 h-5 w-5" />
                Ver Plano
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* RESUMO RÁPIDO */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Treinos Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.treinosHoje}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-5 w-5" />
              Meus Alunos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.alunosTotais}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Trophy className="h-5 w-5 text-green-600" />
              Frequência Média
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.frequenciaMedia}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Star className="h-5 w-5 text-orange-600" />
              Para Avaliar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{stats.alunosParaAvaliar}</div>
          </CardContent>
        </Card>
      </div>

      {/* AULAS EXTRAS HOJE */}
      {aulasExtrasAtivas && stats.aulasExtrasHoje > 0 && (
        <Card className="border-2 border-yellow-400 bg-linear-to-r from-yellow-50 to-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-yellow-800">
              <Trophy className="h-7 w-7 text-yellow-600" />
              Aulas Extras Hoje ({stats.aulasExtrasHoje})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full bg-yellow-600 hover:bg-yellow-700">
              <Link href="/dashboard/treinador/aulas-extras">
                Ver Aulas Extras Agendadas
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TreinadorDashboardPage;